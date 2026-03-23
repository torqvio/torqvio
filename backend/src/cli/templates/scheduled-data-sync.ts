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

export const subscriptionChurnPreventionTemplate: Template = {
  id: 'subscription-churn-prevention',
  name: 'Subscription Churn Prevention',
  description: 'Proactive dunning and win-back sequences for subscription businesses',
  version: '1.0.0',
  category: 'subscriptions',
  
  triggers: [
    { type: 'stripe_webhook', events: ['invoice.payment_failed', 'customer.subscription.deleted'] },
    { type: 'schedule', cron: '0 9 * * 1' } // Weekly churn risk analysis
  ],
  
  steps: [
    {
      id: 'analyze_churn_risk',
      action: 'predict_churn_probability',
      config: {
        model: 'subscription_ltv',
        factors: ['payment_history', 'usage_metrics', 'support_tickets']
      }
    },
    {
      id: 'segment_customers',
      action: 'segment_by_risk',
      config: {
        high_risk: { probability: '> 0.7', action: 'immediate_intervention' },
        medium_risk: { probability: '0.3-0.7', action: 'scheduled_outreach' },
        low_risk: { probability: '< 0.3', action: 'monitor' }
      }
    },
    {
      id: 'send_dunning_campaign',
      action: 'send_email_sequence',
      config: {
        sequence: [
          { delay: '0 hours', template: 'payment_failed_immediate' },
          { delay: '24 hours', template: 'payment_failed_reminder' },
          { delay: '72 hours', template: 'payment_failed_final' },
          { delay: '7 days', template: 'subscription_cancellation_offer' }
        ]
      }
    },
    {
      id: 'offer_payment_plan',
      action: 'create_payment_plan',
      config: {
        eligible_for_plan: 'high_value_customers',
        plan_options: ['3_months', '6_months', '12_months']
      }
    },
    {
      id: 'update_crm',
      action: 'sync_to_crm',
      config: {
        tags: ['at_risk', 'dunning_active'],
        priority: 'high'
      }
    }
  ]
};
