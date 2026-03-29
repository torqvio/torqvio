'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, List, LayoutGrid, Plus, ChevronDown, ArrowUp, ArrowDown, Play, Pause, Trash2, Rocket, Brain } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'list' | 'grid'
export type SortOption = 'name' | 'lastRun' | 'executions' | 'failureRate' | 'avgDuration'
export type SortDirection = 'asc' | 'desc'
export type StatusFilter = 'all' | 'active' | 'paused' | 'error' | 'draft'

interface WorkflowToolbarProps {
  searchQuery: string
  onSearchChange: (v: string) => void
  statusFilter: StatusFilter
  onStatusFilterChange: (v: StatusFilter) => void
  viewMode: ViewMode
  onViewModeChange: (v: ViewMode) => void
  sortBy: SortOption
  sortDirection: SortDirection
  onSortChange: (col: SortOption) => void
  selectedCount?: number
  onBulkPause?: () => void
  onBulkResume?: () => void
  onBulkDelete?: () => void
  onBulkDeploy?: () => void
  searchInputRef?: React.RefObject<HTMLInputElement>
  /** Current sub-nav view — controls which filters/actions are visible */
  subNavView?: 'all' | 'deployed' | 'drafts' | 'templates' | 'recent'
  showIntelligence?: boolean
  onIntelligenceToggle?: () => void
  optimizationCount?: number
}

const STATUS_OPTIONS: { value: StatusFilter; label: string; dotClass: string }[] = [
  { value: 'all',    label: 'All Status', dotClass: '' },
  { value: 'active', label: 'Active',     dotClass: 'bg-success' },
  { value: 'paused', label: 'Paused',     dotClass: 'bg-warning' },
  { value: 'error',  label: 'Error',      dotClass: 'bg-error' },
  { value: 'draft',  label: 'Draft',      dotClass: 'bg-text-muted' },
]

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'name',        label: 'Name' },
  { value: 'lastRun',     label: 'Last Run' },
  { value: 'executions',  label: 'Executions' },
  { value: 'failureRate', label: 'Failure Rate' },
  { value: 'avgDuration', label: 'Avg Duration' },
]

const SUBTITLE: Partial<Record<NonNullable<WorkflowToolbarProps['subNavView']>, string>> = {
  deployed: 'Deployed workflows',
  drafts:   'Drafts',
  recent:   'Recently edited',
}

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

export function WorkflowToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange,
  selectedCount = 0,
  onBulkPause,
  onBulkResume,
  onBulkDelete,
  onBulkDeploy,
  searchInputRef,
  subNavView = 'all',
  showIntelligence = false,
  onIntelligenceToggle,
  optimizationCount = 0,
}: WorkflowToolbarProps) {
  const [statusOpen, setStatusOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const statusRef = useRef<HTMLDivElement>(null)
  const sortRef = useRef<HTMLDivElement>(null)

  useClickOutside(statusRef, () => setStatusOpen(false))
  useClickOutside(sortRef, () => setSortOpen(false))

  const currentStatus = STATUS_OPTIONS.find((o) => o.value === statusFilter)!
  const currentSort = SORT_OPTIONS.find((o) => o.value === sortBy)!
  const SortArrow = sortDirection === 'asc' ? ArrowUp : ArrowDown

  // Context-driven display rules
  const showStatusFilter = subNavView === 'all'
  const sortDisabled = subNavView === 'recent'
  const subtitle = SUBTITLE[subNavView]

  return (
    <div className="flex items-center justify-between h-12 px-4 border-b border-border gap-3 flex-shrink-0">
      {/* Left side */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Subtitle badge */}
        {subtitle && (
          <span className="text-xs text-text-muted font-mono border border-border/60 px-2 py-0.5 rounded-md flex-shrink-0">
            {subtitle}
          </span>
        )}

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search workflows…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            ref={searchInputRef}
            className="w-full h-[26px] pl-8 pr-3 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        {/* Status filter — hidden for deployed/drafts (all rows are same status) */}
        {showStatusFilter && (
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
        )}

        {/* Bulk actions — shown when rows are selected */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-1.5 pl-2 border-l border-border">
            <span className="text-xs text-text-muted">{selectedCount} selected</span>
            {subNavView === 'drafts' ? (
              <Button variant="ghost" size="sm" className="h-[26px] text-xs px-2 gap-1" onClick={onBulkDeploy}>
                <Rocket className="w-3 h-3" /> Deploy
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="h-[26px] text-xs px-2 gap-1" onClick={onBulkPause}>
                  <Pause className="w-3 h-3" /> Pause
                </Button>
                <Button variant="ghost" size="sm" className="h-[26px] text-xs px-2 gap-1" onClick={onBulkResume}>
                  <Play className="w-3 h-3" /> Resume
                </Button>
              </>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-[26px] text-xs px-2 gap-1 text-error hover:text-error"
              onClick={onBulkDelete}
            >
              <Trash2 className="w-3 h-3" /> Delete
            </Button>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Sort control — disabled for recent (fixed sort) */}
        {!sortDisabled && (
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1.5 h-[26px] px-2 text-xs bg-surface border border-border rounded-md text-text-secondary hover:border-primary/40 focus:outline-none transition-colors"
            >
              <span className="text-text-muted">Sort:</span>
              {currentSort.label}
              <SortArrow className="w-3 h-3 text-primary" />
            </button>
            {sortOpen && (
              <div className="absolute top-full mt-1 right-0 z-50 w-44 bg-surface border border-border rounded-md shadow-lg py-1 text-xs">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { onSortChange(opt.value); setSortOpen(false) }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 text-left hover:bg-surface-light transition-colors',
                      sortBy === opt.value ? 'text-primary' : 'text-text-secondary'
                    )}
                  >
                    {opt.label}
                    {sortBy === opt.value && <SortArrow className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Intelligence Toggle */}
        {showIntelligence && (
          <button
            onClick={onIntelligenceToggle}
            className={cn(
              'flex items-center gap-1.5 h-[26px] px-2 text-xs rounded-md transition-colors',
              showIntelligence 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
            )}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>AI</span>
            {optimizationCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>
        )}

        {/* View mode toggle */}
        <div className="flex items-center border border-border rounded-md overflow-hidden">
          <button
            onClick={() => onViewModeChange('list')}
            className={cn(
              'h-[26px] px-2 flex items-center transition-colors',
              viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-secondary'
            )}
            title="List view"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            className={cn(
              'h-[26px] px-2 flex items-center transition-colors border-l border-border',
              viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-secondary'
            )}
            title="Grid view"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Create Flow */}
        <Link
          href="/dashboard/workflows/new"
          className="inline-flex items-center h-[30px] px-3 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Create Flow
        </Link>
      </div>
    </div>
  )
}
