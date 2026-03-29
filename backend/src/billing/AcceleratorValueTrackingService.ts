import { logger } from '../utils/logger.js';

export interface ValueTrackingEvent {
  id: string;
  tenantId: string;
  eventType: 'workflow_execution' | 'time_saved' | 'error_prevented' | 'revenue_generated' | 'automation_milestone';
  timestamp: Date;
  value: number; // Monetary value in USD
  metadata: {
    workflowId?: string;
    executionTime?: number;
    manualTimeReplaced?: number;
    errorCost?: number;
    revenueAttribution?: number;
    milestoneType?: string;
    confidence?: number; // 0-1 confidence score
  };
  processed: boolean;
}

export interface OutcomeMetrics {
  valueGenerated: number; // Total USD value created
  timeSaved: number; // Hours saved
  errorsPrevented: number; // Count of errors avoided
  revenueInfluenced: number; // USD revenue attributed
  automationPercentage: number; // % of operations automated
  efficiencyGain: number; // Efficiency multiplier
  costSavings: number; // USD costs saved
  opportunityValue: number; // USD value of new opportunities
}

export interface ValueCalculationContext {
  tenantId: string;
  industry: string;
  companySize: string;
  avgHourlyRate: number; // $/hour for time value calculations
  avgErrorCost: number; // $/error for cost calculations
  revenueMultiplier: number; // Multiplier for revenue attribution
  automationMaturity: number; // 0-1 scale of current automation
}

export class AcceleratorValueTrackingService {
  private valueEvents: Map<string, ValueTrackingEvent[]> = new Map();
  private calculationContexts: Map<string, ValueCalculationContext> = new Map();
  
  constructor() {
    this.initializeDefaultContexts();
  }

  private initializeDefaultContexts() {
    // Default industry benchmarks for value calculations
    const industryContexts = {
      ecommerce: {
        avgHourlyRate: 35,
        avgErrorCost: 250,
        revenueMultiplier: 2.5,
        automationMaturity: 0.3
      },
      saas: {
        avgHourlyRate: 45,
        avgErrorCost: 500,
        revenueMultiplier: 3.0,
        automationMaturity: 0.4
      },
      finance: {
        avgHourlyRate: 75,
        avgErrorCost: 1000,
        revenueMultiplier: 4.0,
        automationMaturity: 0.5
      },
      healthcare: {
        avgHourlyRate: 55,
        avgErrorCost: 750,
        revenueMultiplier: 2.0,
        automationMaturity: 0.25
      },
      manufacturing: {
        avgHourlyRate: 30,
        avgErrorCost: 400,
        revenueMultiplier: 1.8,
        automationMaturity: 0.6
      },
      consulting: {
        avgHourlyRate: 85,
        avgErrorCost: 300,
        revenueMultiplier: 2.2,
        automationMaturity: 0.35
      }
    };

    // Initialize with default contexts
    for (const [industry, context] of Object.entries(industryContexts)) {
      this.calculationContexts.set(industry, context);
    }
  }

  async trackWorkflowExecution(
    tenantId: string,
    workflowId: string,
    executionTime: number,
    manualTimeReplaced: number,
    context: ValueCalculationContext
  ): Promise<void> {
    // Calculate time value
    const timeValue = manualTimeReplaced * context.avgHourlyRate;
    
    // Calculate efficiency gain
    const efficiencyGain = manualTimeReplaced > 0 ? manualTimeReplaced / executionTime : 1;
    
    // Calculate opportunity value (based on efficiency gain)
    const opportunityValue = timeValue * efficiencyGain * 0.5; // 50% of time value as opportunity

    const event: ValueTrackingEvent = {
      id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'workflow_execution',
      timestamp: new Date(),
      value: timeValue + opportunityValue,
      metadata: {
        workflowId,
        executionTime,
        manualTimeReplaced,
        confidence: 0.8 // High confidence for workflow executions
      },
      processed: false
    };

    await this.recordValueEvent(event);
    
    logger.info(`Tracked workflow execution value for tenant ${tenantId}: $${event.value.toFixed(2)}`);
  }

