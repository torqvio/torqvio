'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Workflow {
  id: string
  name: string
  status: string
  lastRun: string
  executions: number
  failureRate: number
  avgDuration: string
}

interface WorkflowMetricsProps {
  workflow: Workflow
}

export default function WorkflowMetrics({ workflow }: WorkflowMetricsProps) {
  const metrics = [
    {
      title: 'Total Executions',
      value: workflow.executions.toLocaleString(),
      change: '+12%',
      changeType: 'positive',
    },
    {
      title: 'Success Rate',
      value: `${(100 - workflow.failureRate).toFixed(1)}%`,
      change: '+0.3%',
      changeType: 'positive',
    },
    {
      title: 'Average Duration',
      value: workflow.avgDuration,
      change: '-15%',
      changeType: 'positive',
    },
    {
      title: 'Last 24h Executions',
      value: '47',
      change: '+8%',
      changeType: 'positive',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardContent className="p-6">
            <div className="flex flex-col space-y-2">
              <p className="text-sm font-medium text-text-secondary">
                {metric.title}
              </p>
              <p className="text-2xl font-bold text-text-primary">
                {metric.value}
              </p>
              <p className="text-sm text-success">
                {metric.change}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
