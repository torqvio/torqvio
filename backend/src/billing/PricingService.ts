export interface AdaptivePlan {
  id: string;
  mode: 'builder' | 'growth' | 'autopilot';
  name: string;
  basePrice: number;
  pricingModel: 'static' | 'adaptive' | 'revenue_share';
  description: string;
  outcome: string; // What this mode delivers
  limits: AdaptivePlanLimits;
  scalingRules: ScalingRules;
  capabilities: CapabilityLayer[];
  position: number;
}

export interface AdaptivePlanLimits {
  // Impact-based limits instead of usage-based
  revenueGeneratedPerMonth: number; // -1 for unlimited
  workflowsInProduction: number; // -1 for unlimited
  integrations: number; // -1 for unlimited
  teamMembers: number; // -1 for unlimited
  
  // Traditional limits for fallback
  executionsPerMonth: number; // -1 for unlimited
  concurrency: number; // -1 for unlimited
  logsRetentionDays: number;
  retryPolicies: 'basic' | 'standard' | 'advanced';
  support: 'community' | 'email' | 'priority' | 'dedicated';
  features: string[];
  sla?: string;
}

export interface ScalingRules {
  // Growth Mode: Auto-scaling based on success metrics
  executionThresholds: { executions: number; price: number }[];
  valueBasedScaling: boolean; // Scale based on value extracted
  
  // Autopilot Mode: Revenue share
  revenueShareRate: number; // 2-5% of value generated
  minimumMonthlyFee: number;
  
  // Builder Mode: Fixed limits on impact
  impactLimits: {
    maxRevenueGenerated: number;
    maxWorkflowsInProduction: number;
  };
}

export interface OutcomeMetrics {
  valueGenerated: number; // EUR/USD value created
  timeSaved: number; // Hours saved
  errorsPrevented: number; // Errors avoided
  revenueInfluenced: number; // Revenue attributed
  automationPercentage: number; // % of ops automated
}

export interface TenantPlan {
  plan: AdaptivePlan;
  mode: 'builder' | 'growth' | 'autopilot';
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  usage: AdaptiveUsage;
  outcomes: OutcomeMetrics;
  capabilities: CapabilityLayer[];
  billing: HybridBilling;
}

export interface CapabilityLayer {
  id: string;
  name: string;
  layer: 'core' | 'intelligence' | 'control' | 'power';
  price: number;
  description: string;
  capabilities: string[];
  unlocks: string[]; // What this enables
  requiredFor: string[]; // Which modes need this
}

export interface AdaptiveUsage {
  executionsPerMonth: number;
  stepRuns: number;
  projects: number;
  workflows: number;
  concurrency: number;
  apiCalls: number;
  
  // New adaptive metrics
  revenueGenerated: number;
  workflowsInProduction: number;
  activeIntegrations: number;
  teamMembers: number;
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

export interface LimitCheck {
  allowed: boolean;
  remaining: number; // -1 for unlimited
  currentUsage?: number;
  limit?: number;
}

export interface Subscription {
  checkoutUrl?: string;
  planId: string;
  mode: 'builder' | 'growth' | 'autopilot';
  price: number | null;
}

import { logger } from '../utils/logger.js';

export class AdaptivePricingService {
  private capabilityLayers: Map<string, CapabilityLayer> = new Map([
    ['core', {
      id: 'core',
      name: 'Core Layer',
      layer: 'core',
      price: 0,
      description: 'Essential workflow capabilities',
      capabilities: ['workflows', 'triggers', 'logs'],
      unlocks: ['Basic workflow execution', 'Simple triggers', 'Execution logs'],
      requiredFor: ['builder', 'growth', 'autopilot']
    }],
    ['intelligence', {
      id: 'intelligence',
      name: 'Intelligence Layer',
      layer: 'intelligence',
      price: 49,
      description: 'AI agents and decision trees',
      capabilities: ['ai_agents', 'decision_trees', 'anomaly_detection'],
      unlocks: ['AI workflow optimization', 'Smart decision making', 'Automated anomaly detection'],
      requiredFor: ['growth', 'autopilot']
    }],
    ['control', {
      id: 'control',
      name: 'Control Layer',
      layer: 'control',
      price: 99,
      description: 'Observability and debugging',
      capabilities: ['observability', 'replay', 'debugging'],
      unlocks: ['Advanced observability', 'Time travel debugging', 'Workflow replay'],
      requiredFor: ['autopilot']
    }],
    ['power', {
      id: 'power',
      name: 'Power Layer',
      layer: 'power',
      price: 199,
      description: 'Priority execution and scaling',
      capabilities: ['priority_execution', 'infra_scaling', 'dedicated_compute'],
      unlocks: ['Priority workflow execution', 'Auto infrastructure scaling', 'Dedicated compute resources'],
      requiredFor: ['autopilot']
    }]
  ]);

