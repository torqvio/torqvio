'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { WorkflowSubNav } from '@/components/workflows/WorkflowSubNav'
import { WorkflowToolbar, type ViewMode, type SortOption, type SortDirection, type StatusFilter } from '@/components/workflows/WorkflowToolbar'
import { WorkflowListView, type Workflow } from '@/components/workflows/WorkflowListView'
import { WorkflowGridView } from '@/components/workflows/WorkflowGridView'
import { WorkflowEmptyState } from '@/components/workflows/WorkflowEmptyState'
import { WorkflowListSkeleton, WorkflowGridSkeleton } from '@/components/workflows/WorkflowSkeleton'
import { TablePagination } from '@/components/workflows/TablePagination'

type SubNavView = 'all' | 'deployed' | 'drafts' | 'templates' | 'recent'

const MOCK_WORKFLOWS: Workflow[] = [
  {
    id: '1',
    name: 'User Onboarding',
    status: 'active',
    trigger: 'webhook',
    lastRun: '2 minutes ago',
    lastEdited: '1 hour ago',
    author: 'Alex',
    executions: 1247,
    failureRate: 0.2,
    avgDuration: '1.2s',
    sparklineData: [80, 95, 110, 105, 130, 120, 140],
  },
  {
    id: '2',
    name: 'Data Processing Pipeline',
    status: 'active',
    trigger: 'schedule',
    lastRun: '5 minutes ago',
    lastEdited: '3 hours ago',
    author: 'Sam',
    executions: 892,
    failureRate: 0.1,
    avgDuration: '4.8s',
    sparklineData: [60, 70, 65, 80, 75, 90, 88],
  },
  {
    id: '3',
    name: 'Email Campaign',
    status: 'paused',
    trigger: 'manual',
    lastRun: '1 hour ago',
    lastEdited: '2 days ago',
    author: 'Jordan',
    executions: 456,
    failureRate: 2.3,
    avgDuration: '0.9s',
    sparklineData: [40, 55, 45, 60, 50, 30, 20],
  },
  {
    id: '4',
    name: 'Payment Retry Handler',
    status: 'error',
    trigger: 'event',
    lastRun: '12 minutes ago',
    lastEdited: '30 minutes ago',
    author: 'Alex',
    executions: 3201,
    failureRate: 8.4,
    avgDuration: '2.1s',
    sparklineData: [200, 250, 300, 280, 350, 400, 380],
  },
  {
    id: '5',
    name: 'Notification Dispatcher',
    status: 'active',
    trigger: 'event',
    lastRun: '30 seconds ago',
    lastEdited: '5 hours ago',
    author: 'Sam',
    executions: 5840,
    failureRate: 0.0,
    avgDuration: '0.3s',
    sparklineData: [400, 450, 500, 480, 520, 560, 580],
  },
  {
    id: '6',
    name: 'Weekly Report Generator',
    status: 'draft',
    trigger: 'schedule',
    lastRun: 'Never',
    lastEdited: '4 hours ago',
    author: 'Jordan',
    executions: 0,
    failureRate: 0,
    avgDuration: '—',
    sparklineData: [0, 0, 0, 0, 0, 0, 0],
  },
  {
    id: '7',
    name: 'Analytics Aggregator',
    status: 'draft',
    trigger: 'schedule',
    lastRun: 'Never',
    lastEdited: '6 hours ago',
    author: 'Alex',
    executions: 0,
    failureRate: 0,
    avgDuration: '—',
    sparklineData: [0, 0, 0, 0, 0, 0, 0],
  },
]

function filterBySubNav(workflows: Workflow[], view: SubNavView): Workflow[] {
  switch (view) {
    case 'deployed':
      return workflows.filter((w) => w.status === 'active')
    case 'drafts':
      return workflows.filter((w) => w.status === 'draft')
    case 'recent':
      return [...workflows].slice(0, 10)
    default:
      return workflows
  }
}

