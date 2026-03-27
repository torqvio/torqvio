import { Router, Request, Response } from 'express';
import { createDatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';
import { apiAuthMiddleware } from '../../middleware/apiAuth.js';

const router: Router = Router();

// GET /api/v1/flows - List all flows
router.get('/', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();
    const flows = await db.query(
      'SELECT * FROM flows WHERE project_id = $1 ORDER BY created_at DESC',
      [projectId]
    );
    res.json({ flows: flows || [], count: (flows || []).length });
  } catch (error) {
    logger.error('Failed to list flows:', error);
    res.status(500).json({
      error: 'Failed to list flows',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/flows/:id - Get a specific flow
router.get('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();

    const result = await db.query(
      'SELECT * FROM flows WHERE id = $1 AND project_id = $2',
      [id, projectId]
    );

    if (result.length === 0) {
      return res.status(404).json({
        error: 'Flow not found',
        message: `Flow with id ${id} not found`
      });
    }
    
    res.json(result[0]);
  } catch (error) {
    logger.error('Failed to get flow:', error);
    res.status(500).json({
      error: 'Failed to get flow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/flows - Create a new flow
router.post('/', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, definition } = req.body;
    const projectId = (req as any).projectId;

    if (!name || !definition) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'name and definition are required'
      });
    }

    const db = createDatabaseConnection();

    // Create flow record
    const result = await db.query(
      `INSERT INTO flows (name, definition, project_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [name, JSON.stringify(definition), projectId]
    );
    
    logger.info(`Flow created: ${name}`, { flowId: result[0].id });
    
    res.status(201).json({
      flow: result[0],
      message: 'Flow created successfully'
    });
  } catch (error) {
    logger.error('Failed to create flow:', error);
    res.status(500).json({
      error: 'Failed to create flow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/v1/flows/:id - Update a flow
router.put('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;
    const projectId = (req as any).projectId;

    const db = createDatabaseConnection();

    // Check if flow exists and belongs to this project
    const existing = await db.query(
      'SELECT * FROM flows WHERE id = $1 AND project_id = $2',
      [id, projectId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Flow not found',
        message: `Flow with id ${id} not found`
      });
    }

    // Update flow
    const result = await db.query(
      `UPDATE flows
       SET name = COALESCE($1, name),
           definition = COALESCE($2, definition),
           updated_at = NOW()
       WHERE id = $3 AND project_id = $4
       RETURNING *`,
      [name, definition ? JSON.stringify(definition) : undefined, id, projectId]
    );
    
    logger.info(`Flow updated: ${id}`, { flowId: id });
    
    res.json({
      flow: result[0],
      message: 'Flow updated successfully'
    });
  } catch (error) {
    logger.error('Failed to update flow:', error);
    res.status(500).json({
      error: 'Failed to update flow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/v1/flows/:id - Delete a flow
router.delete('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();

    // Check if flow exists and belongs to this project
    const existing = await db.query(
      'SELECT id FROM flows WHERE id = $1 AND project_id = $2',
      [id, projectId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Flow not found',
        message: `Flow with id ${id} not found`
      });
    }

    // Delete flow (cascade handles related records)
    await db.query('DELETE FROM flows WHERE id = $1 AND project_id = $2', [id, projectId]);
    
    logger.info(`Flow deleted: ${id}`, { flowId: id });
    
    res.json({
      message: 'Flow deleted successfully'
    });
  } catch (error) {
    logger.error('Failed to delete flow:', error);
    res.status(500).json({
      error: 'Failed to delete flow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/flows/:id/execute - Execute a flow
router.post('/:id/execute', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payload } = req.body;
    const projectId = (req as any).projectId;

    const db = createDatabaseConnection();

    // Check if flow exists and belongs to this project
    const flowResult = await db.query(
      'SELECT * FROM flows WHERE id = $1 AND project_id = $2',
      [id, projectId]
    );
    
    if (flowResult.length === 0) {
      return res.status(404).json({
        error: 'Flow not found',
        message: `Flow with id ${id} not found`
      });
    }
    
    const flow = flowResult[0];
    
    // Create execution record
    const executionResult = await db.query(
      `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
       VALUES ($1, 'pending', $2, NOW(), NOW())
       RETURNING *`,
      [id, JSON.stringify(payload || {})]
    );
    
    const execution = executionResult[0];
    
    logger.info(`Flow execution started: ${id}`, { 
      flowId: id, 
      executionId: execution.id 
    });
    
    // Execute the workflow asynchronously
    executeWorkflowAsync(flow, execution, payload || {}).catch(error => {
      logger.error('Async workflow execution failed:', error);
    });
    
    res.status(202).json({
      execution: execution,
      message: 'Flow execution started'
    });
  } catch (error) {
    logger.error('Failed to execute flow:', error);
    res.status(500).json({
      error: 'Failed to execute flow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Async workflow execution function
async function executeWorkflowAsync(flow: any, execution: any, input: any) {
  const db = createDatabaseConnection();
  
  try {
    // Update execution status to running
    await db.query(
      'UPDATE flow_executions SET status = $1, updated_at = NOW() WHERE id = $2',
      ['running', execution.id]
    );
    
    // Import and execute the workflow
    const { workflow } = await import('../../../packages/core/dist/index.js');
    const workflowDefinition = JSON.parse(flow.definition);
    
    // Create workflow instance
    const workflowInstance = workflow(flow.name, workflowDefinition);
    
    // Execute the workflow
    const result = await workflowInstance.execute(input);
    
    // Update execution with results
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
    // Update execution with error
    await db.query(
      `UPDATE flow_executions 
       SET status = $1, error = $2, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $3`,
      ['failed', (error as Error).message, execution.id]
    );
    
    logger.error(`Workflow execution failed: ${execution.id}`, error);
  }
}

export default router;
