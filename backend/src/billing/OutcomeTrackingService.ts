import { logger } from '../utils/logger.js';

export interface OutcomeEvent {
  id: string;
  tenantId: string;
  type: 'revenue_generated' | 'time_saved' | 'error_prevented' | 'automation_completed';
  value: number;
  metadata: {
    workflowId?: string;
    description?: string;
    timestamp: Date;
    source: 'system' | 'user' | 'ai';
  };
}

export interface OutcomeMetrics {
  valueGenerated: number;
  timeSaved: number;
  errorsPrevented: number;
  revenueInfluenced: number;
  automationPercentage: number;
}

export class OutcomeTrackingService {
  private outcomeEvents: Map<string, OutcomeEvent[]> = new Map();

  async trackOutcome(tenantId: string, event: Omit<OutcomeEvent, 'id' | 'tenantId' | 'metadata'>): Promise<void> {
    const outcomeEvent: OutcomeEvent = {
      id: `outcome_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenantId,
      type: event.type,
      value: event.value,
      metadata: {
        ...event.metadata,
        timestamp: new Date(),
        source: event.metadata?.source || 'system'
      }
    };

    if (!this.outcomeEvents.has(tenantId)) {
      this.outcomeEvents.set(tenantId, []);
    }

    this.outcomeEvents.get(tenantId)!.push(outcomeEvent);

    logger.info(`Outcome tracked for tenant ${tenantId}: ${event.type} = ${event.value}`);
  }

  async calculateOutcomes(tenantId: string, period: 'month' | 'quarter' | 'year' = 'month'): Promise<OutcomeMetrics> {
    const events = this.outcomeEvents.get(tenantId) || [];
    const cutoffDate = this.getCutoffDate(period);

    const filteredEvents = events.filter(event => event.metadata.timestamp >= cutoffDate);

    const metrics: OutcomeMetrics = {
      valueGenerated: 0,
      timeSaved: 0,
      errorsPrevented: 0,
      revenueInfluenced: 0,
      automationPercentage: 0
    };

    for (const event of filteredEvents) {
      switch (event.type) {
        case 'revenue_generated':
          metrics.valueGenerated += event.value;
          metrics.revenueInfluenced += event.value * 1.2; // Assume 20% influence multiplier
          break;
        case 'time_saved':
          metrics.timeSaved += event.value;
          // Convert time saved to monetary value (€50/hour)
          metrics.valueGenerated += event.value * 50;
          break;
        case 'error_prevented':
          metrics.errorsPrevented += event.value;
          // Value each prevented error at €100
          metrics.valueGenerated += event.value * 100;
          break;
        case 'automation_completed':
          // Automation percentage is calculated separately
          break;
      }
    }

    // Calculate automation percentage
    const totalEvents = filteredEvents.length;
    const automationEvents = filteredEvents.filter(e => e.type === 'automation_completed').length;
    if (totalEvents > 0) {
      metrics.automationPercentage = Math.round((automationEvents / totalEvents) * 100);
    }

    return metrics;
  }

  async getOutcomeNarrative(tenantId: string): Promise<string> {
    const metrics = await this.calculateOutcomes(tenantId, 'month');
    
    const narratives: string[] = [];

    if (metrics.valueGenerated > 0) {
      narratives.push(`Generated €${metrics.valueGenerated.toLocaleString()} in value this month`);
    }

    if (metrics.timeSaved > 0) {
      narratives.push(`Saved ${metrics.timeSaved} hours of manual work`);
    }

    if (metrics.errorsPrevented > 0) {
      narratives.push(`Prevented ${metrics.errorsPrevented} costly errors`);
    }

    if (metrics.automationPercentage > 50) {
      narratives.push(`Automated ${metrics.automationPercentage}% of operations`);
    }

    return narratives.join('. ') + '.';
  }

  async predictROI(tenantId: string, inputs: ROICalculationInputs): Promise<ROIPrediction> {
    const currentMetrics = await this.calculateOutcomes(tenantId, 'month');
    
    // AI-powered prediction algorithm
    const baseMultiplier = this.getIndustryMultiplier(inputs.industry);
    const sizeMultiplier = this.getSizeMultiplier(inputs.companySize);
    const useCaseMultiplier = this.getUseCaseMultiplier(inputs.useCase);

    const predictedMonthlyValue = (inputs.expectedWorkflows * 100) * baseMultiplier * sizeMultiplier * useCaseMultiplier;
    const predictedTimeSaved = inputs.expectedWorkflows * 8 * sizeMultiplier; // 8 hours per workflow
    const predictedErrorsPrevented = inputs.expectedWorkflows * 0.5 * useCaseMultiplier;

    const totalPredictedValue = (predictedMonthlyValue * 12) + (predictedTimeSaved * 50) + (predictedErrorsPrevented * 100);
    const breakEvenDays = Math.ceil((299 / (totalPredictedValue / 365))); // Assuming $299 setup cost

    return {
      predictedMonthlySavings: predictedMonthlyValue + (predictedTimeSaved * 50),
      predictedTimeSaved: predictedTimeSaved,
      predictedAutomationRate: Math.min(95, 60 + (inputs.expectedWorkflows * 2)),
      breakEvenDays,
      annualROI: Math.round(((totalPredictedValue - 299) / 299) * 100),
      confidence: this.calculateConfidence(inputs, currentMetrics)
    };
  }

  private getCutoffDate(period: 'month' | 'quarter' | 'year'): Date {
    const now = new Date();
    switch (period) {
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case 'quarter':
        {
          const quarter = Math.floor(now.getMonth() / 3);
          return new Date(now.getFullYear(), quarter * 3, 1);
        }
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
    }
  }

  private getIndustryMultiplier(industry: string): number {
    const multipliers: Record<string, number> = {
      'ecommerce': 1.5,
      'saas': 1.3,
      'finance': 1.8,
      'healthcare': 1.2,
      'manufacturing': 1.4,
      'consulting': 1.1,
      'other': 1.0
    };
    return multipliers[industry] || 1.0;
  }

  private getSizeMultiplier(companySize: string): number {
    const multipliers: Record<string, number> = {
      'solo': 0.8,
      'small': 1.0,
      'medium': 1.3,
      'large': 1.6,
      'enterprise': 2.0
    };
    return multipliers[companySize] || 1.0;
  }

  private getUseCaseMultiplier(useCase: string): number {
    const multipliers: Record<string, number> = {
      'automation': 1.4,
      'integration': 1.2,
      'monitoring': 0.9,
      'reporting': 1.1,
      'ai_workflows': 1.8,
      'other': 1.0
    };
    return multipliers[useCase] || 1.0;
  }

  private calculateConfidence(inputs: ROICalculationInputs, currentMetrics: OutcomeMetrics): number {
    let confidence = 0.7; // Base confidence

    // Increase confidence based on data availability
    if (currentMetrics.valueGenerated > 0) confidence += 0.1;
    if (currentMetrics.timeSaved > 0) confidence += 0.1;
    if (inputs.expectedWorkflows > 10) confidence += 0.05;
    if (inputs.companySize !== 'solo') confidence += 0.05;

    return Math.min(0.95, confidence);
  }
}

export interface ROICalculationInputs {
  companySize: 'solo' | 'small' | 'medium' | 'large' | 'enterprise';
  industry: string;
  useCase: string;
  expectedWorkflows: number;
  currentManualProcesses: number;
  teamSize: number;
}

export interface ROIPrediction {
  predictedMonthlySavings: number;
  predictedTimeSaved: number;
  predictedAutomationRate: number;
  breakEvenDays: number;
  annualROI: number;
  confidence: number;
}
