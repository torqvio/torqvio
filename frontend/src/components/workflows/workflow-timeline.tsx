'use client'

import { CheckCircle, XCircle, Clock, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Execution {
  id: string
  status: 'success' | 'failed' | 'running'
  startedAt: string
  duration: string
  steps: Array<{
    name: string
    status: 'success' | 'failed' | 'running' | 'pending'
    duration?: string
  }>
}

interface WorkflowTimelineProps {
  workflowId: string
}

export default function WorkflowTimeline({ workflowId }: WorkflowTimelineProps) {
  const executions: Execution[] = [
    {
      id: '1',
      status: 'success',
      startedAt: '2 minutes ago',
      duration: '2.4s',
      steps: [
        { name: 'Create User', status: 'success', duration: '0.8s' },
        { name: 'Send Welcome Email', status: 'success', duration: '1.2s' },
        { name: 'Update Analytics', status: 'success', duration: '0.4s' },
      ],
    },
    {
      id: '2',
      status: 'failed',
      startedAt: '15 minutes ago',
      duration: '1.1s',
      steps: [
        { name: 'Create User', status: 'success', duration: '0.7s' },
        { name: 'Send Welcome Email', status: 'failed' },
        { name: 'Update Analytics', status: 'pending' },
      ],
    },
    {
      id: '3',
      status: 'running',
      startedAt: '30 seconds ago',
      duration: '...',
      steps: [
        { name: 'Create User', status: 'success', duration: '0.6s' },
        { name: 'Send Welcome Email', status: 'running' },
        { name: 'Update Analytics', status: 'pending' },
      ],
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-success" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-error" />
      case 'running':
        return <Play className="w-4 h-4 text-primary" />
      default:
        return <Clock className="w-4 h-4 text-text-muted" />
    }
  }

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'status-success'
      case 'failed':
        return 'status-error'
      case 'running':
        return 'status-running'
      default:
        return 'text-text-muted'
    }
  }

  return (
    <div className="space-y-4">
      {executions.map((execution) => (
        <div key={execution.id} className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(execution.status)}
              <span className="text-sm font-medium text-text-primary">
                Execution #{execution.id}
              </span>
              <span className={cn('text-xs', getStatusClass(execution.status))}>
                {execution.status}
              </span>
            </div>
            <div className="text-right">
              <p className="text-xs text-text-secondary">{execution.startedAt}</p>
              <p className="text-xs text-text-primary">{execution.duration}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            {execution.steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                {getStatusIcon(step.status)}
                <span className="text-text-primary">{step.name}</span>
                {step.duration && (
                  <span className="text-text-secondary">{step.duration}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
