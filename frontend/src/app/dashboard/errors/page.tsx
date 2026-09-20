'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, ChevronDown, ChevronRight, Loader2, RefreshCw, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Execution } from '@/types/execution'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8459'

// ── types ────────────────────────────────────────────────────────────────────

interface ErrorGroup {
  signature: string      // first line of error message used as group key
  count: number
  workflows: string[]    // unique workflow names
  executions: Execution[]
  lastSeen: string
}

// ── helpers ──────────────────────────────────────────────────────────────────

function errorSignature(error: string): string {
  // Use the first non-empty line as the group key (strip stack traces)
  return error.split('\n').find(l => l.trim().length > 0)?.trim().slice(0, 120) ?? error.slice(0, 120)
}

function relativeTime(ts: string) {
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

// ── error group card ─────────────────────────────────────────────────────────

function ErrorGroupCard({ group, onRetryAll }: { group: ErrorGroup; onRetryAll: (ids: string[]) => void }) {
  const [open, setOpen] = useState(false)
  const [retrying, setRetrying] = useState(false)

  const handleRetryAll = async () => {
    setRetrying(true)
    try {
      await onRetryAll(group.executions.map(e => e.id))
    } finally {
      setRetrying(false)
    }
  }

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/5 overflow-hidden">
      {/* group header */}
      <div className="flex items-start gap-3 px-4 py-4">
        <button
          onClick={() => setOpen(!open)}
          className="mt-0.5 flex-shrink-0 text-gray-500 hover:text-gray-300 transition-colors"
        >
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
              <XCircle className="w-3 h-3" />
              {group.count} {group.count === 1 ? 'failure' : 'failures'}
            </span>
            <span className="text-xs text-gray-500">
              {[...new Set(group.workflows)].join(', ')}
            </span>
            <span className="text-xs text-gray-600 ml-auto">Last seen {relativeTime(group.lastSeen)}</span>
          </div>
          <p className="text-sm font-mono text-red-300 break-all leading-relaxed">
            {group.signature}
          </p>
        </div>

        <button
          onClick={handleRetryAll}
          disabled={retrying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3147] text-gray-400 text-xs hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {retrying
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RotateCcw className="w-3.5 h-3.5" />}
          Retry all
        </button>
      </div>

      {/* individual executions */}
      {open && (
        <div className="border-t border-red-500/15">
          {group.executions.map(exec => (
            <Link
              key={exec.id}
              href={`/dashboard/executions/${exec.id}`}
              className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors border-b border-red-500/10 last:border-0"
            >
              <XCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-300 font-medium">{exec.workflowName}</span>
                <span className="text-xs text-gray-600 font-mono ml-2">{exec.id}</span>
              </div>
              <div className="text-xs text-gray-500 flex items-center gap-3 flex-shrink-0">
                <span>{exec.startedAt}</span>
                <span>{exec.duration}</span>
                <ChevronRight className="w-3 h-3 text-gray-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

// ── main page ────────────────────────────────────────────────────────────────

export default function ErrorsPage() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [retryingIds, setRetryingIds] = useState<Set<string>>(new Set())

  const load = async () => {
    try {
      setLoading(true)
      setFetchError(null)
      const res = await fetch(`${API}/api/v1/executions?limit=100`)
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      const json = await res.json()
      const all: Execution[] = json.executions ?? json.data?.executions ?? []
      setExecutions(all.filter(e => e.status === 'failed'))
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : 'Failed to load executions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const groups = useMemo<ErrorGroup[]>(() => {
    const map = new Map<string, ErrorGroup>()

    for (const exec of executions) {
      const raw = exec.error ?? 'Unknown error'
      const sig = errorSignature(raw)

      if (!map.has(sig)) {
        map.set(sig, {
          signature: sig,
          count: 0,
          workflows: [],
          executions: [],
          lastSeen: exec.startedAt,
        })
      }
      const g = map.get(sig)!
      g.count++
      if (!g.workflows.includes(exec.workflowName)) g.workflows.push(exec.workflowName)
      g.executions.push(exec)
      // keep the most recent as lastSeen
      if (new Date(exec.startedAt) > new Date(g.lastSeen)) g.lastSeen = exec.startedAt
    }

    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [executions])

  const handleRetryAll = async (ids: string[]) => {
    setRetryingIds(prev => new Set([...prev, ...ids]))
    await Promise.allSettled(
      ids.map(id => fetch(`${API}/api/v1/executions/${id}/retry`, { method: 'POST' }))
    )
    setRetryingIds(new Set())
    await load()
  }

  const handleRetryEverything = async () => {
    const ids = executions.map(e => e.id)
    await handleRetryAll(ids)
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Errors
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {loading ? 'Loading…' : `${executions.length} failed execution${executions.length !== 1 ? 's' : ''} grouped by error type`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {executions.length > 0 && (
            <button
              onClick={handleRetryEverything}
              disabled={retryingIds.size > 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a3147] text-gray-400 text-sm hover:text-white hover:border-gray-500 transition-colors disabled:opacity-50"
            >
              {retryingIds.size > 0
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <RotateCcw className="w-3.5 h-3.5" />}
              Retry all failed
            </button>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-lg border border-[#2a3147] text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* content */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
        </div>
      ) : fetchError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-6 text-center">
          <p className="text-red-400 text-sm mb-3">{fetchError}</p>
          <button onClick={load} className="text-xs text-gray-400 hover:text-white underline">Retry</button>
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-[#1c2333] bg-[#0d1117] px-4 py-16 text-center">
          <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-white font-medium mb-1">No errors</p>
          <p className="text-gray-500 text-sm">All recent executions completed successfully.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {groups.map(group => (
            <ErrorGroupCard
              key={group.signature}
              group={group}
              onRetryAll={handleRetryAll}
            />
          ))}
        </div>
      )}

      <div className="text-xs text-gray-600 text-center pt-2">
        Showing failures from last 100 executions ·{' '}
        <Link href="/dashboard/executions?status=failed" className="text-gray-500 hover:text-gray-300 underline">
          View all failed executions
        </Link>
      </div>
    </div>
  )
}
