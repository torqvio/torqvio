import { Router, Request, Response } from 'express';
import { webhookNotifier } from '../../notifications/WebhookNotifier.js';

const router = Router() as Router;

// POST /api/v1/webhooks/test/workflow-started - Test workflow started event
router.post('/workflow-started', async (req: Request, res: Response) => {
  try {
    const { workflowId, workflowName, inputPayload } = req.body;
    
    await webhookNotifier.emitWorkflowStarted({
      workflowId: workflowId || `test_workflow_${Date.now()}`,
      executionId: `test_execution_${Date.now()}`,
      workflowName: workflowName || 'Test Workflow',
      inputPayload: inputPayload || { test: true, timestamp: Date.now() }
    });
    
    res.json({
      message: 'Workflow started event sent to webhooks',
      event: 'workflow.started',
      workflow_id: workflowId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to send workflow started event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/webhooks/test/workflow-completed - Test workflow completed event
router.post('/workflow-completed', async (req: Request, res: Response) => {
  try {
    const { workflowId, workflowName, result, executionTime } = req.body;
    
    await webhookNotifier.emitWorkflowCompleted({
      workflowId: workflowId || `test_workflow_${Date.now()}`,
      executionId: `test_execution_${Date.now()}`,
      workflowName: workflowName || 'Test Workflow',
      result: result || { status: 'completed', data: 'test result' },
      executionTime: executionTime || 120
    });
    
    res.json({
      message: 'Workflow completed event sent to webhooks',
      event: 'workflow.completed',
      workflow_id: workflowId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to send workflow completed event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/v1/webhooks/test/workflow-failed - Test workflow failed event
router.post('/workflow-failed', async (req: Request, res: Response) => {
  try {
    const { workflowId, workflowName, error, executionTime } = req.body;
    
    await webhookNotifier.emitWorkflowFailed({
      workflowId: workflowId || `test_workflow_${Date.now()}`,
      executionId: `test_execution_${Date.now()}`,
      workflowName: workflowName || 'Test Workflow',
      error: error || {
        message: 'Test error message',
        code: 'TEST_ERROR',
        step: 'test-step'
      },
      executionTime: executionTime || 45
    });
    
    res.json({
      message: 'Workflow failed event sent to webhooks',
      event: 'workflow.failed',
      workflow_id: workflowId,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to send workflow failed event',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
