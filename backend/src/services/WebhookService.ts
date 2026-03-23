import crypto from 'crypto';
import { logger } from '../utils/logger.js';
import { createDatabaseConnection } from '../database/connection.js';

export interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  last_triggered_at?: string;
  retry_count: number;
  max_retries: number;
  next_retry_at?: string;
}

export interface WebhookEvent {
  event: string;
  workflow_id: string;
  execution_id: string;
  timestamp: string;
  data: any;
}

export interface WebhookDeliveryResult {
  success: boolean;
  webhook_id: string;
  status_code?: number;
  error?: string;
  retry_in?: number;
}

export class WebhookService {
  private db = createDatabaseConnection();

  /**
   * Generate HMAC SHA256 signature for webhook payload
   */
  generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  calculateRetryDelay(attempt: number): number {
    const delays = [0, 60000, 300000, 900000, 1800000]; // 0, 1min, 5min, 15min, 30min
    return delays[Math.min(attempt, delays.length - 1)] || 1800000;
  }

  /**
   * Send webhook with signature and retry logic
   */
  async sendWebhook(webhook: WebhookSubscription, event: WebhookEvent): Promise<WebhookDeliveryResult> {
    const payload = JSON.stringify(event);
    const signature = this.generateSignature(payload, webhook.secret);
    
    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Torqvio-Signature': `sha256=${signature}`,
          'User-Agent': 'Torqvio-Webhooks/1.0'
        },
        body: payload,
        signal: AbortSignal.timeout(30000) // 30 second timeout
      } as RequestInit);

      if (response.ok) {
        // Success - reset retry count
        await this.resetRetryCount(webhook.id);
        logger.info(`Webhook delivered successfully: ${webhook.id}`, {
          webhookId: webhook.id,
          url: webhook.url,
          event: event.event,
          status: response.status
        });

        return {
          success: true,
          webhook_id: webhook.id,
          status_code: response.status
        };
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      return await this.handleWebhookFailure(webhook, error, event);
    }
  }

  /**
   * Handle webhook delivery failure with retry logic
   */
  private async handleWebhookFailure(
    webhook: WebhookSubscription, 
    error: any, 
    event: WebhookEvent
  ): Promise<WebhookDeliveryResult> {
    const nextRetryCount = webhook.retry_count + 1;
    
    logger.warn(`Webhook delivery failed: ${webhook.id}`, {
      webhookId: webhook.id,
      url: webhook.url,
      event: event.event,
      attempt: nextRetryCount,
      error: error.message
    });

    if (nextRetryCount > webhook.max_retries) {
      // Max retries exceeded - deactivate webhook
      await this.deactivateWebhook(webhook.id);
      return {
        success: false,
        webhook_id: webhook.id,
        error: `Max retries exceeded. Webhook deactivated. Last error: ${error.message}`
      };
    }

    // Schedule retry
    const retryDelay = this.calculateRetryDelay(nextRetryCount);
    const nextRetryAt = new Date(Date.now() + retryDelay);
    
    await this.scheduleRetry(webhook.id, nextRetryCount, nextRetryAt);

    return {
      success: false,
      webhook_id: webhook.id,
      error: error.message,
      retry_in: retryDelay
    };
  }

  /**
   * Send event to all relevant webhooks
   */
  async sendEventToWebhooks(event: WebhookEvent): Promise<WebhookDeliveryResult[]> {
    const webhooks = await this.getWebhooksForEvent(event.event);
    
    if (webhooks.length === 0) {
      logger.debug(`No webhooks found for event: ${event.event}`);
      return [];
    }

    logger.info(`Sending event ${event.event} to ${webhooks.length} webhooks`);

    // Send webhooks in parallel
    const promises = webhooks.map(webhook => this.sendWebhook(webhook, event));
    return await Promise.all(promises);
  }

  /**
   * Get active webhooks that subscribe to a specific event
   */
  async getWebhooksForEvent(eventType: string): Promise<WebhookSubscription[]> {
    const query = `
      SELECT * FROM webhook_subscriptions 
      WHERE active = true 
      AND $1 = ANY(events)
      ORDER BY created_at ASC
    `;
    
    return await this.db.query<WebhookSubscription>(query, [eventType]);
  }

  /**
   * Create a new webhook subscription
   */
  async createWebhook(data: {
    url: string;
    events: string[];
    secret?: string;
    active?: boolean;
  }): Promise<WebhookSubscription> {
    const secret = data.secret || crypto.randomBytes(32).toString('hex');
    
    const query = `
      INSERT INTO webhook_subscriptions (url, events, secret, active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const [webhook] = await this.db.query<WebhookSubscription>(query, [
      data.url,
      data.events,
      secret,
      data.active ?? true
    ]);

    if (!webhook) {
      throw new Error('Failed to create webhook');
    }

    logger.info(`Webhook created: ${webhook.id}`, {
      webhookId: webhook.id,
      url: webhook.url,
      events: webhook.events
    });

    return webhook;
  }

  /**
   * List all webhooks
   */
  async listWebhooks(): Promise<WebhookSubscription[]> {
    const query = 'SELECT * FROM webhook_subscriptions ORDER BY created_at DESC';
    return await this.db.query<WebhookSubscription>(query);
  }

  /**
   * Get webhook by ID
   */
  async getWebhook(id: string): Promise<WebhookSubscription | null> {
    const query = 'SELECT * FROM webhook_subscriptions WHERE id = $1';
    const webhooks = await this.db.query<WebhookSubscription>(query, [id]);
    return webhooks.length > 0 ? (webhooks[0] ?? null) : null;
  }

  /**
   * Update webhook
   */
  async updateWebhook(id: string, updates: Partial<{
    url: string;
    events: string[];
    secret: string;
    active: boolean;
  }>): Promise<WebhookSubscription | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.url) {
      fields.push(`url = $${paramIndex++}`);
      values.push(updates.url);
    }
    if (updates.events) {
      fields.push(`events = $${paramIndex++}`);
      values.push(updates.events);
    }
    if (updates.secret) {
      fields.push(`secret = $${paramIndex++}`);
      values.push(updates.secret);
    }
    if (updates.active !== undefined) {
      fields.push(`active = $${paramIndex++}`);
      values.push(updates.active);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE webhook_subscriptions 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const webhooks = await this.db.query<WebhookSubscription>(query, values);
    return webhooks.length > 0 ? (webhooks[0] ?? null) : null;
  }

  /**
   * Delete webhook
   */
  async deleteWebhook(id: string): Promise<boolean> {
    const query = 'DELETE FROM webhook_subscriptions WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }

  /**
   * Reset retry count after successful delivery
   */
  private async resetRetryCount(webhookId: string): Promise<void> {
    const query = `
      UPDATE webhook_subscriptions 
      SET retry_count = 0, next_retry_at = NULL, last_triggered_at = NOW()
      WHERE id = $1
    `;
    await this.db.query(query, [webhookId]);
  }

  /**
   * Schedule retry for failed webhook
   */
  private async scheduleRetry(webhookId: string, retryCount: number, nextRetryAt: Date): Promise<void> {
    const query = `
      UPDATE webhook_subscriptions 
      SET retry_count = $1, next_retry_at = $2
      WHERE id = $3
    `;
    await this.db.query(query, [retryCount, nextRetryAt, webhookId]);
  }

  /**
   * Deactivate webhook after max retries
   */
  private async deactivateWebhook(webhookId: string): Promise<void> {
    const query = 'UPDATE webhook_subscriptions SET active = false WHERE id = $1';
    await this.db.query(query, [webhookId]);
    
    logger.warn(`Webhook deactivated due to max retries: ${webhookId}`, {
      webhookId
    });
  }

  /**
   * Process webhooks that are ready for retry
   */
  async processRetries(): Promise<void> {
    const query = `
      SELECT * FROM webhook_subscriptions 
      WHERE active = true 
      AND next_retry_at <= NOW()
      AND retry_count > 0
    `;
    
    const webhooks = await this.db.query<WebhookSubscription>(query);
    
    if (webhooks.length === 0) {
      return;
    }

    logger.info(`Processing ${webhooks.length} webhook retries`);

    // Reset retry attempts and let normal processing handle them
    for (const webhook of webhooks) {
      if (webhook) {
        await this.db.query(
          'UPDATE webhook_subscriptions SET next_retry_at = NULL WHERE id = $1',
          [webhook.id]
        );
      }
    }
  }
}
