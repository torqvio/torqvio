'use client'

import { useState, useEffect } from 'react'
import { apiClient } from '@/services/api'
import type { Workflow, WorkflowExecution } from '@/types/api'

export function useDashboardData() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        // Load workflows and executions in parallel
        const [workflowsResponse, executionsResponse] = await Promise.all([
          apiClient.getWorkflows(),
          apiClient.getExecutions({ limit: 100 })
        ])
        
        setWorkflows(workflowsResponse.flows)
        setExecutions(executionsResponse.executions)
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return {
    workflows,
    executions,
    isLoading,
    error
  }
}
