import { v4 as uuidv4 } from 'uuid';
import {
  FlowDefinition,
  StepDefinition,
  StepType,
  StepConfig,
  RetryPolicy,
  BackoffStrategy,
  CreateFlowRequest
} from '../types/index.js';

/**
 * FlowBuilder - Code-first API for defining durable workflows
 * 
 * Usage:
 * ```typescript
 * const flow = await flow("user-onboarding")
 *   .step(sendWelcomeEmail)
 *   .sleep("1h")
 *   .step(checkUserActivity)
 *   .retry(3, "exponential")
 *   .build();
 * ```
 */

export class FlowBuilder {
  protected flow: Partial<FlowDefinition>;
  protected currentStepId?: string;

  constructor(name: string) {
    this.flow = {
      id: uuidv4(),
      name,
      steps: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  /**
   * Add a function step to the flow
   */
  step(fn: Function | string, config?: Partial<StepConfig>): FlowBuilder {
    const stepId = uuidv4();
    const step: StepDefinition = {
      id: stepId,
      name: typeof fn === 'string' ? fn : fn.name || 'anonymous',
      type: StepType.FUNCTION,
      config: {
        functionCode: typeof fn === 'string' ? undefined : fn.toString(),
        functionName: typeof fn === 'string' ? fn : fn.name,
        timeout: 30000, // 30 seconds default
        ...config
      }
    };

    // Link previous step to this one
    if (this.currentStepId) {
      const prevStep = this.flow.steps!.find(s => s.id === this.currentStepId);
      if (prevStep) {
        prevStep.nextStepId = stepId;
      }
    }

    this.flow.steps!.push(step);
    this.currentStepId = stepId;
    return this;
  }

  /**
   * Add a sleep/delay step
   */
  sleep(duration: string): FlowBuilder {
    const stepId = uuidv4();
    const step: StepDefinition = {
      id: stepId,
      name: `sleep-${duration}`,
      type: StepType.SLEEP,
      config: {
        duration
      }
    };

    if (this.currentStepId) {
      const prevStep = this.flow.steps!.find(s => s.id === this.currentStepId);
      if (prevStep) {
        prevStep.nextStepId = stepId;
      }
    }

    this.flow.steps!.push(step);
    this.currentStepId = stepId;
    return this;
  }

  /**
   * Add retry configuration
   */
  retry(maxAttempts: number, strategy: BackoffStrategy = BackoffStrategy.EXPONENTIAL): FlowBuilder {
    if (!this.currentStepId) {
      throw new Error('No step to apply retry to. Add a step first.');
    }

    const currentStep = this.flow.steps!.find(s => s.id === this.currentStepId);
    if (!currentStep) {
      throw new Error('Current step not found');
    }

    // Apply retry to the last step
    currentStep.config.maxAttempts = maxAttempts;
    currentStep.config.backoffStrategy = strategy;

    // Also set global retry policy
    this.flow.retryPolicy = {
      maxAttempts,
      backoffStrategy: strategy
    };

    return this;
  }

  /**
   * Add conditional execution
   */
  when(condition: string): FlowBuilder {
    if (!this.currentStepId) {
      throw new Error('No step to apply condition to. Add a step first.');
    }

    const currentStep = this.flow.steps!.find(s => s.id === this.currentStepId);
    if (!currentStep) {
      throw new Error('Current step not found');
    }

    currentStep.condition = condition;
    return this;
  }

  /**
   * Add timeout for current step
   */
  timeout(ms: number): FlowBuilder {
    if (!this.currentStepId) {
      throw new Error('No step to apply timeout to. Add a step first.');
    }

    const currentStep = this.flow.steps!.find(s => s.id === this.currentStepId);
    if (!currentStep) {
      throw new Error('Current step not found');
    }

    currentStep.config.timeout = ms;
    return this;
  }

  /**
   * Make current step idempotent
   */
  idempotent(key?: string): FlowBuilder {
    if (!this.currentStepId) {
      throw new Error('No step to make idempotent. Add a step first.');
    }

    const currentStep = this.flow.steps!.find(s => s.id === this.currentStepId);
    if (!currentStep) {
      throw new Error('Current step not found');
    }

    currentStep.config.idempotencyKey = key || `step-${this.currentStepId}`;
    return this;
  }

  /**
   * Build and return the flow definition
   */
  build(): FlowDefinition {
    if (!this.flow.steps || this.flow.steps.length === 0) {
      throw new Error('Flow must have at least one step');
    }

    this.flow.updatedAt = new Date();
    return this.flow as FlowDefinition;
  }

  /**
   * Convert to JSON for storage
   */
  toJSON(): string {
    return JSON.stringify(this.build());
  }

  /**
   * Create flow from JSON
   */
  static fromJSON(json: string): FlowBuilder {
    const flowDef = JSON.parse(json) as FlowDefinition;
    const builder = new FlowBuilder(flowDef.name);
    (builder as any).flow = flowDef;
    return builder;
  }
}

/**
 * Main flow function - entry point for creating flows
 */
export function flow(name: string): FlowBuilder {
  return new FlowBuilder(name);
}

/**
 * Create flow from request object
 */
export function createFlowFromRequest(request: CreateFlowRequest): FlowDefinition {
  const builder = new FlowBuilder(request.name);
  
  // Add steps from request
  request.steps.forEach((step, index) => {
    const stepId = uuidv4();
    const stepDef: StepDefinition = {
      id: stepId,
      name: step.name,
      type: step.type,
      config: step.config,
      nextStepId: index < request.steps.length - 1 ? 'next' : undefined
    };
    
    (builder as any).flow.steps!.push(stepDef);
  });

  if (request.retryPolicy) {
    (builder as any).flow.retryPolicy = request.retryPolicy;
  }

  return builder.build();
}
