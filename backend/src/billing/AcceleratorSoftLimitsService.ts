import { logger } from '../utils/logger.js';
import { AcceleratorValueTrackingService, OutcomeMetrics } from './AcceleratorValueTrackingService.js';

export interface SoftLimitConfig {
  metric: string;
  currentUsage: number;
  displayLimit: number; // What we show the user (psychological limit)
  actualLimit: number; // Real limit (higher than display)
  percentageUsed: number;
  warningThresholds: number[]; // Percentage thresholds for warnings
  upgradeTriggers: UpgradeTrigger[];
  psychologicalMessaging: PsychologicalMessage[];
}

export interface UpgradeTrigger {
  condition: string; // JavaScript condition to evaluate
  action: 'suggest_upgrade' | 'show_urgency' | 'create_fear' | 'show_opportunity';
  targetPlan: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface PsychologicalMessage {
  type: 'progress' | 'scarcity' | 'social_proof' | 'authority' | 'loss_aversion' | 'urgency' | 'opportunity';
  message: string;
  triggerPercentage: number;
  emotion: 'positive' | 'neutral' | 'negative';
  actionRequired: boolean;
}

export interface SoftLimitNotification {
  id: string;
  tenantId: string;
  type: 'warning' | 'urgency' | 'opportunity' | 'limit_reached';
  title: string;
  message: string;
  percentageUsed: number;
  metric: string;
  currentUsage: number;
  displayLimit: number;
  upgradeSuggestion?: {
    plan: string;
    benefits: string[];
    cta: string;
    urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  };
  timestamp: Date;
  read: boolean;
  actionTaken: boolean;
}

export class AcceleratorSoftLimitsService {
  private notifications: Map<string, SoftLimitNotification[]> = new Map();
  private userBehaviorData: Map<string, any> = new Map();
  
  constructor(
    private valueTrackingService: AcceleratorValueTrackingService
  ) {
    this.initializePsychologicalProfiles();
  }

  private initializePsychologicalProfiles() {
    // Initialize user behavior tracking for psychological optimization
    logger.info('Initialized psychological profiling for soft limits');
  }

  async calculateSoftLimits(tenantId: string, currentPlan: any, usage: any): Promise<SoftLimitConfig[]> {
    const softLimits: SoftLimitConfig[] = [];
    
    // Workflow limits with psychological manipulation
    if (currentPlan.limits.workflowsInProduction > 0) {
      const workflowLimit = this.createWorkflowSoftLimit(tenantId, currentPlan, usage);
      softLimits.push(workflowLimit);
    }

    // Execution limits with progress psychology
    if (currentPlan.limits.executionsPerMonth > 0) {
      const executionLimit = this.createExecutionSoftLimit(tenantId, currentPlan, usage);
      softLimits.push(executionLimit);
    }

    // Team member limits with social proof
    if (currentPlan.limits.teamMembers > 0) {
      const teamLimit = this.createTeamSoftLimit(tenantId, currentPlan, usage);
      softLimits.push(teamLimit);
    }

    // Integration limits with opportunity framing
    if (currentPlan.limits.integrations > 0) {
      const integrationLimit = this.createIntegrationSoftLimit(tenantId, currentPlan, usage);
      softLimits.push(integrationLimit);
    }

    return softLimits;
  }

