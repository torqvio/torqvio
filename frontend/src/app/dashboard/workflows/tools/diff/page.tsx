'use client'

import { useState, useEffect } from 'react'
import { ArrowLeftRight, ChevronDown, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/api'
import type { Workflow } from '@/types/api'

interface WorkflowVersion {
  id: string
  label: string
  timestamp?: string
  version?: number
  name?: string
  createdAt?: string
  definition?: Record<string, unknown>
}


type DiffType = 'added' | 'removed' | 'changed' | 'unchanged'

interface DiffLine {
  lineA: number | null
  lineB: number | null
  type: DiffType
  content: string
}

function getBgClass(type: DiffType, side: 'left' | 'right') {
  if (type === 'added' && side === 'right') return 'bg-success/10'
  if (type === 'removed' && side === 'left') return 'bg-error/10'
  if (type === 'changed') return 'bg-warning/10'
  return ''
}

function getSignClass(type: DiffType, side: 'left' | 'right') {
  if (type === 'added' && side === 'right') return 'text-success'
  if (type === 'removed' && side === 'left') return 'text-error'
  if (type === 'changed') return 'text-warning'
  return 'text-text-muted'
}

function getSign(type: DiffType, side: 'left' | 'right') {
  if (type === 'added' && side === 'right') return '+'
  if (type === 'removed' && side === 'left') return '-'
  if (type === 'changed') return '~'
  return ' '
}

function DiffPane({ lines, side }: { lines: DiffLine[]; side: 'left' | 'right' }) {
  return (
    <div className="flex-1 min-w-0 overflow-auto">
      <div className="min-w-0">
        {lines.map((line, idx) => {
          const lineNum = side === 'left' ? line.lineA : line.lineB
          const bg = getBgClass(line.type, side)
          const signClass = getSignClass(line.type, side)
          const sign = getSign(line.type, side)
          const isGhost = (side === 'left' && line.lineA === null) || (side === 'right' && line.lineB === null)

          return (
            <div
              key={idx}
              className={cn(
                'flex items-start gap-2 font-mono text-xs px-3 py-0.5',
                bg,
                isGhost && 'opacity-0 pointer-events-none select-none'
              )}
            >
              <span className="w-8 text-right text-text-muted select-none shrink-0">
                {lineNum ?? ''}
              </span>
              <span className={cn('w-3 shrink-0 select-none', signClass)}>{sign}</span>
              <span className="text-text-secondary whitespace-pre">{line.content}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface DropdownProps {
  value: string
  options: { id: string; label: string; timestamp?: string }[]
  onChange: (id: string) => void
  label?: string
}

function Dropdown({ value, options, onChange, label }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const selected = options.find((o) => o.id === value)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 h-[30px] px-2.5 rounded border border-border bg-surface text-xs text-text-primary hover:bg-surface-light transition-colors min-w-[120px]"
      >
        <span className="flex-1 text-left truncate">
          {label && <span className="text-text-muted mr-1">{label}:</span>}
          {selected?.label}
          {selected?.timestamp && (
            <span className="text-text-muted ml-1">· {selected.timestamp}</span>
          )}
        </span>
        <ChevronDown className="w-3 h-3 text-text-muted flex-shrink-0" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-surface border border-border rounded-md shadow-lg py-1 min-w-[200px]">
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false) }}
                className={cn(
                  'w-full flex flex-col items-start px-3 py-1.5 text-xs hover:bg-surface-light transition-colors',
                  opt.id === value ? 'text-primary font-medium' : 'text-text-secondary'
                )}
              >
                <span>{opt.label}</span>
                {opt.timestamp && <span className="text-text-muted">{opt.timestamp}</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function DiffViewerPage() {
  const [workflowId, setWorkflowId] = useState('')
  const [versionA, setVersionA] = useState('')
  const [versionB, setVersionB] = useState('')
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [versions, setVersions] = useState<WorkflowVersion[]>([])
  const [diffLinesLeft, setDiffLinesLeft] = useState<DiffLine[]>([])
  const [diffLinesRight, setDiffLinesRight] = useState<DiffLine[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load workflows from API
  useEffect(() => {
    const loadWorkflows = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await apiClient.getWorkflows()
        setWorkflows(response.flows)
        
        if (response.flows.length > 0 && !workflowId) {
          setWorkflowId(response.flows[0].id)
        }
      } catch (err) {
        console.error('Failed to load workflows:', err)
        setError(err instanceof Error ? err.message : 'Failed to load workflows')
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkflows()
  }, [])

  // Generate mock versions when workflow changes
  useEffect(() => {
    if (workflowId) {
      const workflow = workflows.find(w => w.id === workflowId)
      if (workflow) {
        // Generate mock versions based on workflow updates
        const mockVersions = [
          { id: 'current', label: 'Current', timestamp: new Date().toLocaleString() },
          { id: 'previous', label: 'Previous', timestamp: '1 day ago' },
          { id: 'original', label: 'Original', timestamp: '1 week ago' },
        ]
        setVersions(mockVersions)
        
        if (!versionA) setVersionA('previous')
        if (!versionB) setVersionB('current')
      }
    }
  }, [workflowId, workflows])

  // Generate diff when versions change
  useEffect(() => {
    if (workflowId && versionA && versionB && versionA !== versionB) {
      const workflow = workflows.find(w => w.id === workflowId)
      if (workflow) {
        // Generate a simple diff based on the workflow definition
        const definition = workflow.definition || {}
        const defString = JSON.stringify(definition, null, 2)
        const lines = defString.split('\n')
        
        // Create a simple mock diff
        const leftLines: DiffLine[] = lines.slice(0, Math.max(lines.length - 2, 1)).map((line, idx) => ({
          lineA: idx + 1,
          lineB: idx + 1,
          type: 'unchanged' as DiffType,
          content: line
        }))
        
        const rightLines: DiffLine[] = lines.map((line, idx) => ({
          lineA: idx + 1,
          lineB: idx + 1,
          type: 'unchanged' as DiffType,
          content: line
        }))
        
        // Add some mock changes
        if (rightLines.length > 5) {
          rightLines[4] = { ...rightLines[4], type: 'changed' as DiffType }
          rightLines[5] = { lineA: null, lineB: 6, type: 'added' as DiffType, content: '  "new_field": "value",' }
        }
        
        setDiffLinesLeft(leftLines)
        setDiffLinesRight(rightLines)
      }
    }
  }, [workflowId, versionA, versionB, workflows])

  const handleSwap = () => {
    setVersionA(versionB)
    setVersionB(versionA)
  }

  const additions = diffLinesRight.filter((l) => l.type === 'added').length
  const deletions = diffLinesLeft.filter((l) => l.type === 'removed').length
  const modifications = diffLinesLeft.filter((l) => l.type === 'changed').length

  return (
    <div className="flex flex-col overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Toolbar */}
      <div className="h-12 px-4 border-b border-border flex items-center gap-2 flex-shrink-0 bg-background">
        <span className="text-sm font-semibold text-text-primary mr-2">Diff Viewer</span>

        <Dropdown
          value={workflowId}
          options={workflows.map((w) => ({ id: w.id, label: w.name }))}
          onChange={setWorkflowId}
          label="Workflow"
        />

        <div className="flex items-center gap-1.5 ml-2">
          <Dropdown
            value={versionA}
            options={versions}
            onChange={setVersionA}
            label="A"
          />

          <button
            onClick={handleSwap}
            title="Swap versions"
            className="inline-flex items-center justify-center w-7 h-7 rounded border border-border bg-surface text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
          </button>

          <Dropdown
            value={versionB}
            options={versions}
            onChange={setVersionB}
            label="B"
          />
        </div>

        <div className="ml-auto">
          <button className="inline-flex items-center h-[30px] px-3 rounded bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
            Deploy Version B
          </button>
        </div>
      </div>

      {/* Column headers */}
      <div className="flex border-b border-border flex-shrink-0 bg-surface">
        <div className="flex-1 px-3 py-1.5 font-mono text-xs text-text-muted border-r border-border">
          Version A &mdash; {versions.find((v) => v.id === versionA)?.timestamp}
        </div>
        <div className="flex-1 px-3 py-1.5 font-mono text-xs text-text-muted">
          Version B &mdash; {versions.find((v) => v.id === versionB)?.timestamp}
        </div>
      </div>

      {/* Diff panes */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-text-secondary">Loading diff...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-error mb-2">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto border-r border-border">
            <DiffPane lines={diffLinesLeft} side="left" />
          </div>
          <div className="flex-1 overflow-auto">
            <DiffPane lines={diffLinesRight} side="right" />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="h-11 px-4 border-t border-border flex items-center justify-between flex-shrink-0 bg-surface">
        <span className="text-xs text-text-muted font-mono">
          <span className="text-success font-semibold">{additions} addition{additions !== 1 ? 's' : ''}</span>
          {', '}
          <span className="text-error font-semibold">{deletions} deletion{deletions !== 1 ? 's' : ''}</span>
          {', '}
          <span className="text-warning font-semibold">{modifications} modification{modifications !== 1 ? 's' : ''}</span>
        </span>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 h-[28px] px-2.5 rounded border border-error/50 text-error text-xs font-medium hover:bg-error/10 transition-colors">
            <RotateCcw className="w-3 h-3" />
            Revert to Version A
          </button>
          <button className="inline-flex items-center h-[28px] px-3 rounded bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
            Deploy Version B
          </button>
        </div>
      </div>
    </div>
  )
}
