import { logger } from '../utils/logger.js';
import { DatabaseConnection } from '../database/connection.js';
import { StepHandlers, StepInput, StepContext } from './StepHandlers.js';
import { flow } from '../engine/FlowBuilder.js';
import { ExecutionEngine } from '../engine/ExecutionEngine.js';

export interface FlowDefinition {
  id: string;
  name: string;
  definition: string | WorkflowStepData;
  project_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkflowStepData {
  steps: WorkflowStep[];
  retryPolicy?: {
    maxRetries: number;
    backoffStrategy: 'exponential' | 'linear' | 'fixed';
  };
}

export interface WorkflowStep {
  name?: string;
  type: string;
  retries?: number;
  timeout?: number;
  [key: string]: any;
}

export interface FlowExecution {
  id: string;
  flow_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  payload: Record<string, any>;
  results?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface WorkflowExecutionResult {
  status: string;
  output: Record<string, any>;
  results: Record<string, any>;
  error?: string;
  startedAt: Date;
  completedAt?: Date;
  stepsExecuted: number;
}

/**
 * Centralized workflow execution service to eliminate duplication
 */
export class WorkflowService {
  private db = DatabaseConnection.getInstance();
  private executionEngine = new ExecutionEngine();

  /**
   * Execute a workflow asynchronously
   */
  async executeWorkflowAsync(flow: FlowDefinition, execution: FlowExecution, input: Record<string, any>): Promise<void> {
    try {
      // Update execution status to running
      await this.updateExecutionStatus(execution.id, 'running');
      
      // Parse workflow definition
      const workflowDefinition = this.parseWorkflowDefinition(flow.definition);
      
      // Convert to core workflow format
      const coreWorkflowDefinition = this.convertToCoreWorkflow(workflowDefinition);
      
      // Create and execute workflow using ExecutionEngine
      const workflowExecution = await this.executionEngine.executeFlow(coreWorkflowDefinition, input);
      
      // Prepare result for storage
      const result = this.prepareExecutionResult(workflowExecution);
      
      // Update execution with results
      await this.updateExecutionWithResults(execution.id, result);
      
      logger.info(`Workflow execution completed: ${execution.id}`, {
        executionId: execution.id,
        status: workflowExecution.status,
        stepsExecuted: result.stepsExecuted,
        duration: this.calculateDuration(result)
      });
      
    } catch (error) {
      // Update execution with error
      await this.updateExecutionWithError(execution.id, error as Error);
      
      logger.error(`Workflow execution failed: ${execution.id}`, error);
    }
  }

  /**
   * Parse workflow definition from string or object
   */
  private parseWorkflowDefinition(definition: string | WorkflowStepData): WorkflowStepData {
    try {
      if (typeof definition === 'string') {
        return JSON.parse(definition);
      } else {
        return definition;
      }
    } catch (error) {
      throw new Error(`Invalid workflow definition: ${(error as Error).message}`);
    }
  }

  /**
   * Convert stored workflow definition to core workflow format
   */
  private convertToCoreWorkflow(definition: WorkflowStepData): any {
    const steps: any = {};
    
    if (definition.steps && Array.isArray(definition.steps)) {
      definition.steps.forEach((step: WorkflowStep, index: number) => {
        const stepName = step.name || `step_${index}`;
        const stepType = step.type || 'transform';
        
        // Get the appropriate handler from StepHandlers
        const handler = StepHandlers.getHandler(stepType);
        
        steps[stepName] = {
          handler,
          retries: step.retries || 3,
          timeout: step.timeout || 30000
        };
      });
    }
    
    return steps;
  }

  /**
   * Prepare execution result for storage
   */
  private prepareExecutionResult(workflowExecution: any): any {
    return {
      status: workflowExecution.status,
      output: workflowExecution.results,
      results: workflowExecution.results,
      error: workflowExecution.error,
      startedAt: workflowExecution.startedAt,
      completedAt: workflowExecution.completedAt,
      stepsExecuted: Object.keys(workflowExecution.results).length
    };
  }

