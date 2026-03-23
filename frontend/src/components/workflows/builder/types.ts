export type StepType =
  | 'webhook' | 'schedule' | 'event' | 'manual'
  | 'http' | 'email' | 'db' | 'transform' | 'code'
  | 'condition' | 'loop' | 'parallel' | 'delay' | 'retry'
  | 'slack' | 'stripe' | 'github'

export interface WorkflowNode {
  id: string
  type: StepType
  name: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
}
