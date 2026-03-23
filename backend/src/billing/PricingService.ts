export interface PricingPlan {
  id: string;
  name: string;
  price: number | null; // null for custom pricing
  description: string;
  limits: PlanLimits;
  overageRates: OverageRates;
  stripePriceId?: string;
  position: number; // For ordering
}

export interface PlanLimits {
  projects: number; // -1 for unlimited
  workflows: number; // -1 for unlimited
  executionsPerMonth: number; // -1 for unlimited
  concurrency: number; // -1 for unlimited
  logsRetentionDays: number;
  retryPolicies: 'basic' | 'standard' | 'advanced';
  support: 'community' | 'email' | 'priority' | 'dedicated';
  features: string[];
  sla?: string; // SLA guarantee for higher tiers
}

export interface OverageRates {
  executionRate: number; // Cost per execution over limit
  stepRuns: boolean; // Whether step runs count separately
}

export interface Usage {
  executionsPerMonth: number;
  stepRuns: number;
  projects: number;
  workflows: number;
  concurrency: number;
  apiCalls: number;
}

export interface TenantPlan {
  plan: PricingPlan;
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  usage: Usage;
  addOns: AddOnSubscription[];
}

export interface AddOn {
  id: string;
  name: string;
  price: number; // Monthly price
  description: string;
  features: string[];
  stripePriceId?: string;
}

export interface AddOnSubscription {
  addOnId: string;
  active: boolean;
  subscribedAt?: Date;
}

export interface BillingCalculation {
  basePrice: number;
  usageCharges: number;
  addOnCharges: number;
  total: number;
  currency: string;
  breakdown: {
    plan: { name: string; price: number };
    usage: { metric: string; quantity: number; rate: number; charge: number }[];
    addOns: { name: string; price: number }[];
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
  price: number | null;
}

import { logger } from '../utils/logger.js';

export class PricingService {
  private plans: Map<string, PricingPlan> = new Map([
    ['free', {
      id: 'free',
      name: 'Free',
      price: 0,
      description: 'Hook Them Forever - Perfect for getting started and small projects',
      limits: {
        projects: 1,
        workflows: 5,
        executionsPerMonth: 1000,
        concurrency: -1, // shared
        logsRetentionDays: 1,
        retryPolicies: 'basic',
        support: 'community',
        features: ['basic_retries', 'community_support', 'webhooks', 'scheduler']
      },
      overageRates: {
        executionRate: 0.001, // $0.001 per execution
        stepRuns: false
      },
      position: 1
    }],
    ['starter', {
      id: 'starter',
      name: 'Starter',
      price: 25,
      description: 'Indie Builders - Sweet spot for small SaaS',
      limits: {
        projects: 5,
        workflows: 50,
        executionsPerMonth: 50000,
        concurrency: 5,
        logsRetentionDays: 7,
        retryPolicies: 'standard',
        support: 'email',
        features: ['standard_retries', 'email_support', 'webhooks', 'scheduler', 'priority_queue']
      },
      overageRates: {
        executionRate: 0.001,
        stepRuns: false
      },
      position: 2
    }],
    ['pro', {
      id: 'pro',
      name: 'Pro',
      price: 99,
      description: 'Real Businesses - This is your money printer tier',
      limits: {
        projects: 20,
        workflows: -1, // unlimited
        executionsPerMonth: 500000,
        concurrency: 20,
        logsRetentionDays: 30,
        retryPolicies: 'advanced',
        support: 'priority',
        features: ['advanced_retries', 'priority_support', 'realtime_monitoring', 'priority_execution', 'custom_branding']
      },
      overageRates: {
        executionRate: 0.0008,
        stepRuns: false
      },
      position: 3
    }],
    ['business', {
      id: 'business',
      name: 'Business',
      price: 399,
      description: 'Critical Infrastructure - Where companies stop thinking about price',
      limits: {
        projects: -1, // unlimited
        workflows: -1, // unlimited
        executionsPerMonth: 2000000,
        concurrency: 100,
        logsRetentionDays: 90,
        retryPolicies: 'advanced',
        support: 'dedicated',
        features: ['all_features', 'rbac', 'audit_logs', 'sla_guarantee', 'dedicated_concurrency'],
        sla: '99.9%'
      },
      overageRates: {
        executionRate: 0.0006,
        stepRuns: false
      },
      position: 4
    }],
    ['enterprise', {
      id: 'enterprise',
      name: 'Enterprise',
      price: null, // Custom pricing
      description: 'We Run Your Company - High-margin, low-volume, huge revenue',
      limits: {
        projects: -1, // unlimited
        workflows: -1, // unlimited
        executionsPerMonth: -1, // unlimited
        concurrency: -1, // unlimited
        logsRetentionDays: -1, // unlimited
        retryPolicies: 'advanced',
        support: 'dedicated',
        features: ['all_features', 'dedicated_infrastructure', 'multi_region', 'compliance', 'custom_slas', 'dedicated_slack'],
        sla: '99.99%'
      },
      overageRates: {
        executionRate: 0.0004,
        stepRuns: true // Enterprise gets step-run billing
      },
      position: 5
    }]
  ]);

