// Integration Framework Types and Interfaces

export interface ConnectorFramework {
  definition: {
    name: string;
    version: string;
    description: string;
    category: string;
    tags: string[];
    icon?: string;
  };
  
  authentication: {
    type: 'api-key' | 'oauth2' | 'basic' | 'bearer' | 'custom';
    configuration: AuthenticationConfig;
  };
  
  endpoints: {
    [key: string]: EndpointDefinition;
  };
  
  rateLimiting: RateLimitConfig;
  errorHandling: ErrorHandlingConfig;
  testing: TestConfig;
}

export interface EndpointDefinition {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  parameters: ParameterDefinition[];
  requestBody?: RequestBodyDefinition;
  response: ResponseDefinition;
  errorResponses: ErrorResponseDefinition[];
  rateLimit?: EndpointRateLimit;
}

export interface ParameterDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  location: 'query' | 'path' | 'header';
  description?: string;
  defaultValue?: any;
  validation?: ValidationRule[];
}

export interface RequestBodyDefinition {
  contentType: string;
  schema: any;
  required: boolean;
  description?: string;
}

export interface ResponseDefinition {
  statusCode: number;
  contentType: string;
  schema: any;
  description?: string;
}

export interface ErrorResponseDefinition {
  statusCode: number;
  contentType: string;
  schema: any;
  description?: string;
}

export interface EndpointRateLimit {
  requestsPerSecond?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  requestsPerDay?: number;
  burstLimit?: number;
}

export interface AuthenticationConfig {
  apiKey?: {
    header: string;
    queryParam?: string;
  };
  
  oauth2?: {
    authUrl: string;
    tokenUrl: string;
    scopes: string[];
    grantType: 'authorization_code' | 'client_credentials';
    clientId?: string;
    clientSecret?: string;
  };
  
  basic?: {
    usernameField: string;
    passwordField: string;
  };
  
  bearer?: {
    tokenField: string;
  };
  
  custom?: {
    implementation: string; // Custom auth function
  };
}

export interface RateLimitConfig {
  default: EndpointRateLimit;
  strategy: 'fixed' | 'sliding' | 'token-bucket';
  retryPolicy: RetryPolicy;
}

export interface ErrorHandlingConfig {
  retryPolicy: RetryPolicy;
  circuitBreaker: CircuitBreakerConfig;
  timeout: number;
  validation: ValidationConfig;
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  initialDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringWindow: number;
}

export interface ValidationConfig {
  requestValidation: boolean;
  responseValidation: boolean;
  customValidators: CustomValidator[];
}

export interface CustomValidator {
  name: string;
  implementation: string;
}

export interface TestConfig {
  connectionTest: ConnectionTest;
  endpointTests: EndpointTest[];
  scenarios: ScenarioTest[];
}

export interface ConnectionTest {
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  expectedStatus: number;
  timeout: number;
}

export interface EndpointTest {
  name: string;
  endpoint: string;
  method: string;
  parameters?: Record<string, any>;
  requestBody?: any;
  expectedResponse: any;
  expectedStatus: number;
}

export interface ScenarioTest {
  name: string;
  description: string;
  steps: TestStep[];
}

export interface TestStep {
  name: string;
  endpoint: string;
  method: string;
  parameters?: Record<string, any>;
  requestBody?: any;
  expectedResponse?: any;
  expectedStatus: number;
}

// Integration Builder Interface
export interface IntegrationBuilder {
  discovery: {
    openapi: OpenAPIDiscovery;
    swagger: SwaggerDiscovery;
    manual: ManualConfiguration;
  };
  
  configuration: {
    authentication: AuthenticationBuilder;
    endpoints: EndpointBuilder;
    rateLimiting: RateLimitBuilder;
    errorHandling: ErrorHandlingBuilder;
  };
  
  testing: {
    connection: ConnectionTest;
    endpoints: EndpointTest;
    scenarios: ScenarioTest;
  };
  
  deployment: {
    validation: ConfigValidation;
    packaging: ConnectorPackaging;
    publishing: ConnectorPublishing;
  };
}

export interface OpenAPIDiscovery {
  url: string;
  authentication?: AuthenticationConfig;
  filter?: DiscoveryFilter;
}

export interface SwaggerDiscovery {
  url: string;
  authentication?: AuthenticationConfig;
  filter?: DiscoveryFilter;
}

export interface ManualConfiguration {
  endpoints: EndpointDefinition[];
  authentication: AuthenticationConfig;
}

export interface DiscoveryFilter {
  tags?: string[];
  paths?: string[];
  methods?: string[];
}

export interface AuthenticationBuilder {
  type: string;
  configuration: Partial<AuthenticationConfig>;
  testConnection: () => Promise<boolean>;
}

export interface EndpointBuilder {
  endpoint: Partial<EndpointDefinition>;
  testEndpoint: () => Promise<TestResult>;
}

export interface RateLimitBuilder {
  limits: Partial<EndpointRateLimit>;
  validateLimits: () => ValidationResult;
}

export interface ErrorHandlingBuilder {
  retryPolicy: Partial<RetryPolicy>;
  circuitBreaker: Partial<CircuitBreakerConfig>;
  validateConfiguration: () => ValidationResult;
}

