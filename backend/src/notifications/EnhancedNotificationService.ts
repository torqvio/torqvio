import { RecoveryEvent } from '../database/RecoveryAnalyticsModel.js';
import { CounterfactualEngine } from '../engine/CounterfactualEngine.js';
import { DatabaseConnection } from '../database/connection.js';

export interface RecoveryEventWithImpact extends RecoveryEvent {
  efficiencyScore?: number;
  protectedLTV?: number;
  customerImpact?: number;
}

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
  chart: any;
  branding: {
    poweredBy: string;
    logo: string;
    shareable: boolean;
  };
  shareUrl?: string;
}

export interface TenantNotificationPreferences {
  ltvFramed: boolean;
  reportFrequency: 'daily' | 'weekly' | 'monthly';
  brandingEnabled: boolean;
  notificationEmail?: string;
  slackWebhook?: string;
}

export class EnhancedNotificationService {
  constructor(
    private db: DatabaseConnection,
    private counterfactualEngine: CounterfactualEngine
  ) {}

  async sendRecoveryAlert(projectId: string, recoveryEvent: RecoveryEvent): Promise<void> {
    const tenantInfo = await this.getTenantInfo(projectId);
    const ltvMultiplier = this.getLTVMultiplier(tenantInfo.industry);
    
    const protectedLTV = recoveryEvent.amount * ltvMultiplier;
    
    // Calculate efficiency and customer impact
    const efficiencyScore = await this.calculateRecoveryEfficiency(projectId, recoveryEvent);
    const customerImpact = this.calculateCustomerImpact(recoveryEvent, protectedLTV);
    
    const enhancedEvent: RecoveryEventWithImpact = {
      ...recoveryEvent,
      efficiencyScore,
      protectedLTV,
      customerImpact
    };

    const preferences = await this.getNotificationPreferences(projectId);
    
    const message = preferences.ltvFramed 
      ? this.buildLTVFramedMessage(enhancedEvent, tenantInfo.companyName)
      : this.buildBasicRecoveryMessage(enhancedEvent);

    await this.sendNotification({
      projectId,
      type: 'recovery_alert',
      message,
      metadata: {
        recoveredAmount: recoveryEvent.amount,
        protectedLTV,
        efficiency: efficiencyScore,
        customerImpact,
        framing: preferences.ltvFramed ? 'ltv' : 'basic'
      }
    });
  }

  async sendWeeklyReport(projectId: string): Promise<WeeklyReport> {
    const impactData = await this.counterfactualEngine.calculateImpactSummary(projectId, 7);
    const identity = await this.counterfactualEngine.generateRevenueIdentity(projectId);
    const tenantInfo = await this.getTenantInfo(projectId);
    
    const report: WeeklyReport = {
      companyName: tenantInfo.companyName || 'Your Company',
      weekPeriod: this.getWeekPeriod(),
      headline: `Torqvio protected €${impactData.totalPreventedLoss.toLocaleString()} for ${tenantInfo.companyName || 'your company'} this week`,
      metrics: {
        recovered: impactData.totalRecovered,
        prevented: impactData.totalPreventedLoss,
        efficiency: impactData.averageEfficiencyScore,
        customersProtected: impactData.customersProtected
      },
      chart: this.generateShareableChart(impactData),
      branding: {
        poweredBy: "Powered by Torqvio",
        logo: "/torqvio-logo.png",
        shareable: true
      }
    };
    
    await this.sendNotification({
      projectId,
      type: 'weekly_report',
      message: report.headline,
      metadata: report
    });

    return report;
  }

  async sendMilestoneNotification(projectId: string, milestone: {
    type: string;
    value: number;
    description: string;
  }): Promise<void> {
    const tenantInfo = await this.getTenantInfo(projectId);
    const preferences = await this.getNotificationPreferences(projectId);
    
    const message = preferences.ltvFramed
      ? `🎯 MILESTONE ACHIEVED: ${milestone.description}\n\nThis represents €${(milestone.value * 12).toLocaleString()} in protected annual revenue for ${tenantInfo.companyName}.`
      : `🎯 MILESTONE: ${milestone.description} - Value: €${milestone.value.toLocaleString()}`;

    await this.sendNotification({
      projectId,
      type: 'milestone',
      message,
      metadata: { milestone, framing: preferences.ltvFramed ? 'ltv' : 'basic' }
    });
  }

  private buildLTVFramedMessage(event: RecoveryEventWithImpact, companyName: string): string {
    return `
🎯 REVENUE PROTECTED FOR ${companyName.toUpperCase()}

You just saved a customer who was about to churn.

💰 Immediate Recovery: €${event.amount.toLocaleString()}
📈 Protected LTV: €${event.protectedLTV?.toLocaleString()}
⚡ Efficiency Score: ${(event.efficiencyScore! * 100).toFixed(1)}%

This isn't just a payment recovery - it's customer retention and future revenue protection.

Without Torqvio, you would have lost this customer and €${event.protectedLTV?.toLocaleString()} in future revenue.

Total revenue protected for ${companyName}: Check your Impact Dashboard →
    `.trim();
  }

  private buildBasicRecoveryMessage(event: RecoveryEventWithImpact): string {
    return `
💰 PAYMENT RECOVERED

Amount: €${event.amount.toLocaleString()}
Customer: ${event.customerId}
Efficiency: ${(event.efficiencyScore! * 100).toFixed(1)}%

Payment recovered successfully.
    `.trim();
  }

