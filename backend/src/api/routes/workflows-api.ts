import { Router, Request, Response } from 'express';
import { createDatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';
import { apiAuthMiddleware } from '../../middleware/apiAuth.js';

const router: Router = Router();

// GET /workflows - List all workflows (matching documented API)
router.get('/', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const db = (req as any).db || createDatabaseConnection();
    
    const offset = (Number(page) - 1) * Number(limit);
    
    const flows = await db.query(
      'SELECT * FROM flows ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [Number(limit), offset]
    );
    
    const countResult = await db.query('SELECT COUNT(*) as total FROM flows');
    const count = Number(countResult[0].total);
    
    const workflows = flows.map((flow: any) => {
      try {
        // Handle both string and object types for definition
        let definition;
        if (typeof flow.definition === 'string') {
          definition = JSON.parse(flow.definition || '{}');
        } else if (typeof flow.definition === 'object') {
          definition = flow.definition || {};
        } else {
          definition = {};
        }
        
        return {
          id: flow.id,
          name: flow.name,
          description: '',
          steps: definition.steps || [],
          status: 'active',
          created_at: flow.created_at,
          updated_at: flow.updated_at
        };
      } catch (error) {
        console.error('Error parsing workflow definition:', error);
        return {
          id: flow.id,
          name: flow.name,
          description: '',
          steps: [],
          status: 'active',
          created_at: flow.created_at,
          updated_at: flow.updated_at
        };
      }
    });
    
    res.json({
      workflows,
      count,
      page: Number(page),
      limit: Number(limit)
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
    const db = createDatabaseConnection();
    
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
    const db = createDatabaseConnection();
    
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
    
    let definition = JSON.parse(existing[0].definition || '{}');
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
    const db = createDatabaseConnection();
    
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

// Async workflow execution function
async function executeWorkflowAsync(flow: any, execution: any, input: any) {
  const db = createDatabaseConnection();
  
  try {
    await db.query(
      'UPDATE flow_executions SET status = $1, updated_at = NOW() WHERE id = $2',
      ['running', execution.id]
    );
    
    const { workflow } = await import('../../../packages/core/dist/index.js');
    const workflowDefinition = JSON.parse(flow.definition);
    
    const workflowInstance = workflow(flow.name, workflowDefinition);
    const result = await workflowInstance.execute(input);
    
    await db.query(
      `UPDATE flow_executions 
       SET status = $1, results = $2, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $3`,
      ['completed', JSON.stringify(result.results), execution.id]
    );
    
    logger.info(`Workflow execution completed: ${execution.id}`, {
      executionId: execution.id,
      resultsCount: Object.keys(result.results).length
    });
    
  } catch (error) {
    await db.query(
      `UPDATE flow_executions 
       SET status = $1, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $3`,
      ['failed', execution.id]
    );
    
    logger.error(`Workflow execution failed: ${execution.id}`, error);
  }
}

export default router;
