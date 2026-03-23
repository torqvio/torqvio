'use client'

import { useMemo } from 'react'
import type { WorkflowExecution } from '@/types/api'

interface ActivityRow {
  id: string
  status: 'success' | 'error' | 'running' | 'warning'
  workflow: string
  step: string
  duration: string
  time: string
}

export function useRecentActivities(executions: WorkflowExecution[]) {
  const activities = useMemo(() => {
    return executions.slice(0, 8).map((exec: WorkflowExecution) => ({
      id: exec.id,
      status: exec.status === 'completed' ? 'success' as const : 
             exec.status === 'failed' ? 'error' as const : 
             exec.status === 'running' ? 'running' as const : 
             'warning' as const,
      workflow: exec.flow_name || exec.workflowName || 'Unknown Workflow',
      step: 'Execution',
      duration: exec.updated_at && exec.created_at 
        ? `${Math.round((new Date(exec.updated_at).getTime() - new Date(exec.created_at).getTime()) / 1000)}s`
        : '—',
      time: exec.created_at ? new Date(exec.created_at).toLocaleString() : 'Unknown'
    }))
  }, [executions])

  return activities
}
