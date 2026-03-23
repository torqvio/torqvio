import { v4 as uuidv4 } from 'uuid';
import { 
  FlowDefinition, 
  FlowExecution, 
  StepResult, 
  StepDefinition, 
  StepType,
  ExecutionStatus,
  StepStatus,
  ExecutionContext,
  ExecutionError
} from '../types/index.js';
import { FlowExecutionModel, StepResultModel } from '../database/models.js';
import { createDatabaseConnection } from '../database/connection.js';

export class ExecutionEngine {
  private executionModel: FlowExecutionModel;
  private stepResultModel: StepResultModel;
  private db = createDatabaseConnection();

  constructor() {
    this.executionModel = new FlowExecutionModel(this.db);
    this.stepResultModel = new StepResultModel(this.db);
  }

  /**
   * Execute a flow with the given payload
   */
  async executeFlow(flow: FlowDefinition, payload: Record<string, any> = {}): Promise<FlowExecution> {
    console.log(`🚀 Starting execution of flow: ${flow.name}`);
    
    // Create execution record
    const executionData: Omit<FlowExecution, 'id' | 'createdAt' | 'updatedAt'> = {
      flowId: flow.id,
      status: ExecutionStatus.RUNNING,
      payload,
      context: {
        stepResults: {},
        retryCount: {},
        errors: [],
        metadata: {}
      },
      startedAt: new Date()
    };

    if (flow.steps[0]?.id) {
      executionData.currentStepId = flow.steps[0].id;
    }

    const execution: FlowExecution = await this.executionModel.create(executionData);

    try {
      // Execute steps sequentially
      await this.executeSteps(flow, execution);
      
      // Mark as completed
      await this.executionModel.update(execution.id, {
        status: ExecutionStatus.COMPLETED,
        completedAt: new Date(),
        currentStepId: undefined
      });

      console.log(`✅ Flow execution completed: ${flow.name}`);
      return await this.executionModel.findById(execution.id) as FlowExecution;

    } catch (error) {
      console.error(`❌ Flow execution failed: ${flow.name}`, error);
      
      // Mark as failed
      await this.executionModel.update(execution.id, {
        status: ExecutionStatus.FAILED,
        completedAt: new Date()
      });

      throw error;
    }
  }

  /**
   * Resume a suspended execution (for retries, delays, etc.)
   */
  async resumeExecution(executionId: string): Promise<FlowExecution> {
    console.log(`🔄 Resuming execution: ${executionId}`);
    
    const execution = await this.executionModel.findById(executionId);
    if (!execution) {
      throw new Error(`Execution not found: ${executionId}`);
    }

    if (execution.status !== ExecutionStatus.SLEEPING && execution.status !== ExecutionStatus.RETRYING) {
      throw new Error(`Cannot resume execution in status: ${execution.status}`);
    }

    // Get the flow definition (we'd need to store this or fetch it)
    // For now, let's assume we have access to it
    const flow = await this.getFlowDefinition(execution.flowId);
    
    // Update status to running
    await this.executionModel.update(executionId, {
      status: ExecutionStatus.RUNNING,
      nextRunAt: undefined
    });

    try {
      await this.executeSteps(flow, execution, execution.currentStepId);
      
      await this.executionModel.update(executionId, {
        status: ExecutionStatus.COMPLETED,
        completedAt: new Date(),
        currentStepId: undefined
      });

      return await this.executionModel.findById(executionId) as FlowExecution;

    } catch (error) {
      await this.executionModel.update(executionId, {
        status: ExecutionStatus.FAILED,
        completedAt: new Date()
      });
      throw error;
    }
  }

