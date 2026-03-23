import { Router, Request, Response } from 'express';
import { createDatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';
import crypto from 'crypto';
import { WebhookTrigger } from '../../triggers/WebhookTrigger.js';
import { EventBus } from '../../events/EventBus.js';
import { TriggerModel, FlowModel } from '../../database/models.js';

const router = Router();

// GET /api/v1/webhooks - List all webhooks
router.get('/', async (req: Request, res: Response) => {
  try {
    const db = createDatabaseConnection();
    const result = await db.query(
      'SELECT * FROM triggers WHERE type = \'webhook\' ORDER BY created_at DESC'
    );
    
    res.json({
      webhooks: result || [],
      count: (result || []).length
    });
  } catch (error) {
    logger.error('Failed to list webhooks:', error);
    res.status(500).json({
      error: 'Failed to list webhooks',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/webhooks - Create a new webhook
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, flow_id, event_type, secret } = req.body;
    
    if (!name || !flow_id || !event_type) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'name, flow_id, and event_type are required'
      });
    }
    
    const db = createDatabaseConnection();
    
    // Generate webhook URL and secret if not provided
    const webhookId = crypto.randomUUID();
    const webhookUrl = `/api/v1/webhooks/${webhookId}`;
    const webhookSecret = secret || crypto.randomBytes(32).toString('hex');
    
    // Create webhook trigger
    const result = await db.query(
      `INSERT INTO triggers (id, name, type, flow_id, config, created_at, updated_at)
       VALUES ($1, $2, 'webhook', $3, $4, NOW(), NOW())
       RETURNING *`,
      [
        webhookId,
        name,
        flow_id,
        JSON.stringify({
          event_type,
          secret: webhookSecret,
          url: webhookUrl
        })
      ]
    );
    
    const webhook = result[0];
    
    logger.info(`Webhook created: ${name}`, { webhookId, flowId: flow_id });
    
    res.status(201).json({
      webhook: {
        ...webhook,
        url: webhookUrl,
        secret: webhookSecret
      },
      message: 'Webhook created successfully'
    });
  } catch (error) {
    logger.error('Failed to create webhook:', error);
    res.status(500).json({
      error: 'Failed to create webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/webhooks/:id - Get a specific webhook
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = createDatabaseConnection();
    
    const result = await db.query(
      'SELECT * FROM triggers WHERE id = $1 AND type = \'webhook\'',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    res.json(result[0]);
  } catch (error) {
    logger.error('Failed to get webhook:', error);
    res.status(500).json({
      error: 'Failed to get webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/v1/webhooks/:id - Delete a webhook
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = createDatabaseConnection();
    
    // Check if webhook exists
    const existing = await db.query(
      'SELECT * FROM triggers WHERE id = $1 AND type = \'webhook\'',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    // Delete webhook
    await db.query('DELETE FROM triggers WHERE id = $1', [id]);
    
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

// POST /api/v1/webhooks/:webhookId - Webhook endpoint (public)
router.post('/:webhookId', async (req: Request, res: Response) => {
  try {
    const { webhookId } = req.params;
    const headers = req.headers as Record<string, string>;
    
    const db = createDatabaseConnection();
    
    // Initialize event system components
    const eventBus = new EventBus(db);
    const triggerModel = new TriggerModel(db);
    const flowModel = new FlowModel(db);
    const webhookTrigger = new WebhookTrigger(eventBus, triggerModel, flowModel);
    
    // Handle webhook using the new event-driven system
    const result = await webhookTrigger.handleWebhook(
      webhookId as string,
      headers,
      req.body,
      'webhook'
    );
    
    if (result.success) {
      logger.info(`Webhook processed successfully: ${webhookId}`, { 
        webhookId, 
        eventId: result.eventId 
      });
      
      res.status(202).json({
        execution_id: result.eventId,
        message: 'Webhook processed successfully'
      });
    } else {
      logger.warn(`Webhook processing failed: ${webhookId}`, { 
        webhookId, 
        error: result.error 
      });
      
      res.status(400).json({
        error: 'Webhook processing failed',
        message: result.error
      });
    }
    
  } catch (error) {
    logger.error('Failed to process webhook:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/webhooks/:id/events - List webhook events
router.get('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const db = createDatabaseConnection();
    
    // Verify webhook exists
    const webhook = await db.query(
      'SELECT * FROM triggers WHERE id = $1 AND type = \'webhook\'',
      [id]
    );
    
    if (webhook.length === 0) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${id} not found`
      });
    }
    
    // Get events for this webhook
    const eventsResult = await db.query(
      `SELECT * FROM events 
       WHERE flow_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [webhook[0].flow_id, Number(limit), Number(offset)]
    );
    
    res.json({
      webhook_id: id,
      events: eventsResult,
      count: eventsResult.length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('Failed to get webhook events:', error);
    res.status(500).json({
      error: 'Failed to get webhook events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