  /**
   * Update execution status in database
   */
  private async updateExecutionStatus(executionId: string, status: string): Promise<void> {
    await this.db.query(
      'UPDATE flow_executions SET status = $1, updated_at = NOW() WHERE id = $2',
      [status, executionId]
    );
  }

  /**
   * Update execution with results
   */
  private async updateExecutionWithResults(executionId: string, result: WorkflowExecutionResult): Promise<void> {
    await this.db.query(
      `UPDATE flow_executions 
       SET status = $1, results = $2, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $3`,
      [result.status, JSON.stringify(result), executionId]
    );
  }

  /**
   * Update execution with error
   */
  private async updateExecutionWithError(executionId: string, error: Error): Promise<void> {
    await this.db.query(
      `UPDATE flow_executions 
       SET status = $1, error = $2, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $3`,
      ['failed', error.message, executionId]
    );
  }

  /**
   * Calculate execution duration
   */
  private calculateDuration(result: WorkflowExecutionResult): number {
    return result.completedAt ? 
      result.completedAt.getTime() - result.startedAt.getTime() : 0;
  }

  /**
   * Create a new execution record
   */
  async createExecution(flowId: string, payload: Record<string, any> = {}): Promise<FlowExecution> {
    const result = await this.db.query(
      `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
       VALUES ($1, 'pending', $2, NOW(), NOW())
       RETURNING *`,
      [flowId, JSON.stringify(payload)]
    );
    
    return result[0];
  }

  /**
   * Get execution by ID
   */
  async getExecution(executionId: string): Promise<FlowExecution | null> {
    const result = await this.db.query(
      'SELECT id, flow_id, status, payload, context, results, error, created_at, updated_at, started_at, completed_at, next_run_at, triggered_by, trigger_metadata FROM flow_executions WHERE id = $1',
      [executionId]
    );
    
    return result.length > 0 ? this.mapRowToExecution(result[0]) : null;
  }

  /**
   * Get executions by flow ID
   */
  async getExecutionsByFlowId(flowId: string, limit: number = 50): Promise<FlowExecution[]> {
    const limitedCount = Math.min(limit, 100); // Max 100 for safety
    const result = await this.db.query(
      'SELECT id, flow_id, status, payload, context, results, error, created_at, updated_at, started_at, completed_at, next_run_at, triggered_by, trigger_metadata FROM flow_executions WHERE flow_id = $1 ORDER BY created_at DESC LIMIT $2',
      [flowId, limitedCount]
    );
    
    return result.map(row => this.mapRowToExecution(row));
  }

  /**
   * Trigger workflow execution by flow name
   */
  async triggerWorkflow(flowName: string, payload: Record<string, any> = {}): Promise<FlowExecution> {
    // Find the flow with specific columns
    const flowResult = await this.db.query(
      'SELECT id, name, definition, project_id, status, created_at, updated_at, tags, version FROM flows WHERE name = $1 LIMIT 1',
      [flowName]
    );
    
    if (flowResult.length === 0) {
      throw new Error(`Workflow not found: ${flowName}`);
    }
    
    const flow = flowResult[0];
    
    // Create execution record
    const execution = await this.createExecution(flow.id, payload);
    
    logger.info(`Workflow execution started: ${flowName}`, { 
      workflowId: flow.id,
      executionId: execution.id 
    });
    
    // Execute the workflow asynchronously
    this.executeWorkflowAsync(flow, execution, payload).catch(error => {
      logger.error('Async workflow execution failed:', error);
    });
    
    return execution;
  }

  private mapRowToExecution(row: any): FlowExecution {
    return {
      id: row.id,
      flow_id: row.flow_id,
      status: row.status as 'pending' | 'running' | 'completed' | 'failed',
      payload: this.parseJsonSafely(row.payload),
      results: row.results ? this.parseJsonSafely(row.results) : undefined,
      error: row.error,
      created_at: row.created_at,
      updated_at: row.updated_at,
      completed_at: row.completed_at
    };
  }

  private parseJsonSafely(json: string | object | null): any {
    if (!json) return {};
    if (typeof json === 'object') return json;
    try {
      return JSON.parse(json);
    } catch (error) {
      logger.warn('Failed to parse JSON in WorkflowService:', error);
      return {};
    }
  }
}
