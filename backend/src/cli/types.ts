export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'email' | 'webhook' | 'custom';
  value_proposition: string;
  environment: Record<string, string>;
  triggers: TemplateTrigger[];
  steps: TemplateStep[];
  monitoring?: TemplateMonitoring;
  compliance?: TemplateCompliance;
}

export interface TemplateTrigger {
  type: 'webhook' | 'event' | 'schedule';
  event?: string;
  source?: string;
  config: Record<string, any>;
}

export interface TemplateStep {
  id: string;
  type: string;
  name: string;
  config: Record<string, any>;
  retry_policy?: RetryPolicy;
}

export interface RetryPolicy {
  max_attempts: number;
  backoff_strategy: 'linear' | 'exponential' | 'fixed';
  base_delay?: number;
}

export interface TemplateMonitoring {
  alerts: TemplateAlert[];
  metrics: string[];
}

export interface TemplateAlert {
  name: string;
  condition: string;
  threshold: string;
  window: string;
  notification: string[];
}

export interface TemplateCompliance {
  data_retention: Record<string, string>;
  security: Record<string, any>;
  regulations: string[];
}

export interface ProjectConfig {
  projectId: string;
  apiKey: string;
  name: string;
  createdAt: string;
}

export interface DeploymentResult {
  deploymentId: string;
  templateId: string;
  status: 'deploying' | 'deployed' | 'failed';
  endpoints: string[];
  webhookUrl?: string;
  message: string;
}

export interface GlobalOptions {
  debug?: boolean;
  verbose?: boolean;
  config?: string;
  apiUrl?: string;
  workspace?: string;
  format?: 'json' | 'table' | 'yaml';
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  definition: any;
}

export interface Execution {
  id: string;
  workflowId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  input: any;
  output?: any;
  error?: string;
  logs: LogEntry[];
}

export interface LogEntry {
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  metadata?: any;
}

export interface Config {
  // API Configuration
  api: {
    url: string;
    timeout?: number;
    retries?: number;
  };
  
  // Authentication Configuration
  auth: {
    method: 'oauth' | 'api_key' | 'service_account';
    api_key?: string;
    auto_refresh?: boolean;
    provider?: 'github' | 'google' | 'microsoft';
    client_id?: string;
    client_secret?: string;
    redirect_uri?: string;
    key_file?: string;
    project_id?: string;
  };
  
  // Workspace Configuration
  workspace: {
    default?: string;
    environments?: Record<string, Environment>;
  };
  
  // CLI Configuration
  cli: {
    output_format?: 'table' | 'json' | 'yaml' | 'csv';
    log_level?: 'debug' | 'info' | 'warn' | 'error';
    auto_confirm?: boolean;
    pager?: boolean;
    color?: boolean;
    unicode?: boolean;
  };
  
  // Database Configuration
  database?: {
    pool?: {
      min?: number;
      max?: number;
      idle_timeout?: number;
      acquire_timeout?: number;
    };
  };
  
  // Redis Configuration
  redis?: {
    pool?: {
      min?: number;
      max?: number;
      timeout?: number;
    };
  };
  
  // SSL/TLS Configuration
  ssl?: {
    enabled?: boolean;
    verify_certificates?: boolean;
    ca_file?: string;
    client_cert?: {
      enabled?: boolean;
      cert_file?: string;
      key_file?: string;
    };
  };
  
  // Monitoring Configuration
  monitoring?: {
    enabled?: boolean;
    metrics_endpoint?: string;
    trace_sampling?: number;
    interval?: number;
  };
  
  // Plugin Configuration
  plugins?: {
    enabled?: boolean;
    directory?: string;
    plugins?: Record<string, PluginConfig>;
  };
  
  // Hook Configuration
  hooks?: {
    pre_run?: string[];
    post_run?: string[];
    on_error?: string[];
  };
  
  // Alias Configuration
  aliases?: Record<string, string>;
  
  // Cache Configuration
  cache?: {
    enabled?: boolean;
    ttl?: number;
    max_size?: number;
    backend?: string;
    strategies?: Record<string, CacheStrategy>;
  };
  
  // Rate Limiting Configuration
  rate_limiting?: {
    enabled?: boolean;
    limits?: Record<string, RateLimit>;
  };
  
  // Encryption Configuration
  encryption?: {
    algorithm?: string;
    key_derivation?: string;
    secrets?: {
      encryption_key?: string;
      key_rotation_days?: number;
    };
    at_rest?: {
      enabled?: boolean;
      algorithm?: string;
    };
  };
  
  // Access Control Configuration
  access_control?: {
    ip_whitelist?: string[];
    ip_blacklist?: string[];
    rate_limiting?: {
      enabled?: boolean;
      requests_per_minute?: number;
    };
  };
}

export interface Environment {
  api_url?: string;
  database_url?: string;
  redis_url?: string;
  log_level?: string;
  variables?: Record<string, string>;
}

export interface PluginConfig {
  enabled?: boolean;
  [key: string]: any;
}

export interface CacheStrategy {
  ttl?: number;
  max_size?: number;
}

export interface RateLimit {
  requests_per_minute?: number;
  burst?: number;
  requests_per_hour?: number;
}

export interface ConfigSource {
  type: 'file' | 'env' | 'default';
  path?: string;
  priority: number;
}

export interface AuthConfig {
  apiKey?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  workspace?: string;
}