  private createWorkflowSoftLimit(tenantId: string, currentPlan: any, usage: any): SoftLimitConfig {
    const actualLimit = currentPlan.limits.workflowsInProduction;
    const currentUsage = usage.workflowsInProduction || 0;
    
    // Psychological display limit (show 80% of actual limit)
    const displayLimit = Math.floor(actualLimit * 0.8);
    const percentageUsed = (currentUsage / displayLimit) * 100;

    return {
      metric: 'workflowsInProduction',
      currentUsage,
      displayLimit,
      actualLimit,
      percentageUsed,
      warningThresholds: [60, 75, 85, 95],
      upgradeTriggers: [
        {
          condition: `workflow_count >= ${Math.floor(displayLimit * 0.8)}`,
          action: 'suggest_upgrade',
          targetPlan: 'growth',
          message: 'Your team is creating lots of workflows! Upgrade to Growth Mode for unlimited production workflows.',
          priority: 'medium'
        },
        {
          condition: `workflow_count >= ${Math.floor(displayLimit * 0.95)}`,
          action: 'show_urgency',
          targetPlan: 'growth',
          message: 'You\'re about to hit your workflow limit! Don\'t let your automation progress stop now.',
          priority: 'high'
        }
      ],
      psychologicalMessaging: [
        {
          type: 'progress',
          message: `You\'ve built ${currentUsage} amazing workflows! You\'re ${Math.round(percentageUsed)}% of the way to becoming an automation expert.`,
          triggerPercentage: 50,
          emotion: 'positive',
          actionRequired: false
        },
        {
          type: 'scarcity',
          message: `Only ${displayLimit - currentUsage} workflow slots left in your current plan. Teams like yours upgrade to Growth Mode to continue scaling.`,
          triggerPercentage: 80,
          emotion: 'neutral',
          actionRequired: true
        },
        {
          type: 'loss_aversion',
          message: `Don't lose momentum! ${currentUsage} workflows are already saving you time. Upgrade to keep building without limits.`,
          triggerPercentage: 90,
          emotion: 'negative',
          actionRequired: true
        }
      ]
    };
  }

  private createExecutionSoftLimit(tenantId: string, currentPlan: any, usage: any): SoftLimitConfig {
    const actualLimit = currentPlan.limits.executionsPerMonth;
    const currentUsage = usage.executionsPerMonth || 0;
    
    // Show higher limit for executions (more forgiving)
    const displayLimit = Math.floor(actualLimit * 0.9);
    const percentageUsed = (currentUsage / displayLimit) * 100;

    // Get value metrics for psychological messaging
    const valueMetrics = this.getUserBehaviorData(tenantId);

    return {
      metric: 'executionsPerMonth',
      currentUsage,
      displayLimit,
      actualLimit,
      percentageUsed,
      warningThresholds: [70, 80, 90, 98],
      upgradeTriggers: [
        {
          condition: `execution_rate >= ${Math.floor(displayLimit * 0.7)}`,
          action: 'show_opportunity',
          targetPlan: 'growth',
          message: `Your workflows are running ${Math.round(percentageUsed)}% more than last month! Growth Mode offers better rates for your success.`,
          priority: 'medium'
        },
        {
          condition: `execution_rate >= ${Math.floor(displayLimit * 0.95)}`,
          action: 'create_fear',
          targetPlan: 'growth',
          message: 'High-performing teams like yours need reliable execution. Don\'t let limits slow down your success.',
          priority: 'high'
        }
      ],
      psychologicalMessaging: [
        {
          type: 'social_proof',
          message: `Teams running ${currentUsage} executions per month typically upgrade to Growth Mode within 30 days.`,
          triggerPercentage: 60,
          emotion: 'neutral',
          actionRequired: false
        },
        {
          type: 'authority',
          message: `Your ${currentUsage} executions show you\'re ready for professional automation. Growth Mode is designed for teams at your scale.`,
          triggerPercentage: 75,
          emotion: 'positive',
          actionRequired: true
        },
        {
          type: 'urgency',
          message: `${displayLimit - currentUsage} executions remaining this month. Upgrade now to ensure uninterrupted automation.`,
          triggerPercentage: 95,
          emotion: 'negative',
          actionRequired: true
        }
      ]
    };
  }

