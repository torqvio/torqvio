'use client'

import Link from 'next/link'
import { MoreHorizontal, Play, Pause, Trash2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Workflow {
  id: string
  name: string
  status: 'active' | 'paused' | 'error'
  lastRun: string
  executions: number
  failureRate: number
}

interface WorkflowTableProps {
  workflows: Workflow[]
}

export default function WorkflowTable({ workflows }: WorkflowTableProps) {
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-success'
      case 'paused':
        return 'status-running'
      case 'error':
        return 'status-error'
      default:
        return ''
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-4 font-medium text-text-secondary">Name</th>
            <th className="text-left p-4 font-medium text-text-secondary">Status</th>
            <th className="text-left p-4 font-medium text-text-secondary">Last Run</th>
            <th className="text-left p-4 font-medium text-text-secondary">Executions</th>
            <th className="text-left p-4 font-medium text-text-secondary">Failure Rate</th>
            <th className="text-left p-4 font-medium text-text-secondary">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workflows.map((workflow) => (
            <tr key={workflow.id} className="border-b border-border hover:bg-surface-light">
              <td className="p-4">
                <Link 
                  href={`/dashboard/workflows/${workflow.id}`}
                  className="text-text-primary hover:text-primary font-medium"
                >
                  {workflow.name}
                </Link>
              </td>
              <td className="p-4">
                <span className={cn('text-xs', getStatusClass(workflow.status))}>
                  {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                </span>
              </td>
              <td className="p-4 text-text-secondary">{workflow.lastRun}</td>
              <td className="p-4 text-text-secondary">{workflow.executions.toLocaleString()}</td>
              <td className="p-4">
                <span className={cn(
                  'text-xs',
                  workflow.failureRate > 2 ? 'status-error' : 'status-success'
                )}>
                  {workflow.failureRate}%
                </span>
              </td>
              <td className="p-4">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    {workflow.status === 'active' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="w-4 h-4" />
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
