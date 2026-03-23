'use client'

import React from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import ExecutionStatusBadge from './ExecutionStatusBadge'
import ExecutionTriggerBadge from './ExecutionTriggerBadge'
import ExecutionActions from './ExecutionActions'
import type { Execution, ExecutionTableProps } from '@/types/execution'

export default function ExecutionTable({ executions, onRetry, onCancel }: ExecutionTableProps) {
  return (
    <div className="w-full">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700 text-left">
            <th className="pb-3 text-sm font-medium text-gray-400">Status</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Workflow</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Trigger</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Started</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Duration</th>
            <th className="pb-3 text-sm font-medium text-gray-400">Progress</th>
            <th className="pb-3 text-sm font-medium text-gray-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {executions.map((execution) => (
            <ExecutionRow 
              key={execution.id} 
              execution={execution} 
              onRetry={onRetry}
              onCancel={onCancel}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ExecutionRow({ 
  execution, 
  onRetry, 
  onCancel 
}: { 
  execution: Execution
  onRetry?: (id: string) => void
  onCancel?: (id: string) => void
}) {
  return (
    <tr className="border-b border-gray-700/50 hover:bg-gray-700/30 transition-colors">
      <td className="py-3">
        <ExecutionStatusBadge status={execution.status} />
      </td>
      <td className="py-3">
        <div>
          <Link 
            href={`/dashboard/workflows/${execution.workflowId}`}
            className="text-sm font-medium text-white hover:text-purple-400 transition-colors"
          >
            {execution.workflowName}
          </Link>
          <div className="text-xs text-gray-400 mt-0.5">{execution.id}</div>
        </div>
      </td>
      <td className="py-3">
        <ExecutionTriggerBadge trigger={execution.trigger} />
      </td>
      <td className="py-3">
        <div className="text-sm text-gray-300">{execution.startedAt}</div>
      </td>
      <td className="py-3">
        <div className="text-sm text-gray-300">
          {execution.startedAtMs ? (
            <LiveDuration startedAtMs={execution.startedAtMs} />
          ) : (
            execution.duration
          )}
        </div>
      </td>
      <td className="py-3">
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-300">
            {execution.completedSteps}/{execution.totalSteps}
          </div>
          <div className="w-24 h-1.5 bg-gray-600 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 transition-all duration-300"
              style={{ width: `${(execution.completedSteps / execution.totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </td>
      <td className="py-3 text-right">
        <ExecutionActions 
          execution={execution}
          onRetry={onRetry}
          onCancel={onCancel}
          onView={(id) => console.log('View execution:', id)}
        />
      </td>
    </tr>
  )
}

function LiveDuration({ startedAtMs }: { startedAtMs: number }) {
  const [elapsed, setElapsed] = React.useState(Math.floor((Date.now() - startedAtMs) / 1000))
  
  React.useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startedAtMs) / 1000)), 1000)
    return () => clearInterval(id)
  }, [startedAtMs])
  
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }
  
  return (
    <div className="flex items-center gap-1">
      <Clock className="w-3 h-3 text-blue-400" />
      <span className="text-sm text-gray-300">{formatTime(elapsed)}</span>
    </div>
  )
}
