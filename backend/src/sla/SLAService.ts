import { DatabaseConnection } from '../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface SLAMetrics {
  period: string;
  uptime: {
    actual: number;
    target: number;
    status: 'met' | 'missed';
  };
  recoverySuccess: {
    actual: number;
    target: number;
    status: 'met' | 'missed';
  };
  responseTime: {
    actual: number;
    target: number;
    status: 'met' | 'missed';
  };
  errorRate: {
    actual: number;
    target: number;
    status: 'met' | 'missed';
  };
  overall: number;
}

export interface SLAReport {
  tenantId: string;
  period: string;
  metrics: SLAMetrics;
  violations: SLAViolation[];
  credits: number;
  status: 'healthy' | 'degraded' | 'critical';
}

export interface SLAViolation {
  id: string;
  metricType: string;
  actualValue: number;
  targetValue: number;
  violationDuration: number; // minutes
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolvedAt?: Date;
  serviceCredits: number;
  createdAt: Date;
}

export class SLAService {
  private db: DatabaseConnection;

  constructor(db: DatabaseConnection) {
    this.db = db;
  }

  async calculateSLAMetrics(tenantId: string, period: string): Promise<SLAMetrics> {
    const now = new Date();
    const periodStart = this.getPeriodStart(now, period);

    const metrics = await Promise.all([
      this.getUptimeMetrics(tenantId, periodStart, now),
      this.getRecoveryMetrics(tenantId, periodStart, now),
      this.getResponseTimeMetrics(tenantId, periodStart, now),
      this.getErrorRateMetrics(tenantId, periodStart, now)
    ]);

    const [uptime, recovery, responseTime, errorRate] = metrics;

    const slaMetrics: SLAMetrics = {
      period,
      uptime: {
        actual: uptime.percentage,
        target: 99.9,
        status: uptime.percentage >= 99.9 ? 'met' : 'missed'
      },
      recoverySuccess: {
        actual: recovery.successRate,
        target: 95.0,
        status: recovery.successRate >= 95.0 ? 'met' : 'missed'
      },
      responseTime: {
        actual: responseTime.p95,
        target: 500, // ms
        status: responseTime.p95 <= 500 ? 'met' : 'missed'
      },
      errorRate: {
        actual: errorRate.percentage,
        target: 0.1, // %
        status: errorRate.percentage <= 0.1 ? 'met' : 'missed'
      },
      overall: this.calculateOverallSLA([uptime.percentage, recovery.successRate, responseTime.p95 <= 500 ? 100 : 0, 100 - errorRate.percentage])
    };

    // Store metrics
    await this.storeSLAMetrics(tenantId, slaMetrics);

    return slaMetrics;
  }

  async generateSLAReport(tenantId: string, period: string = '30d'): Promise<SLAReport> {
    const metrics = await this.calculateSLAMetrics(tenantId, period);
    const violations = await this.getSLAViolations(tenantId, period);
    const credits = await this.calculateServiceCredits(violations);

    const status = this.determineSLAStatus(metrics);

    const report: SLAReport = {
      tenantId,
      period,
      metrics,
      violations,
      credits,
      status
    };

    // Store report
    await this.storeSLAReport(report);

    return report;
  }

  private async getUptimeMetrics(tenantId: string, start: Date, end: Date): Promise<{ percentage: number }> {
    // For demo purposes, simulate uptime monitoring
    // In production, this would integrate with actual monitoring systems
    
    // Get system health checks
    const healthChecks = await this.db.query(`
      SELECT COUNT(*) as total_checks,
             COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_checks
      FROM system_health 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
    `, [tenantId, start, end]);

    const result = healthChecks[0] || { total_checks: 100, healthy_checks: 99 };
    
    const percentage = result.total_checks > 0 ? (result.healthy_checks / result.total_checks) * 100 : 99.9;

    return { percentage: Math.min(percentage, 100) };
  }

  private async getRecoveryMetrics(tenantId: string, start: Date, end: Date): Promise<{ successRate: number }> {
    // Get recovery success metrics
    const recoveryData = await this.db.query(`
      SELECT COUNT(*) as total_attempts,
             COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_attempts
      FROM recovery_analytics 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
    `, [tenantId, start, end]);

    const result = recoveryData[0] || { total_attempts: 100, successful_attempts: 95 };
    
    const successRate = result.total_attempts > 0 ? (result.successful_attempts / result.total_attempts) * 100 : 95.0;

    return { successRate };
  }