  /**
   * Execute steps starting from a specific step
   */
  private async executeSteps(
    flow: FlowDefinition, 
    execution: FlowExecution, 
    startStepId?: string
  ): Promise<void> {
    const context = execution.context as ExecutionContext;
    const startIndex = startStepId 
      ? flow.steps.findIndex(step => step.id === startStepId)
      : 0;

    for (let i = startIndex; i < flow.steps.length; i++) {
      const step = flow.steps[i];
      
      // Update current step
      await this.executionModel.update(execution.id, {
        currentStepId: step.id
      });

      // Check if step should be skipped (conditional execution)
      if (step.condition && !this.evaluateCondition(step.condition, context)) {
        console.log(`⏭️ Skipping step: ${step.name} (condition not met)`);
        continue;
      }

      // Execute the step
      const stepResult = await this.executeStep(step, execution);
      
      // Store step result
      context.stepResults[step.id] = stepResult;
      
      // Update execution context
      await this.executionModel.update(execution.id, {
        context: context
      });

      // Handle step failure
      if (stepResult.status === StepStatus.FAILED) {
        const retryCount = context.retryCount[step.id] || 0;
        const maxAttempts = step.config.maxAttempts || flow.retryPolicy?.maxAttempts || 3;
        
        if (retryCount < maxAttempts) {
          console.log(`🔄 Retrying step: ${step.name} (attempt ${retryCount + 1}/${maxAttempts})`);
          
          // Calculate retry delay
          const delay = this.calculateRetryDelay(retryCount, step.config.backoffStrategy || flow.retryPolicy?.backoffStrategy);
          
          // Update retry count
          context.retryCount[step.id] = retryCount + 1;
          
          // Schedule retry
          await this.executionModel.update(execution.id, {
            status: ExecutionStatus.RETRYING,
            nextRunAt: new Date(Date.now() + delay),
            context: context
          });
          
          return; // Exit and will be resumed later
        } else {
          throw new Error(`Step failed after ${maxAttempts} attempts: ${step.name}`);
        }
      }
    }
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: StepDefinition, execution: FlowExecution): Promise<StepResult> {
    console.log(`⚡ Executing step: ${step.name}`);
    
    const startTime = new Date();
    const stepResult: StepResult = {
      stepId: step.id,
      stepName: step.name,
      status: StepStatus.RUNNING,
      startedAt: startTime,
      duration: 0
    };

    try {
      let output: any;

      switch (step.type) {
        case StepType.FUNCTION:
          output = await this.executeFunctionStep(step, execution);
          break;
          
        case StepType.SLEEP:
          output = await this.executeSleepStep(step);
          break;
          
        case StepType.VALIDATION:
          output = await this.executeValidationStep(step, execution);
          break;
          
        case StepType.PAYMENT_GATEWAY:
          output = await this.executePaymentGatewayStep(step, execution);
          break;
          
        case StepType.DATABASE:
          output = await this.executeDatabaseStep(step, execution);
          break;
          
        case StepType.NOTIFICATION:
          output = await this.executeNotificationStep(step, execution);
          break;
          
        case StepType.SCHEDULER:
          output = await this.executeSchedulerStep(step, execution);
          break;
          
        default:
          throw new Error(`Unsupported step type: ${step.type}`);
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      stepResult.status = StepStatus.COMPLETED;
      stepResult.output = output;
      stepResult.completedAt = endTime;
      stepResult.duration = duration;

      console.log(`✅ Step completed: ${step.name} (${duration}ms)`);

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      stepResult.status = StepStatus.FAILED;
      stepResult.error = {
        stepId: step.id,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: endTime,
        retryable: true
      };
      stepResult.completedAt = endTime;
      stepResult.duration = duration;

      console.log(`❌ Step failed: ${step.name}`, error);
    }

    // Save step result
    const savedResult = await this.stepResultModel.create({
      executionId: execution.id,
      stepId: stepResult.stepId,
      stepName: stepResult.stepName,
      status: stepResult.status,
      output: stepResult.output,
      error: stepResult.error,
      completedAt: stepResult.completedAt,
      duration: stepResult.duration
    });

    return savedResult;
  }

  /**
   * Execute a function step
   */
  private async executeFunctionStep(step: StepDefinition, execution: FlowExecution): Promise<any> {
    // For now, we'll simulate function execution
    // In a real implementation, you'd need to handle:
    // - Loading the function code
    // - Sandboxed execution
    // - Timeout handling
    // - Resource limits
    
    if (!step.config.functionCode) {
      throw new Error(`No function code found for step: ${step.name}`);
    }

    // Simulate function execution with timeout
    const timeout = step.config.timeout || 30000;
    
    return await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Function timeout after ${timeout}ms`));
      }, timeout);

      // Simulate function execution
      try {
        // This is where you'd actually execute the user's function
        // For now, we'll just return a mock result
        const result = {
          executed: true,
          stepName: step.name,
          payload: execution.payload,
          timestamp: new Date()
        };
        
        clearTimeout(timer);
        resolve(result);
      } catch (error) {
        clearTimeout(timer);
        reject(error);
      }
    });
  }

  /**
   * Execute a sleep step
   */
  private async executeSleepStep(step: StepDefinition): Promise<any> {
    const duration = step.config.duration;
    if (!duration) {
      throw new Error(`No duration specified for sleep step: ${step.name}`);
    }

    const ms = this.parseDuration(duration);
    console.log(`😴 Sleeping for ${duration} (${ms}ms)`);
    
    await new Promise(resolve => setTimeout(resolve, ms));
    
    return { slept: duration, durationMs: ms };
  }

  /**
   * Execute a validation step
   */
  private async executeValidationStep(step: StepDefinition, execution: FlowExecution): Promise<any> {
    const { required_fields, amount_limits } = step.config;
    const payload = execution.payload;
    
    // Check required fields
    if (required_fields) {
      for (const field of required_fields) {
        if (!payload[field]) {
          throw new Error(`Required field missing: ${field}`);
        }
      }
    }
    
    // Check amount limits
    if (amount_limits && payload.amount) {
      if (payload.amount < amount_limits.min || payload.amount > amount_limits.max) {
        throw new Error(`Amount ${payload.amount} outside limits (${amount_limits.min}-${amount_limits.max})`);
      }
    }
    
    return { validated: true, payload };
  }

  /**
   * Execute a payment gateway step
   */
  private async executePaymentGatewayStep(step: StepDefinition, execution: FlowExecution): Promise<any> {
    const { provider, retry_count = 3, retry_delay = 1000 } = step.config;
    const payload = execution.payload;
    
    if (provider === 'stripe') {
      // Simulate Stripe payment processing
      console.log(`Processing ${provider} payment:`, payload);
      
      // Simulate payment processing with retry logic
      for (let attempt = 1; attempt <= retry_count; attempt++) {
        try {
          // Mock successful payment
          const result = {
            payment_intent_id: `pi_${Math.random().toString(36).substr(2, 9)}`,
            status: 'succeeded',
            amount: payload.amount,
            currency: payload.currency,
            provider: 'stripe'
          };
          
          console.log(`Payment succeeded on attempt ${attempt}`);
          return result;
        } catch (error) {
          if (attempt === retry_count) {
            throw error;
          }
          console.log(`Payment failed, retrying in ${retry_delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, retry_delay));
        }
      }
    }
    
    throw new Error(`Unsupported payment provider: ${provider}`);
  }

  /**
   * Execute a database step
   */
  private async executeDatabaseStep(step: StepDefinition, execution: FlowExecution): Promise<any> {
    const { table, db_operation } = step.config;
    const payload = execution.payload;
    
    console.log(`Database operation: ${db_operation} on table: ${table}`);
    
    // Simulate database operation
    const result = {
      table,
      operation: db_operation,
      record_id: `rec_${Math.random().toString(36).substr(2, 9)}`,
      affected_rows: 1,
      payload
    };
    
    return result;
  }

  /**
   * Execute a notification step
   */
  private async executeNotificationStep(step: StepDefinition, execution: FlowExecution): Promise<any> {
    const { channels, template } = step.config;
    const payload = execution.payload;
    
    console.log(`Sending notification via: ${channels?.join(', ')}`);
    
    // Simulate notification sending
    const results = channels?.map(channel => ({
      channel,
      template,
      status: 'sent',
      recipient: payload.customer_email || payload.email,
      sent_at: new Date()
    }));
    
    return { notifications: results };
  }

  /**
   * Execute a scheduler step
   */
  private async executeSchedulerStep(step: StepDefinition, execution: FlowExecution): Promise<any> {
    const { next_run, workflow: scheduledWorkflow } = step.config;
    
    console.log(`Scheduling workflow: ${scheduledWorkflow} for: ${next_run}`);
    
    // Simulate workflow scheduling
    const result = {
      scheduled_workflow: scheduledWorkflow,
      next_run,
      scheduled_at: new Date(),
      execution_id: `sched_${Math.random().toString(36).substr(2, 9)}`
    };
    
    return result;
  }

  /**
   * Parse duration string to milliseconds
   */
  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)(s|m|h|d)$/);
    if (!match) {
      throw new Error(`Invalid duration format: ${duration}`);
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's': return value * 1000;
      case 'm': return value * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      default: throw new Error(`Unknown duration unit: ${unit}`);
    }
  }

  /**
   * Calculate retry delay based on strategy
   */
  private calculateRetryDelay(attempt: number, strategy?: string): number {
    const baseDelay = 1000; // 1 second

    switch (strategy) {
      case 'fixed':
        return baseDelay;
        
      case 'linear':
        return baseDelay * (attempt + 1);
        
      case 'exponential':
        return baseDelay * Math.pow(2, attempt);
        
      default:
        return baseDelay * Math.pow(2, attempt); // Default to exponential
    }
  }

  /**
   * Evaluate conditional expressions
   */
  private evaluateCondition(condition: string, context: ExecutionContext): boolean {
    // Simple condition evaluation for now
    // In a real implementation, you'd want a proper expression parser
    try {
      // This is a very basic implementation
      // You'd want to use something like JavaScript's eval in a sandbox
      // or a proper expression language
      
      // For now, just return true (no conditions)
      return true;
    } catch (error) {
      console.error(`Condition evaluation failed: ${condition}`, error);
      return false;
    }
  }

  /**
   * Get flow definition (placeholder - would need proper implementation)
   */
  private async getFlowDefinition(flowId: string): Promise<FlowDefinition> {
    // This would fetch the flow from storage
    // For now, throw an error to indicate this needs implementation
    throw new Error('Flow definition retrieval not implemented');
  }

  /**
   * Find executions that are due for processing
   */
  async findDueExecutions(): Promise<FlowExecution[]> {
    return await this.executionModel.findDueForExecution();
  }
}
