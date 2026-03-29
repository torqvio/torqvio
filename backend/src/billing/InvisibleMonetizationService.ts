import { logger } from '../utils/logger.js';
import { UserStateService, UserState } from './UserStateService.js';

export interface ContextualUpgrade {
  id: string;
  trigger: 'workflow_failure' | 'performance_slow' | 'feature_limit' | 'success_moment';
  title: string;
  description: string;
  microPrice: number; // €3, €7, €12
  impact: string;
  urgency: 'low' | 'medium' | 'high';
  autoExecute: boolean;
}

export interface MicroCommitment {
  id: string;
  type: 'unlock' | 'boost' | 'acceleration';
  price: number;
  description: string;
  duration: 'session' | 'day' | 'week' | 'month' | 'permanent';
  trigger: string;
  stackable: boolean;
}

export interface RevenueGravityEvent {
  type: 'performance_tease' | 'success_amplify' | 'time_pressure' | 'social_proof';
  context: string;
  message: string;
  impliedCost: number;
  conversionProbability: number;
}

export interface ValueTaxCalculation {
  generatedValue: number;
  taxRate: number; // 2-6%
  capturedAmount: number;
  billingMethod: 'infrastructure' | 'performance' | 'scaling' | 'support';
  userPerception: string;
}

export class InvisibleMonetizationService {
  private contextualUpgrades: Map<string, ContextualUpgrade[]> = new Map();
  private microCommitments: Map<string, MicroCommitment[]> = new Map();
  private activeCommitments: Map<string, MicroCommitment[]> = new Map();

  constructor(private userStateService: UserStateService) {
    this.initializeUpgrades();
    this.initializeMicroCommitments();
  }

  private initializeUpgrades() {
    // Workflow failure upgrades
    this.contextualUpgrades.set('workflow_failure', [
      {
        id: 'debug_instant',
        trigger: 'workflow_failure',
        title: 'Debug This Failure Instantly',
        description: 'Enable Replay & Time Travel debugging',
        microPrice: 4,
        impact: 'Fix this error in 30 seconds instead of 30 minutes',
        urgency: 'high',
        autoExecute: false
      },
      {
        id: 'priority_debug',
        trigger: 'workflow_failure',
        title: 'Priority Debug Queue',
        description: 'Jump to front of debugging queue',
        microPrice: 7,
        impact: 'Get help 5x faster',
        urgency: 'high',
        autoExecute: false
      }
    ]);

    // Performance slow upgrades
    this.contextualUpgrades.set('performance_slow', [
      {
        id: 'priority_engine',
        trigger: 'performance_slow',
        title: 'Priority Engine',
        description: 'Run this workflow 3x faster',
        microPrice: 12,
        impact: '1.2s → 0.3s execution time',
        urgency: 'medium',
        autoExecute: false
      },
      {
        id: 'dedicated_resources',
        trigger: 'performance_slow',
        title: 'Dedicated Resources',
        description: 'Reserve compute just for your workflows',
        microPrice: 8,
        impact: 'No queue waiting, consistent performance',
        urgency: 'medium',
        autoExecute: false
      }
    ]);

    // Feature limit upgrades
    this.contextualUpgrades.set('feature_limit', [
      {
        id: 'unlock_advanced',
        trigger: 'feature_limit',
        title: 'Unlock Advanced Features',
        description: 'Access AI optimization and advanced analytics',
        microPrice: 5,
        impact: 'Automatically improve your workflows',
        urgency: 'low',
        autoExecute: false
      }
    ]);

    // Success moment upgrades
    this.contextualUpgrades.set('success_moment', [
      {
        id: 'amplify_success',
        trigger: 'success_moment',
        title: 'Amplify This Success',
        description: 'Apply this optimization to all similar workflows',
        microPrice: 3,
        impact: 'Multiply your time savings across all workflows',
        urgency: 'low',
        autoExecute: true
      }
    ]);
  }

