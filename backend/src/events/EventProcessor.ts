import { 
  Event, 
  EventProcessor as IEventProcessor,
  FlowDefinition,
  FlowExecution,
  ExecutionStatus,
  EventSubscription,
  Trigger,
  TriggerType
} from '../types/index.js';
import { FlowModel, EventModel, TriggerModel, FlowExecutionModel } from '../database/models.js';
import { ExecutionEngine } from '../engine/ExecutionEngine.js';

export class EventProcessor implements IEventProcessor {
  private flowModel: FlowModel;
  private eventModel: EventModel;
  private triggerModel: TriggerModel;
  private executionModel: FlowExecutionModel;
  private executionEngine: ExecutionEngine;

  constructor(
    flowModel: FlowModel,
    eventModel: EventModel,
    triggerModel: TriggerModel,
    executionModel: FlowExecutionModel,
    executionEngine: ExecutionEngine
  ) {
    this.flowModel = flowModel;
    this.eventModel = eventModel;
    this.triggerModel = triggerModel;
    this.executionModel = executionModel;
    this.executionEngine = executionEngine;
  }

  /**
   * Process an incoming event and trigger matching workflows
   */
  async processEvent(event: Event): Promise<void> {
    try {
      console.log(`🔄 Processing event: ${event.type} (${event.id})`);

      // Find workflows that should be triggered by this event
      const matchingWorkflows = await this.findMatchingWorkflows(event);
      
      if (matchingWorkflows.length === 0) {
        console.log(`ℹ️ No workflows found for event type: ${event.type}`);
        await this.eventModel.markAsProcessed(event.id);
        return;
      }

      console.log(`🎯 Found ${matchingWorkflows.length} matching workflows for event: ${event.type}`);

      // Execute the triggered workflows
      await this.executeTriggeredWorkflows(event, matchingWorkflows);

      // Mark event as processed
      await this.eventModel.markAsProcessed(event.id);
      
      console.log(`✅ Event processed successfully: ${event.type} (${event.id})`);
    } catch (error) {
      console.error(`❌ Failed to process event ${event.id}:`, error);
      throw error;
    }
  }

  /**
   * Find workflows that match the given event
   */
  async findMatchingWorkflows(event: Event): Promise<FlowDefinition[]> {
    const matchingWorkflows: FlowDefinition[] = [];

    // Find triggers that match this event type
    const triggers = await this.triggerModel.findByType(TriggerType.EVENT);
    
    for (const trigger of triggers) {
      // Check if trigger config matches this event
      if (this.doesTriggerMatchEvent(trigger, event)) {
        const workflow = await this.flowModel.findById(trigger.flowId);
        if (workflow && trigger.active) {
          matchingWorkflows.push(workflow);
        }
      }
    }

    return matchingWorkflows;
  }

  /**
   * Execute workflows that were triggered by an event
   */
  async executeTriggeredWorkflows(event: Event, workflows: FlowDefinition[]): Promise<void> {
    const executions: Promise<void>[] = [];

    for (const workflow of workflows) {
      const executionPromise = (async () => {
        try {
          // Create execution with event payload
          const execution = await this.executionEngine.executeFlow(workflow, {
            event: {
              id: event.id,
              type: event.type,
              payload: event.payload,
              source: event.source,
              timestamp: event.timestamp
            }
          });

          console.log(`🚀 Started workflow execution: ${workflow.name} -> ${execution.id}`);
        } catch (error) {
          console.error(`❌ Failed to start workflow ${workflow.name}:`, error);
          // Continue with other workflows even if one fails
        }
      })();

      executions.push(executionPromise);
    }

    // Wait for all executions to start
    await Promise.allSettled(executions);
  }

  /**
   * Check if a trigger configuration matches an event
   */
  private doesTriggerMatchEvent(trigger: Trigger, event: Event): boolean {
    const config = trigger.config;

    // Check event type match
    if (config.eventType && config.eventType !== event.type) {
      return false;
    }

    // Check event filters
    if (config.eventFilter) {
      return this.matchesEventFilter(config.eventFilter, event.payload);
    }

    return true;
  }

  /**
   * Check if event payload matches the filter criteria
   */
  private matchesEventFilter(filter: Record<string, any>, payload: Record<string, any>): boolean {
    for (const [key, expectedValue] of Object.entries(filter)) {
      const actualValue = this.getNestedValue(payload, key);
      
      if (typeof expectedValue === 'object' && expectedValue !== null) {
        // Handle nested filters
        if (!this.matchesEventFilter(expectedValue, actualValue || {})) {
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

  /**
   * Process unprocessed events (useful for recovery)
   */
  async processUnprocessedEvents(): Promise<void> {
    try {
      const unprocessedEvents = await this.eventModel.findUnprocessed();
      
      if (unprocessedEvents.length === 0) {
        console.log('ℹ️ No unprocessed events found');
        return;
      }

      console.log(`🔄 Processing ${unprocessedEvents.length} unprocessed events`);

      for (const event of unprocessedEvents) {
        await this.processEvent(event);
      }

      console.log('✅ All unprocessed events handled');
    } catch (error) {
      console.error('❌ Failed to process unprocessed events:', error);
      throw error;
    }
  }
}
