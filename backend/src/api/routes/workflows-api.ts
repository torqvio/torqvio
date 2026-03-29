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

// GET /workflows/:id - Get workflow by ID
router.get('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;

    const flow = await flowRepository.findById(id, projectId);
    
    if (!flow) {
      throw new NotFoundError('Workflow', id);
    }
    
    const response: ApiResponse = {
      success: true,
      data: flow
    };
    
    res.json(response);
  } catch (error) {
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
    
    logger.error('Failed to get workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_WORKFLOW_ERROR',
        message: 'Failed to get workflow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /workflows - Create new workflow
router.post('/', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, description, steps } = req.body;
    const projectId = (req as any).projectId;

    if (!name || !steps) {
      throw new ValidationError('name and steps are required');
    }

    const definition = {
      name,
      description: description || '',
      steps,
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: 'exponential'
      }
    };

    const flow = await flowRepository.create(definition, projectId);
    
    const response: ApiResponse = {
      success: true,
      data: flow,
      message: 'Workflow created successfully'
    };
    
    res.status(201).json(response);
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
    
    logger.error('Failed to create workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_WORKFLOW_ERROR',
        message: 'Failed to create workflow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// PUT /workflows/:id - Update workflow
router.put('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, steps } = req.body;
    const projectId = (req as any).projectId;

    const updateData = {
      name,
      description,
      definition: {
        name: name || 'Untitled Workflow',
        description: description || '',
        steps: steps || []
      }
    };

    const flow = await flowRepository.update(id, updateData, projectId);
    
    const response: ApiResponse = {
      success: true,
      data: flow,
      message: 'Workflow updated successfully'
    };
    
    res.json(response);
  } catch (error) {
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
    
    logger.error('Failed to update workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_WORKFLOW_ERROR',
        message: 'Failed to update workflow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// DELETE /workflows/:id - Delete workflow
router.delete('/:id', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;

    await flowRepository.delete(id, projectId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Workflow deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
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
    
    logger.error('Failed to delete workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_WORKFLOW_ERROR',
        message: 'Failed to delete workflow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /workflows/:id/trigger - Trigger workflow execution
router.post('/:id/trigger', apiAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payload } = req.body;
    const projectId = (req as any).projectId;

    // Check if workflow exists and belongs to this project
    const flow = await flowRepository.findById(id, projectId);
    
    if (!flow) {
      throw new NotFoundError('Workflow', id);
    }
    
    // Create execution using WorkflowService
    const execution = await workflowService.triggerWorkflow(flow.name, payload || {});
    
    const response: ApiResponse = {
      success: true,
      data: execution,
      message: 'Workflow execution started'
    };
    
    res.status(202).json(response);
  } catch (error) {
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
    
    logger.error('Failed to trigger workflow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'TRIGGER_WORKFLOW_ERROR',
        message: 'Failed to trigger workflow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
