'use client'

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ExecutionToolbar, type ExecStatusFilter, type ExecDateRange } from '@/components/executions/ExecutionToolbar'
import ExecutionTable from '@/components/executions/ExecutionTable'
import { TablePagination } from '@/components/workflows/TablePagination'
import { useExecutions } from '@/hooks/useExecutions'
import type { Execution } from '@/types/execution'

function ExecutionsContent() {
  const searchParams = useSearchParams()
  
  const { executions, loading, error, retry, cancel, refresh } = useExecutions()

  const urlStatus = searchParams.get('status') as ExecStatusFilter | null
  const validStatuses: ExecStatusFilter[] = ['all', 'success', 'failed', 'running', 'queued']
  const initialStatus: ExecStatusFilter =
    urlStatus && validStatuses.includes(urlStatus) ? urlStatus : 'all'

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ExecStatusFilter>(initialStatus)
  const [workflowFilter, setWorkflowFilter] = useState('all')
  const [dateRange, setDateRange] = useState<ExecDateRange>('last_24h')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Sync status filter when URL params change
  useEffect(() => {
    const s = searchParams.get('status') as ExecStatusFilter | null
    if (s && validStatuses.includes(s)) {
      setStatusFilter(s)
      setPage(1)
    }
  }, [searchParams, setStatusFilter, setPage])

  // Auto-refresh every 5 seconds for running filter
  useEffect(() => {
    if (statusFilter !== 'running') return
    const id = setInterval(() => {
      refresh()
    }, 5_000)
    return () => clearInterval(id)
  }, [statusFilter, refresh])

  const filtered = useMemo(() => {
    return executions.filter((exec) => {
      const q = searchQuery.toLowerCase()
      const matchesSearch =
        !q || exec.id.toLowerCase().includes(q) || exec.workflowName.toLowerCase().includes(q)
      const matchesStatus   = statusFilter === 'all'   || exec.status === statusFilter
      const matchesWorkflow = workflowFilter === 'all' || exec.workflowId === workflowFilter
      return matchesSearch && matchesStatus && matchesWorkflow
    })
  }, [executions, searchQuery, statusFilter, workflowFilter])

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize
    return filtered.slice(start, start + pageSize)
  }, [filtered, page, pageSize])

  const handleExport = useCallback(() => {
    const header = 'ID,Status,Workflow,Trigger,Started,Duration,Steps\n'
    const rows = filtered.map((e) =>
      [e.id, e.status, `"${e.workflowName}"`, e.trigger, e.startedAt, e.duration, `${e.completedSteps}/${e.totalSteps}`].join(',')
    )
    const csv  = header + rows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'executions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }, [filtered])

  const handleRetry  = useCallback((id: string) => { retry(id) }, [retry])
  const handleCancel = useCallback((id: string) => {
    cancel(id)
  }, [cancel])

  return (
    <div className="flex flex-col overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      <ExecutionToolbar
        searchQuery={searchQuery}
        onSearchChange={(v) => { setSearchQuery(v); setPage(1) }}
        statusFilter={statusFilter}
        onStatusFilterChange={(v) => { setStatusFilter(v); setPage(1) }}
        workflowFilter={workflowFilter}
        onWorkflowFilterChange={(v) => { setWorkflowFilter(v); setPage(1) }}
        dateRange={dateRange}
        onDateRangeChange={(v) => { setDateRange(v); setPage(1) }}
        onExport={handleExport}
      />

      <ExecutionTable
        executions={paginated}
        onRetry={handleRetry}
        onCancel={handleCancel}
      />

      <TablePagination
        total={filtered.length}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(s) => { setPageSize(s); setPage(1) }}
      />
    </div>
  )
}

export default function ExecutionsPage() {
  return (
    <Suspense fallback={<div className="p-8">
      <div className="text-center text-gray-500">Loading executions...</div>
    </div>}>
      <ExecutionsContent />
    </Suspense>
  )
}
