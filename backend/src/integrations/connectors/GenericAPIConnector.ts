import axios from 'axios';
import crypto from 'crypto';
import { IntegrationConnector, ExternalEvent, ProcessedEvent, GenericAPIConfig, WebhookConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '../../database/connection.js';
import { logger } from '../../utils/logger.js';
import { WorkflowEngine } from '../../services/WorkflowEngine.js';

export class GenericAPIConnector implements IntegrationConnector {
  private config: GenericAPIConfig;
  private workflowEngine: WorkflowEngine;

  constructor(config: GenericAPIConfig) {
    this.config = config;
    this.workflowEngine = WorkflowEngine.getInstance();
  }

  async validateCredentials(config: GenericAPIConfig): Promise<boolean> {
    try {
      const response = await axios.get(config.healthCheckUrl, {
        headers: this.getAuthHeaders(config),
        timeout: 5000
      });
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Generic API credential validation failed:', error);
      return false;
    }
  }

  async setupWebhooks(config: GenericAPIConfig): Promise<WebhookConfig> {
    try {
      const webhookPayload = {
        url: config.webhookUrl,
        events: config.events,
        secret: config.webhookSecret
      };

      const response = await axios.post(
        config.webhookRegistrationUrl,
        webhookPayload,
        {
          headers: this.getAuthHeaders(config),
          timeout: 10000
        }
      );

      return {
        endpointId: response.data.id || response.data.webhook_id,
        secret: config.webhookSecret!,
        url: config.webhookUrl!
      };
    } catch (error) {
      console.error('Generic API webhook setup failed:', error);
      throw new Error(`Failed to setup Generic API webhooks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processEvent(event: ExternalEvent): Promise<ProcessedEvent> {
    try {
      // Validate webhook signature
      if (!this.validateWebhookSignature(event)) {
        return {
          id: uuidv4(),
          status: 'invalid_signature',
          reason: 'Webhook signature validation failed'
        };
      }

      // Map external event to internal format
      const mappedEvent = this.mapEventFormat(event);

      // Trigger appropriate workflow
      await this.triggerWorkflow(mappedEvent);

      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: mappedEvent.workflowType,
        data: mappedEvent.data,
        recoveryPotential: mappedEvent.recoveryPotential
      };
    } catch (error) {
      console.error('Error processing Generic API event:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process Generic API event: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private validateWebhookSignature(event: ExternalEvent): boolean {
    try {
      const signature = event.headers['x-signature'] || event.headers['x-webhook-signature'];
      if (!signature) {
        console.warn('No signature header found in webhook');
        return false;
      }

      const expectedSignature = crypto
        .createHmac('sha256', this.config.webhookSecret!)
        .update(JSON.stringify(event.rawData))
        .digest('hex');

      // Support both direct comparison and sha256= prefix format
      const cleanSignature = signature.startsWith('sha256=') 
        ? signature.substring(7) 
        : signature;

      return crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error validating webhook signature:', error);
      return false;
    }
  }

  private mapEventFormat(event: ExternalEvent): MappedEvent {
    const rawData = event.rawData;
    
    // Try to extract common patterns from the event data
    const eventType = this.extractEventType(rawData);
    const customerId = this.extractCustomerId(rawData);
    const amount = this.extractAmount(rawData);
    const paymentStatus = this.extractPaymentStatus(rawData);

    // Determine workflow type based on event characteristics
    const workflowType = this.determineWorkflowType(eventType, paymentStatus, amount);

    return {
      workflowType,
      data: {
        originalEvent: rawData,
        customerId,
        amount,
        paymentStatus,
        eventType,
        timestamp: event.timestamp,
        integrationId: event.integrationId
      },
      recoveryPotential: this.calculateRecoveryPotential(workflowType, amount)
    };
  }

  private extractEventType(rawData: any): string {
    // Try various common field names for event type
    return rawData.type || rawData.event || rawData.event_type || rawData.action || 'unknown';
  }

  private extractCustomerId(rawData: any): string {
    // Try various common field names for customer ID
    return rawData.customer_id || rawData.customerId || rawData.customer?.id || rawData.user_id || rawData.userId || 'unknown';
  }

  private extractAmount(rawData: any): number {
    // Try various common field names for amount
    const amount = rawData.amount || rawData.total || rawData.total_amount || rawData.value || 0;
    return typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  }

  private extractPaymentStatus(rawData: any): string {
    // Try various common field names for payment status
    return rawData.status || rawData.payment_status || rawData.state || rawData.result || 'unknown';
  }

  private determineWorkflowType(eventType: string, paymentStatus: string, amount: number): string {
    const status = paymentStatus.toLowerCase();
    const type = eventType.toLowerCase();

    // Payment failure scenarios
    if (status.includes('fail') || status.includes('decline') || status.includes('error')) {
      return 'payment_failure_recovery';
    }

    // Invoice scenarios
    if (type.includes('invoice') || type.includes('bill')) {
      if (status.includes('overdue') || status.includes('past_due')) {
        return 'invoice_recovery';
      }
      if (status.includes('due')) {
        return 'invoice_reminder';
      }
    }

    // Subscription scenarios
    if (type.includes('subscription') || type.includes('recurring')) {
      if (status.includes('cancel') || status.includes('expire')) {
        return 'subscription_cancellation_recovery';
      }
      if (status.includes('fail') || status.includes('decline')) {
        return 'subscription_payment_recovery';
      }
    }

    // Order scenarios
    if (type.includes('order') || type.includes('purchase')) {
      if (status.includes('cancel') || status.includes('refund')) {
        return 'order_cancellation_recovery';
      }
      if (status.includes('pending') || status.includes('process')) {
        return 'order_processing';
      }
    }

    // Default to generic event processing
    return 'generic_event_processing';
  }

  private calculateRecoveryPotential(workflowType: string, amount: number): number {
    // Base recovery potential on amount and workflow type
    switch (workflowType) {
      case 'payment_failure_recovery':
      case 'subscription_payment_recovery':
        return amount; // Full amount recovery potential
      case 'invoice_recovery':
        return amount * 0.95; // Slightly less for invoices
      case 'subscription_cancellation_recovery':
        return amount * 12; // Assume 12 months of recurring value
      case 'order_cancellation_recovery':
        return amount * 0.8; // Some orders may not be recoverable
      default:
        return amount * 0.5; // Conservative estimate for generic events
    }
  }

  private async triggerWorkflow(mappedEvent: MappedEvent): Promise<void> {
    console.log('Triggering generic API workflow:', mappedEvent);
    
    await this.workflowEngine.trigger(mappedEvent.workflowType, mappedEvent.data);
  }

  private getAuthHeaders(config: GenericAPIConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Torqvio-Integration/1.0'
    };

    switch (config.authType) {
      case 'bearer':
        if (config.authToken) {
          headers['Authorization'] = `Bearer ${config.authToken}`;
        }
        break;
      case 'basic':
        if (config.username && config.password) {
          const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
          headers['Authorization'] = `Basic ${credentials}`;
        }
        break;
      case 'api_key':
        if (config.apiKey) {
          headers['X-API-Key'] = config.apiKey;
        }
        break;
    }

    return headers;
  }

  // Helper method to test webhook connectivity
  async testWebhookConnectivity(): Promise<boolean> {
    try {
      const testPayload = {
        test: true,
        timestamp: new Date().toISOString(),
        source: 'torqvio_integration_test'
      };

      const signature = crypto
        .createHmac('sha256', this.config.webhookSecret!)
        .update(JSON.stringify(testPayload))
        .digest('hex');

      const response = await axios.post(
        this.config.webhookUrl!,
        testPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Signature': signature
          },
          timeout: 10000
        }
      );

      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Webhook connectivity test failed:', error);
      return false;
    }
  }

  // Helper method to get supported event types
  getSupportedEventTypes(): string[] {
    return this.config.events || [];
  }

  // Helper method to update configuration
  updateConfig(updates: Partial<GenericAPIConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

interface MappedEvent {
  workflowType: string;
  data: any;
  recoveryPotential: number;
}
