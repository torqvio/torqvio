import { Router, Request, Response } from 'express';
import { createDatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';

const router: Router = Router();

// GET /executions - List all executions (matching documented API)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, workflow_id } = req.query;
    const db = (req as any).db || createDatabaseConnection();
    
    const offset = (Number(page) - 1) * Number(limit);
    
    let query = 'SELECT * FROM flow_executions ORDER BY created_at DESC LIMIT $1 OFFSET $2';
    let params: any[] = [Number(limit), offset];
    
    let countQuery = 'SELECT COUNT(*) as total FROM flow_executions';
    let countParams: any[] = [];
    
    if (workflow_id) {
      query = 'SELECT * FROM flow_executions WHERE flow_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3';
      params = [workflow_id, Number(limit), offset];
      
      countQuery += ' WHERE flow_id = $1';
      countParams.push(workflow_id);
    }
    
    const executions = await db.query(query, params);
    
    const countResult = await db.query(countQuery, countParams);
    const count = Number(countResult[0].total);
    
    const formattedExecutions = executions.map((execution: any) => {
      try {
        // Handle both string and object types for payload and results
        let payload, results;
        
        if (typeof execution.payload === 'string') {
          payload = JSON.parse(execution.payload || '{}');
        } else if (typeof execution.payload === 'object') {
          payload = execution.payload || {};
        } else {
          payload = {};
        }
        
        if (execution.results) {
          if (typeof execution.results === 'string') {
            results = JSON.parse(execution.results || 'null');
          } else if (typeof execution.results === 'object') {
            results = execution.results;
          } else {
            results = undefined;
          }
        } else {
          results = undefined;
        }
        
        return {
          id: execution.id,
          workflow_id: execution.flow_id,
          status: execution.status,
          payload: payload,
          results: results,
          error: execution.error,
          created_at: execution.created_at,
          started_at: execution.started_at,
          completed_at: execution.completed_at,
          updated_at: execution.updated_at
        };
      } catch (error) {
        console.error('Error parsing execution data:', error);
        return {
          id: execution.id,
          workflow_id: execution.flow_id,
          status: execution.status,
          payload: {},
          results: undefined,
          error: execution.error,
          created_at: execution.created_at,
          started_at: execution.started_at,
          completed_at: execution.completed_at,
          updated_at: execution.updated_at
        };
      }
    });
    
    res.json({
      executions: formattedExecutions,
      count,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error) {
    logger.error('Failed to list executions:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    res.status(500).json({
      error: 'Failed to list executions',
      message: errorMessage
    });
  }
});

// GET /executions/:id - Get a specific execution (matching documented API)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = createDatabaseConnection();
    
    const result = await db.query(
      'SELECT * FROM flow_executions WHERE id = $1',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    const execution = {
      id: result[0].id,
      workflow_id: result[0].flow_id,
      status: result[0].status,
      payload: JSON.parse(result[0].payload || '{}'),
      results: result[0].results ? JSON.parse(result[0].results) : undefined,
      error: result[0].error,
      created_at: result[0].created_at,
      started_at: result[0].started_at,
      completed_at: result[0].completed_at,
      updated_at: result[0].updated_at
    };
    
    res.json({
      data: execution
    });
  } catch (error) {
    logger.error('Failed to get execution:', error);
    res.status(500).json({
      error: 'Failed to get execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /executions/:id/status - Get execution status (matching documented API)
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = createDatabaseConnection();
    
    const result = await db.query(
      'SELECT status FROM flow_executions WHERE id = $1',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    res.json({
      data: {
        status: result[0].status
      }
    });
  } catch (error) {
    logger.error('Failed to get execution status:', error);
    res.status(500).json({
      error: 'Failed to get execution status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /executions/:id/logs - Get execution logs (matching documented API)
router.get('/:id/logs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = createDatabaseConnection();
    
    const result = await db.query(
      'SELECT logs FROM flow_executions WHERE id = $1',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    const logs = result[0].logs ? JSON.parse(result[0].logs) : [];
    
    res.json({
      data: {
        logs: Array.isArray(logs) ? logs : [logs]
      }
    });
  } catch (error) {
    logger.error('Failed to get execution logs:', error);
    res.status(500).json({
      error: 'Failed to get execution logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /executions/:id/cancel - Cancel execution (matching documented API)
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = createDatabaseConnection();
    
    const result = await db.query(
      'SELECT status FROM flow_executions WHERE id = $1',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    if (result[0].status === 'completed' || result[0].status === 'failed' || result[0].status === 'cancelled') {
      return res.status(400).json({
        error: 'Cannot cancel execution',
        message: `Execution with status '${result[0].status}' cannot be cancelled`
      });
    }
    
    await db.query(
      'UPDATE flow_executions SET status = $1, completed_at = NOW(), updated_at = NOW() WHERE id = $2',
      ['cancelled', id]
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

// POST /executions/:id/retry - Retry execution (matching documented API)
router.post('/:id/retry', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = createDatabaseConnection();
    
    const executionResult = await db.query(
      'SELECT * FROM flow_executions WHERE id = $1',
      [id]
    );
    
    if (executionResult.length === 0) {
      return res.status(404).json({
        error: 'Execution not found',
        message: `Execution with id ${id} not found`
      });
    }
    
    const execution = executionResult[0];
    
    if (execution.status !== 'failed') {
      return res.status(400).json({
        error: 'Cannot retry execution',
        message: `Only failed executions can be retried. Current status: ${execution.status}`
      });
    }
    
    const flowResult = await db.query(
      'SELECT * FROM flows WHERE id = $1',
      [execution.flow_id]
    );
    
    if (flowResult.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        message: `Workflow with id ${execution.flow_id} not found`
      });
    }
    
    const flow = flowResult[0];
    const payload = JSON.parse(execution.payload || '{}');
    
    const newExecutionResult = await db.query(
      `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
       VALUES ($1, 'pending', $2, NOW(), NOW())
       RETURNING *`,
      [flow.id, JSON.stringify(payload)]
    );
    
    const newExecution = newExecutionResult[0];
    
    logger.info(`Execution retry started: ${newExecution.id}`, { 
      originalExecutionId: id,
      newExecutionId: newExecution.id 
    });
    
    executeWorkflowAsync(flow, newExecution, payload).catch(error => {
      logger.error('Async workflow execution failed:', error);
    });
    
    const executionResponse = {
      id: newExecution.id,
      workflow_id: newExecution.flow_id,
      status: newExecution.status,
      payload: JSON.parse(newExecution.payload || '{}'),
      created_at: newExecution.created_at,
      updated_at: newExecution.updated_at
    };
    
    res.status(202).json({
      data: executionResponse,
      message: 'Execution retry started'
    });
  } catch (error) {
    logger.error('Failed to retry execution:', error);
    res.status(500).json({
      error: 'Failed to retry execution',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Async workflow execution function
async function executeWorkflowAsync(flow: any, execution: any, input: any) {
  const db = createDatabaseConnection();
  
  try {
    await db.query(
      'UPDATE flow_executions SET status = $1, started_at = NOW(), updated_at = NOW() WHERE id = $2',
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
       SET status = $1, error = $2, completed_at = NOW(), updated_at = NOW() 
       WHERE id = $3`,
      ['failed', (error as Error).message, execution.id]
    );
    
    logger.error(`Workflow execution failed: ${execution.id}`, error);
  }
}

export default router;
