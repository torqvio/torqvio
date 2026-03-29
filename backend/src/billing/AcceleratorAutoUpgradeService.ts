import { logger } from '../utils/logger.js';
import { AcceleratorValueTrackingService, OutcomeMetrics } from './AcceleratorValueTrackingService.js';
import { AcceleratorSoftLimitsService, SoftLimitNotification } from './AcceleratorSoftLimitsService.js';
import { AcceleratorShadowFeaturesService, ShadowFeatureInteraction } from './AcceleratorShadowFeaturesService.js';

export interface BehavioralTrigger {
  id: string;
  name: string;
  condition: string; // JavaScript condition to evaluate
  action: 'suggest_upgrade' | 'show_urgency' | 'create_fear' | 'show_opportunity' | 'social_proof';
  targetPlan: 'growth' | 'autopilot';
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'usage' | 'value' | 'behavior' | 'time' | 'social';
  cooldownPeriod: number; // Hours before trigger can fire again
  conversionWeight: number; // How strongly this predicts conversion
}

export interface UpgradePrompt {
  id: string;
  tenantId: string;
  triggerId: string;
  plan: 'growth' | 'autopilot';
  title: string;
  message: string;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  psychologicalAngle: 'loss_aversion' | 'social_proof' | 'opportunity_cost' | 'status_gain' | 'efficiency_gain';
  benefits: string[];
  socialProof?: string;
  urgencyMessage?: string;
  personalizedElements: PersonalizedElement[];
  timestamp: Date;
  status: 'pending' | 'shown' | 'dismissed' | 'clicked' | 'converted';
  conversionProbability: number;
}

export interface PersonalizedElement {
  type: 'metric' | 'comparison' | 'milestone' | 'time_sensitive' | 'team_impact';
  content: string;
  data: any;
  emotionalWeight: number; // 0-1 emotional impact
}

export interface UserBehaviorProfile {
  tenantId: string;
  usagePatterns: {
    growthRate: number; // Month over month usage growth
    consistency: number; // How consistent their usage is
    peakTimes: string[]; // When they're most active
    featurePreferences: Record<string, number>; // Feature usage frequency
  };
  valueSignals: {
    totalValueGenerated: number;
    valueGrowthRate: number;
    roiAchieved: number;
    timeToValue: number; // Days to first significant value
  };
  psychologicalProfile: {
    riskTolerance: 'low' | 'medium' | 'high';
    decisionSpeed: 'slow' | 'medium' | 'fast';
    socialInfluence: 'low' | 'medium' | 'high';
    priceSensitivity: 'high' | 'medium' | 'low';
    emotionalState: 'exploring' | 'frustrated' | 'ambitious' | 'satisfied' | 'time_pressed';
  };
  conversionSignals: {
    upgradeIntent: number; // 0-1 probability of wanting to upgrade
    priceReadiness: number; // 0-1 readiness to pay more
    timingReadiness: number; // 0-1 readiness to upgrade now
    planPreference: 'growth' | 'autopilot' | 'unsure';
  };
}

export interface TriggerEvaluationContext {
  tenantId: string;
  currentPlan: string;
  usage: any;
  outcomes: OutcomeMetrics;
  behaviorProfile: UserBehaviorProfile;
  notifications: SoftLimitNotification[];
  featureInteractions: ShadowFeatureInteraction[];
  timeSinceSignup: number; // Days
  timeSinceLastUpgrade: number; // Days
  currentMonth: number;
  seasonality: string; // 'growth' | 'stable' | 'decline'
}

export class AcceleratorAutoUpgradeService {
  private behavioralTriggers: Map<string, BehavioralTrigger> = new Map();
  private upgradePrompts: Map<string, UpgradePrompt[]> = new Map();
  private userProfiles: Map<string, UserBehaviorProfile> = new Map();
  private triggerHistory: Map<string, Record<string, string>> = new Map(); // Track fired triggers
  
  constructor(
    private valueTrackingService: AcceleratorValueTrackingService,
    private softLimitsService: AcceleratorSoftLimitsService,
    private shadowFeaturesService: AcceleratorShadowFeaturesService
  ) {
    this.initializeBehavioralTriggers();
  }

