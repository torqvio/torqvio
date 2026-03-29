import { DatabaseConnection } from '../database/connection.js';
import { logger } from '../utils/logger.js';
import { workflow, WorkflowDefinition } from '../../../packages/core/dist/index.js';

// Step handlers for different workflow step types
const stepHandlers = {
  http_request: async (input: any, context: any) => {
    const { url, method = 'GET', headers = {}, body } = input;
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  transform: async (input: any, context: any) => {
    const { script, variables = {} } = input;
    const func = new Function('input', 'context', 'variables', `${script}`);
    return func(input, context, variables);
  },

  condition: async (input: any, context: any) => {
    const { condition, trueValue, falseValue } = input;
    const func = new Function('input', 'context', `return ${condition};`);
    const result = func(input, context);
    return result ? trueValue : falseValue;
  },

  delay: async (input: any, context: any) => {
    const { milliseconds = 1000 } = input;
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    return { delayed: true, duration: milliseconds };
  },

  validate: async (input: any, context: any) => {
    const { schema, data } = input;
    const required = schema.required || [];
    const missing = required.filter((field: string) => !(field in data));
    
    if (missing.length > 0) {
      throw new Error(`Validation failed: missing required fields: ${missing.join(', ')}`);
    }
    
    return { valid: true, data };
  },

  send_email: async (input: any, context: any) => {
    const { to, subject, body, from } = input;
    logger.info('Email would be sent:', { to, subject, from });
    return { sent: true, to, subject };
  },

  database_query: async (input: any, context: any) => {
    const { query, params = [] } = input;
    const db = DatabaseConnection.getInstance();
    
    try {
      const result = await db.query(query, params);
      return { success: true, data: result, count: result.length };
    } catch (error) {
      throw new Error(`Database query failed: ${(error as Error).message}`);
    }
  },

  webhook: async (input: any, context: any) => {
    const { url, payload, headers = {} } = input;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    return { webhookSent: true, url, status: response.status };
  }
};

function convertToCoreWorkflow(definition: any): WorkflowDefinition {
  const steps: WorkflowDefinition = {};
  
  if (definition.steps && Array.isArray(definition.steps)) {
    definition.steps.forEach((step: any, index: number) => {
      const stepName = step.name || `step_${index}`;
      const stepType = step.type || 'transform';
      
      let handler: (input: any, context: any) => Promise<any>;
      
      switch (stepType) {
        case 'http_request': handler = stepHandlers.http_request; break;
        case 'transform': handler = stepHandlers.transform; break;
        case 'condition': handler = stepHandlers.condition; break;
        case 'delay': handler = stepHandlers.delay; break;
        case 'validate': handler = stepHandlers.validate; break;
        case 'send_email': handler = stepHandlers.send_email; break;
        case 'database_query': handler = stepHandlers.database_query; break;
        case 'webhook': handler = stepHandlers.webhook; break;
        default: handler = stepHandlers.transform;
      }
      
      steps[stepName] = {
        handler,
        retries: step.retries || 3,
        timeout: step.timeout || 30000
      };
    });
  }
  
  return steps;
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private db: DatabaseConnection;

  private constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  async trigger(workflowType: string, data: any): Promise<string> {
    try {
      // Find workflow by type/name using specific columns and better query
      const flowResult = await this.db.query(
        'SELECT id, name, definition, retry_policy, created_at, updated_at FROM flows WHERE name = $1 LIMIT 1',
        [workflowType]
      );

      // Fallback to type search if no exact name match
      let flow = flowResult.length > 0 ? flowResult[0] : null;
      
      if (!flow) {
        // Use more efficient JSONB query instead of text LIKE
        const typeFlowResult = await this.db.query(
          'SELECT id, name, definition, retry_policy, created_at, updated_at FROM flows WHERE definition->>\'type\' = $1 LIMIT 1',
          [workflowType]
        );
        
        if (typeFlowResult.length > 0) {
          flow = typeFlowResult[0];
        }
      }

      if (!flow) {
        logger.warn(`No workflow found for type: ${workflowType}`);
        return 'no-workflow-found';
      }

      // Create execution record with specific columns
      const executionResult = await this.db.query(
        `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
         VALUES ($1, 'pending', $2, NOW(), NOW())
         RETURNING id, flow_id, status, payload, created_at, updated_at`,
        [flow.id, JSON.stringify(data || {})]
      );

      const execution = executionResult[0];

      logger.info(`Workflow triggered: ${workflowType}`, {
        workflowId: flow.id,
        executionId: execution.id,
        workflowType
      });

      // Execute workflow asynchronously
      this.executeWorkflowAsync(flow, execution, data).catch(error => {
        logger.error('Async workflow execution failed:', error);
      });

      return execution.id;
    } catch (error) {
      logger.error(`Failed to trigger workflow: ${workflowType}`, error);
      throw error;
    }
  }

  private async executeWorkflowAsync(flow: any, execution: any, input: any): Promise<void> {
    try {
      await this.db.query(
        'UPDATE flow_executions SET status = $1, updated_at = NOW() WHERE id = $2',
        ['running', execution.id]
      );

      let workflowDefinition;
      try {
        if (typeof flow.definition === 'string') {
          workflowDefinition = JSON.parse(flow.definition);
        } else {
          workflowDefinition = flow.definition;
        }
      } catch (error) {
        throw new Error(`Invalid workflow definition: ${(error as Error).message}`);
      }

      const coreWorkflowDefinition = convertToCoreWorkflow(workflowDefinition);
      const workflowInstance = workflow(flow.name, coreWorkflowDefinition);

      logger.info(`Executing workflow: ${flow.name}`, {
        workflowId: flow.id,
        executionId: execution.id,
        stepsCount: Object.keys(coreWorkflowDefinition).length
      });

      const workflowExecution = await workflowInstance.execute(input);

      const result = {
        status: workflowExecution.status,
        output: workflowExecution.results,
        results: workflowExecution.results,
        error: workflowExecution.error,
        startedAt: workflowExecution.startedAt,
        completedAt: workflowExecution.completedAt,
        stepsExecuted: Object.keys(workflowExecution.results).length
      };

      await this.db.query(
        `UPDATE flow_executions 
         SET status = $1, results = $2, completed_at = NOW(), updated_at = NOW() 
         WHERE id = $3`,
        [workflowExecution.status, JSON.stringify(result), execution.id]
      );

      logger.info(`Workflow execution completed: ${execution.id}`, {
        executionId: execution.id,
        status: workflowExecution.status,
        stepsExecuted: result.stepsExecuted,
        duration: workflowExecution.completedAt ? 
          workflowExecution.completedAt.getTime() - workflowExecution.startedAt.getTime() : 0
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await this.db.query(
        `UPDATE flow_executions 
         SET status = $1, results = $2, completed_at = NOW(), updated_at = NOW() 
         WHERE id = $3`,
        ['failed', JSON.stringify({ error: errorMessage }), execution.id]
      );

      logger.error(`Workflow execution failed: ${execution.id}`, error);
    }
  }
}