  private createTeamSoftLimit(tenantId: string, currentPlan: any, usage: any): SoftLimitConfig {
    const actualLimit = currentPlan.limits.teamMembers;
    const currentUsage = usage.teamMembers || 0;
    
    // Team limits are more sensitive - show closer to actual limit
    const displayLimit = Math.floor(actualLimit * 0.85);
    const percentageUsed = (currentUsage / displayLimit) * 100;

    return {
      metric: 'teamMembers',
      currentUsage,
      displayLimit,
      actualLimit,
      percentageUsed,
      warningThresholds: [50, 70, 85, 95],
      upgradeTriggers: [
        {
          condition: `team_members >= ${Math.floor(displayLimit * 0.7)}`,
          action: 'suggest_upgrade',
          targetPlan: 'growth',
          message: 'Your team is growing! Growth Mode includes team collaboration and unlimited members.',
          priority: 'medium'
        },
        {
          condition: `team_members >= ${Math.floor(displayLimit * 0.9)}`,
          action: 'show_urgency',
          targetPlan: 'growth',
          message: 'New team members want access to your automation workflows. Upgrade to collaborate effectively.',
          priority: 'high'
        }
      ],
      psychologicalMessaging: [
        {
          type: 'progress',
          message: `${currentUsage} team members are now using automation! You're building an efficient team culture.`,
          triggerPercentage: 40,
          emotion: 'positive',
          actionRequired: false
        },
        {
          type: 'social_proof',
          message: `85% of teams with ${currentUsage}+ members upgrade to Growth Mode for better collaboration tools.`,
          triggerPercentage: 70,
          emotion: 'neutral',
          actionRequired: true
        },
        {
          type: 'loss_aversion',
          message: `Don't block your team's productivity! ${currentUsage} members depend on these workflows daily.`,
          triggerPercentage: 90,
          emotion: 'negative',
          actionRequired: true
        }
      ]
    };
  }

  private createIntegrationSoftLimit(tenantId: string, currentPlan: any, usage: any): SoftLimitConfig {
    const actualLimit = currentPlan.limits.integrations;
    const currentUsage = usage.activeIntegrations || 0;
    
    // Integrations use opportunity framing
    const displayLimit = Math.floor(actualLimit * 0.75);
    const percentageUsed = (currentUsage / displayLimit) * 100;

    return {
      metric: 'activeIntegrations',
      currentUsage,
      displayLimit,
      actualLimit,
      percentageUsed,
      warningThresholds: [60, 75, 85, 95],
      upgradeTriggers: [
        {
          condition: `integrations >= ${Math.floor(displayLimit * 0.8)}`,
          action: 'show_opportunity',
          targetPlan: 'growth',
          message: `You're connecting ${currentUsage} systems! Growth Mode unlocks advanced integrations and custom APIs.`,
          priority: 'medium'
        }
      ],
      psychologicalMessaging: [
        {
          type: 'opportunity',
          message: `Each new integration typically saves 10+ hours per month. You have ${displayLimit - currentUsage} opportunities left.`,
          triggerPercentage: 50,
          emotion: 'positive',
          actionRequired: false
        },
        {
          type: 'authority',
          message: `Teams with ${currentUsage}+ integrations report 300% ROI. Growth Mode maximizes your integration potential.`,
          triggerPercentage: 75,
          emotion: 'positive',
          actionRequired: true
        }
      ]
    };
  }

  async checkAndGenerateNotifications(tenantId: string, softLimits: SoftLimitConfig[]): Promise<SoftLimitNotification[]> {
    const notifications: SoftLimitNotification[] = [];
    const userBehavior = this.getUserBehaviorData(tenantId);

    for (const limit of softLimits) {
      // Check each threshold
      for (const threshold of limit.warningThresholds) {
        if (limit.percentageUsed >= threshold && limit.percentageUsed < threshold + 5) {
          // Find appropriate psychological message
          const message = limit.psychologicalMessaging.find(
            msg => msg.triggerPercentage <= limit.percentageUsed
          );

          if (message) {
            const notification = await this.createSoftLimitNotification(
              tenantId,
              limit,
              threshold,
              message,
              userBehavior
            );
            
            if (notification) {
              notifications.push(notification);
            }
          }
        }
      }

      // Check upgrade triggers
      for (const trigger of limit.upgradeTriggers) {
        if (this.evaluateTriggerCondition(trigger.condition, limit, userBehavior)) {
          const notification = await this.createUpgradeNotification(
            tenantId,
            limit,
            trigger,
            userBehavior
          );
          
          if (notification) {
            notifications.push(notification);
          }
        }
      }
    }

    // Store notifications
    if (!this.notifications.has(tenantId)) {
      this.notifications.set(tenantId, []);
    }
    this.notifications.get(tenantId)!.push(...notifications);

    return notifications;
  }