  private adaptivePlans: Map<string, AdaptivePlan> = new Map([
    ['builder', {
      id: 'builder',
      mode: 'builder',
      name: 'Builder Mode',
      basePrice: 0,
      pricingModel: 'static',
      description: 'For devs and indie hackers. Unlimited experimentation, hard limits on impact.',
      outcome: 'Build and test workflows without friction',
      limits: {
        revenueGeneratedPerMonth: 1000, // €1k max revenue
        workflowsInProduction: 3,
        integrations: 5,
        teamMembers: 2,
        executionsPerMonth: 10000,
        concurrency: 5,
        logsRetentionDays: 7,
        retryPolicies: 'basic',
        support: 'community',
        features: ['basic_retries', 'community_support', 'webhooks', 'scheduler']
      },
      scalingRules: {
        executionThresholds: [],
        valueBasedScaling: false,
        revenueShareRate: 0,
        minimumMonthlyFee: 0,
        impactLimits: {
          maxRevenueGenerated: 1000,
          maxWorkflowsInProduction: 3
        }
      },
      capabilities: [this.capabilityLayers.get('core')!],
      position: 1
    }],
    ['growth', {
      id: 'growth',
      mode: 'growth',
      name: 'Growth Mode',
      basePrice: 29,
      pricingModel: 'adaptive',
      description: 'Auto-scaling pricing based on your success. Pay as you grow.',
      outcome: 'Scale your business with automated workflows',
      limits: {
        revenueGeneratedPerMonth: -1, // Unlimited
        workflowsInProduction: -1,
        integrations: -1,
        teamMembers: -1,
        executionsPerMonth: -1,
        concurrency: -1,
        logsRetentionDays: 30,
        retryPolicies: 'standard',
        support: 'email',
        features: ['standard_retries', 'email_support', 'webhooks', 'scheduler', 'priority_queue']
      },
      scalingRules: {
        executionThresholds: [
          { executions: 10000, price: 29 },
          { executions: 100000, price: 79 },
          { executions: 1000000, price: 249 },
          { executions: 10000000, price: 999 }
        ],
        valueBasedScaling: true,
        revenueShareRate: 0,
        minimumMonthlyFee: 29,
        impactLimits: {
          maxRevenueGenerated: -1,
          maxWorkflowsInProduction: -1
        }
      },
      capabilities: [this.capabilityLayers.get('core')!, this.capabilityLayers.get('intelligence')!],
      position: 2
    }],
    ['autopilot', {
      id: 'autopilot',
      mode: 'autopilot',
      name: 'Autopilot Mode',
      basePrice: 0,
      pricingModel: 'revenue_share',
      description: 'We take 2-5% of the value we generate. Zero upfront cost.',
      outcome: 'Guaranteed outcomes powered by execution',
      limits: {
        revenueGeneratedPerMonth: -1,
        workflowsInProduction: -1,
        integrations: -1,
        teamMembers: -1,
        executionsPerMonth: -1,
        concurrency: -1,
        logsRetentionDays: -1,
        retryPolicies: 'advanced',
        support: 'dedicated',
        features: ['all_features', 'ai_optimization', 'priority_support', 'custom_integrations']
      },
      scalingRules: {
        executionThresholds: [],
        valueBasedScaling: true,
        revenueShareRate: 0.03, // 3% revenue share
        minimumMonthlyFee: 0,
        impactLimits: {
          maxRevenueGenerated: -1,
          maxWorkflowsInProduction: -1
        }
      },
      capabilities: [this.capabilityLayers.get('core')!, this.capabilityLayers.get('intelligence')!, this.capabilityLayers.get('control')!, this.capabilityLayers.get('power')!],
      position: 3
    }]
  ]);

