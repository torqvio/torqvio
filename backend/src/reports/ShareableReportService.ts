import { v4 as generateUUID } from 'uuid';

export interface ReportOptions {
  title?: string;
  period: '7d' | '30d' | '90d' | '1y';
  expiration?: number; // days
  type?: 'standard' | 'detailed' | 'executive';
}

export interface ShareableReport {
  id: string;
  projectId: string;
  publicId: string;
  title: string;
  period: string;
  generatedAt: Date;
  expiresAt: Date;
  data: ReportData;
  metadata: ReportMetadata;
}

export interface ReportData {
  totalRecovered: number;
  recoveryRate: number;
  counterfactualProtected: number;
  workflowsExecuted: number;
  topWorkflows: WorkflowPerformance[];
  dailyBreakdown: DailyMetric[];
  industryComparison: IndustryBenchmark;
}

export interface WorkflowPerformance {
  workflowId: string;
  name: string;
  executions: number;
  successRate: number;
  totalRecovered: number;
}

export interface DailyMetric {
  date: string;
  recovered: number;
  attempts: number;
  successRate: number;
}

export interface IndustryBenchmark {
  industry: string;
  averageRecoveryRate: number;
  yourRecoveryRate: number;
  percentile: number;
}

export interface ReportMetadata {
  companyName: string;
  industry: string;
  reportType: string;
}

export interface EmbeddableWidget {
  id: string;
  reportId: string;
  type: string;
  embedCode: string;
  data: any;
}

export interface SocialContent {
  title?: string;
  text?: string;
  body?: string;
  subject?: string;
  image?: string;
}

export class ShareableReportService {
  async generateShareableReport(projectId: string, options: ReportOptions): Promise<ShareableReport> {
    const analytics = await this.getProjectAnalytics(projectId, options.period);
    const counterfactual = await this.getCounterfactualAnalytics(projectId, options.period);
    
    const report: ShareableReport = {
      id: generateUUID(),
      projectId,
      publicId: this.generatePublicId(),
      title: options.title || 'Revenue Protection Report',
      period: options.period,
      generatedAt: new Date(),
      expiresAt: this.calculateExpiration(options.expiration),
      data: {
        totalRecovered: analytics.totalRecovered,
        recoveryRate: analytics.recoveryRate,
        counterfactualProtected: counterfactual.protectedAmount,
        workflowsExecuted: analytics.workflowsExecuted,
        topWorkflows: analytics.topWorkflows,
        dailyBreakdown: analytics.dailyBreakdown,
        industryComparison: await this.getIndustryComparison(analytics)
      },
      metadata: {
        companyName: await this.getCompanyName(projectId),
        industry: await this.getIndustry(projectId),
        reportType: options.type || 'standard'
      }
    };

    // Save to database
    await this.saveReport(report);
    
    return report;
  }

  async generatePDFReport(reportId: string): Promise<Buffer> {
    const report = await this.getReport(reportId);
    
    // Generate PDF using puppeteer or similar
    const pdf = await this.createPDFFromTemplate(report);
    
    return pdf;
  }

  async generateEmbeddableWidget(reportId: string, widgetType: string): Promise<EmbeddableWidget> {
    const report = await this.getReport(reportId);
    
    const widget: EmbeddableWidget = {
      id: generateUUID(),
      reportId,
      type: widgetType,
      embedCode: this.generateEmbedCode(reportId, widgetType),
      data: this.extractWidgetData(report, widgetType)
    };

    return widget;
  }

  private generateEmbedCode(reportId: string, widgetType: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `<iframe src="${baseUrl}/embed/${reportId}/${widgetType}" width="400" height="300" frameborder="0"></iframe>`;
  }

  async generateSocialShareContent(reportId: string, platform: 'linkedin' | 'twitter' | 'email'): Promise<SocialContent> {
    const report = await this.getReport(reportId);
    
    const templates = {
      linkedin: {
        title: `We protected $${report.data.totalRecovered.toLocaleString()} in revenue this month`,
        body: `Using Torqvio's automated recovery workflows, we achieved a ${report.data.recoveryRate.toFixed(1)}% recovery rate and protected $${report.data.counterfactualProtected.toLocaleString()} in counterfactual losses. #RevenueProtection #Automation #FinTech`,
        image: await this.generateSocialImage(report)
      },
      twitter: {
        text: `🚀 Just protected $${report.data.totalRecovered.toLocaleString()} in revenue with ${report.data.recoveryRate.toFixed(1)}% recovery rate using @TorqvioAI. Automated recovery workflows that actually work! 💰`,
        image: await this.generateSocialImage(report)
      },
      email: {
        subject: `Monthly Revenue Protection Report: $${report.data.totalRecovered.toLocaleString()} recovered`,
        body: this.generateEmailTemplate(report)
      }
    };

    return templates[platform];
  }

