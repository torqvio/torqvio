'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
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

export default function DashboardHomePage() {
  const [timeRange, setTimeRange] = useState<'24H' | '7D' | '30D'>('24H')
  const [advisorOpen, setAdvisorOpen] = useState(false)

  const { workflows, executions, isLoading, error } = useDashboardData()
  const metricsData = useDashboardMetrics(executions, workflows)
  const advisorIssues = useAdvisorIssues(executions, workflows)
  const recentActivities = useRecentActivities(executions)

  const failedCount = executions.filter(e => e.status === 'failed').length

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto space-y-8">

        {error && (
          <AlertBanner
            severity="error"
            message={error}
            ctaLabel="Retry"
            ctaHref="#"
          />
        )}

        {!isLoading && !error && failedCount > 0 && (
          <AlertBanner
            severity="warning"
            message={`${failedCount} failed execution${failedCount !== 1 ? 's' : ''} in the last 24h`}
            ctaLabel="View errors"
            ctaHref="/dashboard/errors"
          />
        )}

        <ProjectHeader
          projectName="AetherFlow"
          planTier="pro"
          apiEndpoint={process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8459'}
          engineStatus={isLoading ? 'degraded' : error ? 'down' : 'operational'}
          lastDeployment={new Date().toLocaleDateString()}
          lastSuccessfulExecution={
            executions.length > 0
              ? executions[0]?.created_at
                ? new Date(executions[0].created_at).toLocaleString()
                : 'Unknown'
              : 'No executions yet'
          }
          activeWorkflows={workflows.length}
        />

        <QuickActions />

        {!isLoading && !error && (
          <MetricsCarousel
            metrics={metricsData}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
        )}

        {!isLoading && !error && (
          <RecentActivity activities={recentActivities} />
        )}

        {!isLoading && !error && advisorIssues.length > 0 && (
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <button
              onClick={() => setAdvisorOpen(!advisorOpen)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-text-secondary">Optimization opportunities</span>
                <span className="px-1.5 py-0.5 rounded-full text-xs bg-primary/10 text-primary border border-primary/20 font-medium">
                  {advisorIssues.length}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-text-muted transition-transform duration-200 ${advisorOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {advisorOpen && (
              <div className="border-t border-border/50 px-4 py-4">
                <AdvisorSection issues={advisorIssues} />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
