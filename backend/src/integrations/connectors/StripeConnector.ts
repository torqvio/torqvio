import Stripe from 'stripe';
import { IntegrationConnector, ExternalEvent, ProcessedEvent, StripeConfig, WebhookConfig } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class StripeConnector implements IntegrationConnector {
  private stripe: Stripe;

  constructor(config: StripeConfig) {
    this.stripe = new Stripe(config.secretKey, {
      apiVersion: config.apiVersion || '2023-10-16'
    });
  }

  async validateCredentials(config: StripeConfig): Promise<boolean> {
    try {
      await this.stripe.accounts.retrieve();
      return true;
    } catch (error) {
      console.error('Stripe credential validation failed:', error);
      return false;
    }
  }

  async setupWebhooks(config: StripeConfig): Promise<WebhookConfig> {
    try {
      const webhookEndpoint = await this.stripe.webhookEndpoints.create({
        url: config.webhookUrl,
        enabled_events: [
          'payment_intent.payment_failed',
          'invoice.payment_failed',
          'customer.subscription.deleted',
          'payment_method.attached',
          'invoice.payment_succeeded'
        ]
      });

      return {
        endpointId: webhookEndpoint.id,
        secret: webhookEndpoint.secret,
        url: config.webhookUrl
      };
    } catch (error) {
      console.error('Stripe webhook setup failed:', error);
      throw new Error(`Failed to setup Stripe webhooks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processEvent(event: ExternalEvent): Promise<ProcessedEvent> {
    try {
      const stripeEvent = this.stripe.webhooks.constructEvent(
        event.rawData,
        event.headers['stripe-signature'],
        event.config?.webhookSecret || ''
      );

      switch (stripeEvent.type) {
        case 'payment_intent.payment_failed':
          return await this.handlePaymentFailure(stripeEvent.data.object);
        case 'invoice.payment_failed':
          return await this.handleInvoiceFailure(stripeEvent.data.object);
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionCancellation(stripeEvent.data.object);
        case 'payment_method.attached':
          return await this.handlePaymentMethodAttached(stripeEvent.data.object);
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSuccess(stripeEvent.data.object);
        default:
          return {
            id: uuidv4(),
            status: 'ignored',
            reason: `Unsupported event type: ${stripeEvent.type}`
          };
      }
    } catch (error) {
      console.error('Error processing Stripe event:', error);
      return {
        id: uuidv4(),
        status: 'invalid_signature',
        reason: `Failed to verify Stripe webhook signature: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handlePaymentFailure(paymentIntent: any): Promise<ProcessedEvent> {
    try {
      // Extract relevant information
      const customerId = paymentIntent.customer;
      const amount = paymentIntent.amount;
      const currency = paymentIntent.currency;
      const lastPaymentError = paymentIntent.last_payment_error;
      
      // Analyze failure reason
      const failureReason = this.analyzePaymentFailure(lastPaymentError);
      
      // Trigger payment recovery workflow
      await this.triggerRecoveryWorkflow({
        type: 'payment_recovery',
        data: {
          paymentIntentId: paymentIntent.id,
          customerId,
          amount,
          currency,
          failureReason,
          lastPaymentError,
          metadata: paymentIntent.metadata
        }
      });

      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'payment_recovery',
        recoveryPotential: amount,
        data: {
          paymentIntentId: paymentIntent.id,
          customerId,
          amount,
          failureReason
        }
      };
    } catch (error) {
      console.error('Error handling payment failure:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process payment failure: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleInvoiceFailure(invoice: any): Promise<ProcessedEvent> {
    try {
      const customerId = invoice.customer;
      const amount = invoice.amount_due;
      const subscriptionId = invoice.subscription;
      
      // Check if this is a subscription invoice
      const isSubscription = !!subscriptionId;
      
      await this.triggerRecoveryWorkflow({
        type: isSubscription ? 'subscription_recovery' : 'invoice_recovery',
        data: {
          invoiceId: invoice.id,
          customerId,
          amount,
          subscriptionId,
          dueDate: invoice.due_date,
          attemptCount: invoice.attempt_count
        }
      });

      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: isSubscription ? 'subscription_recovery' : 'invoice_recovery',
        recoveryPotential: amount,
        data: {
          invoiceId: invoice.id,
          customerId,
          amount,
          isSubscription
        }
      };
    } catch (error) {
      console.error('Error handling invoice failure:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process invoice failure: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleSubscriptionCancellation(subscription: any): Promise<ProcessedEvent> {
    try {
      const customerId = subscription.customer;
      const amount = subscription.plan?.amount || 0;
      
      await this.triggerRecoveryWorkflow({
        type: 'churn_recovery',
        data: {
          subscriptionId: subscription.id,
          customerId,
          amount,
          canceledAt: subscription.canceled_at,
          cancelReason: subscription.cancel_reason_period_end ? 'period_end' : 'immediate'
        }
      });

      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'churn_recovery',
        recoveryPotential: amount * 12, // Estimate annual value
        data: {
          subscriptionId: subscription.id,
          customerId,
          amount
        }
      };
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process subscription cancellation: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handlePaymentMethodAttached(paymentMethod: any): Promise<ProcessedEvent> {
    try {
      const customerId = paymentMethod.customer;
      
      // This is a positive event - customer added a new payment method
      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'payment_method_update',
        data: {
          paymentMethodId: paymentMethod.id,
          customerId,
          type: paymentMethod.type
        }
      };
    } catch (error) {
      console.error('Error handling payment method attached:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process payment method attachment: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handlePaymentSuccess(invoice: any): Promise<ProcessedEvent> {
    try {
      const customerId = invoice.customer;
      const amount = invoice.amount_paid;
      
      // Log successful payment for analytics
      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'payment_success_analytics',
        data: {
          invoiceId: invoice.id,
          customerId,
          amount,
          paidAt: invoice.status_transitions.paid_at
        }
      };
    } catch (error) {
      console.error('Error handling payment success:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process payment success: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private analyzePaymentFailure(lastPaymentError: any): string {
    if (!lastPaymentError) return 'unknown_error';
    
    const code = lastPaymentError.code;
    const message = lastPaymentError.message?.toLowerCase() || '';
    
    // Common Stripe error codes
    switch (code) {
      case 'card_declined':
        if (message.includes('insufficient funds')) return 'insufficient_funds';
        if (message.includes('expired')) return 'card_expired';
        if (message.includes('incorrect cvc')) return 'incorrect_cvc';
        if (message.includes('incorrect zip')) return 'incorrect_zip';
        return 'card_declined_generic';
      case 'expired_card':
        return 'card_expired';
      case 'incorrect_cvc':
        return 'incorrect_cvc';
      case 'insufficient_funds':
        return 'insufficient_funds';
      case 'processing_error':
        return 'processing_error';
      case 'rate_limit':
        return 'rate_limit';
      default:
        return 'unknown_error';
    }
  }

  private async triggerRecoveryWorkflow(workflowData: any): Promise<void> {
    // Integrate with the existing workflow engine
    const { WorkflowEngineInstance } = await import('../../engine/WorkflowEngine.js');
    
    try {
      await WorkflowEngineInstance.trigger(workflowData.type, workflowData.data);
      console.log('Recovery workflow triggered successfully:', workflowData.type);
    } catch (error) {
      console.error('Failed to trigger recovery workflow:', error);
      throw error;
    }
  }
}