  async getCurrentPlan(tenantId: string): Promise<TenantPlan> {
    const subscription = await this.getActiveSubscription(tenantId);
    
    if (!subscription) {
      return {
        plan: this.adaptivePlans.get('builder')!,
        mode: 'builder',
        status: 'trial',
        trialEndsAt: this.calculateTrialEnd(tenantId),
        usage: await this.getCurrentUsage(tenantId),
        outcomes: await this.getCurrentOutcomes(tenantId),
        capabilities: [this.capabilityLayers.get('core')!],
        billing: await this.calculateHybridBilling(tenantId)
      };
    }

    const plan = this.adaptivePlans.get(subscription.planId);
    if (!plan) {
      throw new Error(`Unknown plan: ${subscription.planId}`);
    }

    return {
      plan,
      mode: plan.mode,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      usage: await this.getCurrentUsage(tenantId),
      outcomes: await this.getCurrentOutcomes(tenantId),
      capabilities: plan.capabilities,
      billing: await this.calculateHybridBilling(tenantId)
    };
  }

  async checkFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    const currentPlan = await this.getCurrentPlan(tenantId);
    
    return currentPlan.plan.limits.features.includes(feature) || 
           currentPlan.plan.limits.features.includes('all_features');
  }

  async checkLimit(tenantId: string, metric: string, requestedAmount: number): Promise<LimitCheck> {
    const currentPlan = await this.getCurrentPlan(tenantId);
    const limit = (currentPlan.plan.limits as any)[metric as keyof AdaptivePlanLimits];
    const currentUsage = (currentPlan.usage as any)[metric] || 0;

    if (limit === -1) {
      return { allowed: true, remaining: -1 };
    }

    const remaining = (limit as number) - currentUsage;
    const allowed = remaining >= requestedAmount;

    return {
      allowed,
      remaining: Math.max(0, remaining),
      currentUsage,
      limit: limit as number
    };
  }

  // NEW: Calculate hybrid billing (subscription + usage + outcomes + revenue share)
  async calculateHybridBilling(tenantId: string): Promise<HybridBilling> {
    const currentPlan = await this.getCurrentPlan(tenantId);
    const usage = currentPlan.usage;
    const outcomes = currentPlan.outcomes;
    
    let baseSubscription = currentPlan.plan.basePrice;
    let usageCharges = 0;
    let outcomeCharges = 0;
    let revenueShare = 0;
    
    const usageBreakdown: { metric: string; quantity: number; rate: number; charge: number }[] = [];
    const outcomeBreakdown: { metric: string; value: number; rate: number; charge: number }[] = [];

    // Calculate adaptive pricing for Growth Mode
    if (currentPlan.plan.pricingModel === 'adaptive') {
      const executions = usage.executionsPerMonth;
      const thresholds = currentPlan.plan.scalingRules.executionThresholds;
      
      for (const threshold of thresholds) {
        if (executions <= threshold.executions) {
          baseSubscription = threshold.price;
          break;
        }
      }
    }

    // Calculate revenue share for Autopilot Mode
    if (currentPlan.plan.pricingModel === 'revenue_share') {
      const shareRate = currentPlan.plan.scalingRules.revenueShareRate;
      const generatedValue = outcomes.valueGenerated;
      revenueShare = generatedValue * shareRate;
      
      baseSubscription = Math.max(revenueShare, currentPlan.plan.scalingRules.minimumMonthlyFee);
    }

    // Calculate usage overages
    if (currentPlan.plan.limits.executionsPerMonth !== -1 && usage.executionsPerMonth > currentPlan.plan.limits.executionsPerMonth) {
      const overage = usage.executionsPerMonth - currentPlan.plan.limits.executionsPerMonth;
      const rate = 0.001; // Default overage rate
      const charge = overage * rate;
      usageCharges += charge;
      
      usageBreakdown.push({
        metric: 'executions',
        quantity: overage,
        rate,
        charge
      });
    }

    // Calculate outcome-based charges
    if (outcomes.timeSaved > 0) {
      const timeValue = outcomes.timeSaved * 50; // €50/hour value
      const rate = 0.1; // 10% of time value
      const charge = timeValue * rate;
      outcomeCharges += charge;
      
      outcomeBreakdown.push({
        metric: 'time_saved',
        value: timeValue,
        rate,
        charge
      });
    }

    // Calculate capability charges
    let capabilityCharges = 0;
    const capabilityBreakdown: { name: string; price: number }[] = [];
    
    for (const capability of currentPlan.capabilities) {
      if (capability.price > 0) {
        capabilityCharges += capability.price;
        capabilityBreakdown.push({
          name: capability.name,
          price: capability.price
        });
      }
    }

    const total = baseSubscription + usageCharges + outcomeCharges + revenueShare + capabilityCharges;

    return {
      baseSubscription,
      usageCharges,
      outcomeCharges,
      revenueShare,
      total,
      currency: 'USD',
      breakdown: {
        subscription: { name: currentPlan.plan.name, price: baseSubscription },
        usage: usageBreakdown,
        outcomes: outcomeBreakdown,
        revenueShare: { generated: outcomes.valueGenerated, rate: currentPlan.plan.scalingRules.revenueShareRate, charge: revenueShare },
        capabilities: capabilityBreakdown
      }
    };
  }

