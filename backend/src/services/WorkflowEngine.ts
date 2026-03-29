import { logger } from '../utils/logger.js';
import { StepHandlers } from './StepHandlers.js';
import { FlowRepository, FlowExecutionRepository } from '../repositories/FlowRepository.js';
import { ExecutionStatus } from '../types/index.js';

// Simplified workflow execution without external dependency
function executeSteps(steps: any[], input: any): Promise<any> {
  return new Promise((resolve) => {
    const results: Record<string, any> = {};
    let currentStep = 0;
    
    const executeNextStep = async () => {
      if (currentStep >= steps.length) {
        resolve({ status: 'completed', results });
        return;
      }
      
      const step = steps[currentStep];
      const stepName = step.name || `step_${currentStep}`;
      
      try {
        const handler = StepHandlers.getHandler(step.type);
        const stepInput = { ...step.config, ...input };
        const result = await handler(stepInput, {});
        results[stepName] = result;
        currentStep++;
        executeNextStep();
      } catch (error) {
        resolve({ status: 'failed', error, results });
      }
    };
    
    executeNextStep();
  });
}

function convertToCoreWorkflow(definition: any): any[] {
  return definition.steps || [];
}

export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private flowRepository: FlowRepository;
  private executionRepository: FlowExecutionRepository;

  private constructor() {
    this.flowRepository = new FlowRepository();
    this.executionRepository = new FlowExecutionRepository();
  }

  static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  async trigger(workflowType: string, data: any): Promise<string> {
    try {
      // Find workflow by type/name using repository
      const flow = await this.flowRepository.findByName(workflowType);

      if (!flow) {
        logger.warn(`No workflow found for type: ${workflowType}`);
        return 'no-workflow-found';
      }

      // Create execution record using repository
      const execution = await this.executionRepository.create(flow.id, data || {});

      logger.info(`Workflow triggered: ${workflowType}`, {
        workflowId: flow.id,
        executionId: execution.id,
        workflowType
      });

      // Execute workflow asynchronously
      this.executeWorkflowAsync(flow, execution, data).catch(error => {
        logger.error('Async workflow execution failed:', error);
      });

      return execution.id;
    } catch (error) {
      logger.error(`Failed to trigger workflow: ${workflowType}`, error);
      throw error;
    }
  }

  private async executeWorkflowAsync(flow: any, execution: any, input: any): Promise<void> {
    try {
      // Update execution status using repository
      await this.executionRepository.updateStatus(execution.id, ExecutionStatus.RUNNING);

      let workflowDefinition;
      try {
        if (typeof flow.definition === 'string') {
          workflowDefinition = JSON.parse(flow.definition);
        } else {
          workflowDefinition = flow.definition;
        }
      } catch (error) {
        throw new Error(`Invalid workflow definition: ${(error as Error).message}`);
      }

      const coreWorkflowDefinition = convertToCoreWorkflow(workflowDefinition);
      const workflowExecution = await executeSteps(coreWorkflowDefinition, input);

      const result = {
        status: workflowExecution.status,
        output: workflowExecution.results,
        results: workflowExecution.results,
        error: workflowExecution.error,
        startedAt: new Date(),
        completedAt: new Date(),
        stepsExecuted: Object.keys(workflowExecution.results || {}).length
      };

      // Update execution results using repository
      const finalStatus = workflowExecution.status === 'completed' ? ExecutionStatus.COMPLETED : ExecutionStatus.FAILED;
      await this.executionRepository.updateResults(execution.id, result, finalStatus);

      logger.info(`Workflow execution completed: ${execution.id}`, {
        executionId: execution.id,
        status: finalStatus,
        stepsExecuted: result.stepsExecuted,
        duration: 0 // Simplified duration
      });

    } catch (error) {
      // Update execution error using repository
      await this.executionRepository.updateError(execution.id, error as Error);

      logger.error(`Workflow execution failed: ${execution.id}`, error);
    }
  }
}
