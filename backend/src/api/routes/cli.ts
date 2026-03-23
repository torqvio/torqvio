import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '../../database/connection.js';
import jwt from 'jsonwebtoken';

const router = Router();

// CLI Authentication and Project Management
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { projectName, framework = 'cli' } = req.body;
    
    if (!projectName) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    // Generate API key
    const apiKey = `af_${uuidv4().replace(/-/g, '')}`;
    const projectId = uuidv4();

    // Store project in database
    const db = DatabaseConnection.getInstance();
    await db.query(`
      INSERT INTO projects (id, name, api_key, framework, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [projectId, projectName, apiKey, framework]);

    // Generate JWT token for CLI
    const token = jwt.sign(
      { projectId, apiKey, projectName },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '365d' }
    );

    res.json({
      success: true,
      projectId,
      apiKey,
      token,
      projectName
    });

  } catch (error: any) {
    console.error('CLI auth registration error:', error);
    res.status(500).json({ error: 'Failed to register project' });
  }
});

// Template Management
router.get('/templates/list', async (req: Request, res: Response) => {
  try {
    const templates = [
      {
        id: 'payment-recovery',
        name: 'Stripe Payment Recovery',
        description: 'Never lose a payment due to temporary failures',
        category: 'payment',
        value_proposition: 'Recovers 95% of failed payments automatically',
        environment: {
          STRIPE_SECRET_KEY: 'sk_test_...',
          WEBHOOK_SECRET: 'whsec_...'
        },
        triggers: [
          {
            type: 'webhook',
            event: 'payment_failed',
            source: 'stripe'
          }
        ],
        steps: [
          {
            id: 'validate_payment',
            type: 'validation',
            config: { check_status: true }
          },
          {
            id: 'retry_payment',
            type: 'retry',
            config: { max_attempts: 3, backoff: 'exponential' }
          },
          {
            id: 'fallback_payment_method',
            type: 'action',
            config: { use_backup_method: true }
          },
          {
            id: 'customer_notification',
            type: 'notification',
            config: { template: 'payment_recovery' }
          },
          {
            id: 'recovery_alert',
            type: 'alert',
            config: { notify_admin: true }
          }
        ]
      },
      {
        id: 'email-reliability',
        name: 'Email Delivery Assurance',
        description: 'Ensure critical emails always reach customers',
        category: 'email',
        value_proposition: '99.9% email delivery guarantee',
        environment: {
          PRIMARY_EMAIL_PROVIDER: 'sendgrid',
          FALLBACK_EMAIL_PROVIDER: 'ses',
          PRIMARY_API_KEY: 'SG._...',
          FALLBACK_API_KEY: 'AKIA...'
        },
        triggers: [
          {
            type: 'event',
            event: 'email.send.failed'
          }
        ],
        steps: [
          {
            id: 'validate_recipient',
            type: 'validation',
            config: { check_email_format: true }
          },
          {
            id: 'retry_primary_provider',
            type: 'retry',
            config: { max_attempts: 3, delay: 1000 }
          },
          {
            id: 'fallback_to_secondary_provider',
            type: 'action',
            config: { switch_provider: true }
          },
          {
            id: 'delivery_confirmation',
            type: 'verification',
            config: { track_delivery: true }
          },
          {
            id: 'failure_tracking',
            type: 'logging',
            config: { log_failures: true }
          }
        ]
      },
      {
        id: 'webhook-ingestion',
        name: 'Robust Webhook Processing',
        description: 'Never lose incoming webhook data',
        category: 'webhook',
        value_proposition: 'Zero webhook data loss',
        environment: {
          WEBHOOK_SECRET: 'whsec_...',
          RETRY_QUEUE: 'webhook_retries'
        },
        triggers: [
          {
            type: 'webhook',
            event: 'webhook.received'
          }
        ],
        steps: [
          {
            id: 'signature_validation',
            type: 'validation',
            config: { verify_signature: true }
          },
          {
            id: 'schema_validation',
            type: 'validation',
            config: { validate_schema: true }
          },
          {
            id: 'immediate_persistence',
            type: 'storage',
            config: { store_immediately: true }
          },
          {
            id: 'retry_processing',
            type: 'retry',
            config: { max_attempts: 5, backoff: 'linear' }
          },
          {
            id: 'dead_letter_queue',
            type: 'storage',
            config: { store_failures: true }
          }
        ]
      }
    ];

    res.json({ templates });

  } catch (error: any) {
    console.error('Template list error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

router.get('/templates/:templateId', async (req: Request, res: Response) => {
  try {
    const { templateId } = req.params;
    
    // Get template details (in real implementation, this would come from database)
    const templates = await getTemplateList();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json(template);

  } catch (error: any) {
    console.error('Template fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// Template Deployment
router.post('/templates/deploy', async (req: Request, res: Response) => {
  try {
    const { templateId, environment = {}, force = false } = req.body;
    const projectId = req.headers['x-project-id'] as string;
    
    if (!templateId || !projectId) {
      return res.status(400).json({ error: 'Template ID and Project ID are required' });
    }

    // Get template details
    const templates = await getTemplateList();
    const template = templates.find(t => t.id === templateId);
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Check if already deployed
    if (!force) {
      const db = DatabaseConnection.getInstance();
      const existingDeployment = await db.query(
        'SELECT * FROM deployments WHERE project_id = $1 AND template_id = $2',
        [projectId, templateId]
      );
      
      if (existingDeployment.length > 0) {
        return res.status(409).json({ 
          error: 'Template already deployed',
          deploymentId: existingDeployment[0].id,
          message: 'Use --force to redeploy'
        });
      }
    }

    // Create deployment
    const deploymentId = uuidv4();
    const webhookUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/webhook/${deploymentId}`;
    
    const db = DatabaseConnection.getInstance();
    
    // Insert deployment record
    await db.query(`
      INSERT INTO deployments (id, project_id, template_id, status, webhook_url, environment, created_at)
      VALUES ($1, $2, $3, 'deploying', $4, $5, NOW())
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        webhook_url = EXCLUDED.webhook_url,
        environment = EXCLUDED.environment,
        updated_at = NOW()
    `, [deploymentId, projectId, templateId, webhookUrl, JSON.stringify(environment)]);

    // Create workflow from template
    const workflowId = uuidv4();
    await db.query(`
      INSERT INTO flows (id, project_id, name, definition, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `, [workflowId, projectId, template.name, JSON.stringify({
      triggers: template.triggers,
      steps: template.steps,
      environment: { ...template.environment, ...environment }
    })]);

    // Create webhook trigger
    const webhookTriggerId = uuidv4();
    await db.query(`
      INSERT INTO webhooks (id, project_id, flow_id, trigger_id, url, secret, active, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
    `, [webhookTriggerId, projectId, workflowId, webhookTriggerId, webhookUrl, environment.WEBHOOK_SECRET || 'default-secret']);

    // Update deployment status
    await db.query(`
      UPDATE deployments SET status = 'deployed', updated_at = NOW()
      WHERE id = $1
    `, [deploymentId]);

    const deployment = {
      deploymentId,
      templateId,
      status: 'deployed',
      endpoints: [
        `/webhook/${deploymentId}`,
        `/api/deployments/${deploymentId}/status`,
        `/api/deployments/${deploymentId}/logs`
      ],
      webhookUrl,
      message: `Template "${template.name}" deployed successfully`
    };

    res.json(deployment);

  } catch (error: any) {
    console.error('Template deployment error:', error);
    res.status(500).json({ error: 'Failed to deploy template' });
  }
});

