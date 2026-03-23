import { v4 as uuidv4 } from 'uuid';
import { ExecutionEngine } from './ExecutionEngine.js';
import { createDatabaseConnection } from '../database/connection.js';
import { FlowDefinition } from '../types/index.js';

export class WorkflowEngine {
  private executionEngine: ExecutionEngine;
  private db = createDatabaseConnection();

  constructor() {
    this.executionEngine = new ExecutionEngine();
  }

  /**
   * Trigger a workflow by name with payload
   */
  async trigger(workflowName: string, payload: Record<string, any> = {}): Promise<{ executionId: string; status: string }> {
    console.log(`🚀 Triggering workflow: ${workflowName}`);
    
    // Find workflow by name
    const flowResult = await this.db.query(
      'SELECT * FROM flows WHERE name = $1',
      [workflowName]
    );
    
    if (flowResult.length === 0) {
      throw new Error(`Workflow not found: ${workflowName}`);
    }
    
    const flow = flowResult[0];
    const flowDefinition: FlowDefinition = JSON.parse(flow.definition);
    
    // Execute the workflow
    const execution = await this.executionEngine.executeFlow(flowDefinition, payload);
    
    return {
      executionId: execution.id,
      status: execution.status
    };
  }

  /**
   * Get workflow execution status
   */
  async getExecutionStatus(executionId: string): Promise<any> {
    const result = await this.db.query(
      'SELECT * FROM flow_executions WHERE id = $1',
      [executionId]
    );
    
    if (result.length === 0) {
      throw new Error(`Execution not found: ${executionId}`);
    }
    
    const execution = result[0];
    
    return {
      id: execution.id,
      status: execution.status,
      results: execution.results ? JSON.parse(execution.results) : null,
      error: execution.error,
      created_at: execution.created_at,
      completed_at: execution.completed_at
    };
  }

  /**
   * Find executions that are due for processing
   */
  async findDueExecutions(): Promise<any[]> {
    return await this.executionEngine.findDueExecutions();
  }

  /**
   * Resume a suspended execution
   */
  async resumeExecution(executionId: string): Promise<any> {
    return await this.executionEngine.resumeExecution(executionId);
  }
}

// Export singleton instance
export const WorkflowEngineInstance = new WorkflowEngine();