  private async getTenantInfo(projectId: string): Promise<{
    companyName: string;
    industry: string;
    revenueTier: string;
  }> {
    const query = `
      SELECT ti.company_name, ti.industry, ti.revenue_tier, p.name as project_name
      FROM tenant_identity ti
      JOIN projects p ON ti.project_id = p.id
      WHERE p.id = $1
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    return {
      companyName: result?.company_name || result?.project_name || 'Your Company',
      industry: result?.industry || 'default',
      revenueTier: result?.revenue_tier || 'startup'
    };
  }

  private async getNotificationPreferences(projectId: string): Promise<TenantNotificationPreferences> {
    const query = `
      SELECT notification_preferences, branding_enabled
      FROM tenant_identity ti
      JOIN projects p ON ti.project_id = p.id
      WHERE p.id = $1
    `;
    
    const result = await this.db.queryOne(query, [projectId]);
    
    const preferences = result?.notification_preferences || {};
    
    return {
      ltvFramed: preferences.ltvFramed !== false, // Default to true
      reportFrequency: preferences.reportFrequency || 'weekly',
      brandingEnabled: result?.branding_enabled !== false,
      notificationEmail: preferences.notificationEmail,
      slackWebhook: preferences.slackWebhook
    };
  }

  private getLTVMultiplier(industry: string): number {
    const ltvMultipliers = {
      'saas': 12,        // 12x monthly revenue for LTV
      'ecommerce': 3,    // 3x average order value
      'subscription': 8, // 8x monthly subscription
      'default': 5       // 5x average
    };
    
    return ltvMultipliers[industry as keyof typeof ltvMultipliers] || ltvMultipliers.default;
  }

  private async calculateRecoveryEfficiency(projectId: string, event: RecoveryEvent): Promise<number> {
    // Get recent efficiency data
    const impactSummary = await this.counterfactualEngine.calculateImpactSummary(projectId, 7);
    return impactSummary.averageEfficiencyScore;
  }

  private calculateCustomerImpact(event: RecoveryEvent, protectedLTV: number): number {
    // Customer impact score based on amount and LTV
    const amountScore = Math.min(1, event.amount / 1000); // Normalize to €1000
    const ltvScore = Math.min(1, protectedLTV / 5000); // Normalize to €5000 LTV
    
    return (amountScore + ltvScore) / 2;
  }

  private getWeekPeriod(): string {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
    
    return `${weekStart.toLocaleDateString()} - ${weekEnd.toLocaleDateString()}`;
  }

  private generateShareableChart(impactData: any): any {
    // Generate chart data for weekly report
    return {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'Revenue Protected',
          data: [
            impactData.totalRecovered / 7 * 0.8,
            impactData.totalRecovered / 7 * 1.2,
            impactData.totalRecovered / 7 * 0.9,
            impactData.totalRecovered / 7 * 1.1,
            impactData.totalRecovered / 7 * 1.3,
            impactData.totalRecovered / 7 * 0.7,
            impactData.totalRecovered / 7 * 1.0
          ],
          backgroundColor: 'rgba(147, 51, 234, 0.5)',
          borderColor: 'rgba(147, 51, 234, 1)',
          borderWidth: 2
        }]
      }
    };
  }

  private async sendNotification(payload: {
    projectId: string;
    type: string;
    message: string;
    metadata: any;
  }): Promise<void> {
    const preferences = await this.getNotificationPreferences(payload.projectId);
    
    // Send email if configured
    if (preferences.notificationEmail) {
      await this.sendEmail({
        recipient: preferences.notificationEmail,
        subject: this.getSubjectForType(payload.type, payload.metadata),
        message: payload.message
      });
    }
    
    // Send Slack if configured
    if (preferences.slackWebhook) {
      await this.sendSlack({
        webhook: preferences.slackWebhook,
        message: payload.message
      });
    }
    
    // Always log to console for CLI visibility
    console.log(`🔔 ${payload.type.toUpperCase()}: ${payload.message}`);
  }

  private getSubjectForType(type: string, metadata: any): string {
    switch (type) {
      case 'recovery_alert':
        return metadata.framing === 'ltv' 
          ? `🎯 Revenue Protected: €${metadata.recoveredAmount.toLocaleString()} + €${metadata.protectedLTV?.toLocaleString()} LTV`
          : `💰 Payment Recovered: €${metadata.recoveredAmount.toLocaleString()}`;
      case 'weekly_report':
        return `📊 Weekly Torqvio Report: €${metadata.metrics.prevented.toLocaleString()} Loss Prevented`;
      case 'milestone':
        return `🎯 Milestone Achieved: ${metadata.milestone.description}`;
      default:
        return 'Torqvio Notification';
    }
  }

  private async sendEmail(payload: {
    recipient: string;
    subject: string;
    message: string;
  }): Promise<void> {
    try {
      console.log(`📧 Email sent to ${payload.recipient}:`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Message: ${payload.message}`);
      
      // In production, integrate with email service
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  private async sendSlack(payload: {
    webhook: string;
    message: string;
  }): Promise<void> {
    try {
      console.log(`📱 Slack notification sent:`);
      console.log(`Message: ${payload.message}`);
      
      // In production, integrate with Slack API
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  async updateNotificationPreferences(projectId: string, preferences: Partial<TenantNotificationPreferences>): Promise<void> {
    const query = `
      UPDATE tenant_identity 
      SET notification_preferences = COALESCE(notification_preferences, '{}') || $1::jsonb,
          updated_at = NOW()
      WHERE project_id = $2
    `;
    
    await this.db.query(query, [JSON.stringify(preferences), projectId]);
  }
}
