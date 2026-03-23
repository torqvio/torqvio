import { EventBus } from './EventBus.js';
import { FlowModel } from '../database/models.js';
import { ExecutionEngine } from '../engine/ExecutionEngine.js';
import { DatabaseConnection } from '../database/connection.js';

export class WorkflowTriggerMapper {
  private flowModel: FlowModel;

  constructor(
    private db: DatabaseConnection,
    private eventBus: EventBus,
    private executionEngine: ExecutionEngine
  ) {
    this.flowModel = new FlowModel(db);
    this.setupMappings();
  }

  private setupMappings(): void {
    // Payment Failed → Payment Recovery Workflow
    this.eventBus.on('payment.failed', async (event) => {
      const paymentRecoveryFlow = await this.flowModel.findByName('Stripe Payment Recovery');
      
      if (paymentRecoveryFlow) {
        await this.executionEngine.executeFlow(paymentRecoveryFlow, {
          event: event.payload,
          source: event.source,
          timestamp: event.timestamp
        });
      }
    });

    // Subscription Dunning → Subscription Dunning Workflow
    this.eventBus.on('subscription.dunning', async (event) => {
      const dunningFlow = await this.flowModel.findByName('Subscription Dunning');
      
      if (dunningFlow) {
        await this.executionEngine.executeFlow(dunningFlow, {
          event: event.payload,
          source: event.source,
          timestamp: event.timestamp
        });
      }
    });

    // Webhook Dead Letter → Dead Letter Queue Workflow
    this.eventBus.on('webhook.dead_letter', async (event) => {
      const deadLetterFlow = await this.flowModel.findByName('Webhook Dead Letter Queue');
      
      if (deadLetterFlow) {
        await this.executionEngine.executeFlow(deadLetterFlow, {
          event: event.payload,
          source: event.source,
          timestamp: event.timestamp
        });
      }
    });

    // API Retry → API Retry Pipeline Workflow
    this.eventBus.on('api.retry', async (event) => {
      const retryFlow = await this.flowModel.findByName('API Retry Pipeline');
      
      if (retryFlow) {
        await this.executionEngine.executeFlow(retryFlow, {
          event: event.payload,
          source: event.source,
          timestamp: event.timestamp
        });
      }
    });
  }
}