  async trackTimeSaved(
    tenantId: string,
    hoursSaved: number,
    activityType: string,
    context: ValueCalculationContext
  ): Promise<void> {
    const timeValue = hoursSaved * context.avgHourlyRate;
    
    // Add multiplier based on activity type
    const activityMultipliers = {
      'manual_data_entry': 1.2,
      'report_generation': 1.5,
      'customer_support': 1.8,
      'compliance_checking': 2.0,
      'inventory_management': 1.3,
      'financial_reconciliation': 2.2,
      'quality_assurance': 1.7
    };

    const multiplier = activityMultipliers[activityType as keyof typeof activityMultipliers] || 1.0;
    const adjustedValue = timeValue * multiplier;

    const event: ValueTrackingEvent = {
      id: `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'time_saved',
      timestamp: new Date(),
      value: adjustedValue,
      metadata: {
        confidence: 0.9 // Very high confidence for time tracking
      },
      processed: false
    };

    await this.recordValueEvent(event);
    
    logger.info(`Tracked time saved value for tenant ${tenantId}: ${hoursSaved}h = $${adjustedValue.toFixed(2)}`);
  }

  async trackErrorPrevented(
    tenantId: string,
    errorType: string,
    potentialImpact: 'low' | 'medium' | 'high' | 'critical',
    context: ValueCalculationContext
  ): Promise<void> {
    // Base error cost with multipliers
    const impactMultipliers = {
      low: 0.5,
      medium: 1.0,
      high: 2.5,
      critical: 5.0
    };

    // Error type multipliers
    const errorTypeMultipliers = {
      'data_validation': 1.0,
      'payment_processing': 3.0,
      'customer_data': 2.5,
      'compliance_violation': 4.0,
      'system_outage': 5.0,
      'security_breach': 8.0,
      'inventory_mismatch': 1.5,
      'shipping_error': 2.0
    };

    const baseCost = context.avgErrorCost;
    const impactMultiplier = impactMultipliers[potentialImpact];
    const typeMultiplier = errorTypeMultipliers[errorType as keyof typeof errorTypeMultipliers] || 1.0;
    
    const totalValue = baseCost * impactMultiplier * typeMultiplier;

    const event: ValueTrackingEvent = {
      id: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'error_prevented',
      timestamp: new Date(),
      value: totalValue,
      metadata: {
        errorCost: totalValue,
        confidence: 0.7 // Medium confidence for error prevention
      },
      processed: false
    };

    await this.recordValueEvent(event);
    
    logger.info(`Tracked error prevention value for tenant ${tenantId}: ${errorType} (${potentialImpact}) = $${totalValue.toFixed(2)}`);
  }

  async trackRevenueInfluenced(
    tenantId: string,
    revenueAmount: number,
    attributionType: 'direct' | 'assisted' | 'indirect',
    context: ValueCalculationContext
  ): Promise<void> {
    // Attribution multipliers
    const attributionMultipliers = {
      direct: 1.0,    // 100% attribution
      assisted: 0.6,  // 60% attribution
      indirect: 0.3   // 30% attribution
    };

    const attributedRevenue = revenueAmount * attributionMultipliers[attributionType] * context.revenueMultiplier;

    const event: ValueTrackingEvent = {
      id: `revenue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'revenue_generated',
      timestamp: new Date(),
      value: attributedRevenue,
      metadata: {
        revenueAttribution: attributedRevenue,
        confidence: attributionType === 'direct' ? 0.9 : attributionType === 'assisted' ? 0.7 : 0.5
      },
      processed: false
    };

    await this.recordValueEvent(event);
    
    logger.info(`Tracked revenue influence for tenant ${tenantId}: $${attributedRevenue.toFixed(2)} (${attributionType})`);
  }

  async trackAutomationMilestone(
    tenantId: string,
    milestoneType: string,
    milestoneValue: number,
    context: ValueCalculationContext
  ): Promise<void> {
    // Milestone value calculations
    const milestoneCalculations = {
      'first_automation': milestoneValue * 10, // 10x multiplier for first automation
      'process_fully_automated': milestoneValue * 5,
      'team_onboarded': milestoneValue * 3,
      'integration_completed': milestoneValue * 2,
      'scalability_achieved': milestoneValue * 4,
      'compliance_automated': milestoneValue * 6
    };

    const calculatedValue = milestoneCalculations[milestoneType as keyof typeof milestoneCalculations] || milestoneValue;

    const event: ValueTrackingEvent = {
      id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      eventType: 'automation_milestone',
      timestamp: new Date(),
      value: calculatedValue,
      metadata: {
        milestoneType,
        confidence: 0.8
      },
      processed: false
    };

    await this.recordValueEvent(event);
    
    logger.info(`Tracked automation milestone for tenant ${tenantId}: ${milestoneType} = $${calculatedValue.toFixed(2)}`);
  }

  private async recordValueEvent(event: ValueTrackingEvent): Promise<void> {
    if (!this.valueEvents.has(event.tenantId)) {
      this.valueEvents.set(event.tenantId, []);
    }
    
    this.valueEvents.get(event.tenantId)!.push(event);
    
    // Mark as processed
    event.processed = true;
  }

