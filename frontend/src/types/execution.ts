export interface ExecutionStep {
  id: string
  name: string
  status: 'success' | 'failed' | 'running' | 'pending'
  duration: string
  error?: string
}

export interface Execution {
  id: string
  workflowName: string
  workflowId: string
  status: 'success' | 'failed' | 'running' | 'queued'
  trigger: 'webhook' | 'schedule' | 'manual' | 'event'
  startedAt: string
  startedAtMs?: number
  duration: string
  steps: ExecutionStep[]
  totalSteps: number
  completedSteps: number
  error?: string
}

export interface ExecutionTableProps {
  executions: Execution[]
  onRetry?: (id: string) => void
  onCancel?: (id: string) => void
}