  private async getResponseTimeMetrics(tenantId: string, start: Date, end: Date): Promise<{ p95: number }> {
    // Get API response time metrics
    const responseTimeData = await this.db.query(`
      SELECT response_time_ms
      FROM api_metrics 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
      ORDER BY response_time_ms ASC
    `, [tenantId, start, end]);

    const responseTimes = responseTimeData.map(row => row.response_time_ms);
    
    if (responseTimes.length === 0) {
      return { p95: 250 }; // Default good response time
    }

    // Calculate 95th percentile
    const p95Index = Math.floor(responseTimes.length * 0.95);
    const p95 = responseTimes[p95Index] || 450;

    return { p95 };
  }

  private async getErrorRateMetrics(tenantId: string, start: Date, end: Date): Promise<{ percentage: number }> {
    // Get error rate metrics
    const errorData = await this.db.query(`
      SELECT COUNT(*) as total_requests,
             COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_requests
      FROM api_metrics 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
    `, [tenantId, start, end]);

    const result = errorData[0] || { total_requests: 10000, error_requests: 5 };
    
    const percentage = result.total_requests > 0 ? (result.error_requests / result.total_requests) * 100 : 0.05;

    return { percentage };
  }

  private calculateOverallSLA(metricValues: number[]): number {
    // Calculate overall SLA as weighted average
    const weights = [0.4, 0.3, 0.2, 0.1]; // Uptime, Recovery, Response Time, Error Rate
    
    const weightedSum = metricValues.reduce((sum, value, index) => {
      const weight = weights[index];
      return sum + (value * (weight || 0));
    }, 0);

    return Math.min(weightedSum, 100);
  }

  private determineSLAStatus(metrics: SLAMetrics): 'healthy' | 'degraded' | 'critical' {
    const missedMetrics = [
      metrics.uptime.status === 'missed',
      metrics.recoverySuccess.status === 'missed',
      metrics.responseTime.status === 'missed',
      metrics.errorRate.status === 'missed'
    ].filter(Boolean).length;

    if (missedMetrics === 0) return 'healthy';
    if (missedMetrics <= 2) return 'degraded';
    return 'critical';
  }

  private async getSLAViolations(tenantId: string, period: string): Promise<SLAViolation[]> {
    const dateRange = this.getDateRange(period);
    
    const violations = await this.db.query(`
      SELECT * FROM sla_violations 
      WHERE tenant_id = $1 
      AND created_at BETWEEN $2 AND $3
      ORDER BY created_at DESC
    `, [tenantId, dateRange.start, dateRange.end]);

    return violations.map(row => ({
      id: row.id,
      metricType: row.metric_type,
      actualValue: row.actual_value,
      targetValue: row.target_value,
      violationDuration: row.violation_duration,
      severity: row.severity,
      resolvedAt: row.resolved_at,
      serviceCredits: row.service_credits,
      createdAt: row.created_at
    }));
  }

  private async calculateServiceCredits(violations: SLAViolation[]): Promise<number> {
    return violations.reduce((total, violation) => {
      return total + violation.serviceCredits;
    }, 0);
  }

  private async storeSLAMetrics(tenantId: string, metrics: SLAMetrics): Promise<void> {
    await this.db.query(`
      INSERT INTO sla_metrics (
        id, tenant_id, period, uptime_actual, uptime_target, uptime_status,
        recovery_success_actual, recovery_success_target, recovery_success_status,
        response_time_actual, response_time_target, response_time_status,
        error_rate_actual, error_rate_target, error_rate_status,
        overall_sla, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW())
      ON CONFLICT (tenant_id, period) DO UPDATE SET
        uptime_actual = $4, uptime_status = $6,
        recovery_success_actual = $7, recovery_success_status = $9,
        response_time_actual = $10, response_time_status = $12,
        error_rate_actual = $13, error_rate_status = $15,
        overall_sla = $16, created_at = NOW()
    `, [
      uuidv4(),
      tenantId,
      metrics.period,
      metrics.uptime.actual,
      metrics.uptime.target,
      metrics.uptime.status,
      metrics.recoverySuccess.actual,
      metrics.recoverySuccess.target,
      metrics.recoverySuccess.status,
      metrics.responseTime.actual,
      metrics.responseTime.target,
      metrics.responseTime.status,
      metrics.errorRate.actual,
      metrics.errorRate.target,
      metrics.errorRate.status,
      metrics.overall
    ]);
  }

  private async storeSLAReport(report: SLAReport): Promise<void> {
    // Store summary of the report for historical tracking
    await this.db.query(`
      INSERT INTO sla_reports (
        id, tenant_id, period, overall_sla, status, violations_count, service_credits, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      ON CONFLICT (tenant_id, period) DO UPDATE SET
        overall_sla = $4, status = $5, violations_count = $6, service_credits = $7, created_at = NOW()
    `, [
      uuidv4(),
      report.tenantId,
      report.period,
      report.metrics.overall,
      report.status,
      report.violations.length,
      report.credits
    ]);
  }

