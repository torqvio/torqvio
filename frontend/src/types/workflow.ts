export interface Step {
  id: string
  type: 'http' | 'delay' | 'condition' | 'retry' | 'custom'
  name: string
  config: StepConfig
  position: { x: number; y: number }
}

export interface StepConfig {
  // HTTP step config
  url?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  
  // Delay step config
  duration?: number
  unit?: 'milliseconds' | 'seconds' | 'minutes'
  
  // Condition step config
  condition?: string
  truePath?: 'continue' | 'end'
  falsePath?: 'continue' | 'end'
  
  // Retry step config
  maxAttempts?: number
  backoff?: 'exponential' | 'linear' | 'fixed'
  baseDelay?: number
  
  // Custom step config
  code?: string
}

export interface StepType {
  type: string
  name: string
  icon: React.ComponentType<any>
  color: string
  description: string
}

export interface WorkflowBuilderProps {
  onStepsChange?: (steps: Step[]) => void
}
