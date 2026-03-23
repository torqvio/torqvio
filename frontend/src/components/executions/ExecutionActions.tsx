'use client'

import { Button } from '@/components/ui/button'
import { Eye, ChevronDown, RefreshCw, XOctagon } from 'lucide-react'
import type { Execution } from '@/types/execution'

interface ExecutionActionsProps {
  execution: Execution
  onRetry?: (id: string) => void
  onCancel?: (id: string) => void
  onView?: (id: string) => void
}

export default function ExecutionActions({ 
  execution, 
  onRetry, 
  onCancel, 
  onView 
}: ExecutionActionsProps) {
  const canRetry = execution.status === 'failed'
  const canCancel = execution.status === 'running' || execution.status === 'queued'

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView?.(execution.id)}
        className="text-gray-400 hover:text-white"
      >
        <Eye className="w-4 h-4" />
      </Button>
      
      {canRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRetry?.(execution.id)}
          className="text-blue-400 hover:text-blue-300"
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      )}
      
      {canCancel && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onCancel?.(execution.id)}
          className="text-red-400 hover:text-red-300"
        >
          <XOctagon className="w-4 h-4" />
        </Button>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-400 hover:text-white"
      >
        <ChevronDown className="w-4 h-4" />
      </Button>
    </div>
  )
}