  private initializeBehavioralTriggers() {
    // Usage-based triggers
    this.behavioralTriggers.set('workflow_growth', {
      id: 'workflow_growth',
      name: 'Rapid Workflow Creation',
      condition: 'workflow_growth_rate > 0.5 && workflow_count >= 4',
      action: 'show_opportunity',
      targetPlan: 'growth',
      message: 'You\'re creating workflows 50% faster than most users! Growth Mode will help you scale without limits.',
      priority: 'medium',
      category: 'usage',
      cooldownPeriod: 72, // 3 days
      conversionWeight: 0.7
    });

    this.behavioralTriggers.set('execution_volume', {
      id: 'execution_volume',
      name: 'High Execution Volume',
      condition: 'executions_per_month >= 800 && execution_growth_rate > 0.3',
      action: 'suggest_upgrade',
      targetPlan: 'growth',
      message: 'Your workflows are running at scale! Growth Mode offers better rates for your volume.',
      priority: 'high',
      category: 'usage',
      cooldownPeriod: 48, // 2 days
      conversionWeight: 0.8
    });

    this.behavioralTriggers.set('team_expansion', {
      id: 'team_expansion',
      name: 'Team Member Growth',
      condition: 'team_members >= 3 && team_growth_rate > 0',
      action: 'show_opportunity',
      targetPlan: 'growth',
      message: 'Your team is growing! Growth Mode includes unlimited team members and collaboration tools.',
      priority: 'medium',
      category: 'usage',
      cooldownPeriod: 96, // 4 days
      conversionWeight: 0.6
    });

    // Value-based triggers
    this.behavioralTriggers.set('value_achievement', {
      id: 'value_achievement',
      name: 'Significant Value Generated',
      condition: 'value_generated >= 5000 && roi_achieved >= 2.0',
      action: 'social_proof',
      targetPlan: 'growth',
      message: 'You\'ve generated over $5,000 in value! Teams at your level typically upgrade to Growth Mode.',
      priority: 'medium',
      category: 'value',
      cooldownPeriod: 120, // 5 days
      conversionWeight: 0.75
    });

    this.behavioralTriggers.set('time_savings', {
      id: 'time_savings',
      name: 'Significant Time Savings',
      condition: 'time_saved >= 40 && time_savings_growth_rate > 0.2',
      action: 'show_opportunity',
      targetPlan: 'growth',
      message: 'You\'ve saved 40+ hours this month! Growth Mode will help you save even more with advanced automation.',
      priority: 'medium',
      category: 'value',
      cooldownPeriod: 72, // 3 days
      conversionWeight: 0.65
    });

    // Behavioral triggers
    this.behavioralTriggers.set('feature_exploration', {
      id: 'feature_exploration',
      name: 'Advanced Feature Exploration',
      condition: 'premium_feature_views >= 5 && premium_feature_attempts >= 2',
      action: 'suggest_upgrade',
      targetPlan: 'growth',
      message: 'You\'re exploring advanced features! Unlock full access with Growth Mode.',
      priority: 'medium',
      category: 'behavior',
      cooldownPeriod: 48, // 2 days
      conversionWeight: 0.8
    });

    this.behavioralTriggers.set('support_seeking', {
      id: 'support_seeking',
      name: 'Support Limitation Encountered',
      condition: 'support_interactions >= 3 && frustration_signals >= 2',
      action: 'create_fear',
      targetPlan: 'growth',
      message: 'Don\'t let support limitations slow your progress. Growth Mode includes priority support.',
      priority: 'high',
      category: 'behavior',
      cooldownPeriod: 24, // 1 day
      conversionWeight: 0.9
    });

    // Time-based triggers
    this.behavioralTriggers.set('milestone_timing', {
      id: 'milestone_timing',
      name: '30-Day Milestone',
      condition: 'days_since_signup >= 30 && days_since_signup <= 35 && usage_consistency > 0.7',
      action: 'show_opportunity',
      targetPlan: 'growth',
      message: 'You\'ve been using Torqvio for a month! Here\'s a special offer for loyal users: 20% off Growth Mode.',
      priority: 'medium',
      category: 'time',
      cooldownPeriod: 168, // 7 days
      conversionWeight: 0.6
    });

    this.behavioralTriggers.set('seasonal_opportunity', {
      id: 'seasonal_opportunity',
      name: 'Growth Season Opportunity',
      condition: 'seasonality == "growth" && usage_growth_rate > 0.2',
      action: 'show_opportunity',
      targetPlan: 'growth',
      message: 'It\'s growth season! Teams like yours scale 3x faster with Growth Mode automation.',
      priority: 'low',
      category: 'time',
      cooldownPeriod: 168, // 7 days
      conversionWeight: 0.5
    });

    // Social proof triggers
    this.behavioralTriggers.set('peer_comparison', {
      id: 'peer_comparison',
      name: 'Peer Success Comparison',
      condition: 'peer_upgrade_rate > 0.6 && user_value_percentile < 70',
      action: 'social_proof',
      targetPlan: 'growth',
      message: '60% of teams similar to yours have upgraded to Growth Mode and are seeing 3x better results.',
      priority: 'medium',
      category: 'social',
      cooldownPeriod: 120, // 5 days
      conversionWeight: 0.7
    });

    // High-intent triggers for Autopilot
    this.behavioralTriggers.set('enterprise_signals', {
      id: 'enterprise_signals',
      name: 'Enterprise Readiness Signals',
      condition: 'value_generated >= 25000 && team_members >= 5 && integrations >= 10',
      action: 'show_opportunity',
      targetPlan: 'autopilot',
      message: 'You\'re ready for enterprise-scale automation. Autopilot Mode handles everything while you focus on growth.',
      priority: 'high',
      category: 'value',
      cooldownPeriod: 168, // 7 days
      conversionWeight: 0.85
    });

    this.behavioralTriggers.set('revenue_share_optimization', {
      id: 'revenue_share_optimization',
      name: 'Revenue Share Optimization',
      condition: 'roi_achieved >= 5.0 && revenue_influenced >= 10000',
      action: 'show_opportunity',
      targetPlan: 'autopilot',
      message: 'Your 5x ROI proves automation works. Switch to Autopilot and only pay 3% of the value you generate.',
      priority: 'medium',
      category: 'value',
      cooldownPeriod: 120, // 5 days
      conversionWeight: 0.8
    });

    logger.info('Initialized behavioral triggers for auto-upgrade system');
  }

