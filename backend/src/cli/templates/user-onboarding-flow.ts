export interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  category: string;
  triggers: TemplateTrigger[];
  steps: TemplateStep[];
}

export interface TemplateTrigger {
  type: string;
  events?: string[];
  cron?: string;
  description?: string;
}

export interface TemplateStep {
  id: string;
  action: string;
  config: Record<string, any>;
}

export const cartAbandonmentRecoveryTemplate: Template = {
  id: 'user-onboarding-flow',
  name: 'User Onboarding Flow',
  description: 'Complete user registration with email verification and welcome sequence',
  version: '1.0.0',
  category: 'automation',
  
  triggers: [
    { type: 'webhook', events: ['user_registered', 'signup_initiated'] },
    { type: 'schedule', cron: '0 */6 * * *' } // Every 6 hours
  ],
  
  steps: [
    {
      id: 'analyze_cart_value',
      action: 'calculate_cart_metrics',
      config: {
        include_shipping: true,
        include_discounts: false,
        minimum_value: 50
      }
    },
    {
      id: 'segment_abandonment_reason',
      action: 'categorize_abandonment',
      config: {
        categories: ['high_value', 'return_customer', 'new_customer', 'shipping_issue']
      }
    },
    {
      id: 'send_recovery_sequence',
      action: 'send_multichannel_sequence',
      config: {
        channels: ['email', 'sms', 'push_notification'],
        sequence: [
          { channel: 'email', delay: '1 hour', template: 'cart_abandonment_1' },
          { channel: 'sms', delay: '3 hours', template: 'cart_abandonment_sms' },
          { channel: 'email', delay: '24 hours', template: 'cart_abandonment_discount' },
          { channel: 'push', delay: '48 hours', template: 'cart_expiring_soon' }
        ]
      }
    },
    {
      id: 'create_recovery_link',
      action: 'generate_recovery_url',
      config: {
        expire_hours: 72,
        auto_apply_discount: true,
        discount_type: 'percentage',
        discount_value: 10
      }
    },
    {
      id: 'track_recovery_metrics',
      action: 'log_conversion_event',
      config: {
        event_type: 'cart_recovery',
        attribution_window: '7 days'
      }
    }
  ]
};
