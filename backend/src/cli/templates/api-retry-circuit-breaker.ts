import { Template } from '../types.js';

export const paymentRecoveryTemplate: Template = {
  id: 'api-retry-circuit-breaker',
  name: 'API Retry with Circuit Breaker',
  description: 'Intelligent API retry logic with circuit breaker pattern',
  category: 'webhook',
  value_proposition: '99.99% API reliability for critical integrations',
  environment: {
    API_SECRET_KEY: 'your_api_secret_key',
    WEBHOOK_SECRET: 'whsec_...',
    NOTIFICATION_EMAIL: 'admin@yourcompany.com',
    MAX_RETRY_ATTEMPTS: '3',
    RETRY_DELAY_MS: '1000'
  },
  triggers: [
    {
      type: 'webhook',
      event: 'api_failure',
      source: 'external_api',
      config: {
        endpoint: '/webhook/api-retry',
        signature_header: 'x-signature',
        events: ['api_request_failed', 'service_unavailable']
      }
    }
  ],
  steps: [
    {
      id: 'validate_api_failure',
      type: 'validation',
      name: 'Validate API Failure',
      config: {
        checks: [
          'request_id_exists',
          'failure_reason_valid',
          'service_available'
        ]
      },
      retry_policy: {
        max_attempts: 2,
        backoff_strategy: 'exponential'
      }
    },
    {
      id: 'log_failure_details',
      type: 'logging',
      name: 'Log Failure Details',
      config: {
        level: 'error',
        include_fields: [
          'request_id',
          'failure_reason',
          'service_name',
          'endpoint',
          'status_code'
        ]
      }
    },
    {
      id: 'check_previous_attempts',
      type: 'condition',
      name: 'Check Previous Attempts',
      config: {
        condition: 'retry_count < max_retry_attempts',
        on_true: 'retry_api_call',
        on_false: 'escalate_failure'
      }
    },
    {
      id: 'retry_api_call',
      type: 'api_call',
      name: 'Retry API Call',
      config: {
        method: 'POST',
        url: '${original_endpoint}',
        headers: {
          'Authorization': 'Bearer ${API_SECRET_KEY}'
        },
        body: {
          'data': '${original_request_body}'
        },
        timeout: 30000
      },
      retry_policy: {
        max_attempts: 3,
        backoff_strategy: 'exponential',
        base_delay: 1000
      }
    },
    {
      id: 'verify_retry_success',
      type: 'condition',
      name: 'Verify Retry Success',
      config: {
        condition: 'response_status < 400',
        on_true: 'send_recovery_success',
        on_false: 'increment_retry_count'
      }
    },
    {
      id: 'increment_retry_count',
      type: 'data_transform',
      name: 'Increment Retry Count',
      config: {
        operation: 'increment',
        field: 'retry_count',
        value: 1
      }
    },
    {
      id: 'wait_before_retry',
      type: 'delay',
      name: 'Wait Before Next Retry',
      config: {
        delay_ms: '${RETRY_DELAY_MS}',
        exponential_backoff: true
      }
    },
    {
      id: 'send_recovery_success',
      type: 'notification',
      name: 'Send Recovery Success',
      config: {
        type: 'email',
        to: '${NOTIFICATION_EMAIL}',
        template: 'api_recovery_success',
        subject: 'API Call Successfully Recovered',
        variables: {
          'endpoint': '${original_endpoint}',
          'service_name': '${service_name}',
          'retry_attempts': '${retry_count}'
        }
      }
    },
    {
      id: 'escalate_failure',
      type: 'escalation',
      name: 'Escalate API Failure',
      config: {
        escalation_level: 'high',
        notify_admin: true,
        create_support_ticket: true,
        priority: 'urgent'
      }
    },
    {
      id: 'send_failure_notification',
      type: 'notification',
      name: 'Send Failure Notification',
      config: {
        type: 'email',
        to: '${NOTIFICATION_EMAIL}',
        template: 'api_failure_escalation',
        subject: 'API Recovery Failed - Action Required',
        variables: {
          'request_id': '${request_id}',
          'service_name': '${service_name}',
          'endpoint': '${original_endpoint}',
          'failure_reason': '${failure_reason}',
          'retry_attempts': '${retry_count}'
        }
      }
    },
    {
      id: 'update_service_status',
      type: 'data_update',
      name: 'Update Service Status',
      config: {
        table: 'services',
        operation: 'update',
        condition: 'name = ${service_name}',
        fields: {
          'status': 'degraded',
          'last_failure_date': 'NOW()',
          'requires_manual_review': true
        }
      }
    },
    {
      id: 'create_recovery_report',
      type: 'reporting',
      name: 'Create Recovery Report',
      config: {
        report_type: 'api_recovery_attempt',
        metrics: [
          'endpoint',
          'failure_reason',
          'retry_count',
          'recovery_success',
          'time_to_recovery'
        ],
        tags: ['api', 'recovery', 'circuit-breaker']
      }
    }
  ],
  monitoring: {
    alerts: [
      {
        name: 'High API Failure Rate',
        condition: 'failure_rate > 10%',
        threshold: '10%',
        window: '1h',
        notification: ['email', 'slack']
      },
      {
        name: 'API Recovery Success Rate Low',
        condition: 'recovery_rate < 80%',
        threshold: '80%',
        window: '24h',
        notification: ['email']
      }
    ],
    metrics: [
      'api_attempts',
      'api_failures',
      'recovery_attempts',
      'recovery_success_rate',
      'average_recovery_time'
    ]
  },
  compliance: {
    data_retention: {
      api_logs: '2 years',
      request_data: '1 year'
    },
    security: {
      encrypt_sensitive_data: true,
      audit_trail: true,
      access_controls: ['dev_team', 'admin']
    },
    regulations: ['SOC2', 'GDPR']
  }
};

export default paymentRecoveryTemplate;