  private initializeMicroCommitments() {
    this.microCommitments.set('default', [
      {
        id: 'session_boost',
        type: 'boost',
        price: 3,
        description: 'Speed boost for this session',
        duration: 'session',
        trigger: 'slow_execution',
        stackable: true
      },
      {
        id: 'daily_unlock',
        type: 'unlock',
        price: 7,
        description: 'Unlock premium features for today',
        duration: 'day',
        trigger: 'feature_limit',
        stackable: false
      },
      {
        id: 'weekly_acceleration',
        type: 'acceleration',
        price: 12,
        description: 'Full acceleration for this week',
        duration: 'week',
        trigger: 'high_usage',
        stackable: true
      },
      {
        id: 'monthly_priority',
        type: 'boost',
        price: 25,
        description: 'Priority execution all month',
        duration: 'month',
        trigger: 'consistent_usage',
        stackable: false
      }
    ]);
  }

  async getContextualUpgrade(tenantId: string, trigger: string, context: any): Promise<ContextualUpgrade | null> {
    const userState = await this.userStateService.getCurrentUserState(tenantId);
    const upgrades = this.contextualUpgrades.get(trigger) || [];
    
    // Filter upgrades appropriate for user state
    const availableUpgrades = upgrades.filter(upgrade => {
      if (userState.state === 'explore') return false; // No upgrades in explore state
      if (userState.state === 'depend') return false; // Everything unlocked in depend state
      return true;
    });

    if (availableUpgrades.length === 0) return null;

    // Select most relevant upgrade based on context
    return this.selectMostRelevantUpgrade(availableUpgrades, context);
  }

  async executeMicroCommitment(tenantId: string, commitmentId: string): Promise<boolean> {
    const commitment = this.findMicroCommitment(commitmentId);
    if (!commitment) return false;

    // Add to active commitments
    if (!this.activeCommitments.has(tenantId)) {
      this.activeCommitments.set(tenantId, []);
    }
    this.activeCommitments.get(tenantId)!.push(commitment);

    // Apply the commitment effect
    await this.applyCommitmentEffect(tenantId, commitment);

    logger.info(`Executed micro-commitment for tenant ${tenantId}: ${commitment.description} (€${commitment.price})`);
    return true;
  }

  async generateRevenueGravityEvent(tenantId: string, context: any): Promise<RevenueGravityEvent[]> {
    const events: RevenueGravityEvent[] = [];
    const userState = await this.userStateService.getCurrentUserState(tenantId);

    // Performance teasing
    if (context.executionTime && context.executionTime > 1000) {
      events.push({
        type: 'performance_tease',
        context: 'slow_execution',
        message: `⚡ Could run in ${(context.executionTime / 3).toFixed(1)}s with Priority Engine (+€12/month impact)`,
        impliedCost: 12,
        conversionProbability: 0.3
      });
    }

    // Success amplification
    if (context.timeSaved && context.timeSaved > 60) {
      events.push({
        type: 'success_amplify',
        context: 'time_saved',
        message: `🎉 You saved ${Math.round(context.timeSaved / 60)} hours this week! Amplify this success for €3`,
        impliedCost: 3,
        conversionProbability: 0.4
      });
    }

    // Time pressure
    if (context.queueLength && context.queueLength > 10) {
      events.push({
        type: 'time_pressure',
        context: 'queue_pressure',
        message: `⏰ Your queue is slowing due to traffic. Skip queue for €7`,
        impliedCost: 7,
        conversionProbability: 0.6
      });
    }

    // Social proof
    if (userState.state === 'build' || userState.state === 'scale') {
      events.push({
        type: 'social_proof',
        context: 'peer_behavior',
        message: `Teams like yours upgrade within 9 days. Most spend €25-50/month on optimizations.`,
        impliedCost: 25,
        conversionProbability: 0.2
      });
    }

    return events;
  }

