import { logger } from '../utils/logger.js';

export type UserState = 'explore' | 'build' | 'scale' | 'depend';

export interface StateTransition {
  from: UserState;
  to: UserState;
  trigger: string;
  conditions: string[];
  automatic: boolean;
  revenueImpact: number;
}

export interface UserStateProfile {
  state: UserState;
  name: string;
  description: string;
  pricingModel: 'free' | 'micro_payments' | 'adaptive' | 'value_tax';
  baseCost: number;
  characteristics: {
    friction: 'none' | 'minimal' | 'moderate' | 'high';
    limits: 'none' | 'soft' | 'hard' | 'performance';
    upgrades: 'hidden' | 'suggested' | 'required' | 'automatic';
  };
  triggers: StateTransition[];
  behaviors: string[];
  revenueExtraction: string[];
}

export class UserStateService {
  private stateProfiles: Map<UserState, UserStateProfile> = new Map([
    ['explore', {
      state: 'explore',
      name: 'Explore',
      description: 'Free exploration with zero friction',
      pricingModel: 'free',
      baseCost: 0,
      characteristics: {
        friction: 'none',
        limits: 'none',
        upgrades: 'hidden'
      },
      triggers: [
        {
          from: 'explore',
          to: 'build',
          trigger: 'first_automation_win',
          conditions: ['completed_workflow', 'saved_time > 30min', 'user_engagement > 7days'],
          automatic: true,
          revenueImpact: 3
        }
      ],
      behaviors: [
        'Unlimited workflow creation',
        'Full feature access',
        'No performance limits',
        'Success tracking enabled'
      ],
      revenueExtraction: [
        'Zero cost acquisition',
        'Build habit and dependency',
        'Track success metrics for upsell'
      ]
    }],
    ['build', {
      state: 'build',
      name: 'Build',
      description: 'Micro-commitments kick in automatically',
      pricingModel: 'micro_payments',
      baseCost: 3,
      characteristics: {
        friction: 'minimal',
        limits: 'soft',
        upgrades: 'suggested'
      },
      triggers: [
        {
          from: 'build',
          to: 'scale',
          trigger: 'consistent_usage',
          conditions: ['daily_executions > 100', 'monthly_value > 1000', 'team_size > 2'],
          automatic: true,
          revenueImpact: 25
        }
      ],
      behaviors: [
        '€3 micro-payment triggers',
        'Performance teasing active',
        'Contextual upgrade suggestions',
        'Success amplification messages'
      ],
      revenueExtraction: [
        'Micro-commitments stack',
        'Performance boost purchases',
        'Time-based upgrades',
        'Feature unlocks at pain points'
      ]
    }],
    ['scale', {
      state: 'scale',
      name: 'Scale',
      description: 'Adaptive pricing based on usage + value',
      pricingModel: 'adaptive',
      baseCost: 25,
      characteristics: {
        friction: 'moderate',
        limits: 'performance',
        upgrades: 'required'
      },
      triggers: [
        {
          from: 'scale',
          to: 'depend',
          trigger: 'infrastructure_critical',
          conditions: ['executions > 1M/month', 'revenue_impact > 50k', 'team_size > 10'],
          automatic: false,
          revenueImpact: 500
        }
      ],
      behaviors: [
        'Dynamic pricing adjustments',
        'Revenue gravity active',
        'Value tax calculation',
        'Automatic expansion suggestions'
      ],
      revenueExtraction: [
        'Usage-based scaling',
        'Value percentage capture',
        'Team member billing',
        'Infrastructure premiums'
      ]
    }],
    ['depend', {
      state: 'depend',
      name: 'Depend',
      description: 'Torqvio becomes critical infrastructure',
      pricingModel: 'value_tax',
      baseCost: 0,
      characteristics: {
        friction: 'high',
        limits: 'none',
        upgrades: 'automatic'
      },
      triggers: [],
      behaviors: [
        'Value-based billing dominant',
        'Zero noticeable friction',
        'Automatic capacity scaling',
        'Enterprise features enabled'
      ],
      revenueExtraction: [
        '2-6% value capture',
        'Infrastructure margins',
        'Compliance premiums',
        'Support contracts'
      ]
    }]
  ]);

  private transitionHistory: Map<string, StateTransition[]> = new Map();

  async getCurrentUserState(tenantId: string): Promise<UserStateProfile> {
    // In real implementation, this would query the database
    // For now, we'll determine state based on usage patterns
    
    const mockUsage = await this.getTenantUsage(tenantId);
    const currentState = await this.determineStateFromUsage(mockUsage);
    
    return this.stateProfiles.get(currentState)!;
  }

  async evaluateStateTransition(tenantId: string): Promise<StateTransition | null> {
    const currentState = await this.getCurrentUserState(tenantId);
    const usage = await this.getTenantUsage(tenantId);
    const outcomes = await this.getTenantOutcomes(tenantId);

    // Check each trigger for the current state
    for (const trigger of currentState.triggers) {
      if (await this.evaluateTriggerConditions(trigger.conditions, usage, outcomes)) {
        logger.info(`State transition triggered for tenant ${tenantId}: ${trigger.from} → ${trigger.to}`);
        return trigger;
      }
    }

    return null;
  }

