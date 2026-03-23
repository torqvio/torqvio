import { DatabaseConnection } from '../database/connection.js';
import { RecoveryAnalyticsModel } from '../database/RecoveryAnalyticsModel.js';

export interface CounterfactualImpact {
  date: Date;
  actual: {
    totalTransactions: number;
    failedTransactions: number;
    recoveredAmount: number;
  };
  counterfactual: {
    projectedFailures: number;
    projectedLoss: number;
  };
  impact: {
    preventedLoss: number;
    efficiencyScore: number;
    confidenceScore: number;
    interventionImpact: number;
  };
}

export interface RevenueIdentity {
  totalRevenueProtected: number;
  recoveryStory: string;
  trustScore: number;
  efficiencyScore: number;
  milestones: Array<{
    type: string;
    value: number;
    description: string;
    date: string;
  }>;
}

export interface TenantInfo {
  projectName: string;
  industry: string;
  revenueTier: string;
  baselineFailureRate?: number;
}

export class CounterfactualEngine {
  constructor(
    private db: DatabaseConnection,
    private analyticsModel: RecoveryAnalyticsModel
  ) {}

  async calculateCounterfactualImpact(projectId: string, date: Date): Promise<CounterfactualImpact> {
    // 1. Get actual performance data
    const actualData = await this.getActualPerformanceData(projectId, date);
    
    // 2. Calculate baseline failure rate (industry average or historical)
    const baselineFailureRate = await this.getBaselineFailureRate(projectId, date);
    
    // 3. Project counterfactual scenario (what would happen without Torqvio)
    const counterfactualFailures = Math.floor(
      actualData.totalTransactions * baselineFailureRate
    );
    
    const averageTransactionValue = actualData.totalTransactions > 0 
      ? (actualData.failedAmount + actualData.recoveredAmount) / actualData.totalTransactions
      : 0;
    
    const counterfactualLoss = counterfactualFailures * averageTransactionValue;
    
    // 4. Calculate prevented loss
    const actualLoss = actualData.failedAmount - actualData.recoveredAmount;
    const preventedLoss = counterfactualLoss - actualLoss;
    
    // 5. Calculate efficiency score
    const efficiencyScore = this.calculateEfficiencyScore(
      actualData.recoveredAmount,
      counterfactualLoss,
      actualData.retryAttempts
    );
    
    // 6. Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(
      actualData.totalTransactions,
      baselineFailureRate
    );
    
    const impact: CounterfactualImpact = {
      date,
      actual: {
        totalTransactions: actualData.totalTransactions,
        failedTransactions: actualData.failedTransactions,
        recoveredAmount: actualData.recoveredAmount
      },
      counterfactual: {
        projectedFailures: counterfactualFailures,
        projectedLoss: counterfactualLoss
      },
      impact: {
        preventedLoss,
        efficiencyScore,
        confidenceScore,
        interventionImpact: counterfactualLoss > 0 ? preventedLoss / counterfactualLoss : 0
      }
    };

    // Store the counterfactual analytics
    await this.storeCounterfactualAnalytics(projectId, date, impact);
    
