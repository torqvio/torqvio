import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { FlowRepository, FlowExecutionRepository } from '../../repositories/FlowRepository.js';
import { WorkflowService } from '../../services/WorkflowService.js';
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
    const { limit = 10, workflow_id } = req.query;
    
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
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_EXECUTIONS_ERROR',
        message: 'Failed to list executions',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /executions/:id - Get execution by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const execution = await executionRepository.findById(id);
    
    if (!execution) {
      throw new NotFoundError('Execution', id);
    }
    
    const response: ApiResponse = {
      success: true,
      data: execution
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXECUTION_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to get execution:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EXECUTION_ERROR',
        message: 'Failed to get execution',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /executions/:id/logs - Get execution logs
router.get('/:id/logs', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const execution = await executionRepository.findById(id);
    
    if (!execution) {
      throw new NotFoundError('Execution', id);
    }

    // TODO: Implement actual log retrieval from log storage
    const logs = [
      `Execution ${id} started`,
      `Step 1: HTTP request completed`,
      `Step 2: Data transformation completed`,
      `Execution ${id} completed successfully`
    ];
    
    const response: ApiResponse = {
      success: true,
      data: {
        logs
      }
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXECUTION_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to get execution logs:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EXECUTION_LOGS_ERROR',
        message: 'Failed to get execution logs',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /executions/:id/cancel - Cancel execution
router.post('/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const execution = await executionRepository.findById(id);
    
    if (!execution) {
      throw new NotFoundError('Execution', id);
    }
    
    if (execution.status === 'completed' || execution.status === 'failed' || execution.status === 'cancelled') {
      throw new ValidationError(`Execution with status '${execution.status}' cannot be cancelled`);
    }
    
    await executionRepository.updateStatus(id, 'cancelled');
    
    logger.info(`Execution cancelled: ${id}`, { executionId: id });
    
    const response: ApiResponse = {
      success: true,
      message: 'Execution cancelled successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'EXECUTION_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to cancel execution:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CANCEL_EXECUTION_ERROR',
        message: 'Failed to cancel execution',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /executions/:id/retry - Retry execution
router.post('/:id/retry', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const execution = await executionRepository.findById(id);
    
    if (!execution) {
      throw new NotFoundError('Execution', id);
    }
    
    if (execution.status !== 'failed') {
      throw new ValidationError(`Only failed executions can be retried. Current status: ${execution.status}`);
    }
    
    // Get the flow for this execution
    const flow = await flowRepository.findById(execution.flow_id);
    
    if (!flow) {
      throw new NotFoundError('Flow', execution.flow_id);
    }
    
    // Create new execution with same payload
    const newExecution = await workflowService.triggerWorkflow(flow.name, execution.payload);
    
    logger.info(`Execution retry started: ${newExecution.id}`, { 
      originalExecutionId: id,
      newExecutionId: newExecution.id 
    });
    
    const response: ApiResponse = {
      success: true,
      data: newExecution,
      message: 'Execution retry started'
    };
    
    res.status(202).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    if (error instanceof ValidationError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to retry execution:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'RETRY_EXECUTION_ERROR',
        message: 'Failed to retry execution',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
