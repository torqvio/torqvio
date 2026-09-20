export interface CapabilityLayer {
  id: string;
  name: string;
  layer: 'core' | 'intelligence' | 'control' | 'power';
  price: number;
  description: string;
  capabilities: string[];
  unlocks: string[];
  requiredFor: string[];
}

export interface AdaptivePlanLimits {
  revenueGeneratedPerMonth: number;
  workflowsInProduction: number;
  integrations: number;
  teamMembers: number;
  executionsPerMonth: number;
  concurrency: number;
  logsRetentionDays: number;
  retryPolicies: 'basic' | 'standard' | 'advanced';
  support: 'community' | 'email' | 'priority' | 'dedicated';
  features: string[];
  sla?: string;
}

export interface ScalingRules {
  executionThresholds: { executions: number; price: number }[];
  valueBasedScaling: boolean;
  revenueShareRate: number;
  minimumMonthlyFee: number;
  impactLimits: {
    maxRevenueGenerated: number;
    maxWorkflowsInProduction: number;
  };
}

export interface AdaptivePlan {
  id: string;
  mode: 'builder' | 'growth' | 'autopilot';
  name: string;
  basePrice: number;
  pricingModel: 'static' | 'adaptive' | 'revenue_share';
  description: string;
  outcome: string;
  limits: AdaptivePlanLimits;
  scalingRules: ScalingRules;
  capabilities: CapabilityLayer[];
  position: number;
}

export interface AdaptiveUsage {
  executionsPerMonth: number;
  stepRuns: number;
  projects: number;
  workflows: number;
  concurrency: number;
  apiCalls: number;
  revenueGenerated: number;
  workflowsInProduction: number;
  activeIntegrations: number;
  teamMembers: number;
}

export interface OutcomeMetrics {
  valueGenerated: number;
  timeSaved: number;
  errorsPrevented: number;
  revenueInfluenced: number;
  automationPercentage: number;
}

export interface HybridBilling {
  baseSubscription: number;
  usageCharges: number;
  outcomeCharges: number;
  revenueShare: number;
  total: number;
  currency: string;
  breakdown: {
    subscription: { name: string; price: number };
    usage: { metric: string; quantity: number; rate: number; charge: number }[];
    outcomes: { metric: string; value: number; rate: number; charge: number }[];
    revenueShare: { generated: number; rate: number; charge: number };
    capabilities: { name: string; price: number }[];
  };
}

export interface TenantPlan {
  plan: AdaptivePlan;
  mode: 'builder' | 'growth' | 'autopilot';
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  usage: AdaptiveUsage;
  outcomes: OutcomeMetrics;
  capabilities: CapabilityLayer[];
  billing: HybridBilling;
}
