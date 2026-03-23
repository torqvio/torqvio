'use client'

import { Shield, Zap, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

type IssueCategory = 'security' | 'performance' | 'reliability' | 'setup'

interface AdvisorIssue {
  id: string
  category: IssueCategory
  title: string
  description: string
  severity: 'high' | 'medium' | 'low' | 'critical'
  actionLabel?: string
  actionHref?: string
}

interface AdvisorSectionProps {
  issues: AdvisorIssue[]
}

const categoryConfig: Record<IssueCategory, { icon: typeof Shield; color: string; bg: string }> = {
  security: { icon: Shield, color: 'text-error', bg: 'bg-error/10' },
  performance: { icon: Zap, color: 'text-warning', bg: 'bg-warning/10' },
  reliability: { icon: AlertTriangle, color: 'text-primary', bg: 'bg-primary/10' },
}

const severityColors = {
  high: 'border-error/30',
  medium: 'border-warning/30',
  low: 'border-border',
}

function IssueCard({ issue }: { issue: AdvisorIssue }) {
  const config = categoryConfig[issue.category]
  const Icon = config.icon

  return (
    <div
      className={`min-w-[260px] flex-shrink-0 snap-start rounded-lg border bg-surface p-4 hover:bg-surface-light transition-colors ${severityColors[issue.severity]}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${config.bg}`}>
          <Icon className={`w-4 h-4 ${config.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary mb-1">{issue.title}</p>
          <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">{issue.description}</p>
          {issue.actionLabel && issue.actionHref && (
            <Link
              href={issue.actionHref}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 mt-2 transition-colors"
            >
              {issue.actionLabel}
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export function AdvisorSection({ issues }: AdvisorSectionProps) {
  if (issues.length === 0) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-text-primary">Advisor</h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/20">
          {issues.length} issue{issues.length !== 1 ? 's' : ''} found
        </span>
      </div>

      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {issues.map((issue) => (
          <IssueCard key={issue.id} issue={issue} />
        ))}
      </div>
    </div>
  )
}
