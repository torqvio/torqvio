import { getWebhookDbConnection } from '../database/webhook-connection.js';
import { logger } from '../utils/logger.js';

// Simple in-memory queue for webhook creation
class WebhookQueue {
  private queue: Array<{
    data: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timestamp: number;
  }> = [];
  
  private processing = false;
  private batchSize = 10;
  private batchTimeout = 100; // 100ms
  private maxQueueSize = 1000;
  private batchTimer: NodeJS.Timeout | null = null;

  async addToQueue(data: any): Promise<any> {
    return new Promise((resolve, reject) => {
      // Reject if queue is full (circuit breaker)
      if (this.queue.length >= this.maxQueueSize) {
        reject(new Error('Queue full - try again later'));
        return;
      }

      this.queue.push({
        data,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    this.processing = true;

    try {
      while (this.queue.length > 0) {
        const batch = this.queue.splice(0, this.batchSize);
        
        // Process batch in parallel
        await Promise.allSettled(
          batch.map(item => this.processWebhook(item))
        );
      }
    } finally {
      this.processing = false;
    }
  }

  private async processWebhook(item: any): Promise<void> {
    try {
      const db = getWebhookDbConnection();
      const { data, resolve, reject } = item;

      // Fast batch insert
      const result = await db.query(
        `INSERT INTO webhooks (id, url, secret, active, trigger_id) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, url, active, created_at, updated_at`,
        [
          data.webhookId,
          data.url,
          data.webhookSecret,
          data.active,
          JSON.stringify(data.events)
        ]
      );

      resolve(result[0]);
    } catch (error) {
      item.reject(error);
    }
  }

  getStats() {
    return {
      queueLength: this.queue.length,
      processing: this.processing,
      maxQueueSize: this.maxQueueSize,
      batchSize: this.batchSize
    };
  }
}

// Global queue instance
export const webhookQueue = new WebhookQueue();
