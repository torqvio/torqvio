'use client'

import { useState } from 'react'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { ProjectHeader } from '@/components/dashboard/ProjectHeader'
import { MetricsCarousel } from '@/components/dashboard/MetricsCarousel'
import { AdvisorSection } from '@/components/dashboard/AdvisorSection'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { useDashboardData } from '@/hooks/useDashboardData'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { useAdvisorIssues } from '@/hooks/useAdvisorIssues'
import { useRecentActivities } from '@/hooks/useRecentActivities'
import type { Workflow, WorkflowExecution } from '@/types/api'
import { MetricCardData, ExecutionData } from '@/types/dashboard'


export default function DashboardHomePage() {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H')
  const { workflows, executions, isLoading, error } = useDashboardData()
  const metricsData = useDashboardMetrics(executions, workflows)
  const advisorIssues = useAdvisorIssues(executions, workflows)
  const recentActivities = useRecentActivities(executions)


  const showAlert = !isLoading && !error && executions.filter(e => e.status === 'failed').length > 0

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto px-6 py-6 space-y-8">
        {/* Section 1: Alert Banner */}
        {error && (
          <AlertBanner
            severity="error"
            message={error}
            ctaLabel="Retry"
            ctaHref="#"
          />
        )}
        {showAlert && (
          <AlertBanner
            severity="warning"
            message={`${executions.filter(e => e.status === 'failed').length} failed executions detected`}
            ctaLabel="View Errors"
            ctaHref="/dashboard/executions?status=failed"
          />
        )}

        {/* Section 2: Project Header + Status Tiles */}
        <ProjectHeader
          projectName="Torqvio"
          planTier="pro"
          apiEndpoint="http://localhost:8459"
          engineStatus={isLoading ? 'degraded' : error ? 'down' : 'operational'}
          lastDeployment={new Date().toLocaleDateString()}
          lastSuccessfulExecution={executions.length > 0 
            ? executions[0]?.created_at 
              ? new Date(executions[0].created_at).toLocaleString() 
              : 'Unknown'
            : 'No executions'}
          activeWorkflows={workflows.length}
        />

        {/* Section 3: Execution Metrics Carousel */}
        {!isLoading && !error && (
          <MetricsCarousel
            metrics={metricsData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}

        {/* Section 4: Advisor / Insights */}
        {!isLoading && !error && (
          <AdvisorSection issues={advisorIssues} />
        )}

        {/* Section 5: Recent Activity */}
        {!isLoading && !error && (
          <RecentActivity activities={recentActivities} />
        )}

        {/* Section 6: Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}
