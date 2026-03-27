import { Router } from 'express';
import { EventBus } from '../../events/EventBus.js';
import { EventProcessor } from '../../events/EventProcessor.js';
import { Event, EventSubscription } from '../../types/index.js';

const router: Router = Router();

/**
 * POST /events
 * Publish a new event to the event bus
 */
router.post('/events', async (req, res) => {
  try {
    const { type, payload, source, correlationId, causationId, projectId } = req.body;

    if (!type) {
      return res.status(400).json({
        error: 'Missing required field: type'
      });
    }

    const event = await req.eventBus.publish({
      type,
      payload: payload || {},
      source: source || 'api',
      correlationId,
      causationId,
      projectId
    });

    res.status(201).json({
      success: true,
      eventId: event.id,
      message: 'Event published successfully'
    });

  } catch (error) {
    console.error('Failed to publish event:', error);
    res.status(500).json({
      error: 'Failed to publish event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /events
 * List events with optional filtering
 */
router.get('/events', async (req, res) => {
  try {
    const { type, processed, limit = 50, offset = 0 } = req.query;

    // This would need to be implemented in the EventModel
    const events = await req.eventModel.findWithFilters({
      type: type as string,
      processed: processed === 'true',
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    });

    res.json({
      events,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: events.length
      }
    });

  } catch (error) {
    console.error('Failed to fetch events:', error);
    res.status(500).json({
      error: 'Failed to fetch events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /events/:id
 * Get a specific event by ID
 */
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await req.eventModel.findById(id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    res.json({ event });

  } catch (error) {
    console.error('Failed to fetch event:', error);
    res.status(500).json({
      error: 'Failed to fetch event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /events/:id/process
 * Manually trigger processing of an unprocessed event
 */
router.post('/events/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await req.eventModel.findById(id);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    if (event.processed) {
      return res.status(400).json({
        error: 'Event has already been processed'
      });
    }

    await req.eventProcessor.processEvent(event);

    res.json({
      success: true,
      message: 'Event processed successfully'
    });

  } catch (error) {
    console.error('Failed to process event:', error);
    res.status(500).json({
      error: 'Failed to process event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /events/process-unprocessed
 * Process all unprocessed events (useful for recovery)
 */
router.post('/events/process-unprocessed', async (req, res) => {
  try {
    await req.eventProcessor.processUnprocessedEvents();

    res.json({
      success: true,
      message: 'Unprocessed events processed successfully'
    });

  } catch (error) {
    console.error('Failed to process unprocessed events:', error);
    res.status(500).json({
      error: 'Failed to process unprocessed events',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /event-subscriptions
 * Create a new event subscription
 */
router.post('/event-subscriptions', async (req, res) => {
  try {
    const { flowId, eventType, filterConfig, projectId } = req.body;

    if (!flowId || !eventType) {
      return res.status(400).json({
        error: 'Missing required fields: flowId, eventType'
      });
    }

    const subscription: Omit<EventSubscription, 'id' | 'createdAt'> = {
      flowId,
      eventType,
      filterConfig,
      active: true,
      projectId
    };

    const createdSubscription = await req.eventSubscriptionModel.create(subscription);

    res.status(201).json({
      subscription: createdSubscription,
      message: 'Event subscription created successfully'
    });

  } catch (error) {
    console.error('Failed to create event subscription:', error);
    res.status(500).json({
      error: 'Failed to create event subscription',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /event-subscriptions
 * List event subscriptions
 */
router.get('/event-subscriptions', async (req, res) => {
  try {
    const { flowId, eventType, active, projectId } = req.query;

    const subscriptions = await req.eventSubscriptionModel.findWithFilters({
      flowId: flowId as string,
      eventType: eventType as string,
      active: active === 'true',
      projectId: projectId as string
    });

    res.json({ subscriptions });

  } catch (error) {
    console.error('Failed to fetch event subscriptions:', error);
    res.status(500).json({
      error: 'Failed to fetch event subscriptions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /event-subscriptions/:id/activate
 * Activate an event subscription
 */
router.put('/event-subscriptions/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await req.eventSubscriptionModel.activate(id);
    
    if (!success) {
      return res.status(404).json({
        error: 'Event subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Event subscription activated successfully'
    });

  } catch (error) {
    console.error('Failed to activate event subscription:', error);
    res.status(500).json({
      error: 'Failed to activate event subscription',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /event-subscriptions/:id/deactivate
 * Deactivate an event subscription
 */
router.put('/event-subscriptions/:id/deactivate', async (req, res) => {
  try {
    const { id } = req.params;
    
    const success = await req.eventSubscriptionModel.deactivate(id);
    
    if (!success) {
      return res.status(404).json({
        error: 'Event subscription not found'
      });
    }

    res.json({
      success: true,
      message: 'Event subscription deactivated successfully'
    });

  } catch (error) {
    console.error('Failed to deactivate event subscription:', error);
    res.status(500).json({
      error: 'Failed to deactivate event subscription',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