// Project Status
router.get('/projects/status', async (req: Request, res: Response) => {
  try {
    const projectId = req.headers['x-project-id'] as string;
    
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }

    const db = DatabaseConnection.getInstance();
    
    // Get project info
    const projectResult = await db.query(
      'SELECT * FROM projects WHERE id = $1',
      [projectId]
    );
    
    if (projectResult.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    const project = projectResult[0];
    
    // Get deployments
    const deploymentsResult = await db.query(
      'SELECT * FROM deployments WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    
    const deployments = deploymentsResult.map((dep: any) => ({
      deploymentId: dep.id,
      templateId: dep.template_id,
      templateName: dep.template_id.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      status: dep.status,
      webhookUrl: dep.webhook_url,
      createdAt: dep.created_at,
      updatedAt: dep.updated_at
    }));

    res.json({
      projectId: project.id,
      projectName: project.name,
      framework: project.framework,
      createdAt: project.created_at,
      deployments,
      totalDeployments: deployments.length,
      activeDeployments: deployments.filter((d: any) => d.status === 'deployed').length
    });

  } catch (error: any) {
    console.error('Project status error:', error);
    res.status(500).json({ error: 'Failed to fetch project status' });
  }
});

// Helper function
async function getTemplateList() {
  return [
    {
      id: 'payment-recovery',
      name: 'Stripe Payment Recovery',
      description: 'Never lose a payment due to temporary failures',
      category: 'payment',
      value_proposition: 'Recovers 95% of failed payments automatically',
      environment: {
        STRIPE_SECRET_KEY: 'sk_test_...',
        WEBHOOK_SECRET: 'whsec_...'
      },
      triggers: [{ type: 'webhook', event: 'payment_failed' }],
      steps: []
    },
    {
      id: 'email-reliability',
      name: 'Email Delivery Assurance',
      description: 'Ensure critical emails always reach customers',
      category: 'email',
      value_proposition: '99.9% email delivery guarantee',
      environment: {
        PRIMARY_EMAIL_PROVIDER: 'sendgrid',
        FALLBACK_EMAIL_PROVIDER: 'ses'
      },
      triggers: [{ type: 'event', event: 'email.send.failed' }],
      steps: []
    },
    {
      id: 'webhook-ingestion',
      name: 'Robust Webhook Processing',
      description: 'Never lose incoming webhook data',
      category: 'webhook',
      value_proposition: 'Zero webhook data loss',
      environment: {
        WEBHOOK_SECRET: 'whsec_...'
      },
      triggers: [{ type: 'webhook', event: 'webhook.received' }],
      steps: []
    }
  ];
}

export default router;