  async evaluateTriggers(tenantId: string, context: TriggerEvaluationContext): Promise<UpgradePrompt[]> {
    const prompts: UpgradePrompt[] = [];
    const firedTriggers = this.triggerHistory.get(tenantId) || [];

    for (const trigger of this.behavioralTriggers.values()) {
      // Check cooldown period
      if (this.isTriggerInCooldown(trigger.id, tenantId)) {
        continue;
      }

      // Evaluate trigger condition
      if (await this.evaluateTriggerCondition(trigger, context)) {
        const prompt = await this.createUpgradePrompt(trigger, context);
        
        if (prompt && prompt.conversionProbability > 0.3) { // Only show high-probability prompts
          prompts.push(prompt);
          this.recordTriggerFired(trigger.id, tenantId);
        }
      }
    }

    // Sort by conversion probability and priority
    prompts.sort((a, b) => {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityWeight[a.urgencyLevel] || 1;
      const bPriority = priorityWeight[b.urgencyLevel] || 1;
      
      return (b.conversionProbability * bPriority) - (a.conversionProbability * aPriority);
    });

    // Store prompts
    if (!this.upgradePrompts.has(tenantId)) {
      this.upgradePrompts.set(tenantId, []);
    }
    this.upgradePrompts.get(tenantId)!.push(...prompts);

    return prompts.slice(0, 3); // Return top 3 prompts max
  }

  private async evaluateTriggerCondition(trigger: BehavioralTrigger, context: TriggerEvaluationContext): Promise<boolean> {
    try {
      const evaluationContext = this.buildEvaluationContext(context);
      
      // Replace variables in condition
      let evalCondition = trigger.condition;
      for (const [key, value] of Object.entries(evaluationContext)) {
        evalCondition = evalCondition.replace(new RegExp(key, 'g'), value.toString());
      }

      return eval(evalCondition);
    } catch (error) {
      logger.error(`Failed to evaluate trigger condition for ${trigger.id}:`, error);
      return false;
    }
  }

