import { WebhookService, WebhookEvent } from '../services/WebhookService.js';
import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';

export class WorkflowEventEmitter extends EventEmitter {
  private webhookService: WebhookService;
  private retryInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.webhookService = new WebhookService();
    this.setupEventHandlers();
    this.startRetryProcessor();
  }

  /**
   * Setup event handlers for workflow events
   */
  private setupEventHandlers(): void {
    // Workflow started event
    this.on('workflow.started', async (data) => {
      await this.handleWorkflowEvent('workflow.started', data);
    });

    // Workflow completed event
    this.on('workflow.completed', async (data) => {
      await this.handleWorkflowEvent('workflow.completed', data);
    });

    // Workflow failed event
    this.on('workflow.failed', async (data) => {
      await this.handleWorkflowEvent('workflow.failed', data);
    });
  }

  /**
   * Handle workflow events and send webhooks
   */
  private async handleWorkflowEvent(eventType: string, data: any): Promise<void> {
    try {
      const webhookEvent: WebhookEvent = {
        event: eventType,
        workflow_id: data.workflowId || data.workflow_id || 'unknown',
        execution_id: data.executionId || data.execution_id || 'unknown',
        timestamp: new Date().toISOString(),
        data: {
          workflow_name: data.workflowName || data.workflow_name || 'Unknown Workflow',
          ...data
        }
      };

      // Remove redundant fields from data
      if (webhookEvent.data.workflowId) delete webhookEvent.data.workflowId;
      if (webhookEvent.data.executionId) delete webhookEvent.data.executionId;
      if (webhookEvent.data.workflowName) delete webhookEvent.data.workflowName;

      const results = await this.webhookService.sendEventToWebhooks(webhookEvent);
      
      // Log results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      logger.info(`Webhook delivery completed for ${eventType}`, {
        eventType,
        total: results.length,
        success: successCount,
        failures: failureCount,
        workflow_id: webhookEvent.workflow_id,
        execution_id: webhookEvent.execution_id
      });

      // Emit results for monitoring
      this.emit('webhook.delivery.completed', {
        eventType,
        results,
        successCount,
        failureCount
      });

    } catch (error) {
      logger.error(`Failed to handle workflow event: ${eventType}`, error);
      this.emit('webhook.delivery.error', {
        eventType,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Start the retry processor to handle failed webhook deliveries
   */
  private startRetryProcessor(): void {
    // Process retries every minute
    this.retryInterval = setInterval(async () => {
      try {
        await this.webhookService.processRetries();
      } catch (error) {
        logger.error('Failed to process webhook retries:', error);
      }
    }, 60000); // 1 minute
  }

  /**
   * Stop the retry processor
   */
  stopRetryProcessor(): void {
    if (this.retryInterval) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
    }
  }

  /**
   * Emit workflow started event
   */
  emitWorkflowStarted(data: {
    workflowId: string;
    executionId: string;
    workflowName?: string;
    inputPayload?: any;
  }): void {
    this.emit('workflow.started', data);
  }

  /**
   * Emit workflow completed event
   */
  emitWorkflowCompleted(data: {
    workflowId: string;
    executionId: string;
    workflowName?: string;
    result?: any;
    executionTime?: number;
  }): void {
    this.emit('workflow.completed', data);
  }

  /**
   * Emit workflow failed event
   */
  emitWorkflowFailed(data: {
    workflowId: string;
    executionId: string;
    workflowName?: string;
    error: {
      message: string;
      code?: string;
      step?: string;
    };
    executionTime?: number;
  }): void {
    this.emit('workflow.failed', data);
  }
}

// Global instance
export const workflowEventEmitter = new WorkflowEventEmitter();
