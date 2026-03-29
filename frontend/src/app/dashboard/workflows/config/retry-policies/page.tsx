'use client'

import { useState } from 'react'
import { Edit2, Trash2, Plus, Save, X, Brain, TrendingUp, AlertTriangle, Zap, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type BackoffStrategy = 'Exponential' | 'Linear' | 'Fixed'
type DelayUnit = 'ms' | 's' | 'min'

interface RetryPolicy {
  id: string
  name: string
  maxRetries: number
  backoff: BackoffStrategy
  baseDelay: number
  baseDelayUnit: DelayUnit
  maxDelay: number | null
  maxDelayUnit: DelayUnit
  usedBy: number
  isDefault: boolean
  healthScore?: number
  predictiveTiming?: boolean
  providerInsights?: ProviderInsight[]
}

interface ProviderInsight {
  provider: string
  failureRate: number
  avgResponseTime: number
  recommendedDelay: number
  recommendedRetries: number
  confidence: number
}

interface FailureIntelligence {
  id: string
  type: 'pattern' | 'provider' | 'timing'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  recommendation: string
  impact: string
  confidence: number
  policyId?: string
  policyName?: string
  autoFixAvailable: boolean
}

interface PolicyFormState {
  name: string
  maxRetries: number
  backoff: BackoffStrategy
  baseDelay: number
  baseDelayUnit: DelayUnit
  maxDelay: number | null
  maxDelayUnit: DelayUnit
}

const PROVIDER_INSIGHTS: ProviderInsight[] = [
  {
    provider: 'Stripe API',
    failureRate: 2.3,
    avgResponseTime: 450,
    recommendedDelay: 2000,
    recommendedRetries: 3,
    confidence: 94
  },
  {
    provider: 'SendGrid',
    failureRate: 1.8,
    avgResponseTime: 320,
    recommendedDelay: 1500,
    recommendedRetries: 2,
    confidence: 89
  },
  {
    provider: 'Slack API',
    failureRate: 0.9,
    avgResponseTime: 180,
    recommendedDelay: 800,
    recommendedRetries: 2,
    confidence: 91
  }
]

const FAILURE_INTELLIGENCE: FailureIntelligence[] = [
  {
    id: 'intel_001',
    type: 'provider',
    severity: 'high',
    title: 'Stripe API Rate Limiting Pattern',
    description: 'Stripe API shows 45% failure rate during peak hours with 429 errors.',
    recommendation: 'Implement exponential backoff with 2s base delay and circuit breaker',
    impact: 'Reduce failures by 67%',
    confidence: 92,
    policyId: '1',
    policyName: 'Default',
    autoFixAvailable: true
  },
  {
    id: 'intel_002',
    type: 'timing',
    severity: 'medium',
    title: 'Suboptimal Retry Timing Detected',
    description: 'Current retry policy too aggressive for email provider during peak loads.',
    recommendation: 'Increase base delay to 1.5s and reduce max retries to 2',
    impact: 'Improve delivery success by 34%',
    confidence: 87,
    policyId: '2',
    policyName: 'Aggressive',
    autoFixAvailable: true
  },
  {
    id: 'intel_003',
    type: 'pattern',
    severity: 'low',
    title: 'Weekend Failure Pattern',
    description: 'Lower failure rates on weekends suggest current policy is over-aggressive.',
    recommendation: 'Consider time-based retry adjustment',
    impact: 'Save 23% on unnecessary retries',
    confidence: 78,
    autoFixAvailable: false
  }
]

const INITIAL_POLICIES: RetryPolicy[] = [
  {
    id: '1',
    name: 'Default',
    maxRetries: 3,
    backoff: 'Exponential',
    baseDelay: 1,
    baseDelayUnit: 's',
    maxDelay: 30,
    maxDelayUnit: 's',
    usedBy: 4,
    isDefault: true,
    healthScore: 78,
    predictiveTiming: false,
    providerInsights: PROVIDER_INSIGHTS.slice(0, 2)
  },
  {
    id: '2',
    name: 'Aggressive',
    maxRetries: 5,
    backoff: 'Linear',
    baseDelay: 500,
    baseDelayUnit: 'ms',
    maxDelay: 5,
    maxDelayUnit: 's',
    usedBy: 2,
    isDefault: false,
    healthScore: 62,
    predictiveTiming: false,
    providerInsights: [PROVIDER_INSIGHTS[1]]
  },
  {
    id: '3',
    name: 'Smart Retry',
    maxRetries: 4,
    backoff: 'Exponential',
    baseDelay: 2,
    baseDelayUnit: 's',
    maxDelay: 60,
    maxDelayUnit: 's',
    usedBy: 1,
    isDefault: false,
    healthScore: 94,
    predictiveTiming: true,
    providerInsights: PROVIDER_INSIGHTS
  },
]

function emptyForm(): PolicyFormState {
  return {
    name: '',
    maxRetries: 3,
    backoff: 'Exponential',
    baseDelay: 1,
    baseDelayUnit: 's',
    maxDelay: 30,
    maxDelayUnit: 's',
  }
}

function policyToForm(p: RetryPolicy): PolicyFormState {
  return {
    name: p.name,
    maxRetries: p.maxRetries,
    backoff: p.backoff,
    baseDelay: p.baseDelay,
    baseDelayUnit: p.baseDelayUnit,
    maxDelay: p.maxDelay,
    maxDelayUnit: p.maxDelayUnit,
  }
}

function formatDelay(value: number | null, unit: DelayUnit): string {
  if (value === null || value === 0) return '—'
  return `${value}${unit}`
}

function DelayInput({
  label,
  value,
  unit,
  onValueChange,
  onUnitChange,
}: {
  label: string
  value: number | null
  unit: DelayUnit
  onValueChange: (v: number | null) => void
  onUnitChange: (u: DelayUnit) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] uppercase tracking-wider text-text-muted font-mono">{label}</label>
      <div className="flex gap-1">
        <input
          type="number"
          min={0}
          value={value ?? ''}
          onChange={(e) => onValueChange(e.target.value === '' ? null : Number(e.target.value))}
          className="w-20 h-8 px-2 text-xs bg-surface border border-border rounded text-text-primary focus:outline-none focus:border-primary"
          placeholder="0"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value as DelayUnit)}
          className="h-8 px-2 text-xs bg-surface border border-border rounded text-text-secondary focus:outline-none focus:border-primary"
        >
          <option value="ms">ms</option>
          <option value="s">s</option>
          <option value="min">min</option>
        </select>
      </div>
    </div>
  )
}