    return impact;
  }

  private async getActualPerformanceData(projectId: string, date: Date): Promise<{
    totalTransactions: number;
    failedTransactions: number;
    recoveredAmount: number;
    failedAmount: number;
    retryAttempts: number;
  }> {
    // Get today's recovery analytics
    const todayStats = await this.analyticsModel.getTodayRecoveryStats(projectId);
    
    // For demonstration, we'll simulate some transaction data
    // In a real implementation, this would come from actual transaction logs
    const totalTransactions = Math.max(todayStats.retryAttempts + todayStats.successfulRetries, 100);
    const failedTransactions = todayStats.retryAttempts;
    const recoveredAmount = todayStats.totalRecovered;
    const failedAmount = todayStats.totalFailed;
    const retryAttempts = todayStats.retryAttempts;

    return {
      totalTransactions,
      failedTransactions,
      recoveredAmount,
      failedAmount,
      retryAttempts
    };
  }

  private async getBaselineFailureRate(projectId: string, date: Date): Promise<number> {
    // Strategy: Use industry average or historical pre-Torqvio baseline
    const tenantInfo = await this.getTenantInfo(projectId);
    
    // Check if we have historical data
    const historicalData = await this.getHistoricalBaseline(projectId, date);
    
    if (historicalData && historicalData.transactions > 100) {
      return historicalData.failureRate;
    }
    
    // Fallback to industry averages
    const industryAverages = {
      'saas': 0.029,      // 2.9% payment failure rate
      'ecommerce': 0.042,  // 4.2% payment failure rate
      'subscription': 0.036, // 3.6% payment failure rate
      'default': 0.035     // 3.5% average
    };
    
    return industryAverages[tenantInfo.industry as keyof typeof industryAverages] || industryAverages.default;
  }

  private async getTenantInfo(projectId: string): Promise<TenantInfo> {
    const query = `
      SELECT p.name as project_name, ti.industry, ti.revenue_tier
      FROM projects p
      LEFT JOIN tenant_identity ti ON p.id = ti.project_id
      WHERE p.id = $1
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    return {
      projectName: result?.project_name || 'Unknown',
      industry: result?.industry || 'default',
      revenueTier: result?.revenue_tier || 'startup'
    };
  }

  private async getHistoricalBaseline(projectId: string, date: Date): Promise<{ transactions: number; failureRate: number } | null> {
    // Look for historical data before Torqvio was implemented
    // For now, return null to use industry averages
    // In a real implementation, this would query pre-Torqvio transaction data
    return null;
  }

  private calculateEfficiencyScore(
    recovered: number,
    potentialLoss: number,
    retryAttempts: number
  ): number {
    // Efficiency = (Recovered / Potential Loss) * (1 / Retry Attempts Factor)
    if (potentialLoss === 0) return 0;
    
    const recoveryRatio = recovered / potentialLoss;
    const retryEfficiency = Math.max(0.1, 1 - (retryAttempts * 0.1)); // Penalize excessive retries
    
    return Math.min(1, recoveryRatio * retryEfficiency);
  }

  private calculateConfidenceScore(
    totalTransactions: number,
    baselineFailureRate: number
  ): number {
    // Confidence based on sample size and baseline stability
    const sampleSizeConfidence = Math.min(1, totalTransactions / 1000); // More transactions = higher confidence
    const baselineStability = 1 - Math.abs(baselineFailureRate - 0.035); // Closer to average = more stable
    
    return (sampleSizeConfidence + baselineStability) / 2;
  }

  private async storeCounterfactualAnalytics(projectId: string, date: Date, impact: CounterfactualImpact): Promise<void> {
    const query = `
      INSERT INTO counterfactual_analytics (
        project_id, date, total_transactions, failed_transactions, recovered_transactions, recovered_amount,
        baseline_failure_rate, counterfactual_failures, counterfactual_loss, prevented_loss,
        recovery_efficiency_score, confidence_score, intervention_impact
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      ON CONFLICT (project_id, date) DO UPDATE SET
        total_transactions = EXCLUDED.total_transactions,
        failed_transactions = EXCLUDED.failed_transactions,
        recovered_transactions = EXCLUDED.recovered_transactions,
        recovered_amount = EXCLUDED.recovered_amount,
        baseline_failure_rate = EXCLUDED.baseline_failure_rate,
        counterfactual_failures = EXCLUDED.counterfactual_failures,
        counterfactual_loss = EXCLUDED.counterfactual_loss,
        prevented_loss = EXCLUDED.prevented_loss,
        recovery_efficiency_score = EXCLUDED.recovery_efficiency_score,
        confidence_score = EXCLUDED.confidence_score,
        intervention_impact = EXCLUDED.intervention_impact,
        updated_at = NOW()
    `;
    
    await this.db.query(query, [
      projectId,
      date.toISOString().split('T')[0],
      impact.actual.totalTransactions,
      impact.actual.failedTransactions,
      Math.floor(impact.actual.recoveredAmount / 100), // Estimate recovered transactions
      impact.actual.recoveredAmount,
      await this.getBaselineFailureRate(projectId, date),
      impact.counterfactual.projectedFailures,
      impact.counterfactual.projectedLoss,
      impact.impact.preventedLoss,
      impact.impact.efficiencyScore,
      impact.impact.confidenceScore,
      impact.impact.interventionImpact
    ]);
  }

  async calculateImpactSummary(projectId: string, days: number): Promise<{
    totalRecovered: number;
    totalPreventedLoss: number;
    averageEfficiencyScore: number;
    averageConfidenceScore: number;
    revenueProtectionScore: number;
    customersProtected: number;
  }> {
    const query = `
      SELECT 
        COALESCE(SUM(recovered_amount), 0) as total_recovered,
        COALESCE(SUM(prevented_loss), 0) as total_prevented_loss,
        COALESCE(AVG(recovery_efficiency_score), 0) as avg_efficiency_score,
        COALESCE(AVG(confidence_score), 0) as avg_confidence_score,
        COALESCE(SUM(counterfactual_failures), 0) as total_failures_prevented
      FROM counterfactual_analytics
      WHERE project_id = $1 AND date >= CURRENT_DATE - INTERVAL '${days} days'
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    const totalRecovered = parseFloat(result.total_recovered) || 0;
    const totalPreventedLoss = parseFloat(result.total_prevented_loss) || 0;
    const averageEfficiencyScore = parseFloat(result.avg_efficiency_score) || 0;
    const averageConfidenceScore = parseFloat(result.avg_confidence_score) || 0;
    const customersProtected = parseInt(result.total_failures_prevented) || 0;
    
    // Revenue Protection Score: Combined measure of recovery and prevention
    const totalProtection = totalRecovered + totalPreventedLoss;
    const revenueProtectionScore = averageEfficiencyScore * averageConfidenceScore;
    
    return {
      totalRecovered,
      totalPreventedLoss,
      averageEfficiencyScore,
      averageConfidenceScore,
      revenueProtectionScore,
      customersProtected
    };
  }

  async generateRevenueIdentity(projectId: string): Promise<RevenueIdentity> {
    const analytics = await this.analyticsModel.getRecoveryStats(projectId, 30);
    const impactSummary = await this.calculateImpactSummary(projectId, 30);
    
    const totalProtected = analytics.totalRecovered + impactSummary.totalPreventedLoss;
    const efficiencyScore = impactSummary.averageEfficiencyScore;
    
    // Generate AI-powered recovery story
    const recoveryStory = await this.generateRecoveryStory(
      analytics,
      impactSummary,
      efficiencyScore
    );
    
    return {
      totalRevenueProtected: totalProtected,
      recoveryStory,
      trustScore: this.calculateTrustScore(analytics, impactSummary),
      efficiencyScore,
      milestones: await this.identifyMilestones(projectId)
    };
  }

  private async generateRecoveryStory(
    analytics: any,
    counterfactualData: any,
    efficiencyScore: number
  ): Promise<string> {
    // AI-generated narrative based on actual performance
    const stories = [
      `In the last 30 days, Torqvio protected €${(analytics.totalRecovered + counterfactualData.totalPreventedLoss).toLocaleString()} of your revenue, 
       achieving a ${(efficiencyScore * 100).toFixed(1)}% efficiency rate in preventing payment failures.`,
      
      `Your payment system operates at a ${(100 - analytics.recoveryRate).toFixed(1)}% failure rate without intervention. 
       Torqvio's automated recovery prevented €${counterfactualData.totalPreventedLoss.toLocaleString()} in potential losses.`,
       
      `With ${analytics.retryAttempts} intelligent retry attempts, Torqvio achieved a ${analytics.recoveryRate.toFixed(1)}% recovery rate, 
       transforming ${analytics.totalFailed} potential failures into successful transactions.`
    ];
    
    return stories[Math.floor(Math.random() * stories.length)];
  }

  private calculateTrustScore(analytics: any, counterfactualData: any): number {
    // Trust score based on consistency and reliability
    const consistencyScore = analytics.recoveryRate > 50 ? 0.8 : 0.4;
    const efficiencyScore = counterfactualData.averageEfficiencyScore;
    const confidenceScore = counterfactualData.averageConfidenceScore;
    
    return (consistencyScore + efficiencyScore + confidenceScore) / 3;
  }

  private async identifyMilestones(projectId: string): Promise<Array<{
    type: string;
    value: number;
    description: string;
    date: string;
  }>> {
    const query = `
      SELECT milestone_type, milestone_value, milestone_description, created_at
      FROM revenue_identity_timeline
      WHERE project_id = $1
      ORDER BY created_at DESC
      LIMIT 10
    `;
    
    const milestones = await this.db.query(query, [projectId]);
    
    return milestones.map(milestone => ({
      type: milestone.milestone_type,
      value: parseFloat(milestone.milestone_value) || 0,
      description: milestone.milestone_description || '',
      date: milestone.created_at
    }));
  }

  async recordMilestone(projectId: string, type: string, value: number, description: string): Promise<void> {
    const impactSummary = await this.calculateImpactSummary(projectId, 30);
    
    const query = `
      INSERT INTO revenue_identity_timeline (
        project_id, milestone_type, milestone_value, milestone_description,
        cumulative_recovered, cumulative_prevented_loss, efficiency_score_at_milestone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    
    await this.db.query(query, [
      projectId,
      type,
      value,
      description,
      impactSummary.totalRecovered,
      impactSummary.totalPreventedLoss,
      impactSummary.averageEfficiencyScore
    ]);
  }
}
