import { DatabaseConnection } from '../database/connection.js';
import { CounterfactualEngine } from '../engine/CounterfactualEngine.js';
import { EnhancedNotificationService } from '../notifications/EnhancedNotificationService.js';
import { TenantIdentityModel } from '../database/TenantIdentityModel.js';
import { v4 as uuidv4 } from 'uuid';

export interface WeeklyReport {
  companyName: string;
  weekPeriod: string;
  headline: string;
  metrics: {
    recovered: number;
    prevented: number;
    efficiency: number;
    customersProtected: number;
  };
  chart: {
    type: string;
    data: {
      labels: string[];
      datasets: Array<{
        label: string;
        data: number[];
        backgroundColor: string;
        borderColor: string;
        borderWidth: number;
      }>;
    };
  };
  branding: {
    poweredBy: string;
    logo: string;
    shareable: boolean;
  };
  shareUrl?: string;
  reportId: string;
  generatedAt: string;
}

export interface ShareableReport {
  id: string;
  projectId: string;
  reportData: WeeklyReport;
  shareToken: string;
  expiresAt: Date;
  accessCount: number;
  createdAt: Date;
}

export class WeeklyReportGenerator {
  constructor(
    private db: DatabaseConnection,
    private counterfactualEngine: CounterfactualEngine,
    private notificationService: EnhancedNotificationService,
    private tenantIdentityModel: TenantIdentityModel
  ) {}

  async generateWeeklyReport(projectId: string): Promise<WeeklyReport> {
    const impactData = await this.counterfactualEngine.calculateImpactSummary(projectId, 7);
    const identity = await this.counterfactualEngine.generateRevenueIdentity(projectId);
    const tenantInfo = await this.tenantIdentityModel.getTenantInfo(projectId);
    
    const report: WeeklyReport = {
      companyName: tenantInfo.companyName,
      weekPeriod: this.getWeekPeriod(),
      headline: `Torqvio protected €${impactData.totalPreventedLoss.toLocaleString()} for ${tenantInfo.companyName} this week`,
      metrics: {
        recovered: impactData.totalRecovered,
        prevented: impactData.totalPreventedLoss,
        efficiency: impactData.averageEfficiencyScore,
        customersProtected: impactData.customersProtected
      },
      chart: {
        type: 'bar',
        data: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          datasets: [{
            label: 'Revenue Protected',
            data: await this.getDailyProtectionData(projectId, 7),
            backgroundColor: 'rgba(147, 51, 234, 0.5)',
            borderColor: 'rgba(147, 51, 234, 1)',
            borderWidth: 2
          }]
        }
      },
      branding: {
        poweredBy: "Powered by Torqvio",
        logo: "/torqvio-logo.png",
        shareable: true
      },
      reportId: uuidv4(),
      generatedAt: new Date().toISOString()
    };
    