export interface ConfigValidation {
  validate: (config: ConnectorFramework) => ValidationResult;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ConnectorPackaging {
  package: (config: ConnectorFramework) => Promise<PackageResult>;
  optimize: (package: PackageResult) => Promise<PackageResult>;
}

export interface ConnectorPublishing {
  publish: (package: PackageResult) => Promise<PublishResult>;
  update: (id: string, package: PackageResult) => Promise<PublishResult>;
}

// Result Types
export interface TestResult {
  success: boolean;
  response?: any;
  error?: string;
  duration: number;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  field: string;
  message: string;
  recommendation?: string;
}

export interface PackageResult {
  id: string;
  name: string;
  version: string;
  package: any;
  metadata: PackageMetadata;
}

export interface PackageMetadata {
  size: number;
  checksum: string;
  createdAt: string;
  dependencies: string[];
}

export interface PublishResult {
  id: string;
  status: 'published' | 'failed';
  url?: string;
  error?: string;
}

// Integration Patterns
export interface DataSyncPattern {
  source: {
    system: string;
    endpoint: string;
    authentication: AuthenticationConfig;
    polling: {
      interval: number;
      strategy: 'incremental' | 'full';
    };
  };
  
  transformation: {
    mapping: FieldMapping[];
    validation: ValidationRule[];
    enrichment: EnrichmentRule[];
  };
  
  target: {
    system: string;
    endpoint: string;
    authentication: AuthenticationConfig;
    batching: {
      size: number;
      delay: number;
    };
  };
  
  conflictResolution: {
    strategy: 'source-wins' | 'target-wins' | 'manual';
    rules: ConflictRule[];
  };
}

export interface EventDrivenPattern {
  events: {
    source: string;
    eventType: string;
    filters: EventFilter[];
  };
  
  processing: {
    transformation: DataTransformation;
    validation: EventValidation;
    enrichment: EventEnrichment;
  };
  
  actions: {
    target: string;
    action: string;
    parameters: ActionParameters[];
    retryPolicy: RetryPolicy;
  };
  
  monitoring: {
    tracking: EventTracking;
    alerting: AlertingRules;
    metrics: PerformanceMetrics;
  };
}

export interface RequestResponsePattern {
  request: {
    endpoint: string;
    method: string;
    headers: Record<string, string>;
    body: RequestBody;
    timeout: number;
  };
  
  processing: {
    validation: ResponseValidation;
    transformation: ResponseTransformation;
    errorHandling: ErrorHandler;
  };
  
  response: {
    success: SuccessHandler;
    error: ErrorHandler;
    timeout: TimeoutHandler;
  };
  
  caching: {
    enabled: boolean;
    ttl: number;
    key: string;
  };
}

// Supporting Types
export interface FieldMapping {
  source: string;
  target: string;
  transformation?: string;
  required: boolean;
}

export interface ValidationRule {
  field: string;
  rule: string;
  parameters?: any;
}

export interface EnrichmentRule {
  field: string;
  source: string;
  transformation?: string;
}

export interface ConflictRule {
  condition: string;
  resolution: string;
}

export interface EventFilter {
  field: string;
  operator: string;
  value: any;
}

export interface DataTransformation {
  script?: string;
  mappings?: FieldMapping[];
}

export interface EventValidation {
  rules: ValidationRule[];
}

export interface EventEnrichment {
  rules: EnrichmentRule[];
}

export interface ActionParameters {
  name: string;
  value: string;
  type: string;
}

export interface EventTracking {
  enabled: boolean;
  storage: string;
}

export interface AlertingRules {
  rules: AlertRule[];
}

export interface AlertRule {
  condition: string;
  action: string;
  parameters: any;
}

export interface PerformanceMetrics {
  enabled: boolean;
  metrics: string[];
}

export interface RequestBody {
  type: string;
  data: any;
}

export interface ResponseValidation {
  rules: ValidationRule[];
}

export interface ResponseTransformation {
  script?: string;
  mappings?: FieldMapping[];
}

export interface ErrorHandler {
  strategy: string;
  parameters: any;
}

export interface SuccessHandler {
  action: string;
  parameters: any;
}

export interface TimeoutHandler {
  action: string;
  parameters: any;
}

// Connector Registry
export interface ConnectorRegistry {
  connectors: Map<string, ConnectorFramework>;
  categories: Map<string, string[]>;
  search: (query: string) => ConnectorFramework[];
  getByCategory: (category: string) => ConnectorFramework[];
  register: (connector: ConnectorFramework) => void;
  unregister: (id: string) => void;
}

// Integration Runtime
export interface IntegrationRuntime {
  execute: (integrationId: string, context: any) => Promise<IntegrationResult>;
  schedule: (integrationId: string, schedule: string) => void;
  monitor: (integrationId: string) => IntegrationMetrics;
  healthCheck: (integrationId: string) => Promise<HealthStatus>;
}

export interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  duration: number;
  logs: LogEntry[];
}

export interface IntegrationMetrics {
  executions: number;
  successRate: number;
  averageDuration: number;
  errorRate: number;
  lastExecution: string;
}

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  details: HealthDetail[];
}

export interface HealthDetail {
  component: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  metrics?: any;
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: any;
}