  private buildEvaluationContext(context: TriggerEvaluationContext): Record<string, any> {
    return {
      // Usage metrics
      workflow_count: context.usage.workflowsInProduction || 0,
      executions_per_month: context.usage.executionsPerMonth || 0,
      team_members: context.usage.teamMembers || 0,
      integrations: context.usage.activeIntegrations || 0,
      
      // Growth rates
      workflow_growth_rate: context.behaviorProfile.usagePatterns.growthRate,
      execution_growth_rate: context.behaviorProfile.usagePatterns.growthRate,
      team_growth_rate: context.behaviorProfile.usagePatterns.growthRate,
      time_savings_growth_rate: context.behaviorProfile.valueSignals.valueGrowthRate,
      
      // Value metrics
      value_generated: context.outcomes.valueGenerated,
      time_saved: context.outcomes.timeSaved,
      roi_achieved: context.behaviorProfile.valueSignals.roiAchieved,
      revenue_influenced: context.outcomes.revenueInfluenced,
      
      // Behavioral metrics
      premium_feature_views: context.featureInteractions.filter(i => i.interactionType === 'view').length,
      premium_feature_attempts: context.featureInteractions.filter(i => i.interactionType === 'attempt_use').length,
      support_interactions: context.notifications.filter(n => n.metric.includes('support')).length,
      frustration_signals: context.behaviorProfile.psychologicalProfile.emotionalState === 'frustrated' ? 3 : 0,
      
      // Time metrics
      days_since_signup: context.timeSinceSignup,
      days_since_last_upgrade: context.timeSinceLastUpgrade,
      usage_consistency: context.behaviorProfile.usagePatterns.consistency,
      
      // Social metrics
      peer_upgrade_rate: 0.6, // Mock data - would come from actual peer analysis
      user_value_percentile: this.calculateValuePercentile(context.outcomes.valueGenerated),
      
      // Seasonality
      seasonality: context.seasonality
    };
  }

  private calculateValuePercentile(userValue: number): number {
    // Mock calculation - would use actual distribution
    const valueDistribution = [1000, 2500, 5000, 10000, 25000, 50000];
    for (let i = 0; i < valueDistribution.length; i++) {
      if (userValue <= valueDistribution[i]) {
        return (i / valueDistribution.length) * 100;
      }
    }
    return 95;
  }

  private async createUpgradePrompt(trigger: BehavioralTrigger, context: TriggerEvaluationContext): Promise<UpgradePrompt | null> {
    const personalizedElements = await this.createPersonalizedElements(trigger, context);
    const psychologicalAngle = this.selectPsychologicalAngle(trigger, context);
    const benefits = this.getPlanBenefits(trigger.targetPlan);
    const socialProof = this.generateSocialProof(trigger, context);
    const urgencyMessage = this.generateUrgencyMessage(trigger, context);
    
    const conversionProbability = this.calculateConversionProbability(trigger, context);

    return {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId: context.tenantId,
      triggerId: trigger.id,
      plan: trigger.targetPlan,
      title: this.generatePromptTitle(trigger, context),
      message: trigger.message,
      urgencyLevel: trigger.priority,
      psychologicalAngle,
      benefits,
      socialProof,
      urgencyMessage,
      personalizedElements,
      timestamp: new Date(),
      status: 'pending',
      conversionProbability
    };
  }

