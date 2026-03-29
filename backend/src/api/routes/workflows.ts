import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { FlowRepository, FlowExecutionRepository } from '../../repositories/FlowRepository.js';
import { WorkflowService } from '../../services/WorkflowService.js';
import { 
  ExecuteFlowRequest,
  ApiResponse,
  NotFoundError,
  ValidationError
} from '../../types/index.js';

const router: Router = Router();
const flowRepository = new FlowRepository();
const executionRepository = new FlowExecutionRepository();
const workflowService = new WorkflowService();

/**
 * @swagger
 * /api/workflows/execute:
 *   post:
 *     summary: Execute a workflow
 *     tags: [Workflows]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - workflowId
 *             properties:
 *               workflowId:
 *                 type: string
 *                 description: The name/ID of the workflow to execute
 *               input:
 *                 type: object
 *                 description: Input data for the workflow execution
 *     responses:
 *       200:
 *         description: Workflow execution started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 executionId:
 *                   type: string
 *                   format: uuid
 *                   description: ID of the created execution
 *                 status:
 *                   type: string
 *                   enum: [pending, running, completed, failed]
 *                   description: Initial execution status
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Workflow not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/execute', async (req, res) => {
  try {
    const { workflowId, input } = req.body;
    
    if (!workflowId) {
      throw new ValidationError('workflowId is required');
    }

    // Use WorkflowService to trigger workflow
    const execution = await workflowService.triggerWorkflow(workflowId, input || {});
    
    const response: ApiResponse = {
      success: true,
      data: {
        id: execution.id,
        workflowId,
        status: 'pending',
        execution
      },
      message: 'Workflow execution started'
    };
    
    res.status(202).json(response);
    
  } catch (error) {
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
    
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'WORKFLOW_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to execute workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXECUTE_WORKFLOW_ERROR',
        message: 'Failed to execute workflow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /api/workflows/:id/status - Get workflow execution status
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const execution = await executionRepository.findById(id);
    
    if (!execution) {
      throw new NotFoundError('Execution', id);
    }
    
    const response: ApiResponse = {
      success: true,
      data: {
        id: execution.id,
        status: execution.status,
        results: execution.results,
        error: execution.error,
        created_at: execution.createdAt,
        completed_at: execution.completedAt
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
    
    logger.error('Failed to get execution status:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_EXECUTION_STATUS_ERROR',
        message: 'Failed to get execution status',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
