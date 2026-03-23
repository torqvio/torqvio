'use client'

import { cn } from '@/lib/utils'
import type { Execution } from '@/types/execution'

interface ExecutionStatusBadgeProps {
  status: Execution['status']
  className?: string
}

export default function ExecutionStatusBadge({ status, className }: ExecutionStatusBadgeProps) {
  const getStatusConfig = (status: Execution['status']) => {
    switch (status) {
      case 'success':
        return {
          color: 'text-green-400 bg-green-400/10',
          icon: '✓',
          label: 'Success'
        }
      case 'failed':
        return {
          color: 'text-red-400 bg-red-400/10',
          icon: '✕',
          label: 'Failed'
        }
      case 'running':
        return {
          color: 'text-blue-400 bg-blue-400/10',
          icon: '⟳',
          label: 'Running'
        }
      case 'queued':
        return {
          color: 'text-yellow-400 bg-yellow-400/10',
          icon: '⏳',
          label: 'Queued'
        }
      default:
        return {
          color: 'text-gray-400 bg-gray-400/10',
          icon: '?',
          label: 'Unknown'
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
      config.color,
      className
    )}>
      <span className="text-xs">{config.icon}</span>
      {config.label}
    </span>
  )
}
