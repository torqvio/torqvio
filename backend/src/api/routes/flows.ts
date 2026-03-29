import { Router, Request, Response } from 'express';
import { logger } from '../../utils/logger.js';
import { apiAuthMiddleware } from '../../middleware/apiAuth.js';
import { FlowRepository, FlowExecutionRepository } from '../../repositories/FlowRepository.js';
import { WorkflowService } from '../../services/WorkflowService.js';
import { 
  CreateFlowRequest, 
  UpdateFlowRequest, 
  ExecuteFlowRequest,
  ListFlowsQuery,
  ApiResponse,
  NotFoundError,
  ValidationError
} from '../../types/index.js';

const router: Router = Router();
let flowRepository: FlowRepository;
let executionRepository: FlowExecutionRepository;
let workflowService: WorkflowService;

// Initialize repositories after database is ready
function initializeRepositories() {
  flowRepository = new FlowRepository();
  executionRepository = new FlowExecutionRepository();
  workflowService = new WorkflowService();
}

// Middleware to ensure repositories are initialized
function ensureRepositories(req: Request, res: Response, next: Function) {
  if (!flowRepository) {
    initializeRepositories();
  }
  next();
}

// GET /api/v1/flows - List all flows
router.get('/', apiAuthMiddleware, ensureRepositories, async (req: Request, res: Response) => {
  try {
    const projectId = (req as any).projectId;
    const query: ListFlowsQuery = {
      page: parseInt(req.query.page as string) || undefined,
      limit: parseInt(req.query.limit as string) || undefined,
      status: req.query.status as string,
      search: req.query.search as string,
      sort_by: req.query.sort_by as any,
      sort_order: req.query.sort_order as any
    };

    const { flows, meta } = await flowRepository.list(query, projectId);
    
    const response: ApiResponse<{ flows: any[] }> = {
      success: true,
      data: { flows, ...meta },
      meta
    };
    
    res.json(response);
  } catch (error) {
    logger.error('Failed to list flows:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LIST_FLOWS_ERROR',
        message: 'Failed to list flows',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// GET /api/v1/flows/:id - Get a specific flow
router.get('/:id', apiAuthMiddleware, ensureRepositories, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;

    const flow = await flowRepository.findById(id, projectId);
    
    if (!flow) {
      throw new NotFoundError('Flow', id);
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
          code: 'FLOW_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to get flow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_FLOW_ERROR',
        message: 'Failed to get flow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /api/v1/flows - Create a new flow
router.post('/', apiAuthMiddleware, ensureRepositories, async (req: Request, res: Response) => {
  try {
    const { name, definition } = req.body;
    const projectId = (req as any).projectId;

    if (!name || !definition) {
      throw new ValidationError('name and definition are required');
    }

    const createData: CreateFlowRequest = { name, definition };
    const flow = await flowRepository.create(createData, projectId);
    
    const response: ApiResponse = {
      success: true,
      data: { flow },
      message: 'Flow created successfully'
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
    
    logger.error('Failed to create flow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_FLOW_ERROR',
        message: 'Failed to create flow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// PUT /api/v1/flows/:id - Update a flow
router.put('/:id', apiAuthMiddleware, ensureRepositories, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;
    const projectId = (req as any).projectId;

    const updateData: UpdateFlowRequest = { name, definition };
    const flow = await flowRepository.update(id, updateData, projectId);
    
    const response: ApiResponse = {
      success: true,
      data: { flow },
      message: 'Flow updated successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FLOW_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to update flow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_FLOW_ERROR',
        message: 'Failed to update flow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// DELETE /api/v1/flows/:id - Delete a flow
router.delete('/:id', apiAuthMiddleware, ensureRepositories, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = (req as any).projectId;

    await flowRepository.delete(id, projectId);
    
    const response: ApiResponse = {
      success: true,
      message: 'Flow deleted successfully'
    };
    
    res.json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FLOW_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to delete flow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_FLOW_ERROR',
        message: 'Failed to delete flow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// POST /api/v1/flows/:id/execute - Execute a flow
router.post('/:id/execute', apiAuthMiddleware, ensureRepositories, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { payload } = req.body;
    const projectId = (req as any).projectId;

    // Check if flow exists and belongs to this project
    const flow = await flowRepository.findById(id, projectId);
    if (!flow) {
      throw new NotFoundError('Flow', id);
    }
    
    // Create execution using WorkflowService
    const execution = await workflowService.triggerWorkflow(flow.name, payload);
    
    const response: ApiResponse = {
      success: true,
      data: { execution },
      message: 'Flow execution started'
    };
    
    res.status(202).json(response);
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(404).json({
        success: false,
        error: {
          code: 'FLOW_NOT_FOUND',
          message: error.message,
          timestamp: new Date().toISOString()
        }
      });
      return;
    }
    
    logger.error('Failed to execute flow:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'EXECUTE_FLOW_ERROR',
        message: 'Failed to execute flow',
        timestamp: new Date().toISOString()
      }
    });
  }
});

export default router;
