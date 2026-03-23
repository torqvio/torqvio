import { Router } from 'express';
import { z } from 'zod';
import chalk from 'chalk';

const router = Router();

// Authentication schemas
const loginSchema = z.object({
  apiKey: z.string().optional(),
  method: z.enum(['github', 'google']).optional(),
  token: z.string().optional()
});

const registerSchema = z.object({
  projectName: z.string(),
  framework: z.string()
});

// CLI Authentication endpoints
router.post('/auth/register', async (req, res) => {
  try {
    const { projectName, framework } = registerSchema.parse(req.body);
    
    // Generate API key and project ID
    const apiKey = `af_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    const projectId = `proj_${Date.now()}`;
    
    // In a real implementation, store in database
    console.log(chalk.blue(`[CLI] Registered project: ${projectName}`));
    
    res.json({
      apiKey,
      projectId,
      projectName,
      framework,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid registration data' });
  }
});

router.post('/auth/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authorization header' });
    }
    
    const apiKey = authHeader.substring(7);
    
    // In a real implementation, verify against database
    if (apiKey.startsWith('af_')) {
      res.json({
        user: {
          id: 'user_123',
          email: 'user@example.com',
          name: 'Demo User'
        },
        valid: true
      });
    } else {
      res.status(401).json({ error: 'Invalid API key' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Template endpoints
router.get('/templates/:templateName', async (req, res) => {
  try {
    const { templateName } = req.params;
    const authHeader = req.headers.authorization;
    const projectId = req.headers['x-project-id'] as string;
    
    if (!authHeader || !projectId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Template definitions
    const templates: Record<string, any> = {
      'payment-recovery': {
        id: 'payment-recovery',
        name: 'Stripe Payment Recovery',
        description: 'Never lose a payment due to temporary failures',
        category: 'payment',
        triggers: [{ type: 'webhook', event: 'payment.failed', config: {} }],
        steps: [
          { id: 'step1', type: 'delay', name: 'Wait 5 minutes', config: {} },
          { id: 'step2', type: 'api', name: 'Retry Payment', config: {} }
        ],
        environment: { STRIPE_SECRET_KEY: '' },
        value_proposition: 'Recovers 95% of failed payments automatically'
      },
      'email-reliability': {
        id: 'email-reliability',
        name: 'Email Delivery Assurance',
        description: 'Ensure critical emails always reach customers',
        category: 'email',
        triggers: [{ type: 'event', event: 'email.send', config: {} }],
        steps: [
          { id: 'step1', type: 'email', name: 'Send Primary', config: {} },
          { id: 'step2', type: 'delay', name: 'Wait 30 seconds', config: {} },
          { id: 'step3', type: 'email', name: 'Send Fallback', config: {} }
        ],
        environment: { PRIMARY_EMAIL_PROVIDER: '', FALLBACK_EMAIL_PROVIDER: '' },
        value_proposition: '99.9% email delivery guarantee'
      },
      'webhook-ingestion': {
        id: 'webhook-ingestion',
        name: 'Robust Webhook Processing',
        description: 'Never lose incoming webhook data',
        category: 'webhook',
        triggers: [{ type: 'webhook', event: 'webhook.received', config: {} }],
        steps: [
          { id: 'step1', type: 'validate', name: 'Validate webhook', config: {} },
          { id: 'step2', type: 'process', name: 'Process data', config: {} },
          { id: 'step3', type: 'store', name: 'Store securely', config: {} }
        ],
        environment: { WEBHOOK_SECRET: '' },
        value_proposition: 'Zero webhook data loss'
      }
    };
    
    const template = templates[templateName];
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    console.log(chalk.blue(`[CLI] Fetched template: ${templateName}`));
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

router.post('/templates/deploy', async (req, res) => {
  try {
    const { templateId, environment, force } = req.body;
    const authHeader = req.headers.authorization;
    const projectId = req.headers['x-project-id'] as string;
    
    if (!authHeader || !projectId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const deploymentId = `deploy_${Date.now()}`;
    
    console.log(chalk.blue(`[CLI] Deploying template: ${templateId}`));
    
    // In a real implementation, deploy the template
    res.json({
      deploymentId,
      templateId,
      status: 'deployed',
      endpoints: [
        `/webhook/${templateId}`,
        `/api/${templateId}/status`
      ],
      webhookUrl: `http://localhost:8459/webhook/${templateId}`,
      message: `Template "${templateId}" deployed successfully`
    });
  } catch (error) {
    res.status(500).json({ error: 'Deployment failed' });
  }
});

// Project status endpoint
router.get('/projects/status', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const projectId = req.headers['x-project-id'] as string;
    
    if (!authHeader || !projectId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log(chalk.blue(`[CLI] Project status requested: ${projectId}`));
    
    res.json({
      projectName: 'Demo Project',
      projectId,
      deployments: [
        {
          templateName: 'payment-recovery',
          status: 'deployed',
          deploymentId: 'deploy_123'
        },
        {
          templateName: 'email-reliability',
          status: 'deployed',
          deploymentId: 'deploy_124'
        }
      ],
      status: 'healthy'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get project status' });
  }
});

export default router;
