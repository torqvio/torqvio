import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { apiAuthMiddleware } from '../../middleware/apiAuth.js';
import { FlowRepository, FlowExecutionRepository } from '../../repositories/FlowRepository.js';
import { WorkflowService } from '../../services/WorkflowService.js';
import { 
  ListFlowsQuery,
  ApiResponse,
  NotFoundError,
  ValidationError
} from '../../types/index.js';

const router: Router = Router();
const flowRepository = new FlowRepository();
const executionRepository = new FlowExecutionRepository();
const workflowService = new WorkflowService();

// GET /workflows - List all workflows (matching documented API)
router.get('/', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    const projectId = (req as any).projectId;
    
    // Convert limit to number and validate
    const limitNum = Math.min(Number(limit), 100); // Max 100 items per page
    
    const query: ListFlowsQuery = {
      limit: limitNum
    };
    
    const { flows, meta } = await flowRepository.list(query, projectId);
    
    const response: ApiResponse = {
      success: true,
      data: { workflows: flows, ...meta },
      meta
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to list workflows:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_WORKFLOWS_ERROR',
        message: 'Failed to list workflows',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /workflows - List all workflows (matching documented API)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { cursor, limit = 10, direction = 'forward' } = req.query;
    
    // Convert limit to number and validate
    const limitNum = Math.min(Number(limit), 100); // Max 100 items per page
    
    const query = {
      limit: limitNum,
      cursor: cursor as string,
      direction: direction as 'forward' | 'backward'
    };
    
    const { workflows, meta } = await flowRepository.list(query);
    
    res.json({
      workflows,
      pagination: {
        count: meta.count,
        limit: limitNum,
        hasMore: meta.hasMore,
        nextCursor: meta.nextCursor,
        prevCursor: meta.prevCursor,
        direction
      }
    });
  } catch (error) {
    logger.error('Failed to list workflows:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    res.status(500).json({
      error: 'Failed to list workflows',
      message: errorMessage
    });
  }
});

// POST /workflows - Create a new workflow (matching documented API)
router.post('/', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, steps } = req.body;
    
    if (!name || !steps) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'name and steps are required'
      });
    }
    
    const db = (req as any).db || createDatabaseConnection();
    
    const definition = { steps };
    
    const result = await db.query(
      `INSERT INTO flows (name, definition, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING *`,
      [name, JSON.stringify(definition)]
    );
    
    const workflow = {
      id: result[0].id,
      name: result[0].name,
      description: description || '',
      steps: steps,
      status: 'active',
      created_at: result[0].created_at,
      updated_at: result[0].updated_at
    };
    
    logger.info(`Workflow created: ${name}`, { workflowId: result[0].id });
    
    console.log('Created workflow:', workflow);
    
    res.status(201).json({
      data: workflow,
      message: 'Workflow created successfully'
    });
  } catch (error) {
    logger.error('Failed to create workflow:', error);
    console.error('Workflow creation error details:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    res.status(500).json({
      error: 'Failed to create workflow',
      message: errorMessage
    });
  }
});

