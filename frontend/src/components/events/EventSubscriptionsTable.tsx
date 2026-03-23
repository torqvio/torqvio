'use client'

import { useState } from 'react'
import { Link as LinkIcon, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EventTypeBadge } from './EventTypeBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EventSubscription {
  id: string
  eventType: string
  flowId: string
  workflowName: string
  active: boolean
  createdAt: string
  filterConfig: Record<string, unknown> | null
}

// ─── Mock data ────────────────────────────────────────────────────────────────

export const MOCK_SUBSCRIPTIONS: EventSubscription[] = [
  { id: 'sub_001', eventType: 'payment.failed',       flowId: 'wf_4', workflowName: 'Payment Retry Handler',   active: true,  createdAt: '2 weeks ago', filterConfig: null },
  { id: 'sub_002', eventType: 'payment.failed',       flowId: 'wf_5', workflowName: 'Notification Dispatcher', active: true,  createdAt: '1 week ago',  filterConfig: { currency: 'usd' } },
  { id: 'sub_003', eventType: 'user.signup',          flowId: 'wf_1', workflowName: 'User Onboarding',         active: true,  createdAt: '3 weeks ago', filterConfig: null },
  { id: 'sub_004', eventType: 'subscription.dunning', flowId: 'wf_4', workflowName: 'Payment Retry Handler',   active: true,  createdAt: '2 weeks ago', filterConfig: null },
  { id: 'sub_005', eventType: 'webhook.dead_letter',  flowId: 'wf_3', workflowName: 'Email Campaign',          active: false, createdAt: '1 month ago', filterConfig: null },
]

// ─── Toggle switch ────────────────────────────────────────────────────────────

function Toggle({ active, onChange }: { active: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={cn(
        'relative inline-flex w-7 h-4 rounded-full transition-colors focus:outline-none flex-shrink-0',
        active ? 'bg-success' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform',
          active && 'translate-x-3',
        )}
      />
    </button>
  )
}

// ─── Main table ───────────────────────────────────────────────────────────────

interface EventSubscriptionsTableProps {
  subscriptions: EventSubscription[]
  onToggle?: (id: string, active: boolean) => void
  onDelete?: (id: string) => void
  onEdit?: (sub: EventSubscription) => void
  onCreateNew?: () => void
}

export function EventSubscriptionsTable({
  subscriptions,
  onToggle,
  onDelete,
  onEdit,
  onCreateNew,
}: EventSubscriptionsTableProps) {
  const [toggling, setToggling] = useState<string | null>(null)

  const handleToggle = async (id: string, active: boolean) => {
    setToggling(id)
    await new Promise((r) => setTimeout(r, 400)) // optimistic mock delay
    onToggle?.(id, active)
    setToggling(null)
  }

  if (subscriptions.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
        <LinkIcon className="w-10 h-10 text-text-muted opacity-40" />
        <div>
          <p className="text-sm font-medium text-text-primary">No event subscriptions</p>
          <p className="text-xs text-text-muted mt-1 max-w-xs">
            Create a subscription to wire an event type to a workflow. When the event fires, the workflow runs.
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="mt-1 px-3 py-1.5 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          Create Subscription
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full text-xs border-collapse">
        <thead className="sticky top-0 z-10">
          <tr className="bg-surface border-b border-border">
            <th className="text-left px-4 py-2 text-text-muted font-medium w-10">Status</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-52">Event Type</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium">Workflow</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-52">Filter</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-28">Created</th>
            <th className="text-left px-3 py-2 text-text-muted font-medium w-28">Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id} className="border-b border-border hover:bg-surface-light transition-colors">
              {/* Status toggle */}
              <td className="px-4 py-3">
                <Toggle
                  active={sub.active}
                  onChange={(v) => handleToggle(sub.id, v)}
                />
              </td>

              {/* Event type */}
              <td className="px-3 py-3">
                <EventTypeBadge type={sub.eventType} />
              </td>

              {/* Workflow */}
              <td className="px-3 py-3">
                <a
                  href={`/dashboard/workflows/${sub.flowId}`}
                  className="text-text-primary hover:text-primary hover:underline transition-colors"
                >
                  {sub.workflowName}
                </a>
              </td>

              {/* Filter config */}
              <td className="px-3 py-3">
                {sub.filterConfig ? (
                  <span className="font-mono text-text-muted truncate block max-w-[180px]">
                    {JSON.stringify(sub.filterConfig)}
                  </span>
                ) : (
                  <span className="text-text-muted italic">No filter</span>
                )}
              </td>

              {/* Created */}
              <td className="px-3 py-3 text-text-muted">{sub.createdAt}</td>

              {/* Actions */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onEdit?.(sub)}
                    className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
                    title="Edit subscription"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete?.(sub.id)}
                    className="p-1.5 rounded hover:bg-error/10 text-text-muted hover:text-error transition-colors"
                    title="Delete subscription"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}