import { DatabaseConnection } from './connection.js';
import { EventSubscription } from '../types/index.js';

export class EventSubscriptionModel {
  constructor(private db: DatabaseConnection) {}

  async create(subscription: Omit<EventSubscription, 'id' | 'createdAt'>): Promise<EventSubscription> {
    const query = `
      INSERT INTO event_subscriptions (flow_id, event_type, filter_config, active, project_id)
      RETURNING *
    `;
    
    const [result] = await this.db.query<EventSubscription>(query, [
      subscription.flowId,
      subscription.filterConfig ? JSON.stringify(subscription.filterConfig) : null,
      subscription.active,
      subscription.projectId || null
    ]);
    
    return result!;
  }

  async findById(id: string): Promise<EventSubscription | null> {
    const query = 'SELECT id, flow_id, event_type, filter_config, active, created_at, updated_at FROM event_subscriptions WHERE id = $1';
    return await this.db.queryOne<EventSubscription>(query, [id]);
  }

  async findByFlowId(flowId: string): Promise<EventSubscription[]> {
    const query = 'SELECT id, flow_id, event_type, filter_config, active, created_at, updated_at FROM event_subscriptions WHERE flow_id = $1 ORDER BY created_at DESC LIMIT 100';
    return await this.db.query<EventSubscription>(query, [flowId]);
  }

  async findByEventType(eventType: string): Promise<EventSubscription[]> {
    const query = 'SELECT id, flow_id, event_type, filter_config, active, created_at, updated_at FROM event_subscriptions WHERE event_type = $1 ORDER BY created_at DESC LIMIT 100';
    return await this.db.query<EventSubscription>(query, [eventType]);
  }

  async findActive(): Promise<EventSubscription[]> {
    const query = 'SELECT id, flow_id, event_type, filter_config, active, created_at, updated_at FROM event_subscriptions WHERE active = true ORDER BY created_at DESC LIMIT 1000';
    return await this.db.query<EventSubscription>(query);
  }

  async findWithFilters(filters: {
    flowId?: string;
    eventType?: string;
    active?: boolean;
    projectId?: string;
  }): Promise<EventSubscription[]> {
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (filters.flowId) {
      conditions.push(`flow_id = $${paramIndex++}`);
      values.push(filters.flowId);
    }

    if (filters.eventType) {
      conditions.push(`event_type = $${paramIndex++}`);
      values.push(filters.eventType);
    }

    if (filters.active !== undefined) {
      conditions.push(`active = $${paramIndex++}`);
      values.push(filters.active);
    }

    if (filters.projectId) {
      conditions.push(`project_id = $${paramIndex++}`);
      values.push(filters.projectId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const query = `SELECT id, flow_id, event_type, filter_config, active, created_at, updated_at FROM event_subscriptions ${whereClause} ORDER BY created_at DESC LIMIT 1000`;

    return await this.db.query<EventSubscription>(query, values);
  }

  async activate(id: string): Promise<boolean> {
    const query = 'UPDATE event_subscriptions SET active = true WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }

  async deactivate(id: string): Promise<boolean> {
    const query = 'UPDATE event_subscriptions SET active = false WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }

  async update(id: string, updates: Partial<EventSubscription>): Promise<EventSubscription | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.flowId) {
      fields.push(`flow_id = $${paramIndex++}`);
      values.push(updates.flowId);
    }
    if (updates.eventType) {
      fields.push(`event_type = $${paramIndex++}`);
      values.push(updates.eventType);
    }
    if (updates.filterConfig) {
      fields.push(`filter_config = $${paramIndex++}`);
      values.push(JSON.stringify(updates.filterConfig));
    }
    if (updates.active !== undefined) {
      fields.push(`active = $${paramIndex++}`);
      values.push(updates.active);
    }
    if (updates.projectId) {
      fields.push(`project_id = $${paramIndex++}`);
      values.push(updates.projectId);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE event_subscriptions 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [result] = await this.db.query<EventSubscription>(query, values);
    return result || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM event_subscriptions WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }

  /**
   * Find subscriptions that match an event
   */
  async findMatchingSubscriptions(eventType: string, payload: Record<string, any>): Promise<EventSubscription[]> {
    const query = `
      SELECT * FROM event_subscriptions 
      WHERE active = true AND event_type = $1
      ORDER BY created_at DESC
    `;
    
    const subscriptions = await this.db.query<EventSubscription>(query, [eventType]);
    
    // Filter by event filter config if present
    return subscriptions.filter(subscription => {
      if (!subscription.filterConfig) {
        return true; // No filter means match all events of this type
      }
      
      return this.matchesFilter(subscription.filterConfig, payload);
    });
  }

  /**
   * Check if payload matches the filter configuration
   */
  private matchesFilter(filter: Record<string, any>, payload: Record<string, any>): boolean {
    for (const [key, expectedValue] of Object.entries(filter)) {
      const actualValue = this.getNestedValue(payload, key);
      
      if (typeof expectedValue === 'object' && expectedValue !== null) {
        // Handle nested filters
        if (!this.matchesFilter(expectedValue, actualValue || {})) {
          return false;
        }
      } else if (actualValue !== expectedValue) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}
