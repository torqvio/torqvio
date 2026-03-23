// API Response Types
export interface ApiResponse<T = unknown> {
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Workflow Types
export interface Workflow {
  id: string
  name: string
  description?: string
  definition: Record<string, unknown>
  status: 'active' | 'inactive' | 'draft'
  createdAt: string
  updatedAt: string
  version: number
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  flow_name?: string // Alternative field name from API
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'
  input: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  error_message?: string // Alternative field name from API
  startedAt: string
  completedAt?: string
  duration?: number
  createdAt?: string // API field
  updatedAt?: string // API field
  created_at?: string // Snake case from API
  updated_at?: string // Snake case from API
  steps: ExecutionStep[]
}

export interface ExecutionStep {
  id: string
  name: string
  type: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input?: Record<string, unknown>
  output?: Record<string, unknown>
  error?: string
  startedAt: string
  completedAt?: string
  duration?: number
}

// User Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  createdAt: string
  lastLoginAt?: string
}

// Integration Types
export interface Integration {
  id: string
  name: string
  type: 'webhook' | 'api' | 'database' | 'custom'
  config: Record<string, unknown>
  status: 'active' | 'inactive' | 'error'
  createdAt: string
  updatedAt: string
}

// Event Types
export interface Event {
  id: string
  type: string
  source: string
  data: Record<string, unknown>
  timestamp: string
  processed: boolean
}

// Generic Types to replace 'any'
export type JsonObject = Record<string, unknown>
export type JsonArray = unknown[]
export interface ConfigData extends JsonObject {}

// Workflow Definition Types
export interface WorkflowDefinition {
  steps: WorkflowStep[]
  triggers?: WorkflowTrigger[]
  config?: Record<string, unknown>
}

export interface WorkflowStep {
  id: string
  name: string
  type: string
  config: Record<string, unknown>
  position?: { x: number; y: number }
}

export interface WorkflowTrigger {
  type: string
  config: Record<string, unknown>
}

// Execution Log Types
export interface ExecutionLog {
  id: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  timestamp: string
  step_id?: string
  metadata?: Record<string, unknown>
}
