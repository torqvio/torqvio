'use client'

import { useRef, useState, useEffect } from 'react'
import { Search, ChevronDown, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ExecStatusFilter = 'all' | 'success' | 'failed' | 'running' | 'queued'
export type ExecDateRange = 'last_hour' | 'last_24h' | 'last_7d' | 'custom'

interface ExecutionToolbarProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  statusFilter: ExecStatusFilter
  onStatusFilterChange: (v: ExecStatusFilter) => void
  workflowFilter: string
  onWorkflowFilterChange: (v: string) => void
  dateRange: ExecDateRange
  onDateRangeChange: (v: ExecDateRange) => void
  onExport?: () => void
}

const STATUS_OPTIONS: { value: ExecStatusFilter; label: string; dotClass: string }[] = [
  { value: 'all',     label: 'All Status', dotClass: '' },
  { value: 'success', label: 'Success',    dotClass: 'bg-success' },
  { value: 'failed',  label: 'Failed',     dotClass: 'bg-error' },
  { value: 'running', label: 'Running',    dotClass: 'bg-primary' },
  { value: 'queued',  label: 'Queued',     dotClass: 'bg-text-muted' },
]

const DATE_RANGE_OPTIONS: { value: ExecDateRange; label: string }[] = [
  { value: 'last_hour', label: 'Last hour' },
  { value: 'last_24h',  label: 'Last 24h' },
  { value: 'last_7d',   label: 'Last 7d' },
  { value: 'custom',    label: 'Custom' },
]

const WORKFLOW_OPTIONS: { value: string; label: string }[] = [
  { value: 'all',  label: 'All Workflows' },
  { value: 'wf_1', label: 'User Onboarding' },
  { value: 'wf_2', label: 'Payment Processing' },
  { value: 'wf_3', label: 'Email Campaign' },
  { value: 'wf_4', label: 'Data Sync' },
  { value: 'wf_5', label: 'Slack Alerts' },
]

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export function ExecutionToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  workflowFilter,
  onWorkflowFilterChange,
  dateRange,
  onDateRangeChange,
  onExport,
}: ExecutionToolbarProps) {
  const [statusOpen, setStatusOpen]     = useState(false)
  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [dateOpen, setDateOpen]         = useState(false)

  const statusRef   = useRef<HTMLDivElement>(null)
  const workflowRef = useRef<HTMLDivElement>(null)
  const dateRef     = useRef<HTMLDivElement>(null)

  useClickOutside(statusRef,   () => setStatusOpen(false))
  useClickOutside(workflowRef, () => setWorkflowOpen(false))
  useClickOutside(dateRef,     () => setDateOpen(false))

  const currentStatus   = STATUS_OPTIONS.find((o) => o.value === statusFilter)!
  const currentWorkflow = WORKFLOW_OPTIONS.find((o) => o.value === workflowFilter) ?? WORKFLOW_OPTIONS[0]
  const currentDate     = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)!

  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-border gap-3 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search by execution ID or workflow name…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-[26px] pl-8 pr-3 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Status filter */}
        <div ref={statusRef} className="relative">
          <button
            onClick={() => setStatusOpen((o) => !o)}
            className="flex items-center gap-1.5 h-[26px] px-2 text-xs bg-surface border border-border rounded-md text-text-secondary hover:border-primary/40 focus:outline-none transition-colors"
          >
            {statusFilter !== 'all' && currentStatus.dotClass && (
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', currentStatus.dotClass)} />
            )}
            {currentStatus.label}
            <ChevronDown className={cn('w-3 h-3 text-text-muted transition-transform', statusOpen && 'rotate-180')} />
          </button>
          {statusOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 w-40 bg-surface border border-border rounded-md shadow-lg py-1 text-xs">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onStatusFilterChange(opt.value); setStatusOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-surface-light transition-colors',
                    statusFilter === opt.value ? 'text-primary' : 'text-text-secondary'
                  )}
                >
                  {opt.dotClass
                    ? <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', opt.dotClass)} />
                    : <span className="w-1.5 flex-shrink-0" />
                  }
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Workflow filter */}
        <div ref={workflowRef} className="relative">
          <button
            onClick={() => setWorkflowOpen((o) => !o)}
            className="flex items-center gap-1.5 h-[26px] px-2 text-xs bg-surface border border-border rounded-md text-text-secondary hover:border-primary/40 focus:outline-none transition-colors"
          >
            <span className="text-text-muted">Workflow:</span>
            <span className="max-w-[120px] truncate">{currentWorkflow.label}</span>
            <ChevronDown className={cn('w-3 h-3 text-text-muted transition-transform flex-shrink-0', workflowOpen && 'rotate-180')} />
          </button>
          {workflowOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 w-48 bg-surface border border-border rounded-md shadow-lg py-1 text-xs">
              {WORKFLOW_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onWorkflowFilterChange(opt.value); setWorkflowOpen(false) }}
                  className={cn(
                    'w-full flex items-center px-3 py-1.5 text-left hover:bg-surface-light transition-colors',
                    workflowFilter === opt.value ? 'text-primary' : 'text-text-secondary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range filter */}
        <div ref={dateRef} className="relative">
          <button
            onClick={() => setDateOpen((o) => !o)}
            className="flex items-center gap-1.5 h-[26px] px-2 text-xs bg-surface border border-border rounded-md text-text-secondary hover:border-primary/40 focus:outline-none transition-colors"
          >
            <span className="text-text-muted">Range:</span>
            {currentDate.label}
            <ChevronDown className={cn('w-3 h-3 text-text-muted transition-transform', dateOpen && 'rotate-180')} />
          </button>
          {dateOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 w-36 bg-surface border border-border rounded-md shadow-lg py-1 text-xs">
              {DATE_RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { onDateRangeChange(opt.value); setDateOpen(false) }}
                  className={cn(
                    'w-full flex items-center px-3 py-1.5 text-left hover:bg-surface-light transition-colors',
                    dateRange === opt.value ? 'text-primary' : 'text-text-secondary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-[26px] text-xs px-2 gap-1.5 text-text-secondary hover:text-text-primary"
          onClick={onExport}
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </Button>
      </div>
    </div>
  )
}
