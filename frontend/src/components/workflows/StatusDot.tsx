'use client'

import { cn } from '@/lib/utils'
import type { Workflow } from './WorkflowListView'

interface StatusDotProps {
  status: Workflow['status']
  className?: string
}

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span className={cn('relative flex items-center justify-center w-2 h-2 flex-shrink-0', className)}>
      {status === 'active' && (
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-40" />
      )}
      <span
        className={cn(
          'relative inline-flex rounded-full w-2 h-2',
          status === 'active' && 'bg-success',
          status === 'paused' && 'bg-warning',
          status === 'error' && 'bg-error ring-2 ring-error/20',
          status === 'draft' && 'bg-text-muted',
        )}
      />
    </span>
  )
}
