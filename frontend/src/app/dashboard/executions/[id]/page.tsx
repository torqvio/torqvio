'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, RotateCcw, XCircle, CheckCircle2, Loader2, Clock,
  AlertTriangle, ChevronDown, ChevronRight, Zap, Calendar, Webhook,
  Play, Terminal, Copy, Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Execution, ExecutionStep } from '@/types/execution'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8459'

// ── helpers ─────────────────────────────────────────────────────────────────

function statusIcon(status: string, className = 'w-4 h-4') {
  switch (status) {
    case 'success':  return <CheckCircle2 className={cn(className, 'text-green-400')} />
    case 'failed':   return <XCircle      className={cn(className, 'text-red-400')} />
    case 'running':  return <Loader2      className={cn(className, 'text-blue-400 animate-spin')} />
    case 'pending':  return <Clock        className={cn(className, 'text-gray-500')} />
    default:         return <Clock        className={cn(className, 'text-gray-500')} />
  }
}

function statusBadge(status: string) {
  const map: Record<string, string> = {
    success: 'bg-green-500/15 text-green-400 border-green-500/30',
    failed:  'bg-red-500/15  text-red-400  border-red-500/30',
    running: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    queued:  'bg-gray-500/15 text-gray-400 border-gray-500/30',
    pending: 'bg-gray-500/15 text-gray-400 border-gray-500/30',
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border', map[status] ?? map.pending)}>
      {status === 'running' && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
      {status}
    </span>
  )
}

function triggerIcon(trigger: string) {
  switch (trigger) {
    case 'webhook':  return <Webhook  className="w-3.5 h-3.5" />
    case 'schedule': return <Calendar className="w-3.5 h-3.5" />
    case 'event':    return <Zap      className="w-3.5 h-3.5" />
    default:         return <Play     className="w-3.5 h-3.5" />
  }
}

// ── step card ────────────────────────────────────────────────────────────────

function StepCard({ step, index }: { step: ExecutionStep; index: number }) {
  const [open, setOpen] = useState(step.status === 'failed')
  const [copied, setCopied] = useState(false)

  const copyError = () => {
    if (!step.error) return
    navigator.clipboard.writeText(step.error)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={cn(
      'rounded-xl border transition-colors',
      step.status === 'failed'  ? 'border-red-500/30  bg-red-500/5'  :
      step.status === 'success' ? 'border-green-500/20 bg-transparent' :
      step.status === 'running' ? 'border-blue-500/30 bg-blue-500/5' :
      'border-[#1c2333] bg-transparent'
    )}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        {/* step number + connector */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <div className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
            step.status === 'failed'  ? 'bg-red-500/20  text-red-400'  :
            step.status === 'success' ? 'bg-green-500/20 text-green-400' :
            step.status === 'running' ? 'bg-blue-500/20  text-blue-400' :
            'bg-[#1c2333] text-gray-500'
          )}>
            {index + 1}
          </div>
        </div>

        {statusIcon(step.status)}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{step.name}</p>
          {step.status === 'failed' && step.error && (
            <p className="text-xs text-red-400 truncate mt-0.5">{step.error}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs text-gray-500 font-mono">{step.duration}</span>
          {open ? <ChevronDown className="w-3.5 h-3.5 text-gray-600" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-600" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-[#1c2333] pt-3 space-y-3">
          {step.error ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-red-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Error
                </span>
                <button
                  onClick={copyError}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-red-300 bg-red-500/10 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {step.error}
              </pre>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Terminal className="w-3.5 h-3.5" />
              <span>No output data available</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── main page ────────────────────────────────────────────────────────────────

export default function ExecutionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [execution, setExecution] = useState<Execution | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<'retrying' | 'cancelling' | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API}/api/v1/executions/${id}`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = await res.json()
      // handle both { data: execution } and flat execution shapes
      setExecution(json.data ?? json)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load execution')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  // Auto-refresh while running
  useEffect(() => {
    if (execution?.status !== 'running') return
    const t = setInterval(load, 3000)
    return () => clearInterval(t)
  }, [execution?.status])

  const handleRetry = async () => {
    setActing('retrying')
    try {
      await fetch(`${API}/api/v1/executions/${id}/retry`, { method: 'POST' })
      await load()
    } finally {
      setActing(null)
    }
  }

  const handleCancel = async () => {
    setActing('cancelling')
    try {
      await fetch(`${API}/api/v1/executions/${id}/cancel`, { method: 'POST' })
      await load()
    } finally {
      setActing(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
      </div>
    )
  }

  if (error || !execution) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-3" />
        <p className="text-white font-medium mb-1">Could not load execution</p>
        <p className="text-gray-500 text-sm mb-6">{error ?? 'Execution not found'}</p>
        <Link href="/dashboard/executions" className="text-sm text-primary hover:underline">
          ← Back to executions
        </Link>
      </div>
    )
  }

  const failed = execution.status === 'failed'
  const running = execution.status === 'running'

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/dashboard/executions" className="hover:text-gray-300 transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Executions
        </Link>
        <span>/</span>
        <span className="text-gray-400 font-mono text-xs">{execution.id}</span>
      </div>

      {/* header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            {statusBadge(execution.status)}
            <span className="flex items-center gap-1.5 text-xs text-gray-500">
              {triggerIcon(execution.trigger)}
              {execution.trigger}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">{execution.workflowName}</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">{execution.id}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {running && (
            <button
              onClick={handleCancel}
              disabled={!!acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              {acting === 'cancelling' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
              Cancel
            </button>
          )}
          {failed && (
            <button
              onClick={handleRetry}
              disabled={!!acting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3147] text-gray-300 text-sm hover:border-gray-500 hover:text-white transition-colors disabled:opacity-50"
            >
              {acting === 'retrying' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
              Retry
            </button>
          )}
          <Link
            href={`/dashboard/workflows/${execution.workflowId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3147] text-gray-400 text-sm hover:text-white hover:border-gray-500 transition-colors"
          >
            View workflow
          </Link>
        </div>
      </div>

      {/* stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Started', value: execution.startedAt },
          { label: 'Duration', value: execution.duration },
          { label: 'Steps', value: `${execution.completedSteps} / ${execution.totalSteps}` },
          { label: 'Progress', value: `${Math.round((execution.completedSteps / execution.totalSteps) * 100)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[#1c2333] bg-[#0d1117] px-4 py-3">
            <p className="text-xs text-gray-600 mb-1">{label}</p>
            <p className="text-sm font-medium text-white font-mono">{value}</p>
          </div>
        ))}
      </div>

      {/* top-level error banner */}
      {execution.error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400 mb-1">Execution failed</p>
            <p className="text-xs text-red-300 font-mono">{execution.error}</p>
          </div>
        </div>
      )}

      {/* step timeline */}
      <div>
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Step Timeline
        </h2>
        {execution.steps && execution.steps.length > 0 ? (
          <div className="space-y-2">
            {execution.steps.map((step, i) => (
              <StepCard key={step.id} step={step} index={i} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#1c2333] bg-[#0d1117] px-4 py-10 text-center text-gray-600 text-sm">
            No step data available for this execution
          </div>
        )}
      </div>
    </div>
  )
}