  async calculateOutcomeMetrics(tenantId: string, period: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<OutcomeMetrics> {
    const events = this.valueEvents.get(tenantId) || [];
    const now = new Date();
    
    // Filter events by period
    let periodStart: Date;
    switch (period) {
      case 'daily':
        periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        periodStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
      default:
        periodStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
    }

    const periodEvents = events.filter(event => 
      event.timestamp >= periodStart && event.processed
    );

    // Calculate metrics
    let valueGenerated = 0;
    let timeSaved = 0;
    let errorsPrevented = 0;
    let revenueInfluenced = 0;
    let automationPercentage = 0;
    let efficiencyGain = 1;
    let costSavings = 0;
    let opportunityValue = 0;

    for (const event of periodEvents) {
      const confidence = event.metadata.confidence || 0.8;
      const weightedValue = event.value * confidence;

      switch (event.eventType) {
        case 'workflow_execution':
          valueGenerated += weightedValue;
          if (event.metadata.manualTimeReplaced) {
            timeSaved += event.metadata.manualTimeReplaced * confidence;
          }
          efficiencyGain += (event.metadata.manualTimeReplaced || 0) / (event.metadata.executionTime || 1) * confidence;
          opportunityValue += weightedValue * 0.5;
          break;
          
        case 'time_saved':
          timeSaved += weightedValue / (this.calculationContexts.get('saas')?.avgHourlyRate || 45); // Convert back to hours
          valueGenerated += weightedValue;
          costSavings += weightedValue;
          break;
          
        case 'error_prevented':
          errorsPrevented += 1 * confidence;
          valueGenerated += weightedValue;
          costSavings += weightedValue;
          break;
          
        case 'revenue_generated':
          revenueInfluenced += weightedValue;
          valueGenerated += weightedValue;
          opportunityValue += weightedValue * 0.3;
          break;
          
        case 'automation_milestone':
          valueGenerated += weightedValue;
          opportunityValue += weightedValue;
          break;
      }
    }

    // Calculate automation percentage (mock calculation based on events)
    const totalPossibleEvents = 100; // This would be calculated based on tenant's actual operations
    automationPercentage = Math.min((periodEvents.length / totalPossibleEvents) * 100, 95);

    // Normalize efficiency gain
    efficiencyGain = Math.max(efficiencyGain / Math.max(periodEvents.length, 1), 1);

    return {
      valueGenerated: Math.round(valueGenerated * 100) / 100,
      timeSaved: Math.round(timeSaved * 10) / 10,
      errorsPrevented: Math.round(errorsPrevented),
      revenueInfluenced: Math.round(revenueInfluenced * 100) / 100,
      automationPercentage: Math.round(automationPercentage),
      efficiencyGain: Math.round(efficiencyGain * 100) / 100,
      costSavings: Math.round(costSavings * 100) / 100,
      opportunityValue: Math.round(opportunityValue * 100) / 100
    };
  }

  async getTenantValueContext(tenantId: string): Promise<ValueCalculationContext> {
    // In a real implementation, this would fetch from database
    // For now, return a default context
    return {
      tenantId,
      industry: 'saas',
      companySize: 'medium',
      avgHourlyRate: 45,
      avgErrorCost: 500,
      revenueMultiplier: 3.0,
      automationMaturity: 0.4
    };
  }

  async updateTenantContext(tenantId: string, context: Partial<ValueCalculationContext>): Promise<void> {
    const currentContext = await this.getTenantValueContext(tenantId);
    const updatedContext = { ...currentContext, ...context };
    
    this.calculationContexts.set(tenantId, updatedContext);
    
    logger.info(`Updated value calculation context for tenant ${tenantId}`);
  }

  async getValueEvents(tenantId: string, limit: number = 50): Promise<ValueTrackingEvent[]> {
    const events = this.valueEvents.get(tenantId) || [];
    
    return events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async getValueSummary(tenantId: string): Promise<{
    totalValue: number;
    eventCounts: Record<string, number>;
    averageValue: number;
    topValueEvents: ValueTrackingEvent[];
  }> {
    const events = this.valueEvents.get(tenantId) || [];
    
    const totalValue = events.reduce((sum, event) => sum + event.value, 0);
    const eventCounts = events.reduce((counts, event) => {
      counts[event.eventType] = (counts[event.eventType] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);
    
    const averageValue = events.length > 0 ? totalValue / events.length : 0;
    const topValueEvents = events
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    return {
      totalValue: Math.round(totalValue * 100) / 100,
      eventCounts,
      averageValue: Math.round(averageValue * 100) / 100,
      topValueEvents
    };
  }
}
