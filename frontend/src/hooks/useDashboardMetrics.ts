'use client'

import { useMemo } from 'react'
import type { WorkflowExecution } from '@/types/api'
import { MetricCardData } from '@/types/dashboard'

export function useDashboardMetrics(executions: WorkflowExecution[], workflows: any[]) {
  const metricsData = useMemo(() => {
    const generate24hBars = (base: number, variance: number) =>
      Array.from({ length: 24 }, (_, i) => ({
        label: `${i}:00`,
        value: Math.round(base + (Math.random() - 0.5) * variance),
      }))

    const totalExecutions = executions.length
    return [
      {
        title: 'Total Executions',
        href: '/dashboard/executions',
        total: totalExecutions.toLocaleString(),
        data: generate24hBars(Math.max(totalExecutions / 24, 1), Math.max(totalExecutions / 48, 1)),
      },
      {
        title: 'Active Workflows',
        href: '/dashboard/workflows',
        total: workflows.length.toString(),
        data: generate24hBars(workflows.length, 2),
      },
      {
        title: 'Success Rate',
        href: '/dashboard/executions',
        total: `${Math.round((executions.filter(e => e.status === 'completed').length / Math.max(totalExecutions, 1)) * 100)}%`,
        data: generate24hBars(85, 10),
      },
      {
        title: 'Failed Executions',
        href: '/dashboard/executions?status=failed',
        total: executions.filter(e => e.status === 'failed').length.toString(),
        data: generate24hBars(Math.max(executions.filter(e => e.status === 'failed').length / 24, 1), 2),
      },
    ]
  }, [executions, workflows])

  return metricsData
}