  private addOns: Map<string, AddOn> = new Map([
    ['observability_plus', {
      id: 'observability_plus',
      name: 'Observability+',
      price: 49,
      description: 'Advanced logs, traces, and debugging capabilities',
      features: ['advanced_logs', 'distributed_tracing', 'debugging_tools', 'performance_insights']
    }],
    ['high_priority_execution', {
      id: 'high_priority_execution',
      name: 'High Priority Execution',
      price: 99,
      description: 'Skip queue, faster execution for critical workflows',
      features: ['queue_skip', 'faster_execution', 'priority_routing', 'dedicated_resources']
    }],
    ['replay_time_travel', {
      id: 'replay_time_travel',
      name: 'Replay & Time Travel',
      price: 29,
      description: 'Replay any workflow with time travel debugging',
      features: ['workflow_replay', 'time_travel_debug', 'execution_history', 'state_snapshots']
    }],
    ['webhook_reliability', {
      id: 'webhook_reliability',
      name: 'Webhook Reliability Pack',
      price: 19,
      description: 'Advanced retries and delivery guarantees',
      features: ['advanced_retries', 'delivery_guarantees', 'webhook_monitoring', 'failure_analysis']
    }],
    ['agent_skills_pack', {
      id: 'agent_skills_pack',
      name: 'Agent / Skills Pack',
      price: 19,
      description: 'Export flows as skills.md, agent-ready APIs',
      features: ['skills_export', 'agent_apis', 'workflow_templates', 'ai_integration']
    }]
  ]);

  async getCurrentPlan(tenantId: string): Promise<TenantPlan> {
    const subscription = await this.getActiveSubscription(tenantId);
    
    if (!subscription) {
      return {
        plan: this.plans.get('free')!,
        status: 'trial',
        trialEndsAt: this.calculateTrialEnd(tenantId),
        usage: await this.getCurrentUsage(tenantId),
        addOns: []
      };
    }

    const plan = this.plans.get(subscription.planId);
    if (!plan) {
      throw new Error(`Unknown plan: ${subscription.planId}`);
    }

    return {
      plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      usage: await this.getCurrentUsage(tenantId),
      addOns: await this.getTenantAddOns(tenantId)
    };
  }

  async checkFeatureAccess(tenantId: string, feature: string): Promise<boolean> {
    const currentPlan = await this.getCurrentPlan(tenantId);
    
    return currentPlan.plan.limits.features.includes(feature) || 
           currentPlan.plan.limits.features.includes('all_features');
  }

