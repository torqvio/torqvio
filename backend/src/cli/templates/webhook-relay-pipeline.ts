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

export const fraudChargebackAutomationTemplate: Template = {
  id: 'fraud-chargeback-automation',
  name: 'Fraud & Chargeback Automation',
  description: 'Automated dispute response and fraud prevention workflows',
  version: '1.0.0',
  category: 'risk',
  
  triggers: [
    { type: 'stripe_webhook', events: ['charge.dispute.created', 'radar.alert.created'] },
    { type: 'manual', description: 'Manual dispute escalation' }
  ],
  
  steps: [
    {
      id: 'assess_dispute_risk',
      action: 'analyze_dispute',
      config: {
        factors: ['customer_history', 'order_value', 'dispute_reason', 'evidence_available'],
        risk_threshold: 0.6
      }
    },
    {
      id: 'gather_evidence',
      action: 'collect_dispute_evidence',
      config: {
        evidence_types: [
          'customer_communication',
          'delivery_confirmation', 
          'service_usage_logs',
          'refund_policy'
        ]
      }
    },
    {
      id: 'submit_response',
      action: 'file_dispute_response',
      config: {
        auto_submit: 'low_risk_cases',
        manual_review: 'high_risk_cases',
        response_template: 'standard_evidence_package'
      }
    },
    {
      id: 'update_fraud_scores',
      action: 'adjust_risk_scores',
      config: {
        customer_risk_adjustment: 'dispute_outcome_dependent',
        payment_method_flagging: true
      }
    },
    {
      id: 'implement_prevention',
      action: 'strengthen_controls',
      config: {
        actions: ['upgrade_radar_rules', 'require_additional_verification', 'flag_similar_patterns']
      }
    }
  ]
};