  private generatePublicId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private calculateExpiration(days?: number): Date {
    const expirationDays = days || 30;
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + expirationDays);
    return expiration;
  }

  private async getProjectAnalytics(projectId: string, period: string): Promise<any> {
    // Mock implementation - would query actual database
    return {
      totalRecovered: 125000,
      recoveryRate: 94.5,
      workflowsExecuted: 1250,
      topWorkflows: [
        {
          workflowId: 'stripe-retry',
          name: 'Stripe Payment Retry',
          executions: 450,
          successRate: 96.2,
          totalRecovered: 45000
        },
        {
          workflowId: 'email-dunning',
          name: 'Email Dunning Campaign',
          executions: 380,
          successRate: 92.1,
          totalRecovered: 35000
        }
      ],
      dailyBreakdown: this.generateMockDailyData(period)
    };
  }

  private async getCounterfactualAnalytics(projectId: string, period: string): Promise<any> {
    // Mock implementation
    return {
      protectedAmount: 45000,
      preventedFailures: 125,
      averageInterventionTime: 2.5 // minutes
    };
  }

  private generateMockDailyData(period: string): DailyMetric[] {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data: DailyMetric[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        recovered: Math.floor(Math.random() * 5000) + 1000,
        attempts: Math.floor(Math.random() * 50) + 10,
        successRate: 90 + Math.random() * 8
      });
    }
    
    return data;
  }

  private async getIndustryComparison(analytics: any): Promise<IndustryBenchmark> {
    // Mock implementation
    return {
      industry: 'E-commerce',
      averageRecoveryRate: 78.5,
      yourRecoveryRate: analytics.recoveryRate,
      percentile: 92
    };
  }

  private async getCompanyName(projectId: string): Promise<string> {
    // Mock implementation - would query database
    return 'Acme Corporation';
  }

  private async getIndustry(projectId: string): Promise<string> {
    // Mock implementation - would query database
    return 'E-commerce';
  }

  private async saveReport(report: ShareableReport): Promise<void> {
    // Mock implementation - would save to database
    console.log('Saving report:', report.publicId);
  }

  private async getReport(reportId: string): Promise<ShareableReport> {
    // Mock implementation - would query database
    return {
      id: reportId,
      projectId: 'project-123',
      publicId: 'abc12345',
      title: 'Revenue Protection Report',
      period: '30d',
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      data: {
        totalRecovered: 125000,
        recoveryRate: 94.5,
        counterfactualProtected: 45000,
        workflowsExecuted: 1250,
        topWorkflows: [],
        dailyBreakdown: [],
        industryComparison: {
          industry: 'E-commerce',
          averageRecoveryRate: 78.5,
          yourRecoveryRate: 94.5,
          percentile: 92
        }
      },
      metadata: {
        companyName: 'Acme Corporation',
        industry: 'E-commerce',
        reportType: 'standard'
      }
    };
  }

  private async createPDFFromTemplate(report: ShareableReport): Promise<Buffer> {
    // Mock implementation - would use puppeteer or similar
    return Buffer.from('Mock PDF content');
  }

  private extractWidgetData(report: ShareableReport, widgetType: string): any {
    switch (widgetType) {
      case 'counter':
        return {
          totalRecovered: report.data.totalRecovered,
          recoveryRate: report.data.recoveryRate
        };
      case 'chart':
        return {
          dailyBreakdown: report.data.dailyBreakdown
        };
      default:
        return report.data;
    }
  }

  private async generateSocialImage(report: ShareableReport): Promise<string> {
    // Mock implementation - would generate actual image
    return 'https://via.placeholder.com/1200x630/10B981/FFFFFF?text=Revenue+Protection+Report';
  }

  private generateEmailTemplate(report: ShareableReport): string {
    return `
      <html>
        <body>
          <h2>Monthly Revenue Protection Report</h2>
          <p>Hi there,</p>
          <p>Here's your monthly revenue protection report from Torqvio:</p>
          <ul>
            <li><strong>Total Recovered:</strong> $${report.data.totalRecovered.toLocaleString()}</li>
            <li><strong>Recovery Rate:</strong> ${report.data.recoveryRate.toFixed(1)}%</li>
            <li><strong>Counterfactual Protection:</strong> $${report.data.counterfactualProtected.toLocaleString()}</li>
          </ul>
          <p>View the full report here: ${process.env.FRONTEND_URL}/reports/${report.publicId}</p>
          <p>Best regards,<br/>The Torqvio Team</p>
        </body>
      </html>
    `;
  }
}
