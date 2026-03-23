'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckCircle, XCircle, AlertCircle, Loader, Pause, Play } from 'lucide-react'

type EventStatus = 'success' | 'error' | 'warning' | 'running'

interface ActivityRow {
  id: string
  status: EventStatus
  workflow: string
  step: string
  duration: string
  time: string
}

interface RecentActivityProps {
  activities: ActivityRow[]
}

const statusConfig: Record<EventStatus, { icon: typeof CheckCircle; color: string }> = {
  success: { icon: CheckCircle, color: 'text-success' },
  error: { icon: XCircle, color: 'text-error' },
  warning: { icon: AlertCircle, color: 'text-warning' },
  running: { icon: Loader, color: 'text-primary' },
}

export function RecentActivity({ activities: initialActivities }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityRow[]>(initialActivities)
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    if (!isLive) return

    const workflows = ['User Onboarding', 'Data Sync', 'Email Campaign', 'Webhook Relay', 'Backup Job']
    const steps = ['Validate', 'Process', 'Send', 'Transform', 'Complete']
    const statuses: EventStatus[] = ['success', 'error', 'warning', 'running']

    const interval = setInterval(() => {
      const newActivity: ActivityRow = {
        id: Date.now().toString(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        workflow: workflows[Math.floor(Math.random() * workflows.length)],
        step: steps[Math.floor(Math.random() * steps.length)],
        duration: `${(Math.random() * 4 + 0.1).toFixed(1)}s`,
        time: 'Just now',
      }

      setActivities((prev) => [newActivity, ...prev.slice(0, 7)])
    }, 6000 + Math.random() * 4000)

    return () => clearInterval(interval)
  }, [isLive])

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-text-primary">Recent Activity</h2>
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
              isLive
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-surface-light text-text-muted border border-border'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-text-muted'}`} />
            {isLive ? 'Live' : 'Paused'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLive(!isLive)}
            className="p-1.5 rounded-md border border-border hover:bg-surface-light transition-colors"
            aria-label={isLive ? 'Pause feed' : 'Resume feed'}
          >
            {isLive ? (
              <Pause className="w-3.5 h-3.5 text-text-secondary" />
            ) : (
              <Play className="w-3.5 h-3.5 text-text-secondary" />
            )}
          </button>
          <Link
            href="/dashboard/executions"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider w-10">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Workflow</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden md:table-cell">Step</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider hidden sm:table-cell">Duration</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-text-muted uppercase tracking-wider">Time</th>
            </tr>
          </thead>
          <tbody>
            {activities.slice(0, 8).map((row) => {
              const config = statusConfig[row.status]
              const Icon = config.icon
              return (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-surface-light/50 transition-colors">
                  <td className="px-4 py-2.5">
                    <Icon className={`w-4 h-4 ${config.color} ${row.status === 'running' ? 'animate-spin' : ''}`} />
                  </td>
                  <td className="px-4 py-2.5 text-text-primary font-medium">{row.workflow}</td>
                  <td className="px-4 py-2.5 text-text-secondary hidden md:table-cell">{row.step}</td>
                  <td className="px-4 py-2.5 text-text-secondary text-right font-mono text-xs hidden sm:table-cell">{row.duration}</td>
                  <td className="px-4 py-2.5 text-text-muted text-right text-xs">{row.time}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
