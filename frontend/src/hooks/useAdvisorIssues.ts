'use client'

import { useMemo } from 'react'
import type { WorkflowExecution } from '@/types/api'

interface AdvisorIssue {
  id: string
  category: 'setup' | 'reliability' | 'performance' | 'security'
  title: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  actionLabel: string
  actionHref: string
}

export function useAdvisorIssues(executions: WorkflowExecution[], workflows: any[]) {
  const issues = useMemo(() => {
    const result: AdvisorIssue[] = []
    const failedExecutions = executions.filter(e => e.status === 'failed')
    
    if (failedExecutions.length > 0) {
      result.push({
        id: '1',
        category: 'reliability',
        title: 'Failed executions detected',
        description: `${failedExecutions.length} executions have failed in the recent period.`,
        severity: 'high',
        actionLabel: 'View failures',
        actionHref: '/dashboard/executions?status=failed',
      })
    }
    
    if (workflows.length === 0) {
      result.push({
        id: '2',
        category: 'setup',
        title: 'No workflows configured',
        description: 'Get started by creating your first workflow.',
        severity: 'medium',
        actionLabel: 'Create workflow',
        actionHref: '/dashboard/workflows/create',
      })
    }
    
    return result
  }, [executions, workflows])

  return issues
}