  async monitorSLACompliance(): Promise<void> {
    // Get all active tenants
    const tenants = await this.db.query(`
      SELECT id FROM tenant_identity WHERE status = 'active'
    `);

    for (const tenant of tenants) {
      try {
        const report = await this.generateSLAReport(tenant.id, '24h'); // Daily check
        
        // Check for critical violations
        const criticalViolations = report.violations.filter(v => v.severity === 'critical');
        
        if (criticalViolations.length > 0) {
          // TODO: Send alert notification
          console.log(`Critical SLA violations detected for tenant ${tenant.id}:`, criticalViolations);
        }

        // Auto-resolve old violations
        await this.resolveOldViolations(tenant.id);
      } catch (error) {
        console.error(`Failed to monitor SLA for tenant ${tenant.id}:`, error);
      }
    }
  }

  private async resolveOldViolations(tenantId: string): Promise<void> {
    // Resolve violations older than 24 hours
    await this.db.query(`
      UPDATE sla_violations 
      SET resolved_at = NOW() 
      WHERE tenant_id = $1 
      AND resolved_at IS NULL 
      AND created_at < NOW() - INTERVAL '24 hours'
    `, [tenantId]);
  }

  async logSLAViolation(
    tenantId: string,
    metricType: string,
    actualValue: number,
    targetValueParam: number,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<void> {
    const violationDuration = this.calculateViolationDuration(metricType, actualValue, targetValueParam);
    const serviceCredits = this.calculateServiceCreditsForViolation(severity, violationDuration);

    await this.db.query(`
      INSERT INTO sla_violations (
        id, tenant_id, metric_type, actual_value, target_value, 
        violation_duration, severity, service_credits, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    `, [
      uuidv4(),
      tenantId,
      metricType,
      actualValue,
      targetValueParam,
      violationDuration,
      severity,
      serviceCredits
    ]);
  }

  private calculateViolationDuration(metricType: string, actualValue: number, targetValueParam: number): number {
    // Estimate violation duration based on how much the target is missed
    const deviation = Math.abs(actualValue - targetValueParam);
    const target = targetValueParam;

    if (metricType.includes('uptime') || metricType.includes('recovery')) {
      // Percentage metrics - each 1% deviation = 10 minutes
      return deviation * 10;
    } else if (metricType.includes('response_time')) {
      // Response time - each 100ms deviation = 5 minutes
      return (deviation / 100) * 5;
    } else {
      // Default calculation
      return deviation * 5;
    }
  }

  private calculateServiceCreditsForViolation(severity: string, duration: number): number {
    const creditRates = {
      low: 0.01,    // $0.01 per minute
      medium: 0.05, // $0.05 per minute
      high: 0.10,   // $0.10 per minute
      critical: 0.25 // $0.25 per minute
    };

    const rate = creditRates[severity as keyof typeof creditRates] || 0.05;
    return duration * rate;
  }

  private getPeriodStart(now: Date, period: string): Date {
    const start = new Date(now);

    switch (period) {
      case '1h':
        start.setHours(start.getHours() - 1);
        break;
      case '24h':
        start.setDate(start.getDate() - 1);
        break;
      case '7d':
        start.setDate(start.getDate() - 7);
        break;
      case '30d':
        start.setDate(start.getDate() - 30);
        break;
      case '90d':
        start.setDate(start.getDate() - 90);
        break;
      default:
        start.setDate(start.getDate() - 30);
    }

    return start;
  }

  private getDateRange(period: string): { start: Date; end: Date } {
    const end = new Date();
    const start = this.getPeriodStart(end, period);
    return { start, end };
  }

  async getSLATrends(tenantId: string, periods: number = 12): Promise<any[]> {
    const trends = await this.db.query(`
      SELECT * FROM sla_metrics 
      WHERE tenant_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2
    `, [tenantId, periods]);

    return trends.map(row => ({
      period: row.period,
      overallSLA: row.overall_sla,
      uptime: row.uptime_actual,
      recoverySuccess: row.recovery_success_actual,
      responseTime: row.response_time_actual,
      errorRate: row.error_rate_actual,
      status: this.determineSLAStatus({
        period: row.period,
        uptime: { actual: row.uptime_actual, target: row.uptime_target, status: row.uptime_status },
        recoverySuccess: { actual: row.recovery_success_actual, target: row.recovery_success_target, status: row.recovery_success_status },
        responseTime: { actual: row.response_time_actual, target: row.response_time_target, status: row.response_time_status },
        errorRate: { actual: row.error_rate_actual, target: row.error_rate_target, status: row.error_rate_status },
        overall: row.overall_sla
      }),
      createdAt: row.created_at
    }));
  }
}
