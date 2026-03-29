// Placeholder types for @torqvio/client
export interface Integration {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  projectId: string;
  configuration: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
  scheduleId?: string;
}

export interface IntegrationBundle {
  id: string;
  name: string;
  description: string;
  integrations: Integration[];
  pricing: {
    setup: number;
    monthly: number;
    perExecution: number;
  };
}

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  integrationId: string;
  createdAt?: string;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  scope: string[];
}

export interface ExecutionContext {
  integrationId: string;
  executionId: string;
  userId: string;
  timestamp: Date;
  metadata: Record<string, any>;
  endpoint?: string;
  method?: string;
  parameters?: Record<string, any>;
}

export interface IntegrationResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
  duration?: number;
  logs?: any[];
}

export interface LogEntry {
  id: string;
  integrationId: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface EcosystemRecommendation {
  id?: string;
  integrationId: string;
  reason: string;
  confidence: number;
  benefits: string[];
  integrations?: Integration[];
}

export interface HealthDetail {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message: string;
  timestamp: Date;
  details?: Record<string, any>;
  component?: string;
}

export interface connectivity {
  status: 'connected' | 'disconnected' | 'error';
  latency?: number;
  lastChecked: Date;
}

export interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthDetail[];
}

export interface IntegrationMetrics {
  totalExecutions: number;
  successRate: number;
  averageExecutionTime: number;
  errorCount: number;
  lastExecution: Date;
}
