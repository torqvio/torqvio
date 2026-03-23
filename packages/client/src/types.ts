export interface TorqvioClientConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
  retries?: number;
  enableEvents?: boolean;
}

export interface WorkflowStep {
  name: string;
  type: 'function' | 'webhook' | 'http' | 'delay' | 'condition';
  config: Record<string, any>;
  timeout?: number;
  retries?: number;
}

export interface CreateWorkflowRequest {
  name: string;
  description?: string;
  steps: WorkflowStep[];
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: 'active' | 'inactive' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ExecuteWorkflowRequest {
  [key: string]: any;
}

export type WorkflowStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: WorkflowStatus;
  payload: Record<string, any>;
  results?: Record<string, any>;
  error?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  updated_at: string;
}

export interface WorkflowEvent {
  id: string;
  type: 'workflow.started' | 'workflow.completed' | 'workflow.failed' | 'workflow.step.started' | 'workflow.step.completed' | 'workflow.step.failed';
  data: {
    workflow_id?: string;
    execution_id?: string;
    step_name?: string;
    [key: string]: any;
  };
  timestamp: string;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ListWorkflowsResponse {
  workflows: Workflow[];
  count: number;
  page?: number;
  limit?: number;
}

export interface ListExecutionsResponse {
  executions: WorkflowExecution[];
  count: number;
  page?: number;
  limit?: number;
}
