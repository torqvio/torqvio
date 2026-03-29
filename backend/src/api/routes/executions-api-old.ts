import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { FlowRepository, FlowExecutionRepository } from '../../repositories/FlowRepository.js';
import { WorkflowService } from '../../services/WorkflowService.js';
import { DatabaseConnection } from '../../database/connection.js';
import { WorkflowEngine } from '../../services/WorkflowEngine.js';
import { 
  ListExecutionsQuery,
  ApiResponse,
  NotFoundError,
  ValidationError
} from '../../types/index.js';

const router: Router = Router();
const flowRepository = new FlowRepository();
const executionRepository = new FlowExecutionRepository();
const workflowService = new WorkflowService();

// GET /executions - List all executions (matching documented API)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { cursor, limit = 10, direction = 'forward', workflow_id } = req.query;
    
    // Convert limit to number and validate
    const limitNum = Math.min(Number(limit), 100); // Max 100 items per page
    
    const query: ListExecutionsQuery = {
      limit: limitNum,
      flow_id: workflow_id as string
    };
    
    const { executions, meta } = await executionRepository.list(query);
    
    const response: ApiResponse = {
      success: true,
      data: { executions, ...meta },
      meta
    };
    
    res.json(response);
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
    const db = DatabaseConnection.getInstance();
    
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
    const db = DatabaseConnection.getInstance();
    
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
    const db = DatabaseConnection.getInstance();
    
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
    const db = DatabaseConnection.getInstance();
    
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
    const db = DatabaseConnection.getInstance();
    
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
    
    const workflowEngine = WorkflowEngine.getInstance();
    await workflowEngine.trigger(flow.name, payload).catch((error: any) => {
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

export default router;
