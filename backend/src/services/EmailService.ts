import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private fromAddress: string;
  private appUrl: string;

  constructor() {
    this.fromAddress = process.env.EMAIL_FROM || 'Torqvio <noreply@torqvio.com>';
    this.appUrl = process.env.FRONTEND_URL || 'http://localhost:7243';

    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user, pass },
      });
      logger.info('EmailService: SMTP transporter configured');
    } else {
      logger.warn('EmailService: SMTP not configured (SMTP_HOST, SMTP_USER, SMTP_PASS missing) — emails will be logged only');
    }
  }

  private loadTemplate(templateName: string): string {
    try {
      const templatePath = join(__dirname, 'templates', `${templateName}.html`);
      return readFileSync(templatePath, 'utf-8');
    } catch (error) {
      logger.error(`Failed to load email template: ${templateName}`, error);
      return this.getFallbackTemplate(templateName);
    }
  }

  private getFallbackTemplate(templateName: string): string {
    const templates = {
      'password-reset': `
        <div style="max-width:560px;margin:40px auto;padding:40px;background:#13151f;border-radius:12px;border:1px solid #1e2133;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <h1 style="color:#fff;margin-bottom:20px;">Reset your password</h1>
          <p style="color:#8891a8;">Hi {{name}}, click below to reset your password:</p>
          <a href="{{resetUrl}}" style="display:inline-block;padding:12px 28px;background:#6C5CE7;color:#fff;text-decoration:none;border-radius:8px;">Reset password</a>
          <p style="color:#8891a8;font-size:13px;margin-top:24px;">This link expires in 1 hour.</p>
        </div>
      `,
      'welcome': `
        <div style="max-width:560px;margin:40px auto;padding:40px;background:#13151f;border-radius:12px;border:1px solid #1e2133;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
          <h1 style="color:#fff;margin-bottom:20px;">Welcome, {{name}}!</h1>
          <p style="color:#8891a8;">Your Torqvio account is ready. Create your first workflow:</p>
          <a href="{{dashboardUrl}}" style="display:inline-block;padding:12px 28px;background:#6C5CE7;color:#fff;text-decoration:none;border-radius:8px;">Go to dashboard</a>
        </div>
      `,
    };
    return templates[templateName as keyof typeof templates] || '';
  }

  private async send(to: string, subject: string, html: string, text: string): Promise<void> {
    if (!this.transporter) {
      // Dev fallback: log to console so dev flow still works
      logger.info(`[EMAIL] To: ${to} | Subject: ${subject}\n${text}`);
      return;
    }
    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to,
        subject,
        html,
        text,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  async sendPasswordReset(to: string, token: string, name: string): Promise<void> {
    const resetUrl = `${this.appUrl}/reset-password?token=${token}`;
    const subject = 'Reset your Torqvio password';

    const htmlTemplate = this.loadTemplate('password-reset');
    const html = htmlTemplate
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{resetUrl\}\}/g, resetUrl);

    const text = `Hi ${name},\n\nReset your Torqvio password here:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.\n\n— Torqvio`;

    await this.send(to, subject, html, text);
  }

  async sendWelcome(to: string, name: string): Promise<void> {
    const subject = 'Welcome to Torqvio';
    const dashboardUrl = `${this.appUrl}/dashboard`;

    const htmlTemplate = this.loadTemplate('welcome');
    const html = htmlTemplate
      .replace(/\{\{name\}\}/g, name)
      .replace(/\{\{dashboardUrl\}\}/g, dashboardUrl);

    const text = `Hi ${name},\n\nWelcome to Torqvio! Your account is ready.\n\nGo to your dashboard: ${dashboardUrl}\n\n— Torqvio`;

    await this.send(to, subject, html, text);
  }
}

// Singleton
export const emailService = new EmailService();
