import { Router, Request, Response } from 'express';
import { createDatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';
import { apiAuthMiddleware } from '../../middleware/apiAuth.js';

const router: Router = Router();

// GET /api/v1/executions - List all executions
router.get('/', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { flow_id, status, limit = 50, offset = 0 } = req.query;
    const projectId = (req as any).projectId;

    let query = `
      SELECT fe.*, f.name as flow_name
      FROM flow_executions fe
      JOIN flows f ON fe.flow_id = f.id
      WHERE f.project_id = $1
    `;
    const params: any[] = [projectId];
    let paramIndex = 2;

    if (flow_id) {
      query += ` AND fe.flow_id = $${paramIndex++}`;
      params.push(flow_id);
    }

    if (status) {
      query += ` AND fe.status = $${paramIndex++}`;
      params.push(status);
    }

    query += ` ORDER BY fe.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(Number(limit), Number(offset));
    
    const db = createDatabaseConnection();
    const result = await db.query(query, params);
    
    res.json({
      executions: result || [],
      count: (result || []).length,
      limit: Number(limit),
      offset: Number(offset)
    });
  } catch (error) {
    logger.error('Failed to list executions:', error);
    res.status(500).json({
      error: 'Failed to list executions',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/executions/:id - Get a specific execution
router.get('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();

    const result = await db.query(
      `SELECT fe.*, f.name as flow_name, f.definition
       FROM flow_executions fe
       JOIN flows f ON fe.flow_id = f.id
       WHERE fe.id = $1 AND f.project_id = $2`,
      [id, projectId]
    );
    
    if ((result as any).rows?.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    // Get step results for this execution
    const stepsResult = await db.query(
      `SELECT * FROM step_results 
       WHERE execution_id = $1 
       ORDER BY created_at ASC`,
      [id]
    );
    
    const execution = result[0];
    execution.steps = stepsResult;
    
    res.json(execution);
  } catch (error) {
    logger.error('Failed to get execution:', error);
    res.status(500).json({
      error: 'Failed to get execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/executions/:id/status - Get execution status
router.get('/:id/status', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();

    const result = await db.query(
      `SELECT fe.status, fe.current_step_id, fe.created_at, fe.updated_at
       FROM flow_executions fe
       JOIN flows f ON fe.flow_id = f.id
       WHERE fe.id = $1 AND f.project_id = $2`,
      [id, projectId]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    res.json(result[0]);
  } catch (error) {
    logger.error('Failed to get execution status:', error);
    res.status(500).json({
      error: 'Failed to get execution status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/v1/executions/:id/logs - Get execution logs
router.get('/:id/logs', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();

    // Verify this execution belongs to the project before returning logs
    const ownership = await db.query(
      `SELECT fe.id FROM flow_executions fe
       JOIN flows f ON fe.flow_id = f.id
       WHERE fe.id = $1 AND f.project_id = $2`,
      [id, projectId]
    );
    if (ownership.length === 0) {
      return res.status(404).json({ error: 'Execution not found', message: `No logs found for execution ${id}` });
    }
    
    // Get step results which act as logs
    const result = await db.query(
      `SELECT sr.*, s.name as step_name 
       FROM step_results sr 
       JOIN flows f ON f.id = sr.flow_id
       LEFT JOIN LATERAL jsonb_array_elements(f.definition->'steps') s(step_def) ON true
       WHERE sr.execution_id = $1 
       ORDER BY sr.created_at ASC`,
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Execution logs not found',
        message: `No logs found for execution ${id}`
      });
    }
    
    res.json({
      execution_id: id,
      logs: result,
      count: result.length
    });
  } catch (error) {
    logger.error('Failed to get execution logs:', error);
    res.status(500).json({
      error: 'Failed to get execution logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/executions/:id/cancel - Cancel an execution
router.post('/:id/cancel', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();

    // Check if execution exists, is cancellable, and belongs to this project
    const existing = await db.query(
      `SELECT fe.status FROM flow_executions fe
       JOIN flows f ON fe.flow_id = f.id
       WHERE fe.id = $1 AND f.project_id = $2`,
      [id, projectId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    const currentStatus = existing[0].status;
    
    if (['completed', 'failed', 'cancelled'].includes(currentStatus)) {
      return res.status(400).json({
        error: 'Cannot cancel execution',
        message: `Execution is already ${currentStatus}`
      });
    }
    
    // Update execution status to cancelled
    await db.query(
      `UPDATE flow_executions 
       SET status = 'cancelled', updated_at = NOW() 
       WHERE id = $1`,
      [id]
    );
    
    logger.info(`Execution cancelled: ${id}`, { executionId: id });
    
    res.json({
      message: 'Execution cancelled successfully'
    });
  } catch (error) {
    logger.error('Failed to cancel execution:', error);
    res.status(500).json({
      error: 'Failed to cancel execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/executions/:id/retry - Retry a failed execution
router.post('/:id/retry', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;
    const db = createDatabaseConnection();

    // Check if execution exists, is retryable, and belongs to this project
    const existing = await db.query(
      `SELECT fe.status, fe.flow_id, fe.payload FROM flow_executions fe
       JOIN flows f ON fe.flow_id = f.id
       WHERE fe.id = $1 AND f.project_id = $2`,
      [id, projectId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    const currentStatus = existing[0].status;
    
    if (currentStatus !== 'failed') {
      return res.status(400).json({
        error: 'Cannot retry execution',
        message: `Only failed executions can be retried (current status: ${currentStatus})`
      });
    }
    
    // Create new execution with same payload
    const retryResult = await db.query(
      `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
       VALUES ($1, 'pending', $2, NOW(), NOW())
       RETURNING *`,
      [existing[0].flow_id, existing[0].payload]
    );
    
    const newExecution = retryResult[0];
    
    logger.info(`Execution retry created: ${id} -> ${newExecution.id}`, { 
      originalExecutionId: id,
      newExecutionId: newExecution.id 
    });
    
    res.status(201).json({
      execution: newExecution,
      message: 'Execution retry created successfully'
    });
  } catch (error) {
    logger.error('Failed to retry execution:', error);
    res.status(500).json({
      error: 'Failed to retry execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