  private async createSoftLimitNotification(
    tenantId: string,
    limit: SoftLimitConfig,
    threshold: number,
    message: PsychologicalMessage,
    userBehavior: any
  ): Promise<SoftLimitNotification | null> {
    // Check if we already sent a similar notification recently
    const existingNotifications = this.notifications.get(tenantId) || [];
    const recentSimilar = existingNotifications.find(n => 
      n.metric === limit.metric &&
      n.type === 'warning' &&
      (Date.now() - n.timestamp.getTime()) < 24 * 60 * 60 * 1000 // 24 hours
    );

    if (recentSimilar) {
      return null; // Don't spam the user
    }

    let type: 'warning' | 'urgency' | 'opportunity' | 'limit_reached' = 'warning';
    if (threshold >= 90) type = 'urgency';
    else if (threshold >= 80 && message.type === 'opportunity') type = 'opportunity';
    else if (limit.percentageUsed >= 100) type = 'limit_reached';

    return {
      id: `soft_limit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type,
      title: this.getNotificationTitle(type, limit.metric),
      message: message.message,
      percentageUsed: limit.percentageUsed,
      metric: limit.metric,
      currentUsage: limit.currentUsage,
      displayLimit: limit.displayLimit,
      timestamp: new Date(),
      read: false,
      actionTaken: false
    };
  }

  private async createUpgradeNotification(
    tenantId: string,
    limit: SoftLimitConfig,
    trigger: UpgradeTrigger,
    userBehavior: any
  ): Promise<SoftLimitNotification | null> {
    // Check if we already sent this upgrade trigger
    const existingNotifications = this.notifications.get(tenantId) || [];
    const recentUpgrade = existingNotifications.find(n => 
      n.upgradeSuggestion?.plan === trigger.targetPlan &&
      (Date.now() - n.timestamp.getTime()) < 3 * 24 * 60 * 60 * 1000 // 3 days
    );

    if (recentUpgrade) {
      return null;
    }

    const benefits = this.getPlanBenefits(trigger.targetPlan);
    const urgencyLevel = trigger.priority === 'critical' ? 'critical' : 
                        trigger.priority === 'high' ? 'high' : 
                        trigger.priority === 'medium' ? 'medium' : 'low';

    return {
      id: `upgrade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: trigger.action === 'show_urgency' ? 'urgency' : 'opportunity',
      title: `Upgrade to ${trigger.targetPlan.charAt(0).toUpperCase() + trigger.targetPlan.slice(1)} Mode`,
      message: trigger.message,
      percentageUsed: limit.percentageUsed,
      metric: limit.metric,
      currentUsage: limit.currentUsage,
      displayLimit: limit.displayLimit,
      upgradeSuggestion: {
        plan: trigger.targetPlan,
        benefits,
        cta: this.getUpgradeCTA(trigger.targetPlan, urgencyLevel),
        urgencyLevel
      },
      timestamp: new Date(),
      read: false,
      actionTaken: false
    };
  }

  private getNotificationTitle(type: string, metric: string): string {
    const metricNames = {
      workflowsInProduction: 'Workflows',
      executionsPerMonth: 'Executions',
      teamMembers: 'Team Members',
      activeIntegrations: 'Integrations'
    };

    const titles = {
      warning: `Heads up on ${metricNames[metric as keyof typeof metricNames]}`,
      urgency: `Action needed for ${metricNames[metric as keyof typeof metricNames]}`,
      opportunity: `Opportunity for ${metricNames[metric as keyof typeof metricNames]}`,
      limit_reached: `${metricNames[metric as keyof typeof metricNames]} limit reached`
    };

    return titles[type as keyof typeof titles] || 'Notification';
  }

  private getPlanBenefits(plan: string): string[] {
    const benefits = {
      growth: [
        'Unlimited production workflows',
        'Auto-scaling pricing based on success',
        'Advanced AI agents and optimization',
        'Priority email support',
        '30-day logs retention'
      ],
      autopilot: [
        'Zero upfront cost',
        'Only 3% of value generated',
        'All features included',
        'Dedicated support',
        'Custom integrations'
      ]
    };

    return benefits[plan as keyof typeof benefits] || [];
  }