  async calculateValueTax(tenantId: string, generatedValue: number): Promise<ValueTaxCalculation> {
    const userState = await this.userStateService.getCurrentUserState(tenantId);
    
    let taxRate = 0;
    let billingMethod: 'infrastructure' | 'performance' | 'scaling' | 'support' = 'infrastructure';
    let userPerception = '';

    switch (userState.state) {
      case 'scale':
        taxRate = 0.02; // 2%
        billingMethod = 'performance';
        userPerception = 'Performance optimization fees';
        break;
      case 'depend':
        taxRate = 0.04; // 4%
        billingMethod = 'infrastructure';
        userPerception = 'Infrastructure and scaling costs';
        break;
      default:
        taxRate = 0;
        userPerception = 'No additional fees';
    }

    // Adjust tax rate based on value
    if (generatedValue > 100000) taxRate = Math.min(0.06, taxRate + 0.02); // Up to 6%

    const capturedAmount = generatedValue * taxRate;

    return {
      generatedValue,
      taxRate,
      capturedAmount,
      billingMethod,
      userPerception
    };
  }

  async getActiveCommitments(tenantId: string): Promise<MicroCommitment[]> {
    return this.activeCommitments.get(tenantId) || [];
  }

  async getTotalMicroSpending(tenantId: string, period: 'day' | 'week' | 'month' = 'month'): Promise<number> {
    const commitments = await this.getActiveCommitments(tenantId);
    
    return commitments.reduce((total, commitment) => {
      switch (commitment.duration) {
        case 'session': return total + commitment.price; // One-time
        case 'day': return total + (commitment.price * 30); // Assume daily usage
        case 'week': return total + (commitment.price * 4); // 4 weeks per month
        case 'month': return total + commitment.price;
        default: return total;
      }
    }, 0);
  }

  async suggestNextMicroCommitment(tenantId: string, context: any): Promise<MicroCommitment | null> {
    const userState = await this.userStateService.getCurrentUserState(tenantId);
    const activeCommitments = await this.getActiveCommitments(tenantId);

    // Don't suggest if user is in explore state
    if (userState.state === 'explore') return null;

    // Don't suggest if user already has monthly commitment
    const hasMonthlyCommitment = activeCommitments.some(c => c.duration === 'month');
    if (hasMonthlyCommitment) return null;

    // Suggest based on context
    if (context.executionTime > 2000) {
      return this.findMicroCommitment('session_boost');
    }

    if (context.featureLimitReached) {
      return this.findMicroCommitment('daily_unlock');
    }

    if (context.highUsage) {
      return this.findMicroCommitment('weekly_acceleration');
    }

    return null;
  }

  private selectMostRelevantUpgrade(upgrades: ContextualUpgrade[], context: any): ContextualUpgrade {
    // Simple selection logic - in reality, this would be more sophisticated
    return upgrades.reduce((best, current) => {
      if (current.urgency === 'high' && best.urgency !== 'high') return current;
      if (current.urgency === best.urgency && current.microPrice < best.microPrice) return current;
      return best;
    });
  }

  private findMicroCommitment(commitmentId: string): MicroCommitment | null {
    const allCommitments = this.microCommitments.get('default') || [];
    return allCommitments.find(c => c.id === commitmentId) || null;
  }

  private async applyCommitmentEffect(tenantId: string, commitment: MicroCommitment): Promise<void> {
    // Apply the actual effect of the commitment
    switch (commitment.type) {
      case 'boost':
        await this.applyPerformanceBoost(tenantId, commitment);
        break;
      case 'unlock':
        await this.applyFeatureUnlock(tenantId, commitment);
        break;
      case 'acceleration':
        await this.applyAcceleration(tenantId, commitment);
        break;
    }
  }

  private async applyPerformanceBoost(tenantId: string, commitment: MicroCommitment): Promise<void> {
    logger.info(`Applied performance boost for tenant ${tenantId}: ${commitment.description}`);
  }

  private async applyFeatureUnlock(tenantId: string, commitment: MicroCommitment): Promise<void> {
    logger.info(`Applied feature unlock for tenant ${tenantId}: ${commitment.description}`);
  }

  private async applyAcceleration(tenantId: string, commitment: MicroCommitment): Promise<void> {
    logger.info(`Applied acceleration for tenant ${tenantId}: ${commitment.description}`);
  }
}