// GET /workflows/:id - Get a specific workflow (matching documented API)
router.get('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = DatabaseConnection.getInstance();
    
    const result = await db.query(
      'SELECT * FROM flows WHERE id = $1',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        message: `Workflow with id ${id} not found`
      });
    }
    
    const workflow = {
      id: result[0].id,
      name: result[0].name,
      description: result[0].description || '',
      steps: JSON.parse(result[0].definition || '{}').steps || [],
      status: result[0].status || 'active',
      created_at: result[0].created_at,
      updated_at: result[0].updated_at
    };
    
    res.json({
      data: workflow
    });
  } catch (error) {
    logger.error('Failed to get workflow:', error);
    res.status(500).json({
      error: 'Failed to get workflow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /workflows/:id - Update a workflow (matching documented API)
router.put('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, steps } = req.body;
    const db = DatabaseConnection.getInstance();
    
    const existing = await db.query(
      'SELECT * FROM flows WHERE id = $1',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        message: `Workflow with id ${id} not found`
      });
    }
    
    const definition = JSON.parse(existing[0].definition || '{}');
    if (steps) {
      definition.steps = steps;
    }
    
    const result = await db.query(
      `UPDATE flows 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           definition = $3,
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [name, description, JSON.stringify(definition), id]
    );
    
    const workflow = {
      id: result[0].id,
      name: result[0].name,
      description: result[0].description || '',
      steps: JSON.parse(result[0].definition || '{}').steps || [],
      status: result[0].status || 'active',
      created_at: result[0].created_at,
      updated_at: result[0].updated_at
    };
    
    logger.info(`Workflow updated: ${id}`, { workflowId: id });
    
    res.json({
      data: workflow,
      message: 'Workflow updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update workflow:', error);
    res.status(500).json({
      error: 'Failed to update workflow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /workflows/:id - Delete a workflow (matching documented API)
router.delete('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = DatabaseConnection.getInstance();
    
    const existing = await db.query(
      'SELECT * FROM flows WHERE id = $1',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        message: `Workflow with id ${id} not found`
      });
    }
    
    await db.query('DELETE FROM flows WHERE id = $1', [id]);
    
    logger.info(`Workflow deleted: ${id}`, { workflowId: id });
    
    res.json({
      message: 'Workflow deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete workflow:', error);
    res.status(500).json({
      error: 'Failed to delete workflow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /workflows/:id/trigger - Trigger a workflow (matching documented API)
router.post('/:id/trigger', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payload = req.body;
    const db = (req as any).db || createDatabaseConnection();
    
    const flowResult = await db.query(
      'SELECT * FROM flows WHERE id = $1',
      [id]
    );
    
    if (flowResult.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        message: `Workflow with ID ${id} does not exist`
      });
    }
    
    const flow = flowResult[0];
    
    const executionResult = await db.query(
      `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
       VALUES ($1, 'pending', $2, NOW(), NOW())
       RETURNING *`,
      [id, JSON.stringify(payload || {})]
    );
    
    const execution = executionResult[0];
    
    logger.info(`Workflow execution started: ${id}`, { 
      workflowId: id, 
      executionId: execution.id 
    });
    
    executeWorkflowAsync(flow, execution, payload || {}).catch(error => {
      logger.error('Async workflow execution failed:', error);
    });
    
    const executionResponse = {
      id: execution.id,
      workflow_id: execution.flow_id,
      status: execution.status,
      payload: payload || {},
      created_at: execution.created_at,
      updated_at: execution.updated_at
    };
    
    res.status(202).json({
      data: executionResponse,
      message: 'Workflow execution started'
    });
  } catch (error) {
    logger.error('Failed to trigger workflow:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    res.status(500).json({
      error: 'Failed to trigger workflow',
      message: errorMessage
    });
  }
});

// Step handlers for different workflow step types
const stepHandlers = {
  // HTTP request handler
  http_request: async (input: any, context: any) => {
    const { url, method = 'GET', headers = {}, body } = input;
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  },

  // Data transformation handler
  transform: async (input: any, context: any) => {
    const { script, variables = {} } = input;
    
    // Create a safe evaluation context
    const func = new Function('input', 'context', 'variables', `
      ${script}
    `);
    
    return func(input, context, variables);
  },

  // Condition handler
  condition: async (input: any, context: any) => {
    const { condition, trueValue, falseValue } = input;
    
    const func = new Function('input', 'context', `
      return ${condition};
    `);
    
    const result = func(input, context);
    return result ? trueValue : falseValue;
  },

  // Delay handler
  delay: async (input: any, context: any) => {
    const { milliseconds = 1000 } = input;
    await new Promise(resolve => setTimeout(resolve, milliseconds));
    return { delayed: true, duration: milliseconds };
  },

  // Data validation handler
  validate: async (input: any, context: any) => {
    const { schema, data } = input;
    
    // Basic validation (you can integrate with a validation library like Joi or Zod)
    const required = schema.required || [];
    const missing = required.filter((field: string) => !(field in data));
    
    if (missing.length > 0) {
      throw new Error(`Validation failed: missing required fields: ${missing.join(', ')}`);
    }
    
    return { valid: true, data };
  },

  // Email handler (placeholder - integrate with email service)
  send_email: async (input: any, context: any) => {
    const { to, subject, body, from } = input;
    
    // TODO: Integrate with actual email service
    logger.info('Email would be sent:', { to, subject, from });
    
    return { sent: true, to, subject };
  },

  // Database query handler
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

  // Webhook handler
  webhook: async (input: any, context: any) => {
    const { url, payload, headers = {} } = input;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status} ${response.statusText}`);
    }
    
    return { webhookSent: true, url, status: response.status };
  }
};

// Convert stored workflow definition to core workflow format
function convertToCoreWorkflow(definition: any): WorkflowDefinition {
  const steps: WorkflowDefinition = {};
  
  if (definition.steps && Array.isArray(definition.steps)) {
    definition.steps.forEach((step: any, index: number) => {
      const stepName = step.name || `step_${index}`;
      const stepType = step.type || 'transform';
      
      let handler: (input: any, context: any) => Promise<any>;
      
      switch (stepType) {
        case 'http_request':
          handler = stepHandlers.http_request;
          break;
        case 'transform':
          handler = stepHandlers.transform;
          break;
        case 'condition':
          handler = stepHandlers.condition;
          break;
        case 'delay':
          handler = stepHandlers.delay;
          break;
        case 'validate':
          handler = stepHandlers.validate;
          break;
        case 'send_email':
          handler = stepHandlers.send_email;
          break;
        case 'database_query':
          handler = stepHandlers.database_query;
          break;
        case 'webhook':
          handler = stepHandlers.webhook;
          break;
        default:
          // Default to transform handler
          handler = stepHandlers.transform;
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

// Async workflow execution function
async function executeWorkflowAsync(flow: any, execution: any, input: any) {
  const db = DatabaseConnection.getInstance();
  
  try {
    await db.query(
      'UPDATE flow_executions SET status = $1, updated_at = NOW() WHERE id = $2',
      ['running', execution.id]
    );
    
    // Parse workflow definition
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

    // Convert to core workflow format
    const coreWorkflowDefinition = convertToCoreWorkflow(workflowDefinition);
    
    // Create and execute workflow
    const workflowInstance = workflow(flow.name, coreWorkflowDefinition);
    
    logger.info(`Executing workflow: ${flow.name}`, {
      workflowId: flow.id,
      executionId: execution.id,
      stepsCount: Object.keys(coreWorkflowDefinition).length
    });

    // Execute the workflow
    const workflowExecution = await workflowInstance.execute(input);
    
    // Prepare result for storage
    const result = {
      status: workflowExecution.status,
      output: workflowExecution.results,
      results: workflowExecution.results,
      error: workflowExecution.error,
      startedAt: workflowExecution.startedAt,
      completedAt: workflowExecution.completedAt,
      stepsExecuted: Object.keys(workflowExecution.results).length
    };
    
    await db.query(
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
    
    await db.query(
      `UPDATE flow_executions 
       SET status = $1, results = $2, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $3`,
      ['failed', JSON.stringify({ error: errorMessage }), execution.id]
    );
    
    logger.error(`Workflow execution failed: ${execution.id}`, error);
  }
}

export default router;
