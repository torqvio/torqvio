import { v4 as uuidv4 } from 'uuid';
import { 
  Event, 
  EventHandler, 
  EventBus as IEventBus
} from '../types/index.js';
import { EventModel } from '../database/models.js';
import { DatabaseConnection } from '../database/connection.js';

export class EventBus implements IEventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  private eventModel: EventModel;
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.eventModel = new EventModel(db);
  }

  /**
   * Publish an event to the event bus
   */
  async publish(event: Omit<Event, 'id' | 'timestamp'>): Promise<void> {
    const fullEvent: Event = {
      ...event,
      id: uuidv4(),
      timestamp: new Date(),
      processed: false
    };

    try {
      // Store event in database
      await this.eventModel.create(fullEvent);
      
      // Get handlers for this event type
      const handlers = this.handlers.get(event.type);
      if (handlers) {
        // Execute all handlers asynchronously
        const promises = Array.from(handlers).map(async (handler) => {
          try {
            await handler(fullEvent);
          } catch (error) {
            console.error(`Error in event handler for ${event.type}:`, error);
            // Continue processing other handlers even if one fails
          }
        });
        
        await Promise.allSettled(promises);
      }

      console.log(`📨 Event published: ${event.type} (${fullEvent.id})`);
    } catch (error) {
      console.error(`❌ Failed to publish event ${event.type}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to events of a specific type
   */
  subscribe(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);
    console.log(`👂 Subscribed to event type: ${eventType}`);
  }

  /**
   * Alias for subscribe for compatibility with implementation guide
   */
  on(eventType: string, handler: EventHandler): void {
    this.subscribe(eventType, handler);
  }

  /**
   * Emit an event (alias for publish)
   */
  async emit(eventType: string, data: any): Promise<void> {
    await this.publish({
      type: eventType,
      payload: data,
      source: data.source || 'unknown'
    } as any);
  }

  /**
   * Unsubscribe from events of a specific type
   */
  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      
      if (handlers.size === 0) {
        this.handlers.delete(eventType);
      }
      
      console.log(`👋 Unsubscribed from event type: ${eventType}`);
    }
  }

  /**
   * Get all active subscriptions
   */
  getSubscriptions(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Get handler count for an event type
   */
  getHandlerCount(eventType: string): number {
    return this.handlers.get(eventType)?.size || 0;
  }

  /**
   * Clear all subscriptions
   */
  clear(): void {
    this.handlers.clear();
    console.log('🧹 All event subscriptions cleared');
  }
}
