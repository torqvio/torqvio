import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

// Types for workflow definition
export interface WorkflowStepConfig {
  handler: (input: any, context: WorkflowContext) => Promise<any>;
  retries?: number;
  timeout?: number;
}

export interface WorkflowDefinition {
  [stepName: string]: WorkflowStepConfig;
}

export interface WorkflowContext {
  results: Record<string, any>;
  input: any;
  stepName: string;
  workflowId: string;
  executionId: string;
}

export interface Workflow {
  id: string;
  name: string;
  definition: WorkflowDefinition;
  execute(input?: any): Promise<WorkflowExecution>;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: any;
  results: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  error?: string;
}

// Validation schemas
export const WorkflowStepConfigSchema = z.object({
  handler: z.function(),
  retries: z.number().optional().default(3),
  timeout: z.number().optional().default(30000)
});

export const WorkflowDefinitionSchema = z.record(z.string(), WorkflowStepConfigSchema);

// Core workflow function
export function workflow(name: string, definition: WorkflowDefinition): Workflow {
  // Validate the workflow definition
  WorkflowDefinitionSchema.parse(definition);

  const workflowId = uuidv4();

  return {
    id: workflowId,
    name,
    definition,
    async execute(input = {}) {
      const executionId = uuidv4();
      const execution: WorkflowExecution = {
        id: executionId,
        workflowId,
        status: 'pending',
        input,
        results: {},
        startedAt: new Date()
      };

      try {
        execution.status = 'running';
        
        // Execute steps in order
        for (const [stepName, stepConfig] of Object.entries(definition)) {
          const context: WorkflowContext = {
            results: execution.results,
            input,
            stepName,
            workflowId,
            executionId
          };

          let lastError: Error | null = null;
          const maxRetries = stepConfig.retries || 3;
          const timeout = stepConfig.timeout || 30000;

          // Retry logic
          for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
              // Execute with timeout
              const result = await Promise.race([
                stepConfig.handler(input, context),
                new Promise<never>((_, reject) => 
                  setTimeout(() => reject(new Error(`Step timeout after ${timeout}ms`)), timeout)
                )
              ]);

              execution.results[stepName] = result;
              break; // Success, exit retry loop
            } catch (error) {
              lastError = error as Error;
              if (attempt === maxRetries) {
                throw new Error(`Step '${stepName}' failed after ${maxRetries + 1} attempts: ${lastError.message}`);
              }
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
          }
        }

        execution.status = 'completed';
        execution.completedAt = new Date();
      } catch (error) {
        execution.status = 'failed';
        execution.error = (error as Error).message;
        execution.completedAt = new Date();
        throw error;
      }

      return execution;
    }
  };
}

// Export types and the main workflow function
export { workflow as default };