  private async createPersonalizedElements(trigger: BehavioralTrigger, context: TriggerEvaluationContext): Promise<PersonalizedElement[]> {
    const elements: PersonalizedElement[] = [];

    // Metric-based personalization
    if (context.outcomes.valueGenerated > 0) {
      elements.push({
        type: 'metric',
        content: `You've generated $${context.outcomes.valueGenerated.toLocaleString()} in value`,
        data: { value: context.outcomes.valueGenerated },
        emotionalWeight: 0.7
      });
    }

    if (context.outcomes.timeSaved > 0) {
      elements.push({
        type: 'metric',
        content: `You've saved ${context.outcomes.timeSaved} hours this month`,
        data: { timeSaved: context.outcomes.timeSaved },
        emotionalWeight: 0.6
      });
    }

    // Comparison personalization
    const peerComparison = this.generatePeerComparison(context);
    if (peerComparison) {
      elements.push({
        type: 'comparison',
        content: peerComparison,
        data: { percentile: this.calculateValuePercentile(context.outcomes.valueGenerated) },
        emotionalWeight: 0.8
      });
    }

    // Milestone personalization
    if (context.timeSinceSignup >= 30) {
      elements.push({
        type: 'milestone',
        content: `You've been using Torqvio for ${context.timeSinceSignup} days!`,
        data: { days: context.timeSinceSignup },
        emotionalWeight: 0.5
      });
    }

    // Time-sensitive personalization
    if (context.usage.executionsPerMonth > 800) {
      elements.push({
        type: 'time_sensitive',
        content: `At your current volume, you'll save $${Math.round(context.usage.executionsPerMonth * 0.002)}/month with Growth Mode`,
        data: { savings: context.usage.executionsPerMonth * 0.002 },
        emotionalWeight: 0.7
      });
    }

    // Team impact personalization
    if (context.usage.teamMembers > 1) {
      elements.push({
        type: 'team_impact',
        content: `Your ${context.usage.teamMembers} team members could collaborate 3x more effectively`,
        data: { teamSize: context.usage.teamMembers },
        emotionalWeight: 0.6
      });
    }

    return elements;
  }

  private selectPsychologicalAngle(trigger: BehavioralTrigger, context: TriggerEvaluationContext): UpgradePrompt['psychologicalAngle'] {
    const profile = context.behaviorProfile.psychologicalProfile;

    // Select angle based on user profile and trigger type
    if (trigger.action === 'create_fear' || profile.emotionalState === 'frustrated') {
      return 'loss_aversion';
    }
    
    if (trigger.action === 'social_proof' || profile.socialInfluence === 'high') {
      return 'social_proof';
    }
    
    if (trigger.category === 'value' && profile.priceSensitivity === 'low') {
      return 'opportunity_cost';
    }
    
    if (trigger.category === 'usage' && profile.riskTolerance === 'high') {
      return 'status_gain';
    }
    
    return 'efficiency_gain';
  }

  private generatePromptTitle(trigger: BehavioralTrigger, context: TriggerEvaluationContext): string {
    const planNames = {
      growth: 'Growth Mode',
      autopilot: 'Autopilot Mode'
    };

    const titles = {
      suggest_upgrade: `Upgrade to ${planNames[trigger.targetPlan]}`,
      show_urgency: `Time to Upgrade to ${planNames[trigger.targetPlan]}`,
      create_fear: `Don't Get Left Behind`,
      show_opportunity: `Unlock Your Full Potential`,
      social_proof: `Join Successful Teams`
    };

    return titles[trigger.action] || `Upgrade to ${planNames[trigger.targetPlan]}`;
  }

  private getPlanBenefits(plan: 'growth' | 'autopilot'): string[] {
    const benefits = {
      growth: [
        'Unlimited production workflows',
        'Auto-scaling pricing based on success',
        'Advanced AI agents and optimization',
        'Priority email support',
        '30-day logs retention',
        'Team collaboration tools'
      ],
      autopilot: [
        'Zero upfront cost',
        'Only 3% of value generated',
        'All features included',
        'Dedicated support',
        'Custom integrations',
        'White-label options'
      ]
    };

    return benefits[plan];
  }

  private generateSocialProof(trigger: BehavioralTrigger, context: TriggerEvaluationContext): string | undefined {
    const socialProofMessages = {
      workflow_growth: 'Teams creating workflows as fast as yours typically see 3x ROI after upgrading.',
      execution_volume: '87% of teams with your execution volume upgrade within 30 days.',
      team_expansion: 'Growing teams like yours report 5x better collaboration after upgrading.',
      value_achievement: 'Users generating $5K+ in value have 70% higher satisfaction with Growth Mode.',
      time_savings: 'Teams saving 40+ hours per month typically expand their automation 2x further.',
      feature_exploration: 'Users exploring premium features upgrade 3x more often than average.',
      support_seeking: 'Priority support users report 90% faster problem resolution.',
      enterprise_signals: 'Enterprise teams like yours choose Autopilot for maximum scalability.'
    };

    return socialProofMessages[trigger.id as keyof typeof socialProofMessages];
  }

