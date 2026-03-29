import { Router } from 'express';
import { EventValidator, ExternalEvent } from '../../events/EventValidator.js';
import { EventModel } from '../../database/models.js';
import { DatabaseConnection } from '../../database/connection.js';
import { createHash } from 'crypto';
import { EventBus } from '../../events/EventBus.js';

export function createEventsRouter(db: DatabaseConnection, eventBus: EventBus): Router {
  const router = Router();
  const eventModel = new EventModel(db);

  // POST /events - Public event ingestion endpoint
  router.post('/events', async (req, res) => {
    try {
      // Generate idempotency key from event content
      const idempotencyKey = generateIdempotencyKey(req.body);
      
      // Check if event already processed
      const existingEvent = await findEventByIdempotencyKey(idempotencyKey, db);
      if (existingEvent) {
        return res.status(200).json({
          success: true,
          message: 'Event already processed',
          eventId: (existingEvent as any).id
        });
      }

      // Validate event schema
      const validatedEvent = EventValidator.validate(req.body);
      
      // Add idempotency metadata
      const eventToStore = {
        ...validatedEvent,
        idempotency_key: idempotencyKey,
        timestamp: validatedEvent.timestamp || new Date().toISOString()
      };

      // Store event
      const storedEvent = await eventModel.create({
        type: eventToStore.type,
        payload: eventToStore.data || (eventToStore as any).payload,
        source: eventToStore.source,
        processed: false
      });

      // Emit to internal event bus for workflow triggering
      await eventBus.emit(eventToStore.type, {
        ...eventToStore,
        databaseId: storedEvent.id
      });

      res.status(201).json({
        success: true,
        eventId: storedEvent.id,
        message: 'Event ingested successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('validation')) {
        return res.status(400).json({
          success: false,
          error: 'Invalid event schema',
          details: error.message
        });
      }
      
      console.error('Event ingestion error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to ingest event'
      });
    }
  });

  // GET /events/schemas - List available event schemas
  router.get('/events/schemas', (req, res) => {
    res.json({
      success: true,
      schemas: {
        'payment.failed': {
          description: 'Payment failure from Stripe',
          source: 'stripe',
          required_fields: ['payment_intent_id', 'customer_id', 'amount', 'currency', 'failure_reason']
        },
        'subscription.dunning': {
          description: 'Subscription dunning event',
          source: 'stripe',
          required_fields: ['subscription_id', 'customer_id', 'amount', 'dunning_level']
        },
        'webhook.dead_letter': {
          description: 'Webhook dead letter event',
          source: 'any',
          required_fields: ['original_url', 'original_payload', 'failure_reason']
        },
        'api.retry': {
          description: 'API retry event',
          source: 'any',
          required_fields: ['endpoint', 'method', 'status_code', 'retry_count']
        }
      }
    });
  });

  async function findEventByIdempotencyKey(key: string, db: DatabaseConnection) {
    // This would need to be implemented in your EventModel
    // For now, returning null to always process new events
    return null;
  }

  function generateIdempotencyKey(event: any): string {
    const eventString = JSON.stringify(event);
    return createHash('sha256').update(eventString).digest('hex');
  }

  return router;
}
