'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type SubNavView = 'all' | 'deployed' | 'drafts' | 'templates' | 'recent'

interface WorkflowSubNavProps {
  activeView: SubNavView
  onViewChange: (view: string) => void
  failedCount?: number
}

export function WorkflowSubNav({ activeView, onViewChange, failedCount = 0 }: WorkflowSubNavProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto py-4 px-2 space-y-5">
      {/* WORKFLOWS section */}
      <div>
        <p className="text-[11px] uppercase font-mono text-text-muted px-3 mb-1.5 tracking-wider">
          Workflows
        </p>
        <div className="space-y-0.5">
          {(
            [
              { id: 'all', label: 'All Workflows' },
              { id: 'deployed', label: 'Deployed' },
              { id: 'drafts', label: 'Drafts' },
              { id: 'templates', label: 'Templates' },
              { id: 'recent', label: 'Recently Edited' },
            ] as { id: SubNavView; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                'w-full flex items-center px-3 py-1.5 rounded-md text-sm transition-colors text-left',
                activeView === item.id
                  ? 'bg-primary/10 text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* EXECUTIONS section */}
      <div>
        <p className="text-[11px] uppercase font-mono text-text-muted px-3 mb-1.5 tracking-wider">
          Executions
        </p>
        <div className="space-y-0.5">
          <Link
            href="/dashboard/executions"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            All Executions
            <ArrowUpRight className="w-3 h-3 text-text-muted" />
          </Link>
          <Link
            href="/dashboard/executions?status=running"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            Running
            <ArrowUpRight className="w-3 h-3 text-text-muted" />
          </Link>
          <Link
            href="/dashboard/executions?status=failed"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            <span>Failed</span>
            <div className="flex items-center gap-1.5">
              {failedCount > 0 && (
                <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-error text-white text-[10px] font-bold">
                  {failedCount > 99 ? '99+' : failedCount}
                </span>
              )}
              <ArrowUpRight className="w-3 h-3 text-text-muted" />
            </div>
          </Link>
          <Link
            href="/dashboard/scheduler"
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            Scheduled
            <ArrowUpRight className="w-3 h-3 text-text-muted" />
          </Link>
        </div>
      </div>

      {/* CONFIGURATION section */}
      <div>
        <p className="text-[11px] uppercase font-mono text-text-muted px-3 mb-1.5 tracking-wider">
          Configuration
        </p>
        <div className="space-y-0.5">
          {(
            [
              { label: 'Retry Policies', href: '/dashboard/workflows/config/retry-policies' },
              { label: 'Environment Vars', href: '/dashboard/workflows/config/env' },
              { label: 'Secrets', href: '/dashboard/workflows/config/secrets' },
            ] as { label: string; href: string }[]
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
            >
              {item.label}
              <ArrowUpRight className="w-3 h-3 text-text-muted" />
            </Link>
          ))}
        </div>
      </div>

      {/* TOOLS section */}
      <div>
        <p className="text-[11px] uppercase font-mono text-text-muted px-3 mb-1.5 tracking-wider">
          Tools
        </p>
        <div className="space-y-0.5">
          {(
            [
              { label: 'Workflow Advisor', href: '/dashboard/workflows/tools/advisor' },
              { label: 'Diff Viewer', href: '/dashboard/workflows/tools/diff' },
              { label: 'Import / Export', href: '/dashboard/workflows/tools/import-export' },
            ] as { label: string; href: string }[]
          ).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
            >
              {item.label}
              <ArrowUpRight className="w-3 h-3 text-text-muted" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
