import { DatabaseConnection } from '../database/connection';
import { TenantMetrics, IndustryAverages, TenantBenchmark } from '../integrations/types';
import { v4 as uuidv4 } from 'uuid';

export class BenchmarkingService {
  private db: DatabaseConnection;
  private industryData: Map<string, IndustryAverages> = new Map();

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeIndustryData();
  }

  private initializeIndustryData(): void {
    // Initialize with industry benchmark data
    this.industryData.set('ecommerce', {
      recoveryRate: 0.72, // 72% average recovery rate
      avgRecoveryTime: 48, // 48 hours average
      revenueProtected: 0.15 // 15% of total revenue
    });

    this.industryData.set('saas', {
      recoveryRate: 0.78, // 78% average recovery rate
      avgRecoveryTime: 36, // 36 hours average
      revenueProtected: 0.18 // 18% of total revenue
    });

    this.industryData.set('marketplace', {
      recoveryRate: 0.68, // 68% average recovery rate
      avgRecoveryTime: 72, // 72 hours average
      revenueProtected: 0.12 // 12% of total revenue
    });

    this.industryData.set('subscription', {
      recoveryRate: 0.82, // 82% average recovery rate
      avgRecoveryTime: 24, // 24 hours average
      revenueProtected: 0.22 // 22% of total revenue
    });

    this.industryData.set('other', {
      recoveryRate: 0.70, // 70% average recovery rate
      avgRecoveryTime: 60, // 60 hours average
      revenueProtected: 0.14 // 14% of total revenue
    });
  }

  async generateTenantBenchmark(tenantId: string, period: string = '30d'): Promise<TenantBenchmark> {
    const tenantMetrics = await this.getTenantMetrics(tenantId, period);
    const industryAverages = await this.getIndustryAverages(tenantMetrics.industry);
    const topPerformers = await this.getTopPerformers(tenantMetrics.industry, period);

    const benchmark: TenantBenchmark = {
      tenantId,
      period,
      recoveryRate: {
        current: tenantMetrics.recoveryRate,
        industry: industryAverages.recoveryRate,
        topQuartile: topPerformers.recoveryRate,
        percentile: this.calculatePercentile(tenantMetrics.recoveryRate, industryAverages.recoveryRate)
      },
      averageRecoveryTime: {
        current: tenantMetrics.avgRecoveryTime,
        industry: industryAverages.avgRecoveryTime,
        topQuartile: topPerformers.avgRecoveryTime
      },
      revenueProtection: {
        current: tenantMetrics.revenueProtected,
        industry: industryAverages.revenueProtected,
        topQuartile: topPerformers.revenueProtected
      },
      recommendations: this.generateRecommendations(tenantMetrics, industryAverages)
    };

    // Store benchmark for historical tracking
    await this.storeBenchmark(benchmark);

    return benchmark;
  }

  private async getTenantMetrics(tenantId: string, period: string): Promise<TenantMetrics> {
    const dateRange = this.getDateRange(period);
    
    // Get recovery analytics
    const recoveryData = await this.db.query(`
      SELECT 
        COUNT(*) as total_recoveries,
        AVG(amount) as avg_amount,
        COUNT(DISTINCT customer_id) as unique_customers,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_recoveries
      FROM recovery_analytics 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
    `, [tenantId, dateRange.start, dateRange.end]);

    // Get tenant info
    const tenantInfo = await this.db.query(`
      SELECT industry, estimated_monthly_revenue 
      FROM tenant_identity 
      WHERE id = $1
    `, [tenantId]);

    const recovery = recoveryData[0] || { total_recoveries: 0, successful_recoveries: 0 };
    const tenant = tenantInfo[0] || { industry: 'other', estimated_monthly_revenue: 0 };

    // Calculate metrics
    const totalRecoveries = recovery.total_recoveries || 0;
    const successfulRecoveries = recovery.successful_recoveries || 0;
    const recoveryRate = totalRecoveries > 0 ? successfulRecoveries / totalRecoveries : 0;

    // Get average recovery time
    const timeData = await this.db.query(`
      SELECT AVG(EXTRACT(EPOCH FROM (completed_at - created_at))/3600) as avg_hours
      FROM flow_executions 
      WHERE tenant_id = $1 
      AND status = 'completed'
      AND created_at BETWEEN $2 AND $3
    `, [tenantId, dateRange.start, dateRange.end]);

    const avgRecoveryTime = (timeData[0]?.avg_hours || 0) * 60; // Convert to minutes

    // Get template usage
    const templateData = await this.db.query(`
      SELECT DISTINCT template_id
      FROM flow_executions 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
    `, [tenantId, dateRange.start, dateRange.end]);

    const templateUsage = templateData.map(row => row.template_id);

    // Calculate revenue protected (estimated)
    const monthlyRevenue = tenant.estimated_monthly_revenue || 0;
    const revenueProtected = monthlyRevenue * recoveryRate * 0.1; // Assume 10% of monthly revenue at risk

    return {
      id: tenantId,
      industry: tenant.industry || 'other',
      recoveryRate,
      avgRecoveryTime,
      revenueProtected,
      templateUsage
    };
  }

  private async getIndustryAverages(industry: string): Promise<IndustryAverages> {
    return this.industryData.get(industry) || this.industryData.get('other')!;
  }

  private async getTopPerformers(industry: string, period: string): Promise<IndustryAverages> {
    const dateRange = this.getDateRange(period);
    
    // Get top quartile performers in the industry
    const topPerformers = await this.db.query(`
      SELECT 
        AVG(recovery_rate) as avg_recovery_rate,
        AVG(avg_recovery_time) as avg_recovery_time,
        AVG(revenue_protected) as avg_revenue_protected
      FROM tenant_benchmarks tb
      JOIN tenant_identity ti ON tb.tenant_id = ti.id
      WHERE ti.industry = $1
      AND tb.period = $2
      AND tb.recovery_rate >= (
        SELECT percentile_cont(0.75) WITHIN GROUP (ORDER BY recovery_rate)
        FROM tenant_benchmarks tb2
        JOIN tenant_identity ti2 ON tb2.tenant_id = ti2.id
        WHERE ti2.industry = $1 AND tb2.period = $2
      )
    `, [industry, period]);

    const result = topPerformers[0];

    return {
      recoveryRate: result?.avg_recovery_rate || 0.85,
      avgRecoveryTime: result?.avg_recovery_time || 24,
      revenueProtected: result?.avg_revenue_protected || 0.20
    };
  }

  private calculatePercentile(currentValue: number, industryAverage: number): number {
    // Simple percentile calculation based on deviation from industry average
    const deviation = (currentValue - industryAverage) / industryAverage;
    
    if (deviation < -0.2) return 10; // Bottom 10%
    if (deviation < -0.1) return 25; // Bottom quartile
    if (deviation < 0) return 40; // Below average
    if (deviation < 0.1) return 60; // Above average
    if (deviation < 0.2) return 75; // Top quartile
    return 90; // Top 10%
  }

  private generateRecommendations(tenant: TenantMetrics, industry: IndustryAverages): string[] {
    const recommendations = [];

    // Recovery rate recommendations
    if (tenant.recoveryRate < industry.recoveryRate * 0.9) {
      recommendations.push('Consider enabling smart retry scheduling to improve recovery rates');
      recommendations.push('Review and optimize your dunning email templates');
    }

    if (tenant.recoveryRate < industry.recoveryRate * 0.7) {
      recommendations.push('Your recovery rate is significantly below industry average');
      recommendations.push('Consider adding more payment methods to reduce failures');
    }

    // Recovery time recommendations
    if (tenant.avgRecoveryTime > industry.avgRecoveryTime * 1.5) {
      recommendations.push('Optimize notification timing to reduce recovery time');
      recommendations.push('Consider implementing real-time payment failure alerts');
    }

    // Template usage recommendations
    if (tenant.templateUsage.length < 3) {
      recommendations.push('Deploy additional templates from the marketplace to expand coverage');
      recommendations.push('Consider industry-specific templates for better results');
    }

    // Revenue protection recommendations
    if (tenant.revenueProtected < industry.revenueProtected * 0.8) {
      recommendations.push('Expand integration coverage to protect more revenue');
      recommendations.push('Review your current integrations for optimization opportunities');
    }

    // Positive reinforcement
    if (tenant.recoveryRate > industry.recoveryRate * 1.1) {
      recommendations.push('Excellent recovery rate! Consider sharing your success story');
    }

    if (tenant.avgRecoveryTime < industry.avgRecoveryTime * 0.8) {
      recommendations.push('Great recovery time! Your processes are highly efficient');
    }

    return recommendations;
  }

  private async storeBenchmark(benchmark: TenantBenchmark): Promise<void> {
    await this.db.query(`
      INSERT INTO tenant_benchmarks (
        id, tenant_id, period, recovery_rate, industry_average, top_quartile, percentile,
        avg_recovery_time, industry_avg_time, top_quartile_time,
        revenue_protected, industry_revenue, top_quartile_revenue,
        recommendations, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
      ON CONFLICT (tenant_id, period) DO UPDATE SET
        recovery_rate = $4,
        industry_average = $5,
        top_quartile = $6,
        percentile = $7,
        avg_recovery_time = $8,
        industry_avg_time = $9,
        top_quartile_time = $10,
        revenue_protected = $11,
        industry_revenue = $12,
        top_quartile_revenue = $13,
        recommendations = $14,
        created_at = NOW()
    `, [
      uuidv4(),
      benchmark.tenantId,
      benchmark.period,
      benchmark.recoveryRate.current,
      benchmark.recoveryRate.industry,
      benchmark.recoveryRate.topQuartile,
      benchmark.recoveryRate.percentile,
      benchmark.averageRecoveryTime.current,
      benchmark.averageRecoveryTime.industry,
      benchmark.averageRecoveryTime.topQuartile,
      benchmark.revenueProtection.current,
      benchmark.revenueProtection.industry,
      benchmark.revenueProtection.topQuartile,
      JSON.stringify(benchmark.recommendations)
    ]);
  }

  async getHistoricalBenchmarks(tenantId: string, periods: number = 12): Promise<TenantBenchmark[]> {
    const benchmarks = await this.db.query(`
      SELECT * FROM tenant_benchmarks 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [tenantId, periods]);

    return benchmarks.map(row => ({
      tenantId: row.tenant_id,
      period: row.period,
      recoveryRate: {
        current: row.recovery_rate,
        industry: row.industry_average,
        topQuartile: row.top_quartile,
        percentile: row.percentile
      },
      averageRecoveryTime: {
        current: row.avg_recovery_time,
        industry: row.industry_avg_time,
        topQuartile: row.top_quartile_time
      },
      revenueProtection: {
        current: row.revenue_protected,
        industry: row.industry_revenue,
        topQuartile: row.top_quartile_revenue
      },
      recommendations: row.recommendations
    }));
  }

  async getIndustryLeaderboard(industry: string, period: string = '30d'): Promise<any[]> {
    const leaderboard = await this.db.query(`
      SELECT 
        ti.name as tenant_name,
        tb.recovery_rate,
        tb.percentile,
        tb.avg_recovery_time,
        tb.revenue_protected
      FROM tenant_benchmarks tb
      JOIN tenant_identity ti ON tb.tenant_id = ti.id
      WHERE ti.industry = $1
      AND tb.period = $2
      ORDER BY tb.recovery_rate DESC, tb.percentile DESC
      LIMIT 20
    `, [industry, period]);

    return leaderboard.map((row, index) => ({
      rank: index + 1,
      tenantName: row.tenant_name,
      recoveryRate: row.recovery_rate,
      percentile: row.percentile,
      avgRecoveryTime: row.avg_recovery_time,
      revenueProtected: row.revenue_protected
    }));
  }

  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = new Date();

    switch (period) {
      case '7d':
        start.setDate(end.getDate() - 7);
        break;
      case '30d':
        start.setDate(end.getDate() - 30);
        break;
      case '90d':
        start.setDate(end.getDate() - 90);
        break;
      case '1y':
        start.setFullYear(end.getFullYear() - 1);
        break;
      default:
        start.setDate(end.getDate() - 30);
    }

    return { start, end };
  }

  async updateIndustryData(industry: string, averages: IndustryAverages): Promise<void> {
    this.industryData.set(industry, averages);
    
    // In a real implementation, this would update a database table
    console.log(`Updated industry data for ${industry}:`, averages);
  }
}
