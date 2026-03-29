import { logger } from '../utils/logger.js';
import { AdaptivePricingService } from './PricingService.js';

export interface ExpansionTrigger {
  id: string;
  type: 'soft_limit' | 'shadow_feature' | 'auto_upgrade' | 'psychological';
  condition: string;
  action: ExpansionAction;
  priority: number;
  active: boolean;
}

export interface ExpansionAction {
  type: 'slowdown' | 'showcase' | 'prompt' | 'auto_execute';
  severity: 'low' | 'medium' | 'high';
  message?: string;
  targetPlan?: string;
  discount?: number;
}

export interface SoftLimitConfig {
  metric: string;
  threshold: number; // Percentage of limit (0-100)
  slowdownFactor: number; // 0.1 = 10% speed, 1.0 = full speed
  message: string;
}

export interface ShadowFeature {
  id: string;
  name: string;
  description: string;
  requiredPlan: string;
  previewMode: 'disabled' | 'limited' | 'demo';
  performanceBoost: number; // Percentage improvement
  visualIndicator: 'grayed_out' | 'preview' | 'tooltip';
}

export interface AutoUpgradeMoment {
  id: string;
  triggerConditions: string[];
  detectionWindow: number; // Hours
  confidenceThreshold: number;
  upgradePath: string;
  messaging: {
    title: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    incentive?: string;
  };
}

export class MagneticExpansionService {
  private triggers: Map<string, ExpansionTrigger> = new Map();
  private softLimits: Map<string, SoftLimitConfig> = new Map();
  private shadowFeatures: Map<string, ShadowFeature> = new Map();
  private autoUpgradeMoments: Map<string, AutoUpgradeMoment> = new Map();

  constructor(private pricingService: AdaptivePricingService) {
    this.initializeExpansionHooks();
  }

  private initializeExpansionHooks() {
    // Soft Limits Configuration
    this.softLimits.set('executions', {
      metric: 'executionsPerMonth',
      threshold: 85, // Start slowing at 85% of limit
      slowdownFactor: 0.7, // 30% slower
      message: "Your workflows are running slower due to high usage. Upgrade for full speed."
    });

    this.softLimits.set('workflows', {
      metric: 'workflowsInProduction',
      threshold: 90,
      slowdownFactor: 0.5,
      message: "Workflow creation is being rate-limited. Consider upgrading for unlimited workflows."
    });

    // Shadow Features Configuration
    this.shadowFeatures.set('priority_execution', {
      id: 'priority_execution',
      name: 'Priority Engine',
      description: 'Run workflows 3x faster with dedicated resources',
      requiredPlan: 'growth',
      previewMode: 'demo',
      performanceBoost: 300,
      visualIndicator: 'tooltip'
    });

    this.shadowFeatures.set('ai_optimization', {
      id: 'ai_optimization',
      name: 'AI Workflow Optimizer',
      description: 'AI automatically optimizes your workflow performance',
      requiredPlan: 'autopilot',
      previewMode: 'limited',
      performanceBoost: 150,
      visualIndicator: 'grayed_out'
    });

    this.shadowFeatures.set('advanced_analytics', {
      id: 'advanced_analytics',
      name: 'Advanced Analytics Dashboard',
      description: 'Deep insights into workflow performance and ROI',
      requiredPlan: 'growth',
      previewMode: 'preview',
      performanceBoost: 0,
      visualIndicator: 'preview'
    });

    // Auto-Upgrade Moments
    this.autoUpgradeMoments.set('rapid_growth', {
      id: 'rapid_growth',
      triggerConditions: [
        'executions_growth_200_percent_7_days',
        'workflows_in_production_gt_10',
        'team_expansion_gt_200_percent'
      ],
      detectionWindow: 168, // 7 days
      confidenceThreshold: 0.8,
      upgradePath: 'builder_to_growth',
      messaging: {
        title: "🚀 You're scaling fast!",
        description: "Your usage has grown 200% this week. Upgrade to Growth Mode to maintain performance and unlock advanced features.",
        urgency: 'high',
        incentive: 'First month at Builder Mode price'
      }
    });

    this.autoUpgradeMoments.set('value_achievement', {
      id: 'value_achievement',
      triggerConditions: [
        'value_generated_gt_5000_monthly',
        'time_saved_gt_100_hours_monthly',
        'automation_rate_gt_80_percent'
      ],
      detectionWindow: 720, // 30 days
      confidenceThreshold: 0.9,
      upgradePath: 'growth_to_autopilot',
      messaging: {
        title: "💰 Maximum value unlocked!",
        description: "You're generating significant value with Torqvio. Switch to Autopilot Mode and only pay for results.",
        urgency: 'medium',
        incentive: 'No subscription fee for 3 months'
      }
    });
  }

