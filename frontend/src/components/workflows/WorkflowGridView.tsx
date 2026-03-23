'use client'

import Link from 'next/link'
import { Play, Pause, Edit, Webhook, Calendar, Zap, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { Workflow } from './WorkflowListView'

const STATUS_GLOW: Record<Workflow['status'], string> = {
  active: 'shadow-[0_0_0_1px_rgba(0,200,150,0.25)] hover:shadow-[0_0_0_1px_rgba(0,200,150,0.55)]',
  paused: 'shadow-[0_0_0_1px_rgba(255,165,0,0.25)] hover:shadow-[0_0_0_1px_rgba(255,165,0,0.55)]',
  error:  'shadow-[0_0_0_1px_rgba(255,77,79,0.25)] hover:shadow-[0_0_0_1px_rgba(255,77,79,0.55)]',
  draft:  'shadow-[0_0_0_1px_rgba(107,114,128,0.15)] hover:shadow-[0_0_0_1px_rgba(107,114,128,0.35)]',
}

const STATUS_BADGE: Record<Workflow['status'], string> = {
  active: 'bg-success/10 text-success',
  paused: 'bg-warning/10 text-warning',
  error:  'bg-error/10 text-error',
  draft:  'bg-surface-light text-text-muted',
}

const TRIGGER_ICON: Record<Workflow['trigger'], React.ReactNode> = {
  webhook:  <Webhook   className="w-4 h-4" />,
  schedule: <Calendar  className="w-4 h-4" />,
  manual:   <Zap       className="w-4 h-4" />,
  event:    <GitBranch className="w-4 h-4" />,
}

interface WorkflowGridViewProps {
  workflows: Workflow[]
}

export function WorkflowGridView({ workflows }: WorkflowGridViewProps) {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 overflow-auto flex-1 content-start">
      {workflows.map((workflow) => (
        <div
          key={workflow.id}
          className={cn(
            'bg-surface border border-border rounded-lg p-4 transition-all duration-200 hover:-translate-y-px',
            STATUS_GLOW[workflow.status]
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-text-muted flex-shrink-0">{TRIGGER_ICON[workflow.trigger]}</span>
              <Link
                href={`/dashboard/workflows/${workflow.id}`}
                className="font-semibold text-text-primary hover:text-primary transition-colors truncate"
              >
                {workflow.name}
              </Link>
            </div>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2',
                STATUS_BADGE[workflow.status]
              )}
            >
              {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
            </span>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
            <div>
              <p className="text-[11px] text-text-muted">Last Run</p>
              <p className="text-xs text-text-secondary">{workflow.lastRun}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted">Executions</p>
              <p className="text-xs text-text-secondary">{workflow.executions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted">Avg Duration</p>
              <p className="text-xs text-text-secondary">{workflow.avgDuration}</p>
            </div>
            <div>
              <p className="text-[11px] text-text-muted">Failure Rate</p>
              <p
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
              </p>
            </div>
          </div>

          {/* Failure rate bar */}
          <div className="mb-3">
            <div className="h-1 bg-surface-light rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  workflow.failureRate > 5
                    ? 'bg-error'
                    : workflow.failureRate > 2
                    ? 'bg-warning'
                    : 'bg-success'
                )}
                style={{ width: `${Math.min(workflow.failureRate * 10, 100)}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5 justify-end">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              {workflow.status === 'active'
                ? <Pause className="w-3.5 h-3.5" />
                : <Play  className="w-3.5 h-3.5" />
              }
            </Button>
            <Link
              href={`/dashboard/workflows/${workflow.id}`}
              className="inline-flex items-center gap-1 h-7 px-2 text-xs font-medium rounded-md hover:bg-surface-light text-text-muted transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}
