'use client'

import { useRef, useState } from 'react'
import { Search, ChevronDown, Zap, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

export type EventTab = 'stream' | 'subscriptions' | 'schemas'
export type EventStatusFilter = 'all' | 'processed' | 'unprocessed'
export type EventSourceFilter = 'all' | 'stripe' | 'api' | 'webhook' | 'system' | 'manual'

const EVENT_TYPES = [
  'all',
  'payment.failed',
  'subscription.dunning',
  'webhook.dead_letter',
  'api.retry',
  'user.signup',
  'system.health_check',
]
const SOURCES: EventSourceFilter[] = ['all', 'stripe', 'api', 'webhook', 'system', 'manual']
const STATUSES: { value: EventStatusFilter; label: string }[] = [
  { value: 'all',         label: 'All Status' },
  { value: 'processed',   label: 'Processed' },
  { value: 'unprocessed', label: 'Unprocessed' },
]
const SUB_STATUSES: { value: EventStatusFilter; label: string }[] = [
  { value: 'all',         label: 'All' },
  { value: 'processed',   label: 'Active' },
  { value: 'unprocessed', label: 'Inactive' },
]

const TABS: { value: EventTab; label: string }[] = [
  { value: 'stream',        label: 'Live Stream' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'schemas',       label: 'Schemas' },
]

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  const { useEffect } = require('react')
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────

function FilterDropdown({
  options,
  value,
  onChange,
  prefix,
  width = 'w-36',
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  prefix?: string
  width?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useClickOutside(ref, () => setOpen(false))
  const current = options.find((o) => o.value === value) ?? options[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 h-[26px] px-2 text-xs bg-surface border border-border rounded-md text-text-secondary hover:border-primary/40 focus:outline-none transition-colors"
      >
        {prefix && <span className="text-text-muted">{prefix}</span>}
        <span className="max-w-[120px] truncate">{current.label}</span>
        <ChevronDown className={cn('w-3 h-3 text-text-muted transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>
      {open && (
        <div className={cn('absolute top-full mt-1 left-0 z-50 bg-surface border border-border rounded-md shadow-lg py-1 text-xs', width)}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={cn(
                'w-full flex items-center px-3 py-1.5 text-left hover:bg-surface-light transition-colors',
                value === opt.value ? 'text-primary' : 'text-text-secondary',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main toolbar ─────────────────────────────────────────────────────────────

interface EventToolbarProps {
  activeTab: EventTab
  onTabChange: (tab: EventTab) => void

  // Stream filters
  searchQuery: string
  onSearchChange: (v: string) => void
  typeFilter: string
  onTypeFilterChange: (v: string) => void
  sourceFilter: EventSourceFilter
  onSourceFilterChange: (v: EventSourceFilter) => void
  statusFilter: EventStatusFilter
  onStatusFilterChange: (v: EventStatusFilter) => void
  autoRefresh: boolean
  onAutoRefreshToggle: () => void

  // Sub filters
  subSearchQuery: string
  onSubSearchChange: (v: string) => void
  subStatusFilter: EventStatusFilter
  onSubStatusFilterChange: (v: EventStatusFilter) => void

  // Actions
  onSendTestEvent: () => void
  onNewSubscription: () => void
}

export function EventToolbar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  sourceFilter,
  onSourceFilterChange,
  statusFilter,
  onStatusFilterChange,
  autoRefresh,
  onAutoRefreshToggle,
  subSearchQuery,
  onSubSearchChange,
  subStatusFilter,
  onSubStatusFilterChange,
  onSendTestEvent,
  onNewSubscription,
}: EventToolbarProps) {
  return (
    <div className="flex-shrink-0 border-b border-border">
      {/* Tabs + global actions row */}
      <div className="flex items-center justify-between px-4 h-11 border-b border-border">
        <div className="flex items-center gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-md transition-colors',
                activeTab === tab.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-text-muted hover:text-text-secondary hover:bg-surface-light',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'subscriptions' && (
            <button
              onClick={onNewSubscription}
              className="flex items-center gap-1.5 h-[26px] px-3 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              + New Subscription
            </button>
          )}
          <button
            onClick={onSendTestEvent}
            className="flex items-center gap-1.5 h-[26px] px-3 text-xs rounded-md bg-surface-light hover:bg-border text-text-secondary border border-border transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Send Test Event
          </button>
        </div>
      </div>

      {/* Filter row — tab-specific */}
      {activeTab === 'stream' && (
        <div className="flex items-center justify-between h-10 px-4 gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by type, source, or payload…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-[26px] pl-8 pr-3 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>
            <FilterDropdown
              options={EVENT_TYPES.map((t) => ({ value: t, label: t === 'all' ? 'All Types' : t }))}
              value={typeFilter}
              onChange={onTypeFilterChange}
              width="w-48"
            />
            <FilterDropdown
              options={SOURCES.map((s) => ({ value: s, label: s === 'all' ? 'All Sources' : s }))}
              value={sourceFilter}
              onChange={(v) => onSourceFilterChange(v as EventSourceFilter)}
              width="w-36"
            />
            <FilterDropdown
              options={STATUSES}
              value={statusFilter}
              onChange={(v) => onStatusFilterChange(v as EventStatusFilter)}
              width="w-36"
            />
          </div>
          <button
            onClick={onAutoRefreshToggle}
            className={cn(
              'flex items-center gap-1.5 h-[26px] px-2 text-xs rounded-md border transition-colors',
              autoRefresh
                ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                : 'bg-surface border-border text-text-muted hover:text-text-secondary hover:border-primary/30',
            )}
          >
            <RefreshCw className={cn('w-3.5 h-3.5', autoRefresh && 'animate-spin')} />
            Auto-refresh
          </button>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="flex items-center h-10 px-4 gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Filter by workflow or event type…"
              value={subSearchQuery}
              onChange={(e) => onSubSearchChange(e.target.value)}
              className="w-full h-[26px] pl-8 pr-3 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
          <FilterDropdown
            options={SUB_STATUSES}
            value={subStatusFilter}
            onChange={(v) => onSubStatusFilterChange(v as EventStatusFilter)}
            width="w-32"
          />
        </div>
      )}

      {activeTab === 'schemas' && (
        <div className="flex items-center h-10 px-4 gap-3">
          <p className="text-xs text-text-muted">
            {/* schemas tab has no extra filters */}
            Showing all registered event schemas
          </p>
        </div>
      )}
    </div>
  )
}