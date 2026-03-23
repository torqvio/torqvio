export interface IntegrationConnector {
  validateCredentials(config: IntegrationConfig): Promise<boolean>;
  setupWebhooks(config: IntegrationConfig): Promise<WebhookConfig>;
  processEvent(event: ExternalEvent): Promise<ProcessedEvent>;
}

export interface IntegrationConfig {
  type: string;
  webhookUrl?: string;
  secretKey?: string;
  accessToken?: string;
  shopDomain?: string;
  apiVersion?: string;
  healthCheckUrl?: string;
  webhookRegistrationUrl?: string;
  webhookSecret?: string;
  events?: string[];
  [key: string]: any;
}

export interface WebhookConfig {
  endpointId?: string;
  secret: string;
  url: string;
}

export interface ExternalEvent {
  id: string;
  type: string;
  integrationId: string;
  rawData: any;
  data?: any; // Parsed event data
  headers: Record<string, string>;
  timestamp: Date;
  config?: IntegrationConfig;
}

export interface ProcessedEvent {
  id: string;
  status: 'processed' | 'ignored' | 'invalid_signature' | 'error';
  workflowTriggered?: string;
  recoveryPotential?: number;
  data?: any;
  reason?: string;
}

// Specific integration configs
export interface StripeConfig extends IntegrationConfig {
  secretKey: string;
  webhookUrl: string;
  webhookSecret: string;
  apiVersion?: string;
}

export interface ShopifyConfig extends IntegrationConfig {
  shopDomain: string;
  accessToken: string;
  webhookUrl: string;
}

export interface GenericAPIConfig extends IntegrationConfig {
  healthCheckUrl: string;
  webhookRegistrationUrl: string;
  webhookSecret: string;
  events: string[];
  authType: 'bearer' | 'basic' | 'api_key';
  authToken?: string;
  username?: string;
  password?: string;
}

// Recovery data structures
export interface OrderRecoveryData {
  orderId: string;
  customerEmail: string;
  totalAmount: string;
  failureReason?: string;
}

export interface PaymentHistory {
  totalPayments: number;
  failedPayments: number;
  failureRate: number;
  lastFailureDate?: Date;
}

export interface FailureContext {
  customer: {
    id: string;
    paymentHistory?: PaymentHistory;
    ltv: number;
  };
  amount: number;
  paymentMethod: {
    type: string;
    age: number;
  };
  timeOfDay: number;
  dayOfWeek: number;
  recentAttempts: number;
}

export interface FailurePrediction {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  contributingFactors: number[];
  recommendedActions: string[];
}

// Analytics interfaces
export interface TenantMetrics {
  id: string;
  industry: string;
  recoveryRate: number;
  avgRecoveryTime: number;
  revenueProtected: number;
  templateUsage: string[];
}

export interface IndustryAverages {
  recoveryRate: number;
  avgRecoveryTime: number;
  revenueProtected: number;
}

export interface TenantBenchmark {
  tenantId: string;
  period: string;
  recoveryRate: {
    current: number;
    industry: number;
    topQuartile: number;
    percentile: number;
  };
  averageRecoveryTime: {
    current: number;
    industry: number;
    topQuartile: number;
  };
  revenueProtection: {
    current: number;
    industry: number;
    topQuartile: number;
  };
  recommendations: string[];
}

// Simulation interfaces
export interface SimulationScenario {
  name: string;
  tenantId: string;
  type: 'template_deployment' | 'notification_upgrade' | 'retry_strategy_change' | 'integration_addition';
  period: string;
  investment: number;
  baseline: any;
  config: any;
}

export interface SimulationResult {
  scenario: string;
  period: string;
  baseline: {
    recoveryRate: number;
    revenueProtected: number;
    costs: number;
  };
  simulated: {
    recoveryRate: number;
    revenueProtected: number;
    costs: number;
  };
  impact: {
    additionalRevenue: number;
    roi: number;
    paybackPeriod: number;
  };
}

export interface SimulatedMetrics {
  recoveryRate: number;
  revenueProtected: number;
  costs: number;
}