  async checkLimit(tenantId: string, metric: string, requestedAmount: number): Promise<LimitCheck> {
    const currentPlan = await this.getCurrentPlan(tenantId);
    const limit = (currentPlan.plan.limits as any)[metric as keyof PlanLimits];
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

  // NEW: Calculate monthly billing
  async calculateMonthlyBilling(tenantId: string): Promise<BillingCalculation> {
    const currentPlan = await this.getCurrentPlan(tenantId);
    const usage = currentPlan.usage;
    
    let basePrice = currentPlan.plan.price || 0;
    let usageCharges = 0;
    const usageBreakdown: { metric: string; quantity: number; rate: number; charge: number }[] = [];

    // Calculate execution overages
    if (currentPlan.plan.limits.executionsPerMonth !== -1 && usage.executionsPerMonth > currentPlan.plan.limits.executionsPerMonth) {
      const overage = usage.executionsPerMonth - currentPlan.plan.limits.executionsPerMonth;
      const rate = currentPlan.plan.overageRates.executionRate;
      const charge = overage * rate;
      usageCharges += charge;
      
      usageBreakdown.push({
        metric: 'executions',
        quantity: overage,
        rate,
        charge
      });
    }

    // Calculate step run overages (for enterprise)
    if (currentPlan.plan.overageRates.stepRuns && usage.stepRuns > 0) {
      const rate = currentPlan.plan.overageRates.executionRate * 0.1; // Step runs cost 10% of execution rate
      const charge = usage.stepRuns * rate;
      usageCharges += charge;
      
      usageBreakdown.push({
        metric: 'step_runs',
        quantity: usage.stepRuns,
        rate,
        charge
      });
    }

    // Calculate add-on charges
    let addOnCharges = 0;
    const addOnBreakdown: { name: string; price: number }[] = [];
    
    for (const addOnSub of currentPlan.addOns) {
      if (addOnSub.active) {
        const addOn = this.addOns.get(addOnSub.addOnId);
        if (addOn) {
          addOnCharges += addOn.price;
          addOnBreakdown.push({
            name: addOn.name,
            price: addOn.price
          });
        }
      }
    }

    const total = basePrice + usageCharges + addOnCharges;

    return {
      basePrice,
      usageCharges,
      addOnCharges,
      total,
      currency: 'USD',
      breakdown: {
        plan: { name: currentPlan.plan.name, price: basePrice },
        usage: usageBreakdown,
        addOns: addOnBreakdown
      }
    };
  }

  // NEW: Get available add-ons
  getAvailableAddOns(): AddOn[] {
    return Array.from(this.addOns.values());
  }

  // NEW: Subscribe to add-on
  async subscribeToAddOn(tenantId: string, addOnId: string): Promise<void> {
    const addOn = this.addOns.get(addOnId);
    if (!addOn) {
      throw new Error(`Unknown add-on: ${addOnId}`);
    }

    // In real implementation, this would update the database
    logger.info(`Tenant ${tenantId} subscribed to add-on ${addOnId}`);
  }

  // NEW: Unsubscribe from add-on
  async unsubscribeFromAddOn(tenantId: string, addOnId: string): Promise<void> {
    // In real implementation, this would update the database
    logger.info(`Tenant ${tenantId} unsubscribed from add-on ${addOnId}`);
  }

  async upgradePlan(tenantId: string, newPlanId: string): Promise<Subscription> {
    const newPlan = this.plans.get(newPlanId);
    if (!newPlan) {
      throw new Error(`Unknown plan: ${newPlanId}`);
    }

    // Create Stripe checkout session
    const session = await this.createCheckoutSession(tenantId, newPlan);

    return {
      checkoutUrl: session.url,
      planId: newPlanId,
      price: newPlan.price
    };
  }

  private async createCheckoutSession(tenantId: string, plan: PricingPlan): Promise<any> {
    const tenant = await this.getTenant(tenantId);
    
    // Mock Stripe session creation
    return {
      url: `https://checkout.stripe.com/pay/mock-session?plan=${plan.id}`,
      sessionId: `cs_mock_${Date.now()}`
    };
    
    /* Real implementation would be:
    return await this.stripe.checkout.sessions.create({
      customer: tenant.stripeCustomerId,
      payment_method_types: ['card'],
      mode: plan.price > 0 ? 'subscription' : 'setup',
      line_items: [{
        price: plan.stripePriceId,
        quantity: 1
      }],
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/canceled`,
      metadata: {
        tenantId: tenantId
      }
    });
    */
  }

  private async getActiveSubscription(tenantId: string): Promise<any> {
    // Mock implementation - would query database
    return null; // No active subscription for demo
  }

  async getCurrentUsage(tenantId: string): Promise<Usage> {
    // Mock implementation - would calculate actual usage
    return {
      executionsPerMonth: 450,
      stepRuns: 2250, // Average 5 steps per execution
      projects: 3,
      workflows: 8,
      concurrency: 2,
      apiCalls: 1250
    };
  }

  private async getTenantAddOns(tenantId: string): Promise<AddOnSubscription[]> {
    // Mock implementation - would query database
    return [
      {
        addOnId: 'observability_plus',
        active: true,
        subscribedAt: new Date()
      }
    ];
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

  getAllPlans(): PricingPlan[] {
    return Array.from(this.plans.values());
  }

  getPlan(planId: string): PricingPlan | undefined {
    return this.plans.get(planId);
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
