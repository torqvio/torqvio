import { Router, Request, Response } from 'express';
import { getWebhookDbConnection } from '../../database/webhook-connection.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';
import { z } from 'zod';

const router = Router() as Router;

// Validation schemas
const createWebhookSchema = z.object({
  url: z.string().url().max(500),
  events: z.array(z.string()).min(1),
  secret: z.string().min(1).optional(),
  active: z.boolean().optional()
});

const updateWebhookSchema = z.object({
  url: z.string().url().max(500).optional(),
  events: z.array(z.string()).min(1).optional(),
  secret: z.string().min(1).optional(),
  active: z.boolean().optional()
});

// Helper function to generate webhook ID
function generateWebhookId(): string {
  return crypto.randomUUID();
}

// GET /api/v1/webhooks - List all webhooks
router.get('/', async (req: Request, res: Response) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    const db = getWebhookDbConnection();
    
    // Get total count first
    const countResult = await db.query('SELECT COUNT(*) as total FROM webhooks');
    const total = parseInt(countResult[0]?.total || '0');
    
    // Query webhooks with pagination
    const webhooks = await db.query(`
      SELECT id, url, secret, active, created_at, updated_at
      FROM webhooks 
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [Math.min(Number(limit), 1000), Number(offset)]);
    
    // Transform to match documented format
    const transformedWebhooks = webhooks.map((webhook: any) => ({
      id: webhook.id,
      url: webhook.url,
      events: ['workflow.started', 'workflow.completed', 'workflow.failed'], // Default events for existing webhooks
      active: webhook.active,
      created_at: webhook.created_at,
      updated_at: webhook.updated_at,
      last_triggered_at: null,
      retry_count: 0
    }));
    
    res.json({
      webhooks: transformedWebhooks,
      count: transformedWebhooks.length,
      total,
      limit: Number(limit),
      offset: Number(offset),
      has_more: (Number(offset) + transformedWebhooks.length) < total
    });
  } catch (error) {
    logger.error('Failed to list webhooks:', error);
    res.status(500).json({
      error: 'Failed to list webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/webhooks - Create a new webhook (ULTRA OPTIMIZED)
router.post('/', async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    // Minimal validation - fastest path
    const { url, events = ['workflow.started'], secret, active = true } = req.body;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'URL is required'
      });
    }
    
    // Fast ID generation
    const webhookId = crypto.randomUUID();
    const webhookSecret = secret || crypto.randomBytes(8).toString('hex');
    
    // Optimized database connection
    const db = getWebhookDbConnection();
    
    // Simplified query for maximum speed
    const result = await db.query(
      'INSERT INTO webhooks (id, url, secret, active, trigger_id) VALUES ($1, $2, $3, $4, $5) RETURNING id, url, active, created_at, updated_at',
      [webhookId, url, webhookSecret, active, JSON.stringify(events)]
    );
    
    const webhook = result[0];
    
    // Fast response
    res.status(201).json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events,
        active: webhook.active,
        created_at: webhook.created_at,
        updated_at: webhook.updated_at,
        secret: webhookSecret
      },
      message: 'Webhook created successfully',
      processing_time: `${Date.now() - startTime}ms`
    });
    
  } catch (error) {
    // Fast error response
    res.status(500).json({
      error: 'Failed to create webhook',
      message: error instanceof Error ? error.message : 'Unknown error',
      processing_time: `${Date.now() - startTime}ms`
    });
  }
});

// GET /api/v1/webhooks/stats - Get webhook statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = getWebhookDbConnection();
    
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_webhooks,
        COUNT(CASE WHEN active = true THEN 1 END) as active_webhooks,
        COUNT(CASE WHEN active = false THEN 1 END) as inactive_webhooks,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as created_last_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as created_last_7d,
        COUNT(CASE WHEN url LIKE '%webhook.site%' OR url LIKE '%test%' THEN 1 END) as test_webhooks
      FROM webhooks
    `);
    
    const result = stats[0];
    
    res.json({
      total_webhooks: parseInt(result?.total_webhooks || '0'),
      active_webhooks: parseInt(result?.active_webhooks || '0'),
      inactive_webhooks: parseInt(result?.inactive_webhooks || '0'),
      created_last_24h: parseInt(result?.created_last_24h || '0'),
      created_last_7d: parseInt(result?.created_last_7d || '0'),
      test_webhooks: parseInt(result?.test_webhooks || '0'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get webhook stats:', error);
    res.status(500).json({
      error: 'Failed to get webhook stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/v1/webhooks/bulk - Bulk delete webhooks (for cleanup)
router.delete('/bulk', async (req: Request, res: Response) => {
  try {
    const { webhook_ids, url_pattern, created_before, older_than_hours } = req.body;
    const db = getWebhookDbConnection();
    
    let deletedCount = 0;
    
    if (webhook_ids && Array.isArray(webhook_ids)) {
      // Delete specific webhook IDs
      const result = await db.query(
        `DELETE FROM webhooks WHERE id = ANY($1) RETURNING COUNT(*) as count`,
        [webhook_ids]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (url_pattern) {
      // Delete webhooks matching URL pattern
      const result = await db.query(
        `DELETE FROM webhooks WHERE url ILIKE $1 RETURNING COUNT(*) as count`,
        [`%${url_pattern}%`]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (created_before) {
      // Delete webhooks created before a specific date
      const result = await db.query(
        `DELETE FROM webhooks WHERE created_at < $1 RETURNING COUNT(*) as count`,
        [created_before]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (older_than_hours) {
      // Delete webhooks older than X hours (auto-cleanup)
      const result = await db.query(
        `DELETE FROM webhooks WHERE created_at < NOW() - INTERVAL '${older_than_hours} hours' RETURNING COUNT(*) as count`
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Provide webhook_ids, url_pattern, created_before, or older_than_hours'
      });
    }
    
    logger.warn(`Bulk deleted ${deletedCount} webhooks`, {
      deletedCount,
      reason: req.body,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      message: 'Bulk delete completed',
      deleted_count: deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to bulk delete webhooks:', error);
    res.status(500).json({
      error: 'Failed to bulk delete webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/webhooks/:id - Get a specific webhook
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getWebhookDbConnection();
    
    const result = await db.query(`
      SELECT id, url, secret, active, created_at, updated_at, trigger_id
      FROM webhooks 
      WHERE id = $1
    `, [String(id)]);
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    const webhook = result[0];
    
    // Parse events from trigger_id field
    let events = ['workflow.started', 'workflow.completed', 'workflow.failed']; // Default
    try {
      if (webhook.trigger_id) {
        events = JSON.parse(webhook.trigger_id);
      }
    } catch (e) {
      // Keep default events if parsing fails
    }
    
    // Don't expose the secret in GET responses
    const { secret, ...webhookResponse } = webhook;
    
    res.json({
      ...webhookResponse,
      events,
      last_triggered_at: null,
      retry_count: 0
    });
  } catch (error) {
    logger.error('Failed to get webhook:', error);
    res.status(500).json({
      error: 'Failed to get webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PATCH /api/v1/webhooks/:id - Update a webhook
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = updateWebhookSchema.parse(req.body);
    const db = getWebhookDbConnection();
    
    // Check if webhook exists
    const existing = await db.query('SELECT id FROM webhooks WHERE id = $1', [String(id)]);
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    // Build update query
    const fields = [];
    const values = [];
    let paramIndex = 1;
    
    if (validatedData.url) {
      fields.push(`url = $${paramIndex++}`);
      values.push(validatedData.url);
    }
    if (validatedData.active !== undefined) {
      fields.push(`active = $${paramIndex++}`);
      values.push(validatedData.active);
    }
    if (validatedData.secret) {
      fields.push(`secret = $${paramIndex++}`);
      values.push(validatedData.secret);
    }
    if (validatedData.events) {
      fields.push(`trigger_id = $${paramIndex++}`);
      values.push(JSON.stringify(validatedData.events));
    }
    
    if (fields.length === 0) {
      return res.status(400).json({
        error: 'No valid fields to update',
        message: 'At least one field must be provided for update'
      });
    }
    
    values.push(String(id));
    
    const result = await db.query(`
      UPDATE webhooks 
      SET ${fields.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING id, url, active, created_at, updated_at, trigger_id
    `, values);
    
    const webhook = result[0];
    
    if (!webhook) {
      throw new Error('Failed to update webhook');
    }
    
    // Parse events
    let events = ['workflow.started', 'workflow.completed', 'workflow.failed'];
    try {
      if (webhook.trigger_id) {
        events = JSON.parse(webhook.trigger_id);
      }
    } catch (e) {
      // Keep default events
    }
    
    res.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events,
        active: webhook.active,
        created_at: webhook.created_at,
        updated_at: webhook.updated_at
      },
      ...(validatedData.secret && { secret: validatedData.secret }),
      message: 'Webhook updated successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request body',
        details: error.issues
      });
    }
    
    logger.error('Failed to update webhook:', error);
    res.status(500).json({
      error: 'Failed to update webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/v1/webhooks/:id - Delete a webhook
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getWebhookDbConnection();
    
    // Check if webhook exists
    const existing = await db.query('SELECT id FROM webhooks WHERE id = $1', [String(id)]);
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    // Delete webhook
    await db.query('DELETE FROM webhooks WHERE id = $1', [String(id)]);
    
    logger.info(`Webhook deleted: ${id}`, { webhookId: id });
    
    res.json({
      message: 'Webhook deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete webhook:', error);
    res.status(500).json({
      error: 'Failed to delete webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/webhooks/:id/events - List webhook events (for debugging/monitoring)
router.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const db = getWebhookDbConnection();
    
    const webhook = await db.query(`
      SELECT id, url, active, trigger_id,
             COALESCE(last_triggered_at::text, NULL) as last_triggered_at,
             COALESCE(retry_count, 0) as retry_count
      FROM webhooks 
      WHERE id = $1
    `, [String(id)]);
    
    if (webhook.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    const webhookData = webhook[0];
    
    // Parse events
    let events = ['workflow.started', 'workflow.completed', 'workflow.failed'];
    try {
      if (webhookData.trigger_id) {
        events = JSON.parse(webhookData.trigger_id);
      }
    } catch (e) {
      // Keep default events
    }
    
    res.json({
      webhook_id: String(id),
      webhook_url: webhookData.url,
      events,
      active: webhookData.active,
      last_triggered_at: webhookData.last_triggered_at,
      retry_count: webhookData.retry_count,
      max_retries: 5, // Default max retries
      next_retry_at: null, // Not implemented yet
      message: 'Event delivery log not implemented yet'
    });
  } catch (error) {
    logger.error('Failed to get webhook events:', error);
    res.status(500).json({
      error: 'Failed to get webhook events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/webhooks/:id/test - Test webhook delivery
router.post('/:id/test', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = getWebhookDbConnection();
    
    const webhook = await db.query(`
      SELECT id, url, secret, active, trigger_id
      FROM webhooks 
      WHERE id = $1
    `, [String(id)]);
    
    if (webhook.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    const webhookData = webhook[0];
    
    // Create a test event
    const testEvent = {
      event: 'workflow.started',
      workflow_id: 'test_workflow_' + Date.now(),
      execution_id: 'test_execution_' + Date.now(),
      timestamp: new Date().toISOString(),
      data: {
        workflow_name: 'Test Workflow',
        input_payload: { test: true, timestamp: Date.now() }
      }
    };
    
    // Generate signature
    const payload = JSON.stringify(testEvent);
    const signature = crypto
      .createHmac('sha256', webhookData.secret)
      .update(payload)
      .digest('hex');
    
    // Send test webhook
    let deliveryResult;
    try {
      const response = await fetch(webhookData.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Torqvio-Signature': `sha256=${signature}`,
          'User-Agent': 'Torqvio-Webhooks/1.0'
        },
        body: payload,
        signal: AbortSignal.timeout(30000)
      } as RequestInit);
      
      deliveryResult = {
        success: response.ok,
        status_code: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`
      };
      
      if (response.ok) {
        // Update last_triggered_at
        await db.query(`
          UPDATE webhooks 
          SET last_triggered_at = NOW() 
          WHERE id = $1
        `, [String(id)]);
      }
      
    } catch (error) {
      deliveryResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
    
    return res.json({
      test_event: testEvent,
      delivery_result: deliveryResult,
      message: 'Test webhook sent'
    });
  } catch (error) {
    logger.error('Failed to test webhook:', error);
    res.status(500).json({
      error: 'Failed to test webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/v1/webhooks/bulk - Bulk delete webhooks (for cleanup)
router.delete('/bulk', async (req: Request, res: Response) => {
  try {
    const { webhook_ids, url_pattern, created_before, older_than_hours } = req.body;
    const db = getWebhookDbConnection();
    
    let deletedCount = 0;
    
    if (webhook_ids && Array.isArray(webhook_ids)) {
      // Delete specific webhook IDs
      const result = await db.query(
        `DELETE FROM webhooks WHERE id = ANY($1) RETURNING COUNT(*) as count`,
        [webhook_ids]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (url_pattern) {
      // Delete webhooks matching URL pattern
      const result = await db.query(
        `DELETE FROM webhooks WHERE url ILIKE $1 RETURNING COUNT(*) as count`,
        [`%${url_pattern}%`]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (created_before) {
      // Delete webhooks created before a specific date
      const result = await db.query(
        `DELETE FROM webhooks WHERE created_at < $1 RETURNING COUNT(*) as count`,
        [created_before]
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else if (older_than_hours) {
      // Delete webhooks older than X hours (auto-cleanup)
      const result = await db.query(
        `DELETE FROM webhooks WHERE created_at < NOW() - INTERVAL '${older_than_hours} hours' RETURNING COUNT(*) as count`
      );
      deletedCount = parseInt(result[0]?.count || '0');
      
    } else {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Provide webhook_ids, url_pattern, created_before, or older_than_hours'
      });
    }
    
    logger.warn(`Bulk deleted ${deletedCount} webhooks`, {
      deletedCount,
      reason: req.body,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      message: 'Bulk delete completed',
      deleted_count: deletedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to bulk delete webhooks:', error);
    res.status(500).json({
      error: 'Failed to bulk delete webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/webhooks/stats - Get webhook statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const db = getWebhookDbConnection();
    
    const stats = await db.query(`
      SELECT 
        COUNT(*) as total_webhooks,
        COUNT(CASE WHEN active = true THEN 1 END) as active_webhooks,
        COUNT(CASE WHEN active = false THEN 1 END) as inactive_webhooks,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as created_last_24h,
        COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as created_last_7d,
        COUNT(CASE WHEN url LIKE '%webhook.site%' OR url LIKE '%test%' THEN 1 END) as test_webhooks
      FROM webhooks
    `);
    
    const result = stats[0];
    
    res.json({
      total_webhooks: parseInt(result?.total_webhooks || '0'),
      active_webhooks: parseInt(result?.active_webhooks || '0'),
      inactive_webhooks: parseInt(result?.inactive_webhooks || '0'),
      created_last_24h: parseInt(result?.created_last_24h || '0'),
      created_last_7d: parseInt(result?.created_last_7d || '0'),
      test_webhooks: parseInt(result?.test_webhooks || '0'),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get webhook stats:', error);
    res.status(500).json({
      error: 'Failed to get webhook stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