  async executeStateTransition(tenantId: string, transition: StateTransition): Promise<void> {
    // Record the transition
    if (!this.transitionHistory.has(tenantId)) {
      this.transitionHistory.set(tenantId, []);
    }
    this.transitionHistory.get(tenantId)!.push(transition);

    // Apply state changes
    const newState = this.stateProfiles.get(transition.to);
    if (!newState) return;

    // Execute transition logic
    if (transition.automatic) {
      await this.executeAutomaticTransition(tenantId, transition, newState);
    } else {
      await this.executeManualTransition(tenantId, transition, newState);
    }

    logger.info(`Executed state transition for tenant ${tenantId}: ${transition.from} → ${transition.to}`);
  }

  private async executeAutomaticTransition(
    tenantId: string, 
    transition: StateTransition, 
    newState: UserStateProfile
  ): Promise<void> {
    // Automatic transitions happen without user intervention
    
    switch (transition.to) {
      case 'build':
        // Start micro-commitments automatically
        await this.enableMicroPayments(tenantId);
        await this.startPerformanceTeasing(tenantId);
        break;
        
      case 'scale':
        // Enable adaptive pricing
        await this.enableAdaptivePricing(tenantId);
        await this.activateRevenueGravity(tenantId);
        break;
        
      case 'depend':
        // Switch to value tax model
        await this.enableValueTax(tenantId);
        await this.removeLimits(tenantId);
        break;
    }
  }

  private async executeManualTransition(
    tenantId: string, 
    transition: StateTransition, 
    newState: UserStateProfile
  ): Promise<void> {
    // Manual transitions require user approval (mostly for enterprise)
    
    // Create upgrade prompt
    await this.createUpgradePrompt(tenantId, transition, newState);
  }

  private async evaluateTriggerConditions(
    conditions: string[], 
    usage: any, 
    outcomes: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      if (!await this.evaluateCondition(condition, usage, outcomes)) {
        return false;
      }
    }
    return true;
  }

  private async evaluateCondition(condition: string, usage: any, outcomes: any): Promise<boolean> {
    // Parse and evaluate individual conditions
    const parts = condition.split(/([><=])/);
    
    if (parts.length === 3) {
      const [metric, operator, value] = parts;
      const metricValue = this.getMetricValue(metric.trim(), usage, outcomes);
      const targetValue = parseFloat(value.trim());
      
      switch (operator) {
        case '>': return metricValue > targetValue;
        case '<': return metricValue < targetValue;
        case '>=': return metricValue >= targetValue;
        case '<=': return metricValue <= targetValue;
        case '=': return metricValue === targetValue;
      }
    }
    
    // Handle string-based conditions
    switch (condition) {
      case 'completed_workflow':
        return usage.workflows > 0;
      case 'user_engagement > 7days':
        return usage.accountAge > 7;
      default:
        return false;
    }
  }

  private getMetricValue(metric: string, usage: any, outcomes: any): number {
    switch (metric) {
      case 'daily_executions': return usage.executionsPerMonth / 30;
      case 'monthly_executions': return usage.executionsPerMonth;
      case 'monthly_value': return outcomes.valueGenerated;
      case 'team_size': return usage.teamMembers;
      case 'revenue_impact': return outcomes.revenueInfluenced;
      case 'saved_time': return outcomes.timeSaved;
      default: return 0;
    }
  }

  private async determineStateFromUsage(usage: any): Promise<UserState> {
    // Determine state based on usage patterns
    
    if (usage.workflows === 0 || usage.accountAge < 7) {
      return 'explore';
    }
    
    if (usage.executionsPerMonth < 10000 && usage.teamMembers <= 2) {
      return 'build';
    }
    
    if (usage.executionsPerMonth < 1000000 && usage.teamMembers <= 10) {
      return 'scale';
    }
    
    return 'depend';
  }

  // Private implementation methods
  private async getTenantUsage(tenantId: string): Promise<any> {
    // Mock implementation
    return {
      executionsPerMonth: 50000,
      workflows: 15,
      teamMembers: 3,
      accountAge: 45,
      revenueGenerated: 5000
    };
  }

  private async getTenantOutcomes(tenantId: string): Promise<any> {
    // Mock implementation
    return {
      valueGenerated: 8000,
      timeSaved: 120,
      revenueInfluenced: 12000
    };
  }

  private async enableMicroPayments(tenantId: string): Promise<void> {
    logger.info(`Enabled micro-payments for tenant ${tenantId}`);
  }

  private async startPerformanceTeasing(tenantId: string): Promise<void> {
    logger.info(`Started performance teasing for tenant ${tenantId}`);
  }

  private async enableAdaptivePricing(tenantId: string): Promise<void> {
    logger.info(`Enabled adaptive pricing for tenant ${tenantId}`);
  }

  private async activateRevenueGravity(tenantId: string): Promise<void> {
    logger.info(`Activated revenue gravity for tenant ${tenantId}`);
  }

  private async enableValueTax(tenantId: string): Promise<void> {
    logger.info(`Enabled value tax for tenant ${tenantId}`);
  }

  private async removeLimits(tenantId: string): Promise<void> {
    logger.info(`Removed limits for tenant ${tenantId}`);
  }

  private async createUpgradePrompt(tenantId: string, transition: StateTransition, newState: UserStateProfile): Promise<void> {
    logger.info(`Created upgrade prompt for tenant ${tenantId}: ${transition.from} → ${transition.to}`);
  }

  getStateProfile(state: UserState): UserStateProfile | undefined {
    return this.stateProfiles.get(state);
  }

  getAllStates(): UserStateProfile[] {
    return Array.from(this.stateProfiles.values());
  }

  getTransitionHistory(tenantId: string): StateTransition[] {
    return this.transitionHistory.get(tenantId) || [];
  }
}
