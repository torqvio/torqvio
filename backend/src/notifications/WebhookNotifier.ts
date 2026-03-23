import { getWebhookDbConnection } from '../database/webhook-connection.js';
import { logger } from '../utils/logger.js';
import crypto from 'crypto';

export interface WebhookEvent {
  event: string;
  workflow_id: string;
  execution_id: string;
  timestamp: string;
  data: any;
}

export class WebhookNotifier {
  private db = getWebhookDbConnection();

  /**
   * Send webhook event to all subscribed webhooks
   */
  async sendEvent(event: WebhookEvent): Promise<void> {
    try {
      const webhooks = await this.getActiveWebhooks();
      
      if (webhooks.length === 0) {
        logger.debug(`No active webhooks found for event: ${event.event}`);
        return;
      }

      logger.info(`Sending webhook event ${event.event} to ${webhooks.length} webhooks`);

      // Send webhooks in parallel
      const promises = webhooks.map(webhook => this.sendWebhook(webhook, event));
      const results = await Promise.allSettled(promises);

      // Log results
      const successCount = results.filter(r => r.status === 'fulfilled').length;
      const failureCount = results.length - successCount;

      logger.info(`Webhook delivery completed for ${event.event}`, {
        eventType: event.event,
        total: results.length,
        success: successCount,
        failures: failureCount,
        workflow_id: event.workflow_id,
        execution_id: event.execution_id
      });

    } catch (error) {
      logger.error(`Failed to send webhook event: ${event.event}`, error);
    }
  }

  /**
   * Get all active webhooks
   */
  private async getActiveWebhooks(): Promise<any[]> {
    const result = await this.db.query(`
      SELECT id, url, secret, trigger_id
      FROM webhooks 
      WHERE active = true
    `);

    return result;
  }

  /**
   * Send webhook to a specific URL
   */
  private async sendWebhook(webhook: any, event: WebhookEvent): Promise<void> {
    try {
      // Parse events from trigger_id field
      let subscribedEvents = ['workflow.started', 'workflow.completed', 'workflow.failed'];
      try {
        if (webhook.trigger_id) {
          subscribedEvents = JSON.parse(webhook.trigger_id);
        }
      } catch (e) {
        // Keep default events if parsing fails
      }

      // Check if this webhook subscribes to this event
      if (!subscribedEvents.includes(event.event)) {
        return; // Skip this webhook
      }

      // Generate signature
      const payload = JSON.stringify(event);
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payload)
        .digest('hex');

      // Send webhook
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
        // Update last_triggered_at if the column exists
        try {
          await this.db.query(`
            UPDATE webhooks 
            SET last_triggered_at = NOW() 
            WHERE id = $1
          `, [webhook.id]);
        } catch (e) {
          // Column doesn't exist, ignore
        }

        logger.debug(`Webhook delivered successfully: ${webhook.id}`, {
          webhookId: webhook.id,
          url: webhook.url,
          event: event.event,
          status: response.status
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

    } catch (error) {
      logger.warn(`Webhook delivery failed: ${webhook.id}`, {
        webhookId: webhook.id,
        url: webhook.url,
        event: event.event,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  /**
   * Emit workflow started event
   */
  async emitWorkflowStarted(data: {
    workflowId: string;
    executionId: string;
    workflowName?: string;
    inputPayload?: any;
  }): Promise<void> {
    const event: WebhookEvent = {
      event: 'workflow.started',
      workflow_id: data.workflowId,
      execution_id: data.executionId,
      timestamp: new Date().toISOString(),
      data: {
        workflow_name: data.workflowName || 'Unknown Workflow',
        input_payload: data.inputPayload || {}
      }
    };

    await this.sendEvent(event);
  }

  /**
   * Emit workflow completed event
   */
  async emitWorkflowCompleted(data: {
    workflowId: string;
    executionId: string;
    workflowName?: string;
    result?: any;
    executionTime?: number;
  }): Promise<void> {
    const event: WebhookEvent = {
      event: 'workflow.completed',
      workflow_id: data.workflowId,
      execution_id: data.executionId,
      timestamp: new Date().toISOString(),
      data: {
        workflow_name: data.workflowName || 'Unknown Workflow',
        result: data.result || {},
        execution_time: data.executionTime || 0
      }
    };

    await this.sendEvent(event);
  }

  /**
   * Emit workflow failed event
   */
  async emitWorkflowFailed(data: {
    workflowId: string;
    executionId: string;
    workflowName?: string;
    error: {
      message: string;
      code?: string;
      step?: string;
    };
    executionTime?: number;
  }): Promise<void> {
    const event: WebhookEvent = {
      event: 'workflow.failed',
      workflow_id: data.workflowId,
      execution_id: data.executionId,
      timestamp: new Date().toISOString(),
      data: {
        workflow_name: data.workflowName || 'Unknown Workflow',
        error: data.error,
        execution_time: data.executionTime || 0
      }
    };

    await this.sendEvent(event);
  }
}

// Export singleton instance
export const webhookNotifier = new WebhookNotifier();