  // NEW: Get available capability layers
  getAvailableCapabilityLayers(): CapabilityLayer[] {
    return Array.from(this.capabilityLayers.values());
  }

  // NEW: Subscribe to capability layer
  async subscribeToCapability(tenantId: string, capabilityId: string): Promise<void> {
    const capability = this.capabilityLayers.get(capabilityId);
    if (!capability) {
      throw new Error(`Unknown capability: ${capabilityId}`);
    }

    logger.info(`Tenant ${tenantId} subscribed to capability ${capabilityId}`);
  }

  // NEW: Unsubscribe from capability layer
  async unsubscribeFromCapability(tenantId: string, capabilityId: string): Promise<void> {
    logger.info(`Tenant ${tenantId} unsubscribed from capability ${capabilityId}`);
  }

  async upgradePlan(tenantId: string, newPlanId: string): Promise<Subscription> {
    const newPlan = this.adaptivePlans.get(newPlanId);
    if (!newPlan) {
      throw new Error(`Unknown plan: ${newPlanId}`);
    }

    // Create Stripe checkout session
    const session = await this.createCheckoutSession(tenantId, newPlan);

    return {
      checkoutUrl: session.url,
      planId: newPlanId,
      mode: newPlan.mode,
      price: newPlan.basePrice
    };
  }

  private async createCheckoutSession(tenantId: string, plan: AdaptivePlan): Promise<any> {
    const tenant = await this.getTenant(tenantId);
    
    // Mock Stripe session creation
    return {
      url: `https://checkout.stripe.com/pay/mock-session?plan=${plan.id}`,
      sessionId: `cs_mock_${Date.now()}`
    };
  }

  private async getActiveSubscription(tenantId: string): Promise<any> {
    // Mock implementation - would query database
    return null; // No active subscription for demo
  }

  async getCurrentUsage(tenantId: string): Promise<AdaptiveUsage> {
    // Mock implementation - would calculate actual usage
    return {
      executionsPerMonth: 450,
      stepRuns: 2250, // Average 5 steps per execution
      projects: 3,
      workflows: 8,
      concurrency: 2,
      apiCalls: 1250,
      
      // New adaptive metrics
      revenueGenerated: 2500,
      workflowsInProduction: 5,
      activeIntegrations: 8,
      teamMembers: 3
    };
  }

  async getCurrentOutcomes(tenantId: string): Promise<OutcomeMetrics> {
    // Mock implementation - would calculate actual outcomes
    return {
      valueGenerated: 5000, // €5k value created
      timeSaved: 120, // 120 hours saved
      errorsPrevented: 45, // 45 errors avoided
      revenueInfluenced: 8000, // €8k revenue attributed
      automationPercentage: 67 // 67% of ops automated
    };
  }

  private async getTenantCapabilities(tenantId: string): Promise<CapabilityLayer[]> {
    // Mock implementation - would query database
    return [this.capabilityLayers.get('core')!];
  }

  private calculateTrialEnd(tenantId: string): Date {
    // Mock implementation - would get trial start date from database
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14); // 14-day trial
    return trialEnd;
  }

  private async getTenant(tenantId: string): Promise<any> {
    // Mock implementation - would query database
    return {
      id: tenantId,
      stripeCustomerId: `cus_mock_${tenantId}`
    };
  }

  getAllAdaptivePlans(): AdaptivePlan[] {
    return Array.from(this.adaptivePlans.values());
  }

  getAdaptivePlan(planId: string): AdaptivePlan | undefined {
    return this.adaptivePlans.get(planId);
  }

  async incrementUsage(tenantId: string, metric: string, amount: number = 1): Promise<void> {
    // This would integrate with SubscriptionModel in a real implementation
    // For now, we'll just log the usage increment
    logger.info(`Usage incremented for tenant ${tenantId}: ${metric} +${amount}`);
    
    // Real implementation:
    // const subscriptionModel = new SubscriptionModel();
    // await subscriptionModel.incrementUsage(tenantId, metric, amount);
  }
}
