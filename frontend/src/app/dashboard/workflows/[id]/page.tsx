'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Play, Pause, Copy, Trash2, Webhook, Calendar, Zap, GitBranch,
  CheckCircle2, XCircle, Loader2, Clock, ChevronDown, MoreHorizontal,
  AlertTriangle, Settings, List, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { StatusDot } from '@/components/workflows/StatusDot'
import { ExecutionSparkline } from '@/components/workflows/ExecutionSparkline'

// ─── Mock data ──────────────────────────────────────────────────────────────

const MOCK_WORKFLOWS: Record<string, WorkflowDetail> = {
  default: {
    id: '',
    name: 'Data Processing Pipeline',
    description: 'Pulls data from Postgres, transforms it, and pushes to BigQuery on a schedule.',
    status: 'active',
    trigger: 'schedule',
    triggerDetail: 'Every 15 min  •  */15 * * * *',
    createdAt: 'Jan 15, 2024',
    lastRun: '5 minutes ago',
    executions: 892,
    successRate: 99.9,
    failureRate: 0.1,
    avgDuration: '4.8s',
    retryPolicy: 'Exponential (3 retries, 2s base)',
    tags: ['data', 'pipeline', 'bigquery'],
    sparklineData: [60, 70, 65, 80, 75, 90, 88],
    steps: [
      { id: 's1', name: 'Pull from Postgres',   description: 'SELECT * from events where processed = false', type: 'query' },
      { id: 's2', name: 'Transform & validate', description: 'Schema validation + field normalization',        type: 'transform' },
      { id: 's3', name: 'Push to BigQuery',     description: 'Batch insert into events_processed table',      type: 'write' },
    ],
    recentExecutions: [
      {
        id: 'exec_101', status: 'success', startedAt: '5 min ago', duration: '4.2s',
        steps: [
          { name: 'Pull from Postgres',   status: 'success', duration: '1.1s' },
          { name: 'Transform & validate', status: 'success', duration: '1.8s' },
          { name: 'Push to BigQuery',     status: 'success', duration: '1.3s' },
        ],
      },
      {
        id: 'exec_100', status: 'success', startedAt: '20 min ago', duration: '5.1s',
        steps: [
          { name: 'Pull from Postgres',   status: 'success', duration: '1.4s' },
          { name: 'Transform & validate', status: 'success', duration: '2.1s' },
          { name: 'Push to BigQuery',     status: 'success', duration: '1.6s' },
        ],
      },
      {
        id: 'exec_099', status: 'failed', startedAt: '35 min ago', duration: '2.3s',
        error: 'BigQuery quota exceeded: daily limit reached',
        steps: [
          { name: 'Pull from Postgres',   status: 'success', duration: '1.1s' },
          { name: 'Transform & validate', status: 'success', duration: '0.9s' },
          { name: 'Push to BigQuery',     status: 'failed',  duration: '0.3s', error: 'Quota exceeded' },
        ],
      },
      {
        id: 'exec_098', status: 'success', startedAt: '50 min ago', duration: '4.8s',
        steps: [
          { name: 'Pull from Postgres',   status: 'success', duration: '1.2s' },
          { name: 'Transform & validate', status: 'success', duration: '2.2s' },
          { name: 'Push to BigQuery',     status: 'success', duration: '1.4s' },
        ],
      },
    ],
  },
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface StepDef {
  id: string
  name: string
  description: string
  type: 'query' | 'transform' | 'write' | 'notify' | 'condition'
}

interface ExecStep {
  name: string
  status: 'success' | 'failed' | 'running' | 'pending'
  duration: string
  error?: string
}

interface RecentExec {
  id: string
  status: 'success' | 'failed' | 'running'
  startedAt: string
  duration: string
  error?: string
  steps: ExecStep[]
}

interface WorkflowDetail {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error' | 'draft'
  trigger: 'webhook' | 'schedule' | 'manual' | 'event'
  triggerDetail: string
  createdAt: string
  lastRun: string
  executions: number
  successRate: number
  failureRate: number
  avgDuration: string
  retryPolicy: string
  tags: string[]
  sparklineData: number[]
  steps: StepDef[]
  recentExecutions: RecentExec[]
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const TRIGGER_ICON: Record<string, React.ReactNode> = {
  webhook:  <Webhook   className="w-3.5 h-3.5" />,
  schedule: <Calendar  className="w-3.5 h-3.5" />,
  manual:   <Zap       className="w-3.5 h-3.5" />,
  event:    <GitBranch className="w-3.5 h-3.5" />,
}

const STEP_TYPE_COLOR: Record<StepDef['type'], string> = {
  query:     'bg-blue-500/10 text-blue-400 border-blue-500/20',
  transform: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  write:     'bg-success/10 text-success border-success/20',
  notify:    'bg-warning/10 text-warning border-warning/20',
  condition: 'bg-text-muted/10 text-text-muted border-border',
}

function ExecStatusIcon({ status }: { status: RecentExec['status'] }) {
  switch (status) {
    case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
    case 'failed':  return <XCircle      className="w-3.5 h-3.5 text-error   flex-shrink-0" />
    case 'running': return <Loader2      className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
  }
}

function StepStatusIcon({ status }: { status: ExecStep['status'] }) {
  switch (status) {
    case 'success': return <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
    case 'failed':  return <XCircle      className="w-3 h-3 text-error   flex-shrink-0" />
    case 'running': return <Loader2      className="w-3 h-3 text-primary animate-spin flex-shrink-0" />
    case 'pending': return <Clock        className="w-3 h-3 text-text-muted/40 flex-shrink-0" />
  }
}

// ─── Tabs ────────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'executions' | 'settings'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',   label: 'Overview',   icon: <BarChart2 className="w-3.5 h-3.5" /> },
  { id: 'executions', label: 'Executions', icon: <List      className="w-3.5 h-3.5" /> },
  { id: 'settings',   label: 'Settings',   icon: <Settings  className="w-3.5 h-3.5" /> },
]

// ─── Overview tab ────────────────────────────────────────────────────────────

function OverviewTab({ workflow }: { workflow: WorkflowDetail }) {
  const [expandedExec, setExpandedExec] = useState<string | null>(null)

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      {/* Left: recent executions */}
      <div className="flex flex-col flex-1 min-w-0 border-r border-border overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex-shrink-0">
          <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Recent Executions</p>
        </div>
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b border-border">
                <th className="w-8 h-8 px-3" />
                <th className="text-left h-8 px-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">ID</th>
                <th className="text-left h-8 px-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">Status</th>
                <th className="text-left h-8 px-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">Started</th>
                <th className="text-left h-8 px-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">Duration</th>
                <th className="text-left h-8 px-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">Error</th>
              </tr>
            </thead>
            <tbody>
              {workflow.recentExecutions.map((exec) => {
                const isExpanded = expandedExec === exec.id
                const isFailed = exec.status === 'failed'
                return (
                  <>
                    <tr
                      key={exec.id}
                      onClick={() => setExpandedExec(isExpanded ? null : exec.id)}
                      className={cn(
                        'border-b border-border cursor-pointer transition-colors',
                        isFailed && 'border-l-[3px] border-l-error',
                        isExpanded ? 'bg-primary/5' : 'hover:bg-surface-light'
                      )}
                    >
                      <td className="px-3 py-2 w-8">
                        <ChevronDown className={cn('w-3.5 h-3.5 text-text-muted transition-transform', isExpanded && 'rotate-180')} />
                      </td>
                      <td className="px-3 py-2">
                        <span className="font-mono text-xs text-text-primary">#{exec.id}</span>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <ExecStatusIcon status={exec.status} />
                          <span className={cn(
                            'text-xs capitalize',
                            exec.status === 'success' && 'text-success',
                            exec.status === 'failed'  && 'text-error',
                            exec.status === 'running' && 'text-primary',
                          )}>
                            {exec.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-xs text-text-secondary whitespace-nowrap">{exec.startedAt}</td>
                      <td className="px-3 py-2 font-mono text-xs text-text-secondary">{exec.duration}</td>
                      <td className="px-3 py-2 max-w-[200px]">
                        {exec.error
                          ? <span className="text-[10px] font-mono text-error truncate block" title={exec.error}>{exec.error}</span>
                          : <span className="text-text-muted text-xs">—</span>
                        }
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${exec.id}-expanded`}>
                        <td colSpan={6} className="bg-surface/60 border-b border-border">
                          <div className="px-10 py-4">
                            <div className="flex items-start gap-0">
                              {exec.steps.map((step, i) => (
                                <div key={i} className="flex items-start flex-1 min-w-0">
                                  <div className="flex flex-col items-center flex-1 min-w-0">
                                    <div className="flex items-center w-full">
                                      <div className={cn(
                                        'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2',
                                        step.status === 'success' && 'border-success bg-success/10',
                                        step.status === 'failed'  && 'border-error   bg-error/10',
                                        step.status === 'running' && 'border-primary  bg-primary/10',
                                        step.status === 'pending' && 'border-border   bg-surface-light',
                                      )}>
                                        <StepStatusIcon status={step.status} />
                                      </div>
                                      {i < exec.steps.length - 1 && (
                                        <div className={cn(
                                          'h-0.5 flex-1 mx-1',
                                          step.status === 'success' ? 'bg-success' :
                                          step.status === 'failed'  ? 'bg-error'   :
                                          step.status === 'running' ? 'bg-primary'  : 'bg-border'
                                        )} />
                                      )}
                                    </div>
                                    <div className="mt-1.5 pr-2 w-full">
                                      <p className="text-xs text-text-primary leading-tight">{step.name}</p>
                                      <p className="text-[10px] font-mono text-text-muted mt-0.5">{step.duration}</p>
                                      {step.error && <p className="text-[10px] font-mono text-error mt-0.5">{step.error}</p>}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
          <div className="px-4 py-2 border-t border-border">
            <Link href={`/dashboard/executions?workflow=${workflow.id}`} className="text-xs text-primary hover:underline">
              View all executions →
            </Link>
          </div>
        </div>
      </div>

      {/* Right sidebar: steps + info */}
      <div className="w-72 flex-shrink-0 overflow-auto flex flex-col">
        {/* Steps definition */}
        <div className="border-b border-border">
          <div className="px-4 py-2.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Steps</p>
          </div>
          <div className="px-4 pb-4 space-y-2">
            {workflow.steps.map((step, i) => (
              <div key={step.id} className="flex gap-3">
                {/* Connector */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div className="w-5 h-5 rounded-full bg-surface-light border border-border flex items-center justify-center text-[10px] font-mono text-text-muted">
                    {i + 1}
                  </div>
                  {i < workflow.steps.length - 1 && (
                    <div className="w-px h-full min-h-[16px] bg-border mt-1" />
                  )}
                </div>
                {/* Content */}
                <div className="pb-3 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xs font-medium text-text-primary">{step.name}</span>
                    <span className={cn('text-[10px] px-1 py-0.5 rounded border font-mono', STEP_TYPE_COLOR[step.type])}>
                      {step.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-snug">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trigger info */}
        <div className="border-b border-border">
          <div className="px-4 py-2.5">
            <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Trigger</p>
          </div>
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-text-muted">{TRIGGER_ICON[workflow.trigger]}</span>
              <span className="text-xs font-medium text-text-primary capitalize">{workflow.trigger}</span>
            </div>
            <p className="text-[11px] font-mono text-text-muted">{workflow.triggerDetail}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="px-4 py-4 space-y-3">
          <div>
            <p className="text-[11px] text-text-muted uppercase font-mono tracking-wider mb-0.5">Retry Policy</p>
            <p className="text-xs text-text-secondary">{workflow.retryPolicy}</p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase font-mono tracking-wider mb-0.5">Created</p>
            <p className="text-xs text-text-secondary">{workflow.createdAt}</p>
          </div>
          <div>
            <p className="text-[11px] text-text-muted uppercase font-mono tracking-wider mb-1">Tags</p>
            <div className="flex flex-wrap gap-1">
              {workflow.tags.map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-surface-light text-text-muted rounded-md font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Executions tab ──────────────────────────────────────────────────────────

function ExecutionsTab({ workflow }: { workflow: WorkflowDetail }) {
  return (
    <div className="flex-1 overflow-auto p-6">
      <p className="text-xs text-text-muted">Full execution history — coming soon. <Link href="/dashboard/executions" className="text-primary hover:underline">View in Executions →</Link></p>
    </div>
  )
}

// ─── Settings tab ────────────────────────────────────────────────────────────

function SettingsTab({ workflow }: { workflow: WorkflowDetail }) {
  return (
    <div className="flex-1 overflow-auto p-6 max-w-xl space-y-6">
      <div className="space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">General</p>
        <div className="space-y-2">
          {[
            { label: 'Name',        value: workflow.name },
            { label: 'Description', value: workflow.description },
            { label: 'Workflow ID', value: workflow.id, mono: true },
          ].map((row) => (
            <div key={row.label} className="flex items-start gap-4">
              <span className="text-xs text-text-muted w-24 flex-shrink-0 pt-1">{row.label}</span>
              <span className={cn('text-xs text-text-primary', row.mono && 'font-mono')}>{row.value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-[11px] font-mono uppercase tracking-wider text-text-muted">Danger Zone</p>
        <div className="border border-error/30 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-text-primary mb-0.5">Delete this workflow</p>
              <p className="text-xs text-text-muted">This action cannot be undone. All execution history will be permanently deleted.</p>
            </div>
          </div>
          <button className="inline-flex items-center h-7 px-3 text-xs font-medium rounded-md border border-error/50 text-error hover:bg-error/10 transition-colors gap-1.5">
            <Trash2 className="w-3 h-3" />
            Delete workflow
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function WorkflowDetailPage() {
  const params = useParams()
  const workflowId = params.id as string
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const workflow = { ...(MOCK_WORKFLOWS.default), id: workflowId }

  const STATUS_BADGE: Record<string, string> = {
    active: 'bg-success/10 text-success',
    paused: 'bg-warning/10 text-warning',
    error:  'bg-error/10 text-error',
    draft:  'bg-surface-light text-text-muted',
  }

  return (
    <div className="flex flex-col overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border gap-3 flex-shrink-0">
        {/* Left: breadcrumb + name + status */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/dashboard/workflows"
            className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Workflows
          </Link>
          <span className="text-border text-xs flex-shrink-0">/</span>
          <StatusDot status={workflow.status as 'active' | 'paused' | 'error' | 'draft'} />
          <h1 className="text-sm font-semibold text-text-primary truncate">{workflow.name}</h1>
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize flex-shrink-0', STATUS_BADGE[workflow.status])}>
            {workflow.status}
          </span>
          <div className="flex items-center gap-1 text-text-muted text-xs flex-shrink-0">
            {TRIGGER_ICON[workflow.trigger]}
            <span className="capitalize">{workflow.trigger}</span>
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="flex items-center gap-1.5 h-7 px-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-light rounded-md transition-colors">
            <Copy className="w-3 h-3" />
            Duplicate
          </button>
          <button className="flex items-center gap-1.5 h-7 px-2.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-light rounded-md transition-colors">
            {workflow.status === 'active'
              ? <><Pause className="w-3 h-3" /> Pause</>
              : <><Play  className="w-3 h-3" /> Resume</>
            }
          </button>
          <button className="flex items-center gap-1.5 h-7 px-2.5 text-xs text-error hover:bg-error/10 rounded-md transition-colors">
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div className="flex items-stretch h-14 border-b border-border flex-shrink-0 divide-x divide-border">
        {[
          { label: 'Executions',    value: workflow.executions.toLocaleString(), sub: 'all time' },
          { label: 'Success Rate',  value: `${workflow.successRate}%`,           sub: 'last 7d', color: 'text-success' },
          { label: 'Failure Rate',  value: `${workflow.failureRate}%`,           sub: 'last 7d', color: workflow.failureRate > 5 ? 'text-error' : workflow.failureRate > 2 ? 'text-warning' : 'text-success' },
          { label: 'Avg Duration',  value: workflow.avgDuration,                 sub: 'p50' },
          { label: 'Last Run',      value: workflow.lastRun,                     sub: '' },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col justify-center px-5 min-w-0">
            <span className="text-[10px] text-text-muted uppercase font-mono tracking-wider">{stat.label}</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className={cn('text-sm font-semibold tabular-nums', stat.color ?? 'text-text-primary')}>
                {stat.value}
              </span>
              {stat.sub && <span className="text-[10px] text-text-muted">{stat.sub}</span>}
            </div>
          </div>
        ))}
        {/* Sparkline */}
        <div className="flex items-center px-5">
          <ExecutionSparkline data={workflow.sparklineData} width={80} height={24} />
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex items-center h-9 px-4 border-b border-border gap-1 flex-shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-1.5 h-7 px-3 text-xs rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        {activeTab === 'overview'   && <OverviewTab   workflow={workflow} />}
        {activeTab === 'executions' && <ExecutionsTab workflow={workflow} />}
        {activeTab === 'settings'   && <SettingsTab   workflow={workflow} />}
      </div>
    </div>
  )
}