function PolicyForm({
  form,
  onChange,
  onSave,
  onCancel,
}: {
  form: PolicyFormState
  onChange: (f: PolicyFormState) => void
  onSave: () => void
  onCancel: () => void
}) {
  const set = <K extends keyof PolicyFormState>(key: K, val: PolicyFormState[K]) =>
    onChange({ ...form, [key]: val })

  return (
    <div className="mt-3 pt-3 border-t border-border flex flex-col gap-3">
      {/* Name */}
      <div className="flex flex-col gap-1">
        <label className="text-[11px] uppercase tracking-wider text-text-muted font-mono">Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          className="h-8 px-2 text-xs bg-surface border border-border rounded text-text-primary focus:outline-none focus:border-primary w-full"
          placeholder="Policy name"
        />
      </div>

      {/* Max retries + Backoff */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wider text-text-muted font-mono">Max Retries</label>
          <input
            type="number"
            min={0}
            max={10}
            value={form.maxRetries}
            onChange={(e) => set('maxRetries', Math.min(10, Math.max(0, Number(e.target.value))))}
            className="w-20 h-8 px-2 text-xs bg-surface border border-border rounded text-text-primary focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] uppercase tracking-wider text-text-muted font-mono">Backoff Strategy</label>
          <select
            value={form.backoff}
            onChange={(e) => set('backoff', e.target.value as BackoffStrategy)}
            className="h-8 px-2 text-xs bg-surface border border-border rounded text-text-secondary focus:outline-none focus:border-primary"
          >
            <option value="Exponential">Exponential</option>
            <option value="Linear">Linear</option>
            <option value="Fixed">Fixed</option>
          </select>
        </div>

        <DelayInput
          label="Base Delay"
          value={form.baseDelay}
          unit={form.baseDelayUnit}
          onValueChange={(v) => set('baseDelay', v ?? 0)}
          onUnitChange={(u) => set('baseDelayUnit', u)}
        />

        <DelayInput
          label="Max Delay"
          value={form.maxDelay}
          unit={form.maxDelayUnit}
          onValueChange={(v) => set('maxDelay', v)}
          onUnitChange={(u) => set('maxDelayUnit', u)}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="primary"
          onClick={onSave}
          className="h-7 text-xs px-3 gap-1"
        >
          <Save className="w-3 h-3" />
          Save
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="h-7 text-xs px-3 gap-1"
        >
          <X className="w-3 h-3" />
          Cancel
        </Button>
      </div>
    </div>
  )
}

function PolicyCard({
  policy,
  isEditing,
  editForm,
  onEdit,
  onDelete,
  onFormChange,
  onSave,
  onCancel,
}: {
  policy: RetryPolicy
  isEditing: boolean
  editForm: PolicyFormState | null
  onEdit: () => void
  onDelete: () => void
  onFormChange: (f: PolicyFormState) => void
  onSave: () => void
  onCancel: () => void
}) {
  const backoffColors: Record<BackoffStrategy, string> = {
    Exponential: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Linear: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Fixed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
  }

  return (
    <div
      className={cn(
        'bg-surface border rounded-lg p-4 flex flex-col gap-2 transition-colors',
        isEditing ? 'border-primary/50' : 'border-border hover:border-border/80'
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-semibold text-text-primary truncate">{policy.name}</span>
          {policy.isDefault && (
            <span className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider flex-shrink-0">
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            disabled={policy.isDefault}
            className={cn(
              'h-6 w-6 flex items-center justify-center rounded transition-colors',
              policy.isDefault
                ? 'text-text-muted opacity-30 cursor-not-allowed'
                : 'text-text-muted hover:text-red-400 hover:bg-red-400/10'
            )}
            title={policy.isDefault ? 'Cannot delete default policy' : 'Delete'}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono block">Max Retries</span>
          <span className="text-sm text-text-primary font-medium">{policy.maxRetries}</span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono block">Backoff</span>
          <span
            className={cn(
              'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium',
              backoffColors[policy.backoff]
            )}
          >
            {policy.backoff}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono block">Base Delay</span>
          <span className="text-sm text-text-primary font-medium">
            {formatDelay(policy.baseDelay, policy.baseDelayUnit)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono block">Max Delay</span>
          <span className="text-sm text-text-primary font-medium">
            {formatDelay(policy.maxDelay, policy.maxDelayUnit)}
          </span>
        </div>
      </div>

      {/* Health Score & Intelligence */}
      {policy.healthScore && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted font-mono">Health Score</span>
            <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${getHealthColor(policy.healthScore)}`}
                style={{ width: `${policy.healthScore}%` }}
              />
            </div>
            <span className="text-xs text-gray-400 font-mono">{policy.healthScore}%</span>
          </div>
          
          {policy.predictiveTiming && (
            <div className="flex items-center gap-1">
              <Brain className="w-3 h-3 text-purple-400" />
              <span className="text-xs text-purple-400">Predictive timing enabled</span>
            </div>
          )}
          
          {policy.providerInsights && policy.providerInsights.length > 0 && (
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" />
              <span className="text-xs text-blue-400">{policy.providerInsights.length} provider insights</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <p className="text-xs text-text-muted mt-1">Used by {policy.usedBy} workflow{policy.usedBy !== 1 ? 's' : ''}</p>

      {/* Inline edit form */}
      {isEditing && editForm && (
        <PolicyForm
          form={editForm}
          onChange={onFormChange}
          onSave={onSave}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}

export default function RetryPoliciesPage() {
  const [policies, setPolicies] = useState<RetryPolicy[]>(INITIAL_POLICIES)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<PolicyFormState | null>(null)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState<PolicyFormState>(emptyForm())
  const [showIntelligence, setShowIntelligence] = useState(true)
  const [intelligence] = useState<FailureIntelligence[]>(FAILURE_INTELLIGENCE)

  const handleEdit = (policy: RetryPolicy) => {
    setCreating(false)
    setEditingId(policy.id)
    setEditForm(policyToForm(policy))
  }

  const handleSaveEdit = () => {
    if (!editForm || !editingId) return
    setPolicies((prev) =>
      prev.map((p) =>
        p.id === editingId
          ? {
              ...p,
              name: editForm.name,
              maxRetries: editForm.maxRetries,
              backoff: editForm.backoff,
              baseDelay: editForm.baseDelay,
              baseDelayUnit: editForm.baseDelayUnit,
              maxDelay: editForm.maxDelay,
              maxDelayUnit: editForm.maxDelayUnit,
            }
          : p
      )
    )
    setEditingId(null)
    setEditForm(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this retry policy?')) {
      setPolicies((prev) => prev.filter((p) => p.id !== id))
    }
  }

  const handleStartCreating = () => {
    setEditingId(null)
    setEditForm(null)
    setCreateForm(emptyForm())
    setCreating(true)
  }

  const handleSaveCreate = () => {
    const newPolicy: RetryPolicy = {
      id: String(Date.now()),
      name: createForm.name || 'Untitled Policy',
      maxRetries: createForm.maxRetries,
      backoff: createForm.backoff,
      baseDelay: createForm.baseDelay,
      baseDelayUnit: createForm.baseDelayUnit,
      maxDelay: createForm.maxDelay,
      maxDelayUnit: createForm.maxDelayUnit,
      usedBy: 0,
      isDefault: false,
    }
    setPolicies((prev) => [...prev, newPolicy])
    setCreating(false)
    setCreateForm(emptyForm())
  }

  const handleCancelCreate = () => {
    setCreating(false)
    setCreateForm(emptyForm())
  }

  const handleApplyIntelligence = (intelligenceId: string) => {
    const intel = intelligence.find(i => i.id === intelligenceId)
    if (!intel || !intel.policyId) return
    
    console.log('Applying intelligence:', intel.title)
    // In real app, this would modify the policy with recommended settings
  }

  const handleDismissIntelligence = (intelligenceId: string) => {
    console.log('Dismissing intelligence:', intelligenceId)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="flex flex-col overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Toolbar */}
      <div className="h-12 px-4 border-b border-border flex items-center justify-between flex-shrink-0 bg-background">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-text-primary">Failure Intelligence</span>
          
          {/* Intelligence Toggle */}
          <button
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={`flex items-center gap-1.5 h-7 px-2 text-xs rounded-md transition-colors ${
              showIntelligence 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Intelligence</span>
            {intelligence.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>
        </div>
        
        <button
          onClick={handleStartCreating}
          className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded bg-primary text-white hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-3 h-3" />
          New Policy
        </button>
      </div>

      {/* Scrollable content */}
      <div className="overflow-auto flex-1 p-6">
        {/* Failure Intelligence Panel */}
        {showIntelligence && intelligence.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-300">Failure Intelligence Insights</span>
                <span className="text-xs text-gray-400">{intelligence.length} recommendation{intelligence.length > 1 ? 's' : ''} available</span>
              </div>
            </div>
            
            <div className="space-y-3">
              {intelligence.slice(0, 2).map((intel) => (
                <div key={intel.id} className="flex items-start gap-3 p-3 rounded bg-[#1A1F2E]/50 border border-gray-700/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className={`w-4 h-4 ${
                        intel.severity === 'high' ? 'text-red-400' :
                        intel.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                      }`} />
                      <span className="text-sm font-medium text-white">{intel.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(intel.severity)}`}>
                        {intel.severity}
                      </span>
                      <span className="text-xs text-gray-400">{intel.confidence}% confidence</span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-2">{intel.description}</p>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">{intel.impact}</span>
                      </div>
                      {intel.autoFixAvailable && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400">Auto-fix available</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-400 mb-1">Recommended action:</p>
                        <p className="text-xs text-gray-300">{intel.recommendation}</p>
                        {intel.policyName && (
                          <p className="text-xs text-gray-500 mt-1">Policy: <span className="text-white">{intel.policyName}</span></p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDismissIntelligence(intel.id)}
                          className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleApplyIntelligence(intel.id)}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                        >
                          {intel.autoFixAvailable && <Zap className="w-3 h-3" />}
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New policy creation card */}
        {creating && (
          <div className="bg-surface border border-primary/50 rounded-lg p-4 mb-4">
            <p className="text-sm font-semibold text-text-primary mb-2">New Policy</p>
            <PolicyForm
              form={createForm}
              onChange={setCreateForm}
              onSave={handleSaveCreate}
              onCancel={handleCancelCreate}
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              isEditing={editingId === policy.id}
              editForm={editingId === policy.id ? editForm : null}
              onEdit={() => handleEdit(policy)}
              onDelete={() => handleDelete(policy.id)}
              onFormChange={setEditForm}
              onSave={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