  private generateUrgencyMessage(trigger: BehavioralTrigger, context: TriggerEvaluationContext): string | undefined {
    if (trigger.priority === 'critical') {
      return 'Act now to avoid disruption to your workflows.';
    }
    
    if (trigger.priority === 'high') {
      return 'Limited time offer for users at your level.';
    }
    
    if (trigger.category === 'time' && context.timeSinceSignup >= 30) {
      return 'Special milestone offer expires in 7 days.';
    }
    
    return undefined;
  }

  private calculateConversionProbability(trigger: BehavioralTrigger, context: TriggerEvaluationContext): number {
    let probability = trigger.conversionWeight;

    // Adjust based on user profile
    const profile = context.behaviorProfile;
    
    // Price sensitivity adjustment
    if (profile.psychologicalProfile.priceSensitivity === 'high') {
      probability *= 0.7;
    } else if (profile.psychologicalProfile.priceSensitivity === 'low') {
      probability *= 1.2;
    }

    // Decision speed adjustment
    if (profile.psychologicalProfile.decisionSpeed === 'fast') {
      probability *= 1.1;
    } else if (profile.psychologicalProfile.decisionSpeed === 'slow') {
      probability *= 0.9;
    }

    // Social influence adjustment
    if (profile.psychologicalProfile.socialInfluence === 'high') {
      probability *= 1.15;
    }

    // Existing intent adjustment
    probability += profile.conversionSignals.upgradeIntent * 0.3;

    // Cap at 0.95
    return Math.min(0.95, probability);
  }

  private generatePeerComparison(context: TriggerEvaluationContext): string | null {
    const percentile = this.calculateValuePercentile(context.outcomes.valueGenerated);
    
    if (percentile >= 80) {
      return `You're in the top 20% of users by value generated!`;
    } else if (percentile >= 60) {
      return `You're performing better than 60% of similar teams.`;
    } else if (percentile >= 40) {
      return `Teams at your level typically upgrade to Growth Mode.`;
    } else {
      return `Most teams like yours see 3x improvement after upgrading.`;
    }
  }

  private isTriggerInCooldown(triggerId: string, tenantId: string): boolean {
    const firedTriggers = this.triggerHistory.get(tenantId) || {};
    const trigger = this.behavioralTriggers.get(triggerId);
    
    if (!trigger) return true;

    // Check if trigger was fired within cooldown period
    const lastFired = firedTriggers[triggerId];
    if (!lastFired) return false;

    const cooldownMs = trigger.cooldownPeriod * 60 * 60 * 1000; // Convert hours to ms
    return (Date.now() - new Date(lastFired).getTime()) < cooldownMs;
  }

  private recordTriggerFired(triggerId: string, tenantId: string): void {
    if (!this.triggerHistory.has(tenantId)) {
      this.triggerHistory.set(tenantId, {});
    }
    
    const history = this.triggerHistory.get(tenantId)!;
    history[triggerId] = new Date().toISOString();
    
    logger.info(`Trigger ${triggerId} fired for tenant ${tenantId}`);
  }

  async updateUserBehaviorProfile(tenantId: string, profile: Partial<UserBehaviorProfile>): Promise<void> {
    const existing = this.userProfiles.get(tenantId) || await this.createDefaultProfile(tenantId);
    const updated = { ...existing, ...profile };
    
    this.userProfiles.set(tenantId, updated);
    
    logger.info(`Updated behavior profile for tenant ${tenantId}`);
  }

  private async createDefaultProfile(tenantId: string): Promise<UserBehaviorProfile> {
    return {
      tenantId,
      usagePatterns: {
        growthRate: 0.1,
        consistency: 0.7,
        peakTimes: ['9-11', '14-16'],
        featurePreferences: {}
      },
      valueSignals: {
        totalValueGenerated: 0,
        valueGrowthRate: 0.1,
        roiAchieved: 1.0,
        timeToValue: 14
      },
      psychologicalProfile: {
        riskTolerance: 'medium',
        decisionSpeed: 'medium',
        socialInfluence: 'medium',
        priceSensitivity: 'medium',
        emotionalState: 'exploring'
      },
      conversionSignals: {
        upgradeIntent: 0.3,
        priceReadiness: 0.3,
        timingReadiness: 0.3,
        planPreference: 'unsure'
      }
    };
  }

