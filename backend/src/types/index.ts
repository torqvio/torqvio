// Core types for Torqvio durable execution platform


export interface FlowDefinition {
  id: string;
  name: string;
  steps: StepDefinition[];
  retryPolicy?: RetryPolicy;
  createdAt: Date;
  updatedAt: Date;
}

export interface StepDefinition {
  id: string;
  name: string;
  type: StepType;
  config: StepConfig;
  nextStepId?: string | undefined;
  condition?: string; // conditional execution logic
}

export enum StepType {
  FUNCTION = 'function',
  SLEEP = 'sleep',
  RETRY = 'retry',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  VALIDATION = 'validation',
  PAYMENT_GATEWAY = 'payment_gateway',
  DATABASE = 'database',
  NOTIFICATION = 'notification',
  SCHEDULER = 'scheduler'
}

export interface StepConfig {
  // For FUNCTION steps
  functionName?: string;
  functionCode?: string | undefined;
  
  // For SLEEP steps
  duration?: string; // e.g., "1h", "30m", "5s"
  
  // For RETRY steps
  maxAttempts?: number;
  backoffStrategy?: BackoffStrategy;
  
  // For VALIDATION steps
  required_fields?: string[];
  amount_limits?: {
    min: number;
    max: number;
  };
  
  // For PAYMENT_GATEWAY steps
  provider?: string;
  retry_count?: number;
  retry_delay?: number;
  payment_operation?: string;
  
  // For DATABASE steps
  table?: string;
  db_operation?: string;
  
  // For NOTIFICATION steps
  channels?: string[];
  template?: string;
  
  // For SCHEDULER steps
  next_run?: string;
  workflow?: string;
  
  // Common config
  timeout?: number;
  idempotencyKey?: string;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  retryableErrors?: string[];
}

export enum BackoffStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential'
}

export interface FlowExecution {
  id: string;
  flowId: string;
  status: ExecutionStatus;
  currentStepId?: string | undefined;
  payload: Record<string, any>;
  context: ExecutionContext;
  results?: Record<string, any>;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  nextRunAt?: Date;
}

export enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying',
  SLEEPING = 'sleeping'
}

export interface ExecutionContext {
  stepResults: Record<string, StepResult>;
  retryCount: Record<string, number>;
  errors: ExecutionError[];
  metadata: Record<string, any>;
}

export interface StepResult {
  stepId: string;
  stepName: string;
  status: StepStatus;
  output?: any;
  error?: ExecutionError;
  startedAt: Date;
  completedAt?: Date;
  duration: number;
}

export enum StepStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped'
}

export interface ExecutionError {
  stepId: string;
  message: string;
  code?: string;
  stack?: string | undefined;
  timestamp: Date;
  retryable: boolean;
}

export interface Event {
  id: string;
  type: string;
  payload: Record<string, any>;
  timestamp: Date;
  source?: string;
  flowId?: string;
  executionId?: string;
  correlationId?: string;
  causationId?: string;
  projectId?: string;
  processed?: boolean;
}

export interface Trigger {
  id: string;
  flowId: string;
  type: TriggerType;
  config: TriggerConfig;
  active: boolean;
}

export enum TriggerType {
  HTTP = 'http',
  WEBHOOK = 'webhook',
  SCHEDULE = 'schedule',
  EVENT = 'event',
  DATABASE_EVENT = 'database_event',
  EXTERNAL_API = 'external_api',
  MANUAL = 'manual'
}

export interface TriggerConfig {
  // For HTTP triggers
  path?: string;
  method?: string;
  
  // For SCHEDULE triggers
  cron?: string;
  
  // For EVENT triggers
  eventType?: string;
  eventFilter?: Record<string, any>;
  
  // For WEBHOOK triggers
  auth?: AuthConfig;
  validation?: ValidationConfig;
  
  // Common config
  headers?: Record<string, string>;
}

// Enhanced API Types with proper interfaces
export interface CreateFlowRequest {
  name: string;
  description?: string;
  steps: Omit<StepDefinition, 'id'>[];
  retryPolicy?: RetryPolicy;
  tags?: string[];
}

export interface UpdateFlowRequest {
  name?: string;
  description?: string;
  steps?: Omit<StepDefinition, 'id'>[];
  retryPolicy?: RetryPolicy;
  status?: 'active' | 'inactive' | 'archived';
  tags?: string[];
}

export interface ExecuteFlowRequest {
  flowId?: string;
  flowName?: string;
  payload?: Record<string, any>;
  options?: ExecutionOptions;
}