  private getUpgradeCTA(plan: string, urgency: string): string {
    const ctas = {
      growth: {
        low: 'Explore Growth Mode',
        medium: 'Start Growing',
        high: 'Upgrade Now',
        critical: 'Upgrade Immediately'
      },
      autopilot: {
        low: 'Learn about Autopilot',
        medium: 'Try Autopilot',
        high: 'Activate Autopilot',
        critical: 'Enable Autopilot Now'
      }
    };

    return ctas[plan as keyof typeof ctas]?.[urgency as keyof typeof ctas.growth] || 'Upgrade';
  }

  private evaluateTriggerCondition(condition: string, limit: SoftLimitConfig, userBehavior: any): boolean {
    // Simple condition evaluation (in production, use a proper expression parser)
    try {
      const context = {
        workflow_count: limit.currentUsage,
        execution_rate: limit.currentUsage,
        team_members: limit.currentUsage,
        integrations: limit.currentUsage,
        percentage_used: limit.percentageUsed
      };

      // Replace variables in condition
      let evalCondition = condition;
      for (const [key, value] of Object.entries(context)) {
        evalCondition = evalCondition.replace(new RegExp(key, 'g'), value.toString());
      }

      // Evaluate the condition (simplified - in production use proper evaluation)
      return eval(evalCondition);
    } catch (error) {
      logger.error(`Failed to evaluate trigger condition: ${condition}`, error);
      return false;
    }
  }

  private getUserBehaviorData(tenantId: string): any {
    return this.userBehaviorData.get(tenantId) || {
      upgradeHistory: [],
      usagePatterns: {},
      responseRates: {},
      lastActivity: new Date()
    };
  }

  async trackUserBehavior(tenantId: string, behavior: any): Promise<void> {
    const currentData = this.getUserBehaviorData(tenantId);
    const updatedData = { ...currentData, ...behavior, lastActivity: new Date() };
    
    this.userBehaviorData.set(tenantId, updatedData);
    
    logger.info(`Tracked user behavior for tenant ${tenantId}`);
  }

  async getNotifications(tenantId: string, unreadOnly: boolean = false): Promise<SoftLimitNotification[]> {
    const notifications = this.notifications.get(tenantId) || [];
    
    return unreadOnly 
      ? notifications.filter(n => !n.read)
      : notifications;
  }

  async markNotificationRead(tenantId: string, notificationId: string): Promise<void> {
    const notifications = this.notifications.get(tenantId) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.read = true;
      logger.info(`Marked notification ${notificationId} as read for tenant ${tenantId}`);
    }
  }

  async markNotificationActionTaken(tenantId: string, notificationId: string): Promise<void> {
    const notifications = this.notifications.get(tenantId) || [];
    const notification = notifications.find(n => n.id === notificationId);
    
    if (notification) {
      notification.actionTaken = true;
      
      // Track this for psychological profiling
      await this.trackUserBehavior(tenantId, {
        lastActionTaken: notification.type,
        lastActionTime: new Date(),
        upgradeResponseRate: this.calculateResponseRate(tenantId)
      });
      
      logger.info(`Marked notification ${notificationId} action taken for tenant ${tenantId}`);
    }
  }

  private calculateResponseRate(tenantId: string): number {
    const notifications = this.notifications.get(tenantId) || [];
    const actionableNotifications = notifications.filter(n => n.actionRequired);
    
    if (actionableNotifications.length === 0) return 0;
    
    const respondedNotifications = actionableNotifications.filter(n => n.actionTaken);
    
    return respondedNotifications.length / actionableNotifications.length;
  }

  async getSoftLimitStatus(tenantId: string): Promise<{
    activeLimits: SoftLimitConfig[];
    unreadNotifications: number;
    responseRate: number;
    psychologicalProfile: any;
  }> {
    // This would integrate with the pricing service to get current limits
    // For now, return mock data
    return {
      activeLimits: [],
      unreadNotifications: 0,
      responseRate: this.calculateResponseRate(tenantId),
      psychologicalProfile: this.getUserBehaviorData(tenantId)
    };
  }
}
