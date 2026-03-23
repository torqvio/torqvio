'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, AlertCircle, Info, CheckCircle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface HighPriorityIssue {
  id: string
  workflowId: string
  workflowName: string
  severity: 'high' | 'medium' | 'info'
  description: string
  recommendation: string
  points: number
  primaryAction: { label: string; href: string }
  secondaryActions: { label: string; href?: string; variant?: 'resume' | 'archive' }[]
}

interface Suggestion {
  id: string
  workflowId: string
  workflowName: string
  description: string
  recommendation: string
  points: number
  primaryAction: { label: string; href: string }
  secondaryAction?: { label: string; href?: string }
}

const HIGH_PRIORITY: HighPriorityIssue[] = [
  {
    id: 'hp1',
    workflowId: '4',
    workflowName: 'Payment Retry Handler',
    severity: 'high',
    description: '8.4% failure rate exceeds the 5% threshold',
    recommendation: 'Add exponential backoff retry policy to reduce cascading failures',
    points: 15,
    primaryAction: { label: 'View Workflow', href: '/dashboard/workflows/4' },
    secondaryActions: [{ label: 'Go to Retry Policies', href: '/dashboard/workflows/config/retry-policies' }],
  },
  {
    id: 'hp2',
    workflowId: '3',
    workflowName: 'Email Campaign',
    severity: 'medium',
    description: 'Workflow has been paused for 7 days',
    recommendation: 'Resume or archive this workflow to keep your workspace clean',
    points: 10,
    primaryAction: { label: 'View Workflow', href: '/dashboard/workflows/3' },
    secondaryActions: [
      { label: 'Resume', variant: 'resume' },
      { label: 'Archive', variant: 'archive' },
    ],
  },
]

const SUGGESTIONS: Suggestion[] = [
  {
    id: 's1',
    workflowId: '5',
    workflowName: 'Notification Dispatcher',
    description: 'No retry policy configured',
    recommendation: 'Add a retry policy to handle transient errors and improve reliability',
    points: 5,
    primaryAction: { label: 'View Workflow', href: '/dashboard/workflows/5' },
    secondaryAction: { label: 'Add Retry Policy', href: '/dashboard/workflows/config/retry-policies' },
  },
  {
    id: 's2',
    workflowId: '6',
    workflowName: 'Weekly Report Generator',
    description: 'Draft workflow has never been run',
    recommendation: 'Deploy or delete this draft workflow to reduce clutter',
    points: 3,
    primaryAction: { label: 'View Workflow', href: '/dashboard/workflows/6' },
    secondaryAction: { label: 'Deploy', href: '/dashboard/workflows/6' },
  },
  {
    id: 's3',
    workflowId: '2',
    workflowName: 'Data Processing Pipeline',
    description: 'No description set',
    recommendation: 'Add a description to help your team understand this workflow\'s purpose',
    points: 2,
    primaryAction: { label: 'View Workflow', href: '/dashboard/workflows/2' },
  },
]

const PASSED_CHECKS = [
  'All active workflows have triggers configured',
  'No executions stuck > 1 hour',
  'Secrets rotated within 90 days',
  'No duplicate workflow names',
  'All webhooks have valid endpoints',
  'Retry policies assigned to critical workflows',
  'Execution success rate above 90%',
  'No orphaned environment variables',
]

const SCORE_TOTAL = 100
const SCORE_DEDUCTIONS = HIGH_PRIORITY.reduce((acc, i) => acc + i.points, 0) + SUGGESTIONS.reduce((acc, s) => acc + s.points, 0)
const HEALTH_SCORE = SCORE_TOTAL - SCORE_DEDUCTIONS

function getScoreLabel(score: number): { label: string; color: string } {
  if (score < 40) return { label: 'Critical', color: 'text-error' }
  if (score < 60) return { label: 'Poor', color: 'text-warning' }
  if (score < 80) return { label: 'Good', color: 'text-success' }
  return { label: 'Excellent', color: 'text-success' }
}

function getScoreBarColor(score: number): string {
  if (score < 40) return 'bg-error'
  if (score < 60) return 'bg-warning'
  return 'bg-success'
}

function SeverityIcon({ severity }: { severity: 'high' | 'medium' | 'info' }) {
  if (severity === 'high') return <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
  if (severity === 'medium') return <AlertCircle className="w-4 h-4 text-warning flex-shrink-0" />
  return <Info className="w-4 h-4 text-primary flex-shrink-0" />
}