  async getUpgradePrompts(tenantId: string, status?: UpgradePrompt['status']): Promise<UpgradePrompt[]> {
    const prompts = this.upgradePrompts.get(tenantId) || [];
    
    return status 
      ? prompts.filter(p => p.status === status)
      : prompts;
  }

  async updatePromptStatus(tenantId: string, promptId: string, status: UpgradePrompt['status']): Promise<void> {
    const prompts = this.upgradePrompts.get(tenantId) || [];
    const prompt = prompts.find(p => p.id === promptId);
    
    if (prompt) {
      prompt.status = status;
      
      // Track conversion for learning
      if (status === 'converted') {
        await this.trackConversion(tenantId, prompt);
      }
      
      logger.info(`Updated prompt ${promptId} status to ${status} for tenant ${tenantId}`);
    }
  }

  private async trackConversion(tenantId: string, prompt: UpgradePrompt): Promise<void> {
    const trigger = this.behavioralTriggers.get(prompt.triggerId);
    if (trigger) {
      // Update trigger conversion weight based on actual conversion
      const currentWeight = trigger.conversionWeight;
      const newWeight = Math.min(0.95, currentWeight * 1.1); // Increase weight slightly
      trigger.conversionWeight = newWeight;
      
      logger.info(`Updated trigger ${trigger.id} conversion weight to ${newWeight} based on conversion`);
    }
  }

  async getBehavioralInsights(tenantId: string): Promise<{
    topTriggers: BehavioralTrigger[];
    conversionProbability: number;
    recommendedActions: string[];
    psychologicalProfile: UserBehaviorProfile['psychologicalProfile'];
    nextBestAction: string;
  }> {
    const profile = this.userProfiles.get(tenantId);
    if (!profile) {
      throw new Error(`No behavior profile found for tenant ${tenantId}`);
    }

    // Get most effective triggers for this user
    const effectiveTriggers = Array.from(this.behavioralTriggers.values())
      .filter(trigger => trigger.conversionWeight > 0.5)
      .sort((a, b) => b.conversionWeight - a.conversionWeight)
      .slice(0, 5);

    const conversionProbability = profile.conversionSignals.upgradeIntent;
    const recommendedActions = this.generateRecommendedActions(profile);
    const nextBestAction = this.selectNextBestAction(profile, effectiveTriggers);

    return {
      topTriggers: effectiveTriggers,
      conversionProbability,
      recommendedActions,
      psychologicalProfile: profile.psychologicalProfile,
      nextBestAction
    };
  }

  private generateRecommendedActions(profile: UserBehaviorProfile): string[] {
    const actions: string[] = [];

    if (profile.conversionSignals.upgradeIntent > 0.7) {
      actions.push('Show urgent upgrade prompt with limited-time offer');
    }

    if (profile.psychologicalProfile.emotionalState === 'frustrated') {
      actions.push('Emphasize priority support in Growth Mode');
    }

    if (profile.valueSignals.roiAchieved > 3.0) {
      actions.push('Highlight ROI achievements and suggest expansion');
    }

    if (profile.usagePatterns.growthRate > 0.5) {
      actions.push('Focus on scalability benefits of Growth Mode');
    }

    if (profile.psychologicalProfile.socialInfluence === 'high') {
      actions.push('Include social proof and peer success stories');
    }

    return actions;
  }

  private selectNextBestAction(profile: UserBehaviorProfile, triggers: BehavioralTrigger[]): string {
    if (profile.conversionSignals.timingReadiness > 0.8) {
      return 'Present immediate upgrade opportunity with urgency';
    }

    if (profile.conversionSignals.upgradeIntent > 0.6) {
      return 'Show detailed comparison of benefits vs current plan';
    }

    if (profile.psychologicalProfile.emotionalState === 'exploring') {
      return 'Provide educational content about advanced features';
    }

    if (profile.valueSignals.roiAchieved > 2.0) {
      return 'Demonstrate how much more value they could generate';
    }

    return 'Continue building value and engagement before prompting';
  }
}
