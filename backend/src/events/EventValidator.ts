import { z } from 'zod';

export const BaseEventSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string(),
  source: z.string(),
  timestamp: z.string().datetime().optional(),
  data: z.any(),
  metadata: z.object({
    version: z.string().default('1.0'),
    source_ip: z.string().optional(),
    user_agent: z.string().optional()
  }).optional()
});

export const PaymentFailedEventSchema = BaseEventSchema.extend({
  type: z.literal('payment.failed'),
  source: z.literal('stripe'),
  data: z.object({
    payment_intent_id: z.string(),
    customer_id: z.string(),
    amount: z.number(),
    currency: z.string(),
    failure_reason: z.string(),
    failure_code: z.string(),
    webhook_id: z.string()
  })
});

export const SubscriptionDunningEventSchema = BaseEventSchema.extend({
  type: z.literal('subscription.dunning'),
  source: z.literal('stripe'),
  data: z.object({
    subscription_id: z.string(),
    customer_id: z.string(),
    amount: z.number(),
    currency: z.string(),
    dunning_level: z.number(),
    next_retry_date: z.string()
  })
});

export const WebhookDeadLetterEventSchema = BaseEventSchema.extend({
  type: z.literal('webhook.dead_letter'),
  source: z.string(),
  data: z.object({
    original_url: z.string(),
    original_payload: z.any(),
    failure_reason: z.string(),
    retry_count: z.number(),
    max_retries: z.number()
  })
});

export const ApiRetryEventSchema = BaseEventSchema.extend({
  type: z.literal('api.retry'),
  source: z.string(),
  data: z.object({
    endpoint: z.string(),
    method: z.string(),
    status_code: z.number(),
    response_body: z.any(),
    retry_count: z.number()
  })
});

export type ExternalEvent = z.infer<typeof BaseEventSchema>;
export type PaymentFailedEvent = z.infer<typeof PaymentFailedEventSchema>;
export type SubscriptionDunningEvent = z.infer<typeof SubscriptionDunningEventSchema>;
export type WebhookDeadLetterEvent = z.infer<typeof WebhookDeadLetterEventSchema>;
export type ApiRetryEvent = z.infer<typeof ApiRetryEventSchema>;

export class EventValidator {
  static validate(event: any): ExternalEvent {
    return BaseEventSchema.parse(event);
  }

  static validatePaymentFailed(event: any): PaymentFailedEvent {
    return PaymentFailedEventSchema.parse(event);
  }

  static validateSubscriptionDunning(event: any): SubscriptionDunningEvent {
    return SubscriptionDunningEventSchema.parse(event);
  }

  static validateWebhookDeadLetter(event: any): WebhookDeadLetterEvent {
    return WebhookDeadLetterEventSchema.parse(event);
  }

  static validateApiRetry(event: any): ApiRetryEvent {
    return ApiRetryEventSchema.parse(event);
  }

  static validateByType(eventType: string, event: any): ExternalEvent {
    switch (eventType) {
      case 'payment.failed':
        return this.validatePaymentFailed(event);
      case 'subscription.dunning':
        return this.validateSubscriptionDunning(event);
      case 'webhook.dead_letter':
        return this.validateWebhookDeadLetter(event);
      case 'api.retry':
        return this.validateApiRetry(event);
      default:
        return this.validate(event);
    }
  }
}