function IssueCard({ issue }: { issue: HighPriorityIssue }) {
  const borderColor = issue.severity === 'high' ? 'border-error/50' : 'border-warning/50'

  return (
    <div className={cn('rounded-md border bg-surface p-3 space-y-2', borderColor)}>
      <div className="flex items-start gap-2">
        <SeverityIcon severity={issue.severity} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={issue.primaryAction.href}
              className="text-sm font-medium text-text-primary hover:text-primary truncate"
            >
              {issue.workflowName}
            </Link>
          </div>
          <p className="text-sm text-text-secondary mt-0.5">{issue.description}</p>
          <p className="text-xs text-text-muted mt-0.5">{issue.recommendation}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={issue.primaryAction.href}
          className="inline-flex items-center h-6 px-2.5 rounded text-xs font-medium border border-border text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
        >
          {issue.primaryAction.label}
        </Link>
        {issue.secondaryActions.map((action) =>
          action.href ? (
            <Link
              key={action.label}
              href={action.href}
              className="inline-flex items-center h-6 px-2.5 rounded text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              {action.label}
            </Link>
          ) : (
            <button
              key={action.label}
              className={cn(
                'inline-flex items-center h-6 px-2.5 rounded text-xs font-medium transition-colors',
                action.variant === 'archive'
                  ? 'border border-border text-text-muted hover:text-text-primary hover:bg-surface-light'
                  : 'bg-primary text-white hover:bg-primary/90'
              )}
            >
              {action.label}
            </button>
          )
        )}
      </div>
    </div>
  )
}

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  return (
    <div className="rounded-md border border-warning/40 bg-surface p-3 space-y-2">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-warning flex-shrink-0 mt-px" />
        <div className="flex-1 min-w-0">
          <Link
            href={suggestion.primaryAction.href}
            className="text-sm font-medium text-text-primary hover:text-primary truncate block"
          >
            {suggestion.workflowName}
          </Link>
          <p className="text-sm text-text-secondary mt-0.5">{suggestion.description}</p>
          <p className="text-xs text-text-muted mt-0.5">{suggestion.recommendation}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={suggestion.primaryAction.href}
          className="inline-flex items-center h-6 px-2.5 rounded text-xs font-medium border border-border text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors"
        >
          {suggestion.primaryAction.label}
        </Link>
        {suggestion.secondaryAction && (
          suggestion.secondaryAction.href ? (
            <Link
              href={suggestion.secondaryAction.href}
              className="inline-flex items-center h-6 px-2.5 rounded text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              {suggestion.secondaryAction.label}
            </Link>
          ) : (
            <button className="inline-flex items-center h-6 px-2.5 rounded text-xs font-medium bg-primary text-white hover:bg-primary/90 transition-colors">
              {suggestion.secondaryAction.label}
            </button>
          )
        )}
      </div>
    </div>
  )
}

export default function WorkflowAdvisorPage() {
  const [passedChecksOpen, setPassedChecksOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const scoreInfo = getScoreLabel(HEALTH_SCORE)
  const barColor = getScoreBarColor(HEALTH_SCORE)

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1000)
  }

  return (
    <div className="flex flex-col overflow-auto -m-6" style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <div className="h-12 px-4 border-b border-border flex items-center justify-between flex-shrink-0 bg-background">
        <span className="text-sm font-semibold text-text-primary">Workflow Advisor</span>
        <button
          onClick={handleRefresh}
          className={cn(
            'inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium rounded border border-border text-text-secondary hover:text-text-primary hover:bg-surface-light transition-colors',
            refreshing && 'opacity-60 pointer-events-none'
          )}
        >
          <RefreshCw className={cn('w-3 h-3', refreshing && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 max-w-3xl space-y-6">
        {/* Health Score Card */}
        <div className="rounded-lg border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">Workflow Health Score</span>
            <span className={cn('text-2xl font-bold', scoreInfo.color)}>
              {HEALTH_SCORE}
              <span className="text-base font-normal text-text-muted">/100</span>
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-light overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', barColor)}
              style={{ width: `${HEALTH_SCORE}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>{HIGH_PRIORITY.length} high priority issues · {SUGGESTIONS.length} suggestions · {PASSED_CHECKS.length} checks passed</span>
            <span className={cn('font-semibold', scoreInfo.color)}>{scoreInfo.label}</span>
          </div>
        </div>

        {/* High Priority Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <AlertTriangle className="w-4 h-4 text-error" />
            <span className="text-sm font-semibold text-text-primary">
              High Priority
            </span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-error/15 text-error text-xs font-semibold">
              {HIGH_PRIORITY.length}
            </span>
          </div>
          <div className="space-y-2">
            {HIGH_PRIORITY.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Suggestions Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-0.5">
            <span className="text-base leading-none">💡</span>
            <span className="text-sm font-semibold text-text-primary">
              Suggestions
            </span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-warning/15 text-warning text-xs font-semibold">
              {SUGGESTIONS.length}
            </span>
          </div>
          <div className="space-y-2">
            {SUGGESTIONS.map((suggestion) => (
              <SuggestionCard key={suggestion.id} suggestion={suggestion} />
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Passed Checks Section */}
        <div className="space-y-2">
          <button
            onClick={() => setPassedChecksOpen((o) => !o)}
            className="flex items-center gap-2 px-0.5 w-full group"
          >
            {passedChecksOpen ? (
              <ChevronDown className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
            ) : (
              <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary transition-colors" />
            )}
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-sm font-semibold text-text-primary">
              Passed Checks
            </span>
            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-success/15 text-success text-xs font-semibold">
              {PASSED_CHECKS.length}
            </span>
          </button>

          {passedChecksOpen && (
            <div className="rounded-md border border-border bg-surface divide-y divide-border">
              {PASSED_CHECKS.map((check) => (
                <div key={check} className="flex items-center gap-2.5 px-3 py-2">
                  <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0" />
                  <span className="text-sm text-text-secondary">{check}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
