import axios from 'axios';
import { IntegrationConnector, ExternalEvent, ProcessedEvent, ShopifyConfig, WebhookConfig, OrderRecoveryData } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class ShopifyConnector implements IntegrationConnector {
  private config: ShopifyConfig;
  private baseUrl: string;

  constructor(config: ShopifyConfig) {
    this.config = config;
    this.baseUrl = `https://${config.shopDomain}.myshopify.com`;
  }

  async validateCredentials(config: ShopifyConfig): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': config.accessToken
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Shopify credential validation failed:', error);
      return false;
    }
  }

  async setupWebhooks(config: ShopifyConfig): Promise<WebhookConfig> {
    try {
      const webhookPayload = {
        webhook: {
          topic: 'orders/paid',
          address: config.webhookUrl,
          format: 'json'
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/admin/api/2023-10/webhooks.json`,
        webhookPayload,
        {
          headers: {
            'X-Shopify-Access-Token': config.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        endpointId: response.data.webhook.id.toString(),
        secret: response.data.webhook.secret || 'shopify_webhook_secret',
        url: config.webhookUrl
      };
    } catch (error) {
      console.error('Shopify webhook setup failed:', error);
      throw new Error(`Failed to setup Shopify webhooks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processEvent(event: ExternalEvent): Promise<ProcessedEvent> {
    try {
      const shopifyTopic = event.headers['x-shopify-topic'];
      const shopifyShop = event.headers['x-shopify-shop-domain'];
      
      // Verify the webhook is from the correct shop
      if (shopifyShop !== this.config.shopDomain) {
        return {
          id: uuidv4(),
          status: 'ignored',
          reason: 'Webhook from unauthorized shop'
        };
      }

      switch (shopifyTopic) {
        case 'orders/paid':
          return await this.handleOrderPaid(event.data);
        case 'orders/updated':
          return await this.handleOrderUpdated(event.data);
        case 'orders/cancelled':
          return await this.handleOrderCancelled(event.data);
        case 'checkouts/completed':
          return await this.handleCheckoutCompleted(event.data);
        case 'app/uninstalled':
          return await this.handleAppUninstalled(event.data);
        default:
          return {
            id: uuidv4(),
            status: 'ignored',
            reason: `Unsupported Shopify topic: ${shopifyTopic}`
          };
      }
    } catch (error) {
      console.error('Error processing Shopify event:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process Shopify event: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleOrderPaid(order: any): Promise<ProcessedEvent> {
    try {
      // This is a successful order - log for analytics
      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'order_success_analytics',
        data: {
          orderId: order.id,
          customerId: order.customer?.id,
          totalAmount: order.total_price,
          currency: order.currency,
          createdAt: order.created_at
        }
      };
    } catch (error) {
      console.error('Error handling order paid:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process order paid: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleOrderUpdated(order: any): Promise<ProcessedEvent> {
    try {
      // Check if this is a payment failure update
      if (order.financial_status === 'pending' && order.tags?.includes('payment_failed')) {
        return await this.handlePaymentFailure(order);
      }

      return {
        id: uuidv4(),
        status: 'ignored',
        reason: 'Order update not related to payment failure'
      };
    } catch (error) {
      console.error('Error handling order updated:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process order updated: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleOrderCancelled(order: any): Promise<ProcessedEvent> {
    try {
      // Check if cancellation was due to payment issues
      const cancelReason = order.cancel_reason;
      const isPaymentRelated = cancelReason === 'fraud' || order.tags?.includes('payment_failed');

      if (isPaymentRelated) {
        await this.triggerOrderRecovery({
          orderId: order.id,
          customerEmail: order.email,
          totalAmount: order.total_price,
          failureReason: `Order cancelled: ${cancelReason}`
        });

        return {
          id: uuidv4(),
          status: 'processed',
          workflowTriggered: 'order_cancellation_recovery',
          recoveryPotential: parseFloat(order.total_price) * 100, // cents
          data: {
            orderId: order.id,
            customerId: order.customer?.id,
            totalAmount: order.total_price,
            cancelReason
          }
        };
      }

      return {
        id: uuidv4(),
        status: 'ignored',
        reason: 'Order cancellation not payment related'
      };
    } catch (error) {
      console.error('Error handling order cancelled:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process order cancelled: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleCheckoutCompleted(checkout: any): Promise<ProcessedEvent> {
    try {
      // Check if there were any payment issues during checkout
      if (checkout.abandoned_checkout_url || checkout.closed_at === null) {
        // This might be an abandoned checkout with payment issues
        await this.triggerCheckoutRecovery({
          checkoutId: checkout.id,
          customerEmail: checkout.email,
          totalAmount: checkout.total_price,
          currency: checkout.currency
        });

        return {
          id: uuidv4(),
          status: 'processed',
          workflowTriggered: 'checkout_recovery',
          recoveryPotential: parseFloat(checkout.total_price) * 100,
          data: {
            checkoutId: checkout.id,
            customerEmail: checkout.email,
            totalAmount: checkout.total_price
          }
        };
      }

      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'checkout_success_analytics',
        data: {
          checkoutId: checkout.id,
          totalAmount: checkout.total_price
        }
      };
    } catch (error) {
      console.error('Error handling checkout completed:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process checkout completed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handleAppUninstalled(data: any): Promise<ProcessedEvent> {
    try {
      // App was uninstalled - log for analytics and cleanup
      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'app_uninstalled_cleanup',
        data: {
          shopDomain: this.config.shopDomain,
          uninstalledAt: new Date()
        }
      };
    } catch (error) {
      console.error('Error handling app uninstalled:', error);
      return {
        id: uuidv4(),
        status: 'error',
        reason: `Failed to process app uninstalled: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async handlePaymentFailure(order: any): Promise<ProcessedEvent> {
    try {
      await this.triggerOrderRecovery({
        orderId: order.id,
        customerEmail: order.email,
        totalAmount: order.total_price,
        failureReason: order.payment_details?.gateway_error || 'Payment failed'
      });

      return {
        id: uuidv4(),
        status: 'processed',
        workflowTriggered: 'order_recovery',
        recoveryPotential: parseFloat(order.total_price) * 100, // cents
        data: {
          orderId: order.id,
          customerId: order.customer?.id,
          totalAmount: order.total_price,
          failureReason: order.payment_details?.gateway_error
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

  private async triggerOrderRecovery(orderData: OrderRecoveryData): Promise<void> {
    try {
      // Update order with recovery tags
      await axios.put(
        `${this.baseUrl}/admin/api/2023-10/orders/${orderData.orderId}.json`,
        {
          order: {
            tags: ['payment_failed', 'recovery_active', 'torqvio_recovery']
          }
        },
        {
          headers: {
            'X-Shopify-Access-Token': this.config.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Triggering order recovery workflow:', orderData);
      
      // TODO: Integrate with WorkflowEngine.trigger()
      // await WorkflowEngine.trigger('order-recovery', orderData);
    } catch (error) {
      console.error('Error triggering order recovery:', error);
      throw error;
    }
  }

  private async triggerCheckoutRecovery(checkoutData: any): Promise<void> {
    console.log('Triggering checkout recovery workflow:', checkoutData);
    
    // TODO: Integrate with WorkflowEngine.trigger()
    // await WorkflowEngine.trigger('checkout-recovery', checkoutData);
  }

  // Helper method to get customer order history
  async getCustomerOrderHistory(customerId: string): Promise<any[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/admin/api/2023-10/orders.json?customer_id=${customerId}&status=any`,
        {
          headers: {
            'X-Shopify-Access-Token': this.config.accessToken
          }
        }
      );

      return response.data.orders;
    } catch (error) {
      console.error('Error fetching customer order history:', error);
      return [];
    }
  }

  // Helper method to create a new checkout for recovery
  async createRecoveryCheckout(lineItems: any[], email: string): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admin/api/2023-10/checkouts.json`,
        {
          checkout: {
            email: email,
            line_items: lineItems,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
          }
        },
        {
          headers: {
            'X-Shopify-Access-Token': this.config.accessToken,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.checkout;
    } catch (error) {
      console.error('Error creating recovery checkout:', error);
      throw error;
    }
  }
}