    return report;
  }

  async generateAndSendWeeklyReport(projectId: string): Promise<WeeklyReport> {
    const report = await this.generateWeeklyReport(projectId);
    
    // Send notification
    await this.notificationService.sendWeeklyReport(projectId);
    
    // Record milestone if significant
    if (report.metrics.prevented > 1000) {
      await this.counterfactualEngine.recordMilestone(
        projectId,
        'weekly_protection_milestone',
        report.metrics.prevented,
        `Protected €${report.metrics.prevented.toLocaleString()} in revenue this week`
      );
    }
    
    return report;
  }

  async createShareableReport(projectId: string, report: WeeklyReport): Promise<string> {
    const shareToken = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    
    const query = `
      INSERT INTO shareable_reports (id, project_id, report_data, expires_at, share_token)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING share_token
    `;
    
    const [result] = await this.db.query(query, [
      report.reportId,
      projectId,
      JSON.stringify(report),
      expiresAt,
      shareToken
    ]);
    
    const shareUrl = `${process.env.FRONTEND_URL || 'https://torqvio.com'}/reports/${shareToken}`;
    
    // Update report with share URL
    report.shareUrl = shareUrl;
    
    return shareUrl;
  }

  async getShareableReport(shareToken: string): Promise<ShareableReport | null> {
    const query = `
      SELECT * FROM shareable_reports 
      WHERE share_token = $1 AND expires_at > NOW()
    `;
    
    const result = await this.db.queryOne(query, [shareToken]);
    
    if (!result) {
      return null;
    }
    
    // Increment access count
    await this.db.query(
      'UPDATE shareable_reports SET access_count = access_count + 1 WHERE share_token = $1',
      [shareToken]
    );
    
    return {
      id: result.id,
      projectId: result.project_id,
      reportData: result.report_data,
      shareToken: result.share_token,
      expiresAt: new Date(result.expires_at),
      accessCount: result.access_count,
      createdAt: new Date(result.created_at)
    };
  }

  async scheduleWeeklyReports(): Promise<void> {
    // Get all tenants with weekly report frequency
    const query = `
      SELECT DISTINCT p.id as project_id, ti.company_name
      FROM projects p
      JOIN tenant_identity ti ON p.id = ti.project_id
      WHERE ti.notification_preferences->>'reportFrequency' = 'weekly'
    `;
    
    const projects = await this.db.query(query);
    
    for (const project of projects) {
      try {
        await this.generateAndSendWeeklyReport(project.project_id);
        console.log(`Weekly report generated for project: ${project.project_id} (${project.company_name})`);
      } catch (error) {
        console.error(`Failed to generate weekly report for project ${project.project_id}:`, error);
      }
    }
  }

  private async getDailyProtectionData(projectId: string, days: number): Promise<number[]> {
    const dailyData = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      try {
        const impact = await this.counterfactualEngine.calculateCounterfactualImpact(projectId, date);
        dailyData.push(impact.impact.preventedLoss + impact.actual.recoveredAmount);
      } catch (error) {
        // If no data for this day, use 0
        dailyData.push(0);
      }
    }
    
    return dailyData;
  }

  private getWeekPeriod(): string {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  }

  async generateMonthlyReport(projectId: string): Promise<WeeklyReport> {
    const impactData = await this.counterfactualEngine.calculateImpactSummary(projectId, 30);
    const identity = await this.counterfactualEngine.generateRevenueIdentity(projectId);
    const tenantInfo = await this.tenantIdentityModel.getTenantInfo(projectId);
    
    return {
      companyName: tenantInfo.companyName,
      weekPeriod: this.getMonthPeriod(),
      headline: `Torqvio protected €${impactData.totalPreventedLoss.toLocaleString()} for ${tenantInfo.companyName} this month`,
      metrics: {
        recovered: impactData.totalRecovered,
        prevented: impactData.totalPreventedLoss,
        efficiency: impactData.averageEfficiencyScore,
        customersProtected: impactData.customersProtected
      },
      chart: {
        type: 'bar',
        data: {
          labels: this.getWeeklyLabels(),
          datasets: [{
            label: 'Weekly Revenue Protected',
            data: await this.getWeeklyProtectionData(projectId, 4),
            backgroundColor: 'rgba(147, 51, 234, 0.5)',
            borderColor: 'rgba(147, 51, 234, 1)',
            borderWidth: 2
          }]
        }
      },
      branding: {
        poweredBy: "Powered by Torqvio",
        logo: "/torqvio-logo.png",
        shareable: true
      },
      reportId: uuidv4(),
      generatedAt: new Date().toISOString()
    };
  }

  private async getWeeklyProtectionData(projectId: string, weeks: number): Promise<number[]> {
    const weeklyData = [];
    
    for (let i = weeks - 1; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);
      
      try {
        const impact = await this.counterfactualEngine.calculateImpactSummary(projectId, 7);
        weeklyData.push(impact.totalPreventedLoss + impact.totalRecovered);
      } catch (error) {
        weeklyData.push(0);
      }
    }
    
    return weeklyData;
  }

  private getWeeklyLabels(): string[] {
    const labels = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7 + weekStart.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      labels.push(`Week ${4 - i}`);
    }
    
    return labels;
  }

  private getMonthPeriod(): string {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return `${monthStart.toLocaleDateString()} - ${monthEnd.toLocaleDateString()}`;
  }

  async cleanupExpiredReports(): Promise<void> {
    const query = `
      DELETE FROM shareable_reports 
      WHERE expires_at < NOW()
    `;
    
    const result = await this.db.query(query);
    console.log(`Cleaned up ${result.length} expired shareable reports`);
  }

  async getReportAnalytics(projectId: string): Promise<{
    totalReports: number;
    totalShares: number;
    totalViews: number;
    averageViewsPerShare: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as total_reports,
        COUNT(*) FILTER (WHERE share_token IS NOT NULL) as total_shares,
        COALESCE(SUM(access_count), 0) as total_views
      FROM shareable_reports 
      WHERE project_id = $1
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    const totalReports = parseInt(result.total_reports) || 0;
    const totalShares = parseInt(result.total_shares) || 0;
    const totalViews = parseInt(result.total_views) || 0;
    const averageViewsPerShare = totalShares > 0 ? totalViews / totalShares : 0;
    
    return {
      totalReports,
      totalShares,
      totalViews,
      averageViewsPerShare
    };
  }
}
