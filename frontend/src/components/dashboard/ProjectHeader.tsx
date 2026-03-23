'use client'

import { useState } from 'react'
import { Copy, Check, Activity, Clock, CheckCircle, GitBranch, ChevronDown } from 'lucide-react'

interface ProjectHeaderProps {
  projectName: string
  planTier: 'free' | 'pro' | 'enterprise'
  apiEndpoint: string
  engineStatus: 'operational' | 'degraded' | 'down'
  lastDeployment: string
  lastSuccessfulExecution: string
  activeWorkflows: number
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

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiEndpoint)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const statusConfig = {
    operational: { dot: 'bg-success', label: 'Operational', text: 'text-success' },
    degraded: { dot: 'bg-warning', label: 'Degraded', text: 'text-warning' },
    down: { dot: 'bg-error', label: 'Down', text: 'text-error' },
  }

  const status = statusConfig[engineStatus]

  const stats = [
    { icon: Activity, label: 'Engine', value: status.label, valueClass: status.text, dot: status.dot },
    { icon: GitBranch, label: 'Active workflows', value: `${activeWorkflows}` },
    { icon: CheckCircle, label: 'Last execution', value: lastSuccessfulExecution },
    { icon: Clock, label: 'Last deployed', value: lastDeployment },
  ]

  return (
    <div className="space-y-3">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-text-primary">{projectName}</h1>
          <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${
            planTier === 'pro' ? 'bg-primary/15 text-primary' :
            planTier === 'enterprise' ? 'bg-success/15 text-success' :
            'bg-surface-light text-text-muted'
          }`}>
            {planTier}
          </span>
        </div>
        {/* Endpoint — collapsed by default */}
        <button
          onClick={() => setEndpointOpen(v => !v)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <span className="font-mono">API endpoint</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${endpointOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Endpoint row (toggleable) */}
      {endpointOpen && (
        <div className="flex items-center gap-2">
          <code className="text-xs text-text-secondary font-mono bg-background px-2.5 py-1.5 rounded border border-border">
            {apiEndpoint}
          </code>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded hover:bg-surface-light transition-colors text-text-muted hover:text-text-primary"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* Stat strip — single bordered container, dividers between items */}
      <div className="flex rounded-lg border border-border bg-surface divide-x divide-border overflow-hidden">
        {stats.map(({ icon: Icon, label, value, valueClass, dot }) => (
          <div key={label} className="flex-1 flex items-center gap-3 px-4 py-3 hover:bg-surface-light transition-colors">
            <Icon className="w-4 h-4 text-text-muted flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] text-text-muted uppercase tracking-wider font-medium">{label}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
                <p className={`text-sm font-semibold truncate ${valueClass ?? 'text-text-primary'}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
