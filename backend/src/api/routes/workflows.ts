import { Router } from 'express';
import { workflow } from '../../../packages/core/dist/index.js';
import { createDatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';

const router: Router = Router();

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
      return res.status(400).json({
        error: 'Validation failed',
        message: 'workflowId is required'
      });
    }

    const db = createDatabaseConnection();
    
    // Find workflow by name (workflowId in docs refers to workflow name)
    const flowResult = await db.query(
      'SELECT * FROM flows WHERE name = $1',
      [workflowId]
    );
    
    if (flowResult.length === 0) {
      return res.status(404).json({
        error: 'Workflow not found',
        message: `Workflow with name '${workflowId}' not found`
      });
    }
    
    const flow = flowResult[0];
    
    // Create execution record
    const executionResult = await db.query(
      `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
       VALUES ($1, 'pending', $2, NOW(), NOW())
       RETURNING *`,
      [flow.id, JSON.stringify(input || {})]
    );
    
    const execution = executionResult[0];
    
    logger.info(`Workflow execution started: ${workflowId}`, { 
      workflowId,
      executionId: execution.id 
    });
    
    // Execute the workflow asynchronously
    executeWorkflowAsync(flow, execution, input || {}).catch(error => {
      logger.error('Async workflow execution failed:', error);
    });
    
    res.status(202).json({
      id: execution.id,
      workflowId,
      status: 'pending',
      message: 'Workflow execution started'
    });
    
  } catch (error) {
    logger.error('Failed to execute workflow:', error);
    res.status(500).json({
      error: 'Failed to execute workflow',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/workflows/:id/status - Get workflow execution status
router.get('/:id/status', async (req, res) => {
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
    
    const execution = result[0];
    
    res.json({
      id: execution.id,
      status: execution.status,
      results: execution.results ? JSON.parse(execution.results) : null,
      error: execution.error,
      created_at: execution.created_at,
      completed_at: execution.completed_at
    });
    
  } catch (error) {
    logger.error('Failed to get execution status:', error);
    res.status(500).json({
      error: 'Failed to get execution status',
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
