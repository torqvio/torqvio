'use client'

import { useState } from 'react'
import { ChevronRight, RefreshCw, ExternalLink, CreditCard, Webhook, Zap, Cpu, MousePointerClick, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventTypeBadge } from './EventTypeBadge'
import { EventPayloadViewer } from './EventPayloadViewer'
import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Event {
  id: string
  type: string
  payload: Record<string, unknown>
  source: string
  timestamp: string
  processed: boolean
  matched: number
  correlationId?: string
  causationId?: string
  error?: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_EVENTS: Event[] = [
  {
    id: 'evt_001', type: 'payment.failed', source: 'stripe', timestamp: '3s ago', processed: true, matched: 2,
    correlationId: 'cor_abc123',
    payload: { payment_intent_id: 'pi_xxx', amount: 4999, currency: 'usd', failure_reason: 'card_declined' },
  },
  {
    id: 'evt_002', type: 'user.signup', source: 'api', timestamp: '12s ago', processed: true, matched: 1,
    payload: { user_id: 'usr_123', email: 'jane@example.com', plan: 'pro' },
  },
  {
    id: 'evt_003', type: 'webhook.dead_letter', source: 'webhook', timestamp: '45s ago', processed: false, matched: 0,
    payload: { original_url: 'https://hooks.example.com/ingest', retry_count: 5, max_retries: 5 },
  },
  {
    id: 'evt_004', type: 'subscription.dunning', source: 'stripe', timestamp: '2m ago', processed: true, matched: 1,
    correlationId: 'cor_def456',
    payload: { subscription_id: 'sub_abc', dunning_level: 2, amount: 2900 },
  },
  {
    id: 'evt_005', type: 'api.retry', source: 'api', timestamp: '5m ago', processed: true, matched: 1,
    payload: { endpoint: '/v1/charge', method: 'POST', attempt: 3, max_retries: 5 },
  },
  {
    id: 'evt_006', type: 'payment.failed', source: 'stripe', timestamp: '8m ago', processed: true, matched: 2,
    payload: { payment_intent_id: 'pi_yyy', amount: 1299, currency: 'eur', failure_reason: 'insufficient_funds' },
  },
  {
    id: 'evt_007', type: 'system.health_check', source: 'system', timestamp: '10m ago', processed: true, matched: 0,
    payload: { status: 'healthy', uptime_seconds: 86400 },
  },
  {
    id: 'evt_008', type: 'user.plan_upgraded', source: 'api', timestamp: '22m ago', processed: true, matched: 1,
    payload: { user_id: 'usr_456', from_plan: 'free', to_plan: 'pro' },
  },
]

// ─── Source icon ──────────────────────────────────────────────────────────────

function SourceIcon({ source }: { source: string }) {
  const cls = 'w-3.5 h-3.5 flex-shrink-0'
  switch (source) {
    case 'stripe':  return <CreditCard className={cls} />
    case 'webhook': return <Webhook className={cls} />
    case 'api':     return <Zap className={cls} />
    case 'system':  return <Cpu className={cls} />
    case 'manual':  return <MousePointerClick className={cls} />
    default:        return <Activity className={cls} />
  }
}

// ─── Expanded row ─────────────────────────────────────────────────────────────

function ExpandedRow({ event, onReprocess }: { event: Event; onReprocess: (id: string) => void }) {
  return (
    <tr>
      <td colSpan={8} className="bg-background px-4 pb-4 pt-2 border-b border-border">
        <div className="grid grid-cols-2 gap-4">
          {/* Payload */}
          <div>
            <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5 font-medium">Payload</p>
            <EventPayloadViewer payload={event.payload} />
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5 font-medium">Metadata</p>
              <div className="space-y-1 text-xs">
                <div className="flex gap-2">
                  <span className="text-text-muted w-28 flex-shrink-0">Event ID</span>
                  <span className="font-mono text-text-secondary">{event.id}</span>
                </div>
                {event.correlationId && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-28 flex-shrink-0">Correlation ID</span>
                    <span className="font-mono text-text-secondary">{event.correlationId}</span>
                  </div>
                )}
                {event.causationId && (
                  <div className="flex gap-2">
                    <span className="text-text-muted w-28 flex-shrink-0">Causation ID</span>
                    <span className="font-mono text-text-secondary">{event.causationId}</span>
                  </div>
                )}
                <div className="flex gap-2">
                  <span className="text-text-muted w-28 flex-shrink-0">Source</span>
                  <span className="text-text-secondary capitalize">{event.source}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-text-muted w-28 flex-shrink-0">Matched workflows</span>
                  <span className="text-text-secondary">{event.matched}</span>
                </div>
              </div>
            </div>

            {/* Processing result */}
            <div>
              <p className="text-[11px] text-text-muted uppercase tracking-wide mb-1.5 font-medium">Processing</p>
              <div className="flex items-center gap-2">
                <span className={cn('w-1.5 h-1.5 rounded-full', event.processed ? 'bg-success' : 'bg-warning')} />
                <span className="text-xs text-text-secondary">
                  {event.processed ? 'Processed successfully' : 'Unprocessed'}
                </span>
              </div>
              {event.error && (
                <p className="mt-1 text-xs text-error font-mono">{event.error}</p>
              )}
            </div>

            {/* Actions */}
            {!event.processed && (
              <button
                onClick={() => onReprocess(event.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reprocess
              </button>
            )}
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────

interface EventStreamTableProps {
  events: Event[]
  onReprocess?: (id: string) => void
  onSendTestEvent?: () => void
}

export function EventStreamTable({ events, onReprocess, onSendTestEvent }: EventStreamTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [reprocessingId, setReprocessingId] = useState<string | null>(null)

  const handleReprocess = async (id: string) => {
    setReprocessingId(id)
    await new Promise((r) => setTimeout(r, 800)) // mock delay
    onReprocess?.(id)
    setReprocessingId(null)
  }

  if (events.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <Zap className="w-10 h-10 text-text-muted opacity-40" />
        <div>
          <p className="text-sm font-medium text-text-primary">No events yet</p>
          <p className="text-xs text-text-muted mt-1 max-w-xs">
            Events will appear here when your workflows receive triggers. Send a test event to get started.
          </p>
        </div>
        <button
          onClick={onSendTestEvent}
          className="mt-1 px-3 py-1.5 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Send Test Event
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface border-b border-border">
            <th className="w-8 px-2 py-2" />
            <th className="text-left px-3 py-2 text-text-muted font-medium w-36">Timestamp</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-44">Type</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-28">Source</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-24">Status</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-16">Matched</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium">Payload preview</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => {
            const isExpanded = expandedId === event.id
            return (
              <React.Fragment key={event.id}>
                <tr
                  key={event.id}
                  onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  className={cn(
                    'border-b border-border cursor-pointer hover:bg-surface-light transition-colors group',
                    !event.processed && 'border-l-2 border-l-warning',
                    isExpanded && 'bg-surface-light',
                  )}
                >
                  {/* Expand chevron */}
                  <td className="w-8 px-2 py-2.5 text-text-muted">
                    <ChevronRight className={cn('w-3.5 h-3.5 transition-transform', isExpanded && 'rotate-90')} />
                  </td>

                  {/* Timestamp */}
                  <td className="px-3 py-2.5 text-text-muted font-mono whitespace-nowrap">
                    {event.timestamp}
                  </td>

                  {/* Type */}
                  <td className="px-3 py-2.5">
                    <EventTypeBadge type={event.type} />
                  </td>

                  {/* Source */}
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5 text-text-secondary capitalize">
                      <SourceIcon source={event.source} />
                      {event.source}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2.5">
                    <span className="flex items-center gap-1.5">
                      <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', event.processed ? 'bg-success' : 'bg-warning')} />
                      <span className="text-text-secondary">{event.processed ? 'Processed' : 'Pending'}</span>
                    </span>
                  </td>

                  {/* Matched */}
                  <td className="px-3 py-2.5">
                    {event.matched > 0 ? (
                      <a
                        href={`/dashboard/executions?event=${event.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        {event.matched}
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </a>
                    ) : (
                      <span className="text-text-muted">—</span>
                    )}
                  </td>

                  {/* Payload preview */}
                  <td className="px-3 py-2.5 max-w-0">
                    <span className="font-mono text-text-muted truncate block">
                      {JSON.stringify(event.payload)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                    {!event.processed && (
                      <button
                        onClick={() => handleReprocess(event.id)}
                        disabled={reprocessingId === event.id}
                        className="flex items-center gap-1 px-2 py-1 rounded text-[11px] bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className={cn('w-3 h-3', reprocessingId === event.id && 'animate-spin')} />
                        {reprocessingId === event.id ? '…' : 'Retry'}
                      </button>
                    )}
                  </td>
                </tr>

                {isExpanded && (
                  <ExpandedRow key={`${event.id}-expanded`} event={event} onReprocess={handleReprocess} />
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}