  async checkExpansionTriggers(tenantId: string): Promise<ExpansionTrigger[]> {
    const activeTriggers: ExpansionTrigger[] = [];
    const currentPlan = await this.pricingService.getCurrentPlan(tenantId);
    const usage = currentPlan.usage;

    // Check soft limits
    for (const [metric, config] of this.softLimits) {
      const limit = (currentPlan.plan.limits as any)[config.metric];
      const current = (usage as any)[config.metric];

      if (limit !== -1 && current >= (limit * config.threshold / 100)) {
        activeTriggers.push({
          id: `soft_limit_${metric}`,
          type: 'soft_limit',
          condition: `${metric} >= ${config.threshold}%`,
          action: {
            type: 'slowdown',
            severity: config.threshold >= 90 ? 'high' : 'medium',
            message: config.message
          },
          priority: config.threshold >= 90 ? 10 : 7,
          active: true
        });
      }
    }

    // Check shadow feature opportunities
    for (const [featureId, feature] of this.shadowFeatures) {
      if (await this.shouldShowShadowFeature(tenantId, feature)) {
        activeTriggers.push({
          id: `shadow_feature_${featureId}`,
          type: 'shadow_feature',
          condition: `eligible_for_${featureId}`,
          action: {
            type: 'showcase',
            severity: 'low',
            message: `Unlock ${feature.name} for ${feature.performanceBoost}% better performance`
          },
          priority: 5,
          active: true
        });
      }
    }

    // Check auto-upgrade moments
    for (const [momentId, moment] of this.autoUpgradeMoments) {
      if (await this.evaluateAutoUpgradeMoment(tenantId, moment)) {
        activeTriggers.push({
          id: `auto_upgrade_${momentId}`,
          type: 'auto_upgrade',
          condition: moment.triggerConditions.join(' && '),
          action: {
            type: 'prompt',
            severity: moment.messaging.urgency === 'high' ? 'high' : 'medium',
            message: moment.messaging.title,
            targetPlan: moment.upgradePath.split('_to_')[1]
          },
          priority: moment.messaging.urgency === 'high' ? 15 : 12,
          active: true
        });
      }
    }

    // Sort by priority
    return activeTriggers.sort((a, b) => b.priority - a.priority);
  }

  async applySoftLimit(tenantId: string, metric: string): Promise<number> {
    const config = this.softLimits.get(metric);
    if (!config) return 1.0; // No slowdown

    const currentPlan = await this.pricingService.getCurrentPlan(tenantId);
    const usage = currentPlan.usage;
    const limit = (currentPlan.plan.limits as any)[config.metric];
    const current = (usage as any)[config.metric];

    if (limit === -1) return 1.0; // Unlimited

    const usagePercentage = (current / limit) * 100;

    if (usagePercentage >= config.threshold) {
      logger.info(`Applying soft limit for tenant ${tenantId}: ${metric} at ${usagePercentage}% usage`);
      return config.slowdownFactor;
    }

    return 1.0; // Full speed
  }

  async getShadowFeatures(tenantId: string): Promise<ShadowFeature[]> {
    const availableFeatures: ShadowFeature[] = [];
    const currentPlan = await this.pricingService.getCurrentPlan(tenantId);

    for (const feature of this.shadowFeatures.values()) {
      if (feature.requiredPlan !== currentPlan.mode && feature.previewMode !== 'disabled') {
        availableFeatures.push(feature);
      }
    }

    return availableFeatures;
  }

  async getPsychologicalTriggers(tenantId: string): Promise<string[]> {
    const triggers: string[] = [];
    const currentPlan = await this.pricingService.getCurrentPlan(tenantId);
    const usage = currentPlan.usage;

    // Social proof triggers
    triggers.push("Teams like yours upgrade within 9 days");

    // Progress triggers
    const executionsLimit = currentPlan.plan.limits.executionsPerMonth;
    if (executionsLimit !== -1) {
      const usagePercentage = (usage.executionsPerMonth / executionsLimit) * 100;
      if (usagePercentage > 50) {
        triggers.push(`You're ${Math.round(usagePercentage)}% to ${currentPlan.mode === 'builder' ? 'Growth' : 'Autopilot'} efficiency`);
      }
    }

    // Loss aversion triggers
    if (currentPlan.mode === 'builder') {
      const potentialSavings = usage.executionsPerMonth * 0.001 * 30; // Estimated savings
      triggers.push(`You're losing ~$${potentialSavings.toFixed(0)}/month by staying on Builder Mode`);
    }

    // Urgency triggers
    const outcomes = currentPlan.outcomes;
    if (outcomes.timeSaved > 50) {
      triggers.push("Your time savings justify an upgrade - unlock more automation");
    }

    return triggers;
  }

  private async shouldShowShadowFeature(tenantId: string, feature: ShadowFeature): Promise<boolean> {
    const currentPlan = await this.pricingService.getCurrentPlan(tenantId);
    
    // Only show if user doesn't have the feature
    if (currentPlan.mode === feature.requiredPlan) return false;

    // Check if user would benefit from the feature
    const usage = currentPlan.usage;
    
    switch (feature.id) {
      case 'priority_execution':
        return usage.executionsPerMonth > 10000; // Heavy users
      case 'ai_optimization':
        return usage.workflowsInProduction > 5; // Complex workflows
      case 'advanced_analytics':
        return usage.executionsPerMonth > 50000; // Data-heavy users
      default:
        return false;
    }
  }

  private async evaluateAutoUpgradeMoment(tenantId: string, moment: AutoUpgradeMoment): Promise<boolean> {
    // This would integrate with analytics to evaluate trigger conditions
    // For now, return false (no auto-upgrades without explicit consent)
    return false;
  }

  async generateUpgradeRecommendation(tenantId: string): Promise<{
    recommended: boolean;
    targetPlan: string;
    reasoning: string[];
    incentive: string;
    urgency: 'low' | 'medium' | 'high';
  }> {
    const triggers = await this.checkExpansionTriggers(tenantId);
    const currentPlan = await this.pricingService.getCurrentPlan(tenantId);
    
    const highPriorityTriggers = triggers.filter(t => t.priority >= 10);
    
    if (highPriorityTriggers.length === 0) {
      return {
        recommended: false,
        targetPlan: currentPlan.mode,
        reasoning: [],
        incentive: '',
        urgency: 'low'
      };
    }

    const topTrigger = highPriorityTriggers[0];
    let targetPlan = currentPlan.mode;
    
    if (currentPlan.mode === 'builder') {
      targetPlan = 'growth';
    } else if (currentPlan.mode === 'growth') {
      targetPlan = 'autopilot';
    }

    return {
      recommended: true,
      targetPlan,
      reasoning: [
        topTrigger.action.message || 'Upgrade recommended based on usage patterns',
        ...await this.getPsychologicalTriggers(tenantId)
      ],
      incentive: 'Limited time: First month at current plan price',
      urgency: topTrigger.action.severity as 'low' | 'medium' | 'high'
    };
  }
}