export interface ExecutionOptions {
  timeout?: number;
  retries?: number;
  priority?: 'low' | 'normal' | 'high';
  scheduled_at?: string;
  idempotencyKey?: string;
}

export interface ListFlowsQuery {
  page?: number;
  limit?: number;
  status?: string;
  tags?: string[];
  search?: string;
  sort_by?: 'name' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

export interface ListExecutionsQuery {
  page?: number;
  limit?: number;
  status?: ExecutionStatus;
  flow_id?: string;
  started_after?: string;
  started_before?: string;
  triggered_by?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ResponseMeta {
  page?: number;
  limit?: number;
  total?: number;
  count?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

// Authentication & Authorization Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions?: Permission[];
  last_login_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'admin' | 'user' | 'viewer';

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  project_id: string;
  permissions: Permission[];
  last_used_at?: string;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Integration Types
export interface Integration {
  id: string;
  name: string;
  type: IntegrationType;
  config: IntegrationConfig;
  project_id: string;
  status: 'active' | 'inactive' | 'error';
  last_sync_at?: string;
  created_at: string;
  updated_at: string;
}

export type IntegrationType = 
  | 'shopify'
  | 'stripe'
  | 'slack'
  | 'sendgrid'
  | 'webhook'
  | 'database'
  | 'custom';

export interface IntegrationConfig {
  [key: string]: any;
  credentials?: {
    api_key?: string;
    secret?: string;
    token?: string;
    [key: string]: any;
  };
  settings?: Record<string, any>;
}

// Error Classes
export class ValidationError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id?: string) {
    super(`${resource}${id ? ` with id ${id}` : ''} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

export interface FlowExecutionResponse {
  execution: FlowExecution;
  steps: StepResult[];
}

// Database Types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean | {
    rejectUnauthorized: boolean;
    require: boolean;
  };
  pool?: {
    min?: number;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
    allowExitOnIdle?: boolean;
  };
}

// Logger Types
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  executionId?: string;
  stepId?: string;
}

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Event-Driven System Types
export interface EventBus {
  publish(event: Event): Promise<void>;
  subscribe(eventType: string, handler: EventHandler): void;
  unsubscribe(eventType: string, handler: EventHandler): void;
}

export interface EventHandler {
  (event: Event): Promise<void> | void;
}

export interface EventProcessor {
  processEvent(event: Event): Promise<void>;
  findMatchingWorkflows(event: Event): Promise<FlowDefinition[]>;
  executeTriggeredWorkflows(event: Event, workflows: FlowDefinition[]): Promise<void>;
}

export interface WebhookTrigger {
  endpoint: string;
  eventType: string;
  authentication?: AuthConfig;
  validation?: ValidationConfig;
}

export interface AuthConfig {
  type: 'api_key' | 'bearer' | 'basic' | 'signature';
  credentials: Record<string, any>;
}

export interface ValidationConfig {
  type: 'json_schema' | 'signature' | 'custom';
  rules: Record<string, any>;
}

// Multi-Tenancy Types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'scale';
  settings: OrgSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  organizationId: string;
  name: string;
  apiKey: string;
  settings: ProjectSettings;
  quotas: ResourceQuotas;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrgSettings {
  [key: string]: any;
}

export interface ProjectSettings {
  [key: string]: any;
}

export interface ResourceQuotas {
  maxExecutions?: number;
  maxEvents?: number;
  maxStorage?: number;
  retentionDays?: number;
}

export interface EventSubscription {
  id: string;
  flowId: string;
  eventType: string;
  filterConfig?: Record<string, any>;
  active: boolean;
  createdAt: Date;
  projectId?: string;
}

// ─── Batch Jobs ───────────────────────────────────────────────────────────────

export type BatchJobStatus = 'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type BatchJobItemStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface BatchRetryPolicy {
  max_attempts: number;
  backoff: 'linear' | 'exponential' | 'fixed';
  initial_delay_ms: number;
  max_delay_ms: number;
}

export interface BatchJob {
  id: string;
  project_id: string;
  name: string;
  flow_id: string | null;
  status: BatchJobStatus;
  concurrency: number;
  total_items: number;
  completed_items: number;
  failed_items: number;
  skipped_items: number;
  retry_policy: BatchRetryPolicy;
  scheduled_at: Date | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface BatchJobItem {
  id: string;
  batch_job_id: string;
  payload: Record<string, any>;
  status: BatchJobItemStatus;
  execution_id: string | null;
  attempt: number;
  error: { message: string; code?: string } | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateBatchJobRequest {
  name: string;
  flow_id: string;
  items: Record<string, any>[];
  concurrency?: number;
  retry_policy?: Partial<BatchRetryPolicy>;
  scheduled_at?: string;
}
