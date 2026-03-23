'use client'

import React from 'react'
import Link from 'next/link'
import { Play, Pause, Edit, Trash2, Webhook, Calendar, Zap, GitBranch, ArrowUp, ArrowDown, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { StatusDot } from './StatusDot'
import { ExecutionSparkline } from './ExecutionSparkline'
import type { SortOption, SortDirection } from './WorkflowToolbar'

export interface Workflow {
  id: string
  name: string
  status: 'active' | 'paused' | 'error' | 'draft'
  trigger: 'webhook' | 'schedule' | 'manual' | 'event'
  lastRun: string
  lastEdited?: string
  author?: string
  executions: number
  failureRate: number
  avgDuration: string
  sparklineData?: number[]
}

const TRIGGER_ICON: Record<Workflow['trigger'], React.ReactNode> = {
  webhook:  <Webhook  className="w-3.5 h-3.5" />,
  schedule: <Calendar className="w-3.5 h-3.5" />,
  manual:   <Zap      className="w-3.5 h-3.5" />,
  event:    <GitBranch className="w-3.5 h-3.5" />,
}

const TRIGGER_LABEL: Record<Workflow['trigger'], string> = {
  webhook:  'Webhook',
  schedule: 'Schedule',
  manual:   'Manual',
  event:    'Event',
}

interface SortableHeaderProps {
  label: string
  col: SortOption
  sortBy: SortOption
  sortDirection: SortDirection
  onSort: (col: SortOption) => void
  className?: string
}

function SortableHeader({ label, col, sortBy, sortDirection, onSort, className }: SortableHeaderProps) {
  const isActive = sortBy === col
  return (
    <th
      className={cn(
        'p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted cursor-pointer select-none hover:text-text-secondary transition-colors whitespace-nowrap',
        className
      )}
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        {isActive ? (
          sortDirection === 'asc'
            ? <ArrowUp className="w-3 h-3 text-primary" />
            : <ArrowDown className="w-3 h-3 text-primary" />
        ) : (
          <ArrowUp className="w-3 h-3 opacity-0 group-hover:opacity-30" />
        )}
      </span>
    </th>
  )
}

interface WorkflowListViewProps {
  workflows: Workflow[]
  selectedIds: Set<string>
  onSelectionChange: (ids: Set<string>) => void
  sortBy: SortOption
  sortDirection: SortDirection
  onSortChange: (col: SortOption) => void
  /** Controls column layout */
  subNavView?: 'all' | 'deployed' | 'drafts' | 'templates' | 'recent'
}

export function WorkflowListView({
  workflows,
  selectedIds,
  onSelectionChange,
  sortBy,
  sortDirection,
  onSortChange,
  subNavView = 'all',
}: WorkflowListViewProps) {
  const allSelected = workflows.length > 0 && selectedIds.size === workflows.length

  const toggleAll = () => {
    onSelectionChange(allSelected ? new Set() : new Set(workflows.map((w) => w.id)))
  }

  const toggleOne = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectionChange(next)
  }

  // Column logic
  const showLastRun    = subNavView !== 'drafts' && subNavView !== 'recent'
  const showLastEdited = subNavView === 'drafts' || subNavView === 'recent'
  const showSparklines = subNavView !== 'drafts'

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background z-10">
          <tr className="border-b border-border">
            <th className="w-10 p-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="accent-primary cursor-pointer"
              />
            </th>
            <th className="w-8 p-3" />
            <SortableHeader label="Name"         col="name"        sortBy={sortBy} sortDirection={sortDirection} onSort={onSortChange} />
            <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">
              Trigger
            </th>
            {showLastRun && (
              <SortableHeader label="Last Run"     col="lastRun"     sortBy={sortBy} sortDirection={sortDirection} onSort={onSortChange} />
            )}
            {showLastEdited && (
              <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">
                Last Edited
              </th>
            )}
            <SortableHeader label="Executions"   col="executions"  sortBy={sortBy} sortDirection={sortDirection} onSort={onSortChange} />
            <SortableHeader label="Failure Rate" col="failureRate" sortBy={sortBy} sortDirection={sortDirection} onSort={onSortChange} />
            <SortableHeader label="Avg Duration" col="avgDuration" sortBy={sortBy} sortDirection={sortDirection} onSort={onSortChange} />
            <th className="w-28 p-3" />
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow) => (
            <tr
              key={workflow.id}
              className={cn(
                'border-b border-border hover:bg-surface-light transition-colors group cursor-pointer',
                selectedIds.has(workflow.id) && 'bg-primary/5'
              )}
              onClick={() => toggleOne(workflow.id)}
            >
              {/* Checkbox */}
              <td className="w-10 p-3" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedIds.has(workflow.id)}
                  onChange={() => toggleOne(workflow.id)}
                  className="accent-primary cursor-pointer"
                />
              </td>

              {/* Status dot */}
              <td className="w-8 p-3">
                <StatusDot status={workflow.status} />
              </td>

              {/* Name */}
              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                <div>
                  <Link
                    href={`/dashboard/workflows/${workflow.id}`}
                    className="font-medium text-text-primary hover:text-primary transition-colors"
                  >
                    {workflow.name}
                  </Link>
                  <p className="text-[11px] text-text-muted mt-0.5">{TRIGGER_LABEL[workflow.trigger]}</p>
                </div>
              </td>

              {/* Trigger */}
              <td className="p-3">
                <div className="flex items-center gap-1.5 text-text-muted">
                  {TRIGGER_ICON[workflow.trigger]}
                  <span className="text-xs">{TRIGGER_LABEL[workflow.trigger]}</span>
                </div>
              </td>

              {/* Last Run */}
              {showLastRun && (
                <td className="p-3 text-text-secondary text-xs whitespace-nowrap">{workflow.lastRun}</td>
              )}

              {/* Last Edited (drafts/recent) */}
              {showLastEdited && (
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {workflow.author && (
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 uppercase">
                        {workflow.author[0]}
                      </span>
                    )}
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {workflow.lastEdited ?? workflow.lastRun}
                    </span>
                  </div>
                </td>
              )}

              {/* Executions + sparkline */}
              <td className="p-3">
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary text-xs">{workflow.executions.toLocaleString()}</span>
                  {showSparklines && workflow.sparklineData && (
                    <ExecutionSparkline data={workflow.sparklineData} />
                  )}
                </div>
              </td>

              {/* Failure Rate */}
              <td className="p-3">
                <span
                  className={cn(
                    'text-xs font-medium',
                    workflow.failureRate > 5
                      ? 'text-error'
                      : workflow.failureRate > 2
                      ? 'text-warning'
                      : 'text-success'
                  )}
                >
                  {workflow.failureRate}%
                </span>
              </td>

              {/* Avg Duration */}
              <td className="p-3 text-text-secondary text-xs">{workflow.avgDuration}</td>

              {/* Hover actions */}
              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    title={workflow.status === 'active' ? 'Pause' : 'Resume'}
                  >
                    {workflow.status === 'active'
                      ? <Pause className="w-3.5 h-3.5" />
                      : <Play  className="w-3.5 h-3.5" />
                    }
                  </Button>
                  <Link
                    href={`/dashboard/workflows/${workflow.id}`}
                    className="inline-flex items-center justify-center h-7 w-7 rounded-md text-text-muted hover:text-text-secondary hover:bg-surface-light transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-text-muted hover:text-text-secondary"
                    title="More options"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
