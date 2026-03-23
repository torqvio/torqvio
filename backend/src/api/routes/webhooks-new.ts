import { Router, Request, Response } from 'express';
import { WebhookService, WebhookSubscription, WebhookEvent } from '../../services/WebhookService.js';
import { logger } from '../../utils/logger.js';
import { z } from 'zod';

const router = Router() as Router;
const webhookService = new WebhookService();

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

// GET /api/v1/webhooks - List all webhooks
router.get('/', async (req: Request, res: Response) => {
  try {
    const webhooks = await webhookService.listWebhooks();
    
    res.json({
      webhooks: webhooks.map(w => ({
        id: w.id,
        url: w.url,
        events: w.events,
        active: w.active,
        created_at: w.created_at,
        updated_at: w.updated_at,
        last_triggered_at: w.last_triggered_at,
        retry_count: w.retry_count
      })),
      count: webhooks.length
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
    const validatedData = createWebhookSchema.parse(req.body);
    
    const webhook = await webhookService.createWebhook({
      url: validatedData.url,
      events: validatedData.events,
      ...(validatedData.secret && { secret: validatedData.secret }),
      ...(validatedData.active !== undefined && { active: validatedData.active })
    });
    
    // Return webhook without exposing the secret
    const { secret, ...webhookResponse } = webhook;
    
    res.status(201).json({
      webhook: {
        ...webhookResponse,
        // Only include secret in creation response
        secret: validatedData.secret || secret
      },
      message: 'Webhook created successfully'
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'Invalid request body',
        details: error.issues
      });
    }
    
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
    const webhook = await webhookService.getWebhook(String(id));
    
    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${String(id)} not found`
      });
    }
    
    // Don't expose the secret in GET responses
    const { secret, ...webhookResponse } = webhook;
    
    res.json(webhookResponse);
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
    
    const webhook = await webhookService.updateWebhook(String(id), {
      ...(validatedData.url && { url: validatedData.url }),
      ...(validatedData.events && { events: validatedData.events }),
      ...(validatedData.secret && { secret: validatedData.secret }),
      ...(validatedData.active !== undefined && { active: validatedData.active })
    });
    
    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${String(id)} not found`
      });
    }
    
    // Don't expose the secret unless it was updated
    const { secret, ...webhookResponse } = webhook;
    
    res.json({
      webhook: webhookResponse,
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
    
    // Check if webhook exists
    const existing = await webhookService.getWebhook(String(id));
    if (!existing) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${String(id)} not found`
      });
    }
    
    const success = await webhookService.deleteWebhook(String(id));
    
    if (success) {
      res.json({
        message: 'Webhook deleted successfully'
      });
    } else {
      throw new Error('Failed to delete webhook');
    }
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
    
    const webhook = await webhookService.getWebhook(String(id));
    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${String(id)} not found`
      });
    }
    
    // For now, return webhook info. In a real implementation, 
    // you'd query an event delivery log table
    return res.json({
      webhook_id: String(id),
      webhook_url: webhook.url,
      events: webhook.events,
      active: webhook.active,
      last_triggered_at: webhook.last_triggered_at,
      retry_count: webhook.retry_count,
      max_retries: webhook.max_retries,
      next_retry_at: webhook.next_retry_at,
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
    const webhook = await webhookService.getWebhook(String(id));
    
    if (!webhook) {
      return res.status(404).json({
        error: 'Webhook not found',
        message: `Webhook with id ${String(id)} not found`
      });
    }
    
    // Create a test event
    const testEvent: WebhookEvent = {
      event: 'workflow.started',
      workflow_id: 'test_workflow_' + Date.now(),
      execution_id: 'test_execution_' + Date.now(),
      timestamp: new Date().toISOString(),
      data: {
        workflow_name: 'Test Workflow',
        input_payload: { test: true, timestamp: Date.now() }
      }
    };
    
    // Send test webhook
    const result = await webhookService.sendWebhook(webhook, testEvent);
    
    return res.json({
      test_event: testEvent,
      delivery_result: result,
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

export default router;
