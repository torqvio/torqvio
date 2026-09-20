'use client'

import { useState } from 'react'
import { Copy, Check, ChevronDown } from 'lucide-react'

interface ProjectHeaderProps {
  projectName: string
  planTier: 'free' | 'pro' | 'enterprise'
  apiEndpoint: string
  engineStatus: 'operational' | 'degraded' | 'down'
  lastDeployment: string
  lastSuccessfulExecution: string
  activeWorkflows: number
}

const statusConfig = {
  operational: { label: 'Operational', color: 'text-success', dot: 'bg-success', pulse: true },
  degraded:    { label: 'Degraded',    color: 'text-warning', dot: 'bg-warning', pulse: true },
  down:        { label: 'Down',        color: 'text-error',   dot: 'bg-error',   pulse: false },
}

const planConfig = {
  free:       'text-text-muted border-border',
  pro:        'text-primary border-primary/30',
  enterprise: 'text-success border-success/30',
}

export function ProjectHeader({
  projectName,
  planTier,
  apiEndpoint,
  engineStatus,
  lastDeployment,
  lastSuccessfulExecution,
  activeWorkflows,
}: ProjectHeaderProps) {
  const [copied, setCopied] = useState(false)
  const [endpointOpen, setEndpointOpen] = useState(false)

  const status = statusConfig[engineStatus]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiEndpoint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-2 pb-5 border-b border-border/50">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">{projectName}</h1>
          <span className={`text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded border ${planConfig[planTier]}`}>
            {planTier}
          </span>
          {/* Inline engine status */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              {status.pulse && (
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-50 ${status.dot}`} />
              )}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${status.dot}`} />
            </span>
            <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
          </div>
        </div>

        {/* API endpoint toggle */}
        <button
          onClick={() => setEndpointOpen(v => !v)}
          className="flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <span className="font-mono">API endpoint</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-150 ${endpointOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Inline stat row — no box, just text */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <span>{activeWorkflows} {activeWorkflows === 1 ? 'workflow' : 'workflows'}</span>
        <span className="opacity-30">·</span>
        <span>{lastSuccessfulExecution}</span>
        <span className="opacity-30">·</span>
        <span>Deployed {lastDeployment}</span>
      </div>

      {/* Collapsible endpoint */}
      {endpointOpen && (
        <div className="flex items-center gap-2 pt-1">
          <code className="text-xs font-mono text-text-secondary bg-surface px-2.5 py-1.5 rounded border border-border/60">
            {apiEndpoint}
          </code>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-surface-light transition-colors text-text-muted hover:text-text-primary"
            aria-label="Copy endpoint"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  )
}
