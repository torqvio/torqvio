export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  category: 'payment' | 'subscription' | 'webhook' | 'api' | 'integration';
  value_proposition: string;
  money_impact: string;
  setup_time: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  downloads: number;
  rating: number;
  author: string;
  created_at: string;
  environment: Record<string, string>;
  triggers: any[];
  steps: any[];
  monitoring?: any;
  compliance?: any;
}

export const marketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: 'payment-recovery',
    name: 'Payment Recovery',
    description: 'Never lose a payment due to temporary failures',
    category: 'payment',
    value_proposition: 'Recovers 95% of failed payments automatically',
    money_impact: 'Save €10,000+ monthly',
    setup_time: '2 min',
    difficulty: 'easy',
    tags: ['stripe', 'payments', 'recovery', 'automation'],
    downloads: 1247,
    rating: 4.9,
    author: 'Torqvio',
    created_at: '2024-01-15T00:00:00Z',
    environment: {
      STRIPE_SECRET_KEY: 'sk_test_...',
      WEBHOOK_SECRET: 'whsec_...',
      MAX_RETRY_ATTEMPTS: '3'
    },
    triggers: [
      {
        type: 'webhook',
        event: 'payment_intent.payment_failed',
        source: 'stripe',
        config: {
          endpoint: '/webhook/payment-recovery',
          signature_header: 'stripe-signature',
          events: ['payment_intent.payment_failed', 'invoice.payment_failed']
        }
      }
    ],
    steps: [
      {
        id: 'validate_payment',
        type: 'validation',
        name: 'Validate Payment Status',
        config: {
          checks: ['payment_intent_valid', 'customer_active']
        }
      },
      {
        id: 'check_retry_history',
        type: 'condition',
        name: 'Check Retry History',
        config: {
          condition: 'retry_attempts < max_retry_attempts',
          on_true: 'retry_payment',
          on_false: 'notify_failure'
        }
      },
      {
        id: 'retry_payment',
        type: 'api_call',
        name: 'Retry Payment',
        config: {
          method: 'POST',
          url: 'https://api.stripe.com/v1/payment_intents/${payment_intent_id}/confirm',
          headers: {
            'Authorization': 'Bearer ${STRIPE_SECRET_KEY}'
          },
          delay_ms: '${retry_attempt * 5000}'
        }
      }
    ]
  },
  {
    id: 'subscription-dunning',
    name: 'Subscription Dunning',
    description: 'Automated subscription payment recovery with customer communication',
    category: 'subscription',
    value_proposition: 'Reduce churn by 40% with intelligent retry sequences',
    money_impact: 'Save €5,000+ monthly in lost revenue',
    setup_time: '3 min',
    difficulty: 'easy',
    tags: ['stripe', 'subscriptions', 'churn', 'dunning'],
    downloads: 856,
    rating: 4.7,
    author: 'Torqvio',
    created_at: '2024-01-20T00:00:00Z',
    environment: {
      STRIPE_SECRET_KEY: 'sk_test_...',
      NOTIFICATION_EMAIL: 'admin@yourcompany.com',
      MAX_DUNNING_ATTEMPTS: '3',
      DUNNING_DELAY_DAYS: '3'
    },
    triggers: [
      {
        type: 'webhook',
        event: 'invoice.payment_failed',
        source: 'stripe',
        config: {
          endpoint: '/webhook/subscription-dunning',
          signature_header: 'stripe-signature',
          events: ['invoice.payment_failed', 'customer.subscription.deleted']
        }
      }
    ],
    steps: [
      {
        id: 'validate_subscription',
        type: 'validation',
        name: 'Validate Subscription Status',
        config: {
          checks: ['subscription_active', 'customer_valid']
        }
      },
      {
        id: 'check_dunning_history',
        type: 'condition',
        name: 'Check Dunning History',
        config: {
          condition: 'dunning_attempts < max_dunning_attempts',
          on_true: 'send_dunning_email',
          on_false: 'cancel_subscription'
        }
      },
      {
        id: 'send_dunning_email',
        type: 'notification',
        name: 'Send Dunning Email',
        config: {
          type: 'email',
          template: 'dunning_reminder',
          variables: {
            'customer_name': '${customer.name}',
            'amount_due': '${invoice.amount}',
            'days_overdue': '${days_overdue}'
          }
        }
      },
      {
        id: 'wait_for_payment',
        type: 'delay',
        name: 'Wait For Payment',
        config: {
          delay_ms: '${DUNNING_DELAY_DAYS}d'
        }
      },
      {
        id: 'retry_payment',
        type: 'api_call',
        name: 'Retry Subscription Payment',
        config: {
          method: 'POST',
          url: 'https://api.stripe.com/v1/invoices/${invoice_id}/pay',
          headers: {
            'Authorization': 'Bearer ${STRIPE_SECRET_KEY}'
          }
        }
      }
    ]
  },
  {
    id: 'failed-email-retry',
    name: 'Failed Email Retry',
    description: 'Automatically retry failed email deliveries with exponential backoff',
    category: 'webhook',
    value_proposition: '99.9% email delivery guarantee',
    money_impact: 'Prevent critical communication failures',
    setup_time: '2 min',
    difficulty: 'easy',
    tags: ['email', 'delivery', 'retry', 'communication'],
    downloads: 623,
    rating: 4.6,
    author: 'Torqvio',
    created_at: '2024-01-25T00:00:00Z',
    environment: {
      EMAIL_SERVICE_API_KEY: 'your_email_service_key',
      MAX_RETRY_ATTEMPTS: '5',
      RETRY_DELAY_MS: '60000'
    },
    triggers: [
      {
        type: 'webhook',
        event: 'email.delivery_failed',
        source: 'email_service',
        config: {
          endpoint: '/webhook/email-retry',
          events: ['email.delivery_failed', 'email.bounced']
        }
      }
    ],
    steps: [
      {
        id: 'validate_email_failure',
        type: 'validation',
        name: 'Validate Email Failure',
        config: {
          checks: ['email_valid', 'failure_reason_temporary']
        }
      },
      {
        id: 'check_retry_limit',
        type: 'condition',
        name: 'Check Retry Limit',
        config: {
          condition: 'retry_count < max_retry_attempts',
          on_true: 'delay_and_retry',
          on_false: 'mark_permanent_failure'
        }
      },
      {
        id: 'delay_and_retry',
        type: 'delay',
        name: 'Wait Before Retry',
        config: {
          delay_ms: '${RETRY_DELAY_MS}',
          exponential_backoff: true
        }
      },
      {
        id: 'retry_email_send',
        type: 'api_call',
        name: 'Retry Email Send',
        config: {
          method: 'POST',
          url: 'https://api.emailservice.com/v1/send',
          headers: {
            'Authorization': 'Bearer ${EMAIL_SERVICE_API_KEY}'
          },
          body: '${original_email_payload}'
        }
      }
    ]
  },
  {
    id: 'webhook-dead-letter',
    name: 'Webhook Dead Letter Queue',
    description: 'Catch and process failed webhooks with intelligent retry logic',
    category: 'webhook',
    value_proposition: 'Never lose critical webhook data',
    money_impact: 'Prevent data loss and sync issues',
    setup_time: '1 min',
    difficulty: 'easy',
    tags: ['webhook', 'dead-letter', 'retry', 'reliability'],
    downloads: 445,
    rating: 4.8,
    author: 'Torqvio',
    created_at: '2024-02-01T00:00:00Z',
    environment: {
      DEAD_LETTER_WEBHOOK_URL: 'https://your-app.com/webhook/dead-letter',
      MAX_RETRY_ATTEMPTS: '10',
      RETRY_DELAY_MS: '300000'
    },
    triggers: [
      {
        type: 'webhook',
        event: 'webhook.delivery_failed',
        source: 'any',
        config: {
          endpoint: '/webhook/dead-letter',
          events: ['webhook.delivery_failed']
        }
      }
    ],
    steps: [
      {
        id: 'store_failed_webhook',
        type: 'data_store',
        name: 'Store Failed Webhook',
        config: {
          table: 'failed_webhooks',
          data: '${original_webhook_data}'
        }
      },
      {
        id: 'analyze_failure',
        type: 'condition',
        name: 'Analyze Failure Type',
        config: {
          condition: 'failure_type == "temporary"',
          on_true: 'schedule_retry',
          on_false: 'notify_admin'
        }
      },
      {
        id: 'schedule_retry',
        type: 'delay',
        name: 'Schedule Retry',
        config: {
          delay_ms: '${RETRY_DELAY_MS}',
          exponential_backoff: true
        }
      },
      {
        id: 'retry_webhook',
        type: 'api_call',
        name: 'Retry Webhook Delivery',
        config: {
          method: '${original_webhook_method}',
          url: '${original_webhook_url}',
          headers: '${original_webhook_headers}',
          body: '${original_webhook_body}'
        }
      }
    ]
  },
  {
    id: 'api-retry-pipeline',
    name: 'API Retry Pipeline',
    description: 'Intelligent API retry logic with circuit breaker pattern',
    category: 'api',
    value_proposition: '99.99% API reliability for critical integrations',
    money_impact: 'Prevent integration failures and data loss',
    setup_time: '2 min',
    difficulty: 'medium',
    tags: ['api', 'retry', 'circuit-breaker', 'reliability'],
    downloads: 312,
    rating: 4.5,
    author: 'Torqvio',
    created_at: '2024-02-05T00:00:00Z',
    environment: {
      CIRCUIT_BREAKER_THRESHOLD: '5',
      RETRY_ATTEMPTS: '3',
      RETRY_DELAY_MS: '1000'
    },
    triggers: [
      {
        type: 'webhook',
        event: 'api.request_failed',
        source: 'any',
        config: {
          endpoint: '/webhook/api-retry',
          events: ['api.request_failed']
        }
      }
    ],
    steps: [
      {
        id: 'check_circuit_breaker',
        type: 'condition',
        name: 'Check Circuit Breaker',
        config: {
          condition: 'failure_count < circuit_breaker_threshold',
          on_true: 'retry_api_call',
          on_false: 'open_circuit'
        }
      },
      {
        id: 'retry_api_call',
        type: 'api_call',
        name: 'Retry API Call',
        config: {
          method: '${original_method}',
          url: '${original_url}',
          headers: '${original_headers}',
          body: '${original_body}',
          timeout: 30000
        }
      },
      {
        id: 'update_circuit_state',
        type: 'data_update',
        name: 'Update Circuit State',
        config: {
          operation: 'increment',
          field: 'failure_count',
          condition: 'api_call_failed'
        }
      }
    ]
  }
];

export class TemplateRegistry {
  static getAllTemplates(): MarketplaceTemplate[] {
    return marketplaceTemplates;
  }

  static getTemplateById(id: string): MarketplaceTemplate | undefined {
    return marketplaceTemplates.find(template => template.id === id);
  }

  static getTemplatesByCategory(category: string): MarketplaceTemplate[] {
    return marketplaceTemplates.filter(template => template.category === category);
  }

  static searchTemplates(query: string): MarketplaceTemplate[] {
    const lowercaseQuery = query.toLowerCase();
    return marketplaceTemplates.filter(template =>
      template.name.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }
}