export default function WorkflowsPage() {
  const [subNavView, setSubNavView] = useState<SubNavView>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const isLoading = false
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const [leftWidth, setLeftWidth] = useState(220)
  const dragging = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const onDragHandleMouseDown = useCallback(() => {
    dragging.current = true
    const onMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newWidth = Math.min(Math.max(e.clientX - rect.left, 140), 320)
      setLeftWidth(newWidth)
    }
    const onUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [])

  const handleSortChange = useCallback((col: SortOption) => {
    if (subNavView === 'recent') return
    if (col === sortBy) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortBy(col)
      setSortDirection('asc')
    }
  }, [sortBy, subNavView])

  const hasFilters = searchQuery.trim() !== '' || statusFilter !== 'all'

  const clearFilters = useCallback(() => {
    setSearchQuery('')
    setStatusFilter('all')
    setPage(1)
  }, [])

  const filteredWorkflows = useMemo(() => {
    let wf = filterBySubNav(MOCK_WORKFLOWS, subNavView)

    if (subNavView === 'all' && statusFilter !== 'all') {
      wf = wf.filter((w) => w.status === statusFilter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      wf = wf.filter((w) => w.name.toLowerCase().includes(q))
    }

    if (subNavView === 'recent') return wf

    return [...wf].sort((a, b) => {
      let cmp = 0
      switch (sortBy) {
        case 'name':        cmp = a.name.localeCompare(b.name); break
        case 'executions':  cmp = a.executions - b.executions; break
        case 'failureRate': cmp = a.failureRate - b.failureRate; break
        case 'avgDuration': cmp = a.avgDuration.localeCompare(b.avgDuration); break
        case 'lastRun':     cmp = 0; break
      }
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [subNavView, statusFilter, searchQuery, sortBy, sortDirection])

  const paginatedWorkflows = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredWorkflows.slice(start, start + pageSize)
  }, [filteredWorkflows, page, pageSize])

  const hasHighFailureRate = filteredWorkflows.some((w) => w.failureRate > 5)
  const failedCount = MOCK_WORKFLOWS.filter((w) => w.status === 'error').length

  const handleBulkDelete = useCallback(() => {
    if (window.confirm(`Delete ${selectedIds.size} workflow${selectedIds.size > 1 ? 's' : ''}?`)) {
      setSelectedIds(new Set())
    }
  }, [selectedIds.size])

  const handleBulkDeploy = useCallback(() => {
    if (window.confirm(`Deploy ${selectedIds.size} draft workflow${selectedIds.size > 1 ? 's' : ''}?`)) {
      setSelectedIds(new Set())
    }
  }, [selectedIds.size])

  return (
    <div ref={containerRef} className="flex overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Left sub-nav panel */}
      <div
        className="flex-shrink-0 bg-surface border-r border-border flex flex-col overflow-hidden"
        style={{ width: leftWidth }}
      >
        <div className="px-4 py-3 border-b border-border flex-shrink-0">
          <h2 className="text-sm font-semibold text-text-primary">Workflows</h2>
        </div>
        <WorkflowSubNav
          activeView={subNavView}
          onViewChange={(v) => { setSubNavView(v as SubNavView); setPage(1); setSelectedIds(new Set()) }}
          failedCount={failedCount}
        />
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={onDragHandleMouseDown}
        className="w-[3px] flex-shrink-0 bg-border hover:bg-primary/50 cursor-col-resize transition-colors select-none"
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {hasHighFailureRate && subNavView !== 'drafts' && (
          <div className="px-4 pt-3 flex-shrink-0">
            <AlertBanner
              severity="warning"
              message="Payment Retry Handler has a failure rate above 5% — review may be needed."
              ctaLabel="View failed executions"
              ctaHref="/dashboard/executions?status=failed"
            />
          </div>
        )}

        <WorkflowToolbar
          searchQuery={searchQuery}
          onSearchChange={(v) => { setSearchQuery(v); setPage(1) }}
          statusFilter={statusFilter}
          onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1) }}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
          selectedCount={selectedIds.size}
          onBulkPause={() => setSelectedIds(new Set())}
          onBulkResume={() => setSelectedIds(new Set())}
          onBulkDelete={handleBulkDelete}
          onBulkDeploy={handleBulkDeploy}
          searchInputRef={searchInputRef}
          subNavView={subNavView}
        />

        {isLoading ? (
          viewMode === 'list' ? <WorkflowListSkeleton /> : <WorkflowGridSkeleton />
        ) : filteredWorkflows.length === 0 ? (
          <WorkflowEmptyState
            hasFilters={hasFilters}
            onClearFilters={clearFilters}
            view={subNavView}
          />
        ) : viewMode === 'list' ? (
          <>
            <WorkflowListView
              workflows={paginatedWorkflows}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onSortChange={handleSortChange}
              subNavView={subNavView}
            />
            <TablePagination
              total={filteredWorkflows.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        ) : (
          <>
            <WorkflowGridView workflows={paginatedWorkflows} />
            <TablePagination
              total={filteredWorkflows.length}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </div>
  )
}
