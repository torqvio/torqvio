import { EventEmitter } from 'eventemitter3';
import type { WorkflowEvent } from './types.js';

export class TorqvioEventEmitter extends EventEmitter {
  constructor() {
    super();
  }

  onWorkflowStarted(callback: (event: WorkflowEvent) => void): this {
    return this.on('workflow.started', callback);
  }

  onWorkflowCompleted(callback: (event: WorkflowEvent) => void): this {
    return this.on('workflow.completed', callback);
  }

  onWorkflowFailed(callback: (event: WorkflowEvent) => void): this {
    return this.on('workflow.failed', callback);
  }

  onStepStarted(callback: (event: WorkflowEvent) => void): this {
    return this.on('workflow.step.started', callback);
  }

  onStepCompleted(callback: (event: WorkflowEvent) => void): this {
    return this.on('workflow.step.completed', callback);
  }

  onStepFailed(callback: (event: WorkflowEvent) => void): this {
    return this.on('workflow.step.failed', callback);
  }

  emitWorkflowEvent(event: WorkflowEvent): boolean {
    return this.emit(event.type, event);
  }
}

export { EventEmitter };
