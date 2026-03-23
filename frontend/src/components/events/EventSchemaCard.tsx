'use client'

import { useState } from 'react'
import { ChevronDown, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventTypeBadge } from './EventTypeBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventSchema {
  eventType: string
  source: string
  description: string
  schema: Record<string, unknown>
  subscriptionCount: number
  recentCount: number
  examplePayload: Record<string, unknown>
}

// ─── Built-in schemas ─────────────────────────────────────────────────────────

export const BUILT_IN_SCHEMAS: EventSchema[] = [
  {
    eventType: 'payment.failed',
    source: 'Stripe',
    description: 'Fired when a payment attempt fails with card or network error.',
    subscriptionCount: 2,
    recentCount: 3,
    schema: {
      type: 'object',
      required: ['payment_intent_id', 'amount', 'currency', 'failure_reason'],
      properties: {
        payment_intent_id: { type: 'string' },
        amount:            { type: 'number', description: 'Amount in cents' },
        currency:          { type: 'string', description: 'ISO 4217 currency code' },
        failure_reason:    { type: 'string', enum: ['card_declined', 'insufficient_funds', 'expired_card'] },
      },
    },
    examplePayload: { payment_intent_id: 'pi_xxx', amount: 4999, currency: 'usd', failure_reason: 'card_declined' },
  },
  {
    eventType: 'subscription.dunning',
    source: 'Stripe',
    description: 'Subscription payment overdue, entering dunning cycle.',
    subscriptionCount: 1,
    recentCount: 1,
    schema: {
      type: 'object',
      required: ['subscription_id', 'dunning_level', 'amount'],
      properties: {
        subscription_id: { type: 'string' },
        dunning_level:   { type: 'number', description: 'Current dunning attempt (1–4)' },
        amount:          { type: 'number', description: 'Amount past due in cents' },
      },
    },
    examplePayload: { subscription_id: 'sub_abc', dunning_level: 2, amount: 2900 },
  },
  {
    eventType: 'webhook.dead_letter',
    source: 'Any',
    description: 'Webhook delivery failed after maximum retries.',
    subscriptionCount: 1,
    recentCount: 1,
    schema: {
      type: 'object',
      required: ['original_url', 'retry_count', 'max_retries'],
      properties: {
        original_url: { type: 'string', format: 'uri' },
        retry_count:  { type: 'number' },
        max_retries:  { type: 'number' },
        last_error:   { type: 'string' },
      },
    },
    examplePayload: { original_url: 'https://hooks.example.com/ingest', retry_count: 5, max_retries: 5 },
  },
  {
    eventType: 'api.retry',
    source: 'Any',
    description: 'An API call failed and is scheduled for retry.',
    subscriptionCount: 1,
    recentCount: 1,
    schema: {
      type: 'object',
      required: ['endpoint', 'method', 'attempt', 'max_retries'],
      properties: {
        endpoint:    { type: 'string' },
        method:      { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
        attempt:     { type: 'number' },
        max_retries: { type: 'number' },
      },
    },
    examplePayload: { endpoint: '/v1/charge', method: 'POST', attempt: 3, max_retries: 5 },
  },
]

// ─── Card ─────────────────────────────────────────────────────────────────────

interface EventSchemaCardProps {
  schema: EventSchema
  onSendTest?: (schema: EventSchema) => void
  onFilterSubscriptions?: (eventType: string) => void
  onFilterStream?: (eventType: string) => void
}

export function EventSchemaCard({
  schema,
  onSendTest,
  onFilterSubscriptions,
  onFilterStream,
}: EventSchemaCardProps) {
  const [schemaExpanded, setSchemaExpanded] = useState(false)
  const schemaJson = JSON.stringify(schema.schema, null, 2)

  return (
    <div className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/30 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <EventTypeBadge type={schema.eventType} />
          <p className="text-xs text-text-muted mt-1">{schema.description}</p>
        </div>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-light text-text-muted border border-border flex-shrink-0">
          {schema.source}
        </span>
      </div>

      {/* Counters */}
      <div className="flex items-center gap-4 text-[11px]">
        <button
          onClick={() => onFilterSubscriptions?.(schema.eventType)}
          className="text-text-muted hover:text-primary transition-colors"
        >
          <span className="font-medium text-text-secondary">{schema.subscriptionCount}</span> subscriptions
        </button>
        <button
          onClick={() => onFilterStream?.(schema.eventType)}
          className="text-text-muted hover:text-primary transition-colors"
        >
          <span className="font-medium text-text-secondary">{schema.recentCount}</span> events (24h)
        </button>
      </div>

      {/* Schema toggle */}
      <button
        onClick={() => setSchemaExpanded((o) => !o)}
        className="flex items-center gap-1 text-[11px] text-text-muted hover:text-text-primary transition-colors"
      >
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', schemaExpanded && 'rotate-180')} />
        {schemaExpanded ? 'Hide schema' : 'Show schema'}
      </button>

      {schemaExpanded && (
        <pre className="text-[11px] font-mono text-text-secondary bg-background rounded-md p-3 overflow-auto max-h-48 border border-border leading-relaxed">
          {schemaJson}
        </pre>
      )}

      {/* Send test */}
      <button
        onClick={() => onSendTest?.(schema)}
        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-surface-light hover:bg-border text-text-secondary hover:text-text-primary border border-border transition-colors mt-auto"
      >
        <Send className="w-3.5 h-3.5" />
        Send Test
      </button>
    </div>
  )
}