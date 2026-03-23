import { RecoveryEvent } from '../database/RecoveryAnalyticsModel.js';

export interface NotificationPayload {
  type: 'email' | 'slack' | 'cli';
  recipient: string;
  subject?: string;
  message: string;
  metadata?: any;
}

export class NotificationService {
  private emailTransporter: any;

  constructor() {
    // Initialize email transporter if nodemailer is available
    // For now, we'll use a simple console-based approach
    this.emailTransporter = null;
  }

  async sendPaymentRecoveredNotification(event: RecoveryEvent): Promise<void> {
    const message = this.buildPaymentRecoveredMessage(event);
    
    await this.sendEmail({
      type: 'email',
      recipient: event.metadata?.notificationEmail || process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@example.com',
      subject: `💰 Payment Recovered: €${event.amount}`,
      message
    });

    await this.sendSlackNotification({
      webhook: event.metadata?.slackWebhook || process.env.SLACK_WEBHOOK_URL,
      message: `💰 Recovered €${event.amount} from failed payment (Customer: ${event.customerId})`
    });
  }

  async sendDailyDigest(projectId: string, stats: any): Promise<void> {
    const message = this.buildDailyDigestMessage(stats);
    
    await this.sendEmail({
      type: 'email',
      recipient: process.env.DEFAULT_NOTIFICATION_EMAIL || 'admin@example.com',
      subject: `📊 Daily Torqvio Digest - €${stats.totalRecovered} Recovered`,
      message
    });
  }

  private buildPaymentRecoveredMessage(event: RecoveryEvent): string {
    return `
🎉 PAYMENT RECOVERED!

Amount: €${event.amount}
Customer: ${event.customerId}
Payment Intent: ${event.paymentIntentId}
Recovery Attempt: ${event.recoveryAttempt}
Time: ${new Date(event.createdAt).toLocaleString()}

This payment would have been lost without Torqvio.

Total recovered today: Check your dashboard for live updates.
    `.trim();
  }

  private buildDailyDigestMessage(stats: any): string {
    return `
📊 TORQVIO DAILY DIGEST

💰 Total Recovered: €${stats.totalRecovered.toLocaleString()}
📈 Recovery Rate: ${stats.recoveryRate}%
🔄 Retry Attempts: ${stats.retryAttempts}
⏱️ Avg Recovery Time: ${(stats.avgTimeToRecovery / 1000).toFixed(1)}s

🎯 You would have lost €${stats.wouldHaveLost?.toLocaleString() || '0'} without Torqvio.

Keep your workflows running and watch the revenue grow!
    `.trim();
  }

  private async sendEmail(payload: NotificationPayload): Promise<void> {
    try {
      // For now, just log the email (in production, use nodemailer)
      console.log(`📧 Email sent to ${payload.recipient}:`);
      console.log(`Subject: ${payload.subject}`);
      console.log(`Message: ${payload.message}`);
      
      // In production with nodemailer:
      // await this.emailTransporter.sendMail({
      //   from: process.env.FROM_EMAIL || 'noreply@torqvio.com',
      //   to: payload.recipient,
      //   subject: payload.subject,
      //   text: payload.message
      // });
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  }

  private async sendSlackNotification(payload: { webhook?: string; message: string }): Promise<void> {
    if (!payload.webhook) {
      console.log(`📱 Slack notification (no webhook configured): ${payload.message}`);
      return;
    }

    try {
      // For now, just log the Slack message
      console.log(`📱 Slack notification sent:`);
      console.log(`Message: ${payload.message}`);
      
      // In production:
      // await fetch(payload.webhook, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: payload.message })
      // });
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  async sendCLIRecoveryNotification(recoveryData: {
    amount: number;
    customerId: string;
    totalRecoveredToday: number;
    retryAttempt: number;
  }): Promise<void> {
    console.log('\n💰 PAYMENT RECOVERED!');
    console.log(`✅ Amount: €${recoveryData.amount}`);
    console.log(`✅ Customer: ${recoveryData.customerId}`);
    console.log(`✅ Total today: €${recoveryData.totalRecoveredToday}`);
    console.log(`✅ Attempt: #${recoveryData.retryAttempt}`);
    console.log('This payment would have been lost without Torqvio.\n');
  }
}
