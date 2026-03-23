'use client'

import Link from 'next/link'
import { CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface Schedule {
  id: string
  workflowId: string
  workflowName: string
  cronExpression: string
  humanReadable: string
  nextRunIn: string
  lastRun: string
  lastStatus: 'success' | 'failed' | null
  active: boolean
}

interface ScheduleTableProps {
  schedules: Schedule[]
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function ScheduleTable({ schedules, onToggle, onDelete }: ScheduleTableProps) {
  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Delete schedule for "${name}"? This cannot be undone.`)) {
      onDelete(id)
    }
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-background z-10">
          <tr className="border-b border-border">
            <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">Workflow</th>
            <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">Schedule</th>
            <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">Next Run</th>
            <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">Last Run</th>
            <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">Last Status</th>
            <th className="p-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted whitespace-nowrap">Active</th>
            <th className="w-24 p-3" />
          </tr>
        </thead>
        <tbody>
          {schedules.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center text-xs text-text-muted">
                No schedules found.
              </td>
            </tr>
          ) : (
            schedules.map((s) => (
              <tr key={s.id} className="border-b border-border hover:bg-surface-light transition-colors group">
                {/* Workflow name */}
                <td className="p-3">
                  <Link
                    href={`/dashboard/workflows/${s.workflowId}`}
                    className="font-medium text-text-primary hover:text-primary transition-colors"
                  >
                    {s.workflowName}
                  </Link>
                  <p className="text-[11px] text-text-muted mt-0.5 font-mono">{s.cronExpression}</p>
                </td>

                {/* Human-readable schedule */}
                <td className="p-3 text-text-secondary text-xs whitespace-nowrap">{s.humanReadable}</td>

                {/* Next Run */}
                <td className="p-3 text-text-secondary text-xs whitespace-nowrap">
                  {s.active ? s.nextRunIn : <span className="text-text-muted">—</span>}
                </td>

                {/* Last Run */}
                <td className="p-3 text-text-secondary text-xs whitespace-nowrap">{s.lastRun}</td>

                {/* Last Status */}
                <td className="p-3">
                  {s.lastStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-success" />}
                  {s.lastStatus === 'failed'  && <XCircle      className="w-4 h-4 text-error" />}
                  {s.lastStatus === null      && <span className="text-text-muted text-xs">—</span>}
                </td>

                {/* Active toggle */}
                <td className="p-3">
                  <button
                    onClick={() => onToggle(s.id)}
                    className={cn(
                      'w-8 h-4 rounded-full transition-colors relative',
                      s.active ? 'bg-success' : 'bg-surface-light border border-border'
                    )}
                    title={s.active ? 'Pause schedule' : 'Activate schedule'}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform',
                        s.active ? 'translate-x-4' : 'translate-x-0.5'
                      )}
                    />
                  </button>
                </td>

                {/* Actions */}
                <td className="p-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit schedule">
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-error hover:text-error"
                      title="Delete schedule"
                      onClick={() => handleDelete(s.id, s.workflowName)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
