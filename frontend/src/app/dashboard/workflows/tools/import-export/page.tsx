'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, X, FileJson, File, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/services/api'
import { useToast } from '@/components/ui/toast'
import type { Workflow } from '@/types/api'


type ExportFormat = 'json' | 'yaml'

interface WorkflowFile {
  id: string
  name: string
  size: string
  valid: boolean
}

interface ExportWorkflowData {
  id: string
  name: string
  definition: Record<string, unknown>
  config?: Record<string, unknown>
  environment?: Record<string, unknown>
  retryPolicies?: Record<string, unknown>
}

function FileIcon({ name }: { name: string }) {
  const ext = name.split('.').pop()?.toLowerCase()
  if (ext === 'json') return <FileJson className="w-4 h-4 text-primary flex-shrink-0" />
  return <File className="w-4 h-4 text-text-muted flex-shrink-0" />
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active' ? 'bg-success' :
    status === 'paused' ? 'bg-warning' :
    status === 'error' ? 'bg-error' :
    'bg-text-muted'
  return <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', color)} />
}

export default function ImportExportPage() {
  // Import state
  const [isDragOver, setIsDragOver] = useState(false)
  const [importFiles, setImportFiles] = useState<WorkflowFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Export state
  const [selectedWorkflows, setSelectedWorkflows] = useState<Set<string>>(new Set())
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [includeConfig, setIncludeConfig] = useState(true)
  const [includeEnvVars, setIncludeEnvVars] = useState(false)
  const [includeRetryPolicies, setIncludeRetryPolicies] = useState(true)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
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
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load workflows';
        console.error('Failed to load workflows:', err)
        setError(errorMessage)
        toast({
          type: 'error',
          title: 'Failed to Load Workflows',
          message: 'Unable to load workflows for export. Please refresh the page.'
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadWorkflows()
  }, [])

  // Import handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const simulateAddFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return
    const newFiles: WorkflowFile[] = Array.from(fileList).map((f) => ({
      id: String(Date.now()) + f.name,
      name: f.name,
      size: f.size < 1024 * 1024
        ? `${(f.size / 1024).toFixed(1)} KB`
        : `${(f.size / 1024 / 1024).toFixed(1)} MB`,
      valid: /\.(json|yaml|yml)$/i.test(f.name),
    }))
    setImportFiles((prev) => {
      const existing = new Set(prev.map((p) => p.name))
      return [...prev, ...newFiles.filter((f) => !existing.has(f.name))].slice(0, 10)
    })
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    simulateAddFiles(e.dataTransfer.files)
  }, [simulateAddFiles])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    simulateAddFiles(e.target.files)
    e.target.value = ''
  }, [simulateAddFiles])

  const handleRemoveFile = (id: string) => {
    setImportFiles((prev) => prev.filter((f) => f.id !== id))
  }

  // Export handlers
  const allSelected = selectedWorkflows.size === workflows.length
  const someSelected = selectedWorkflows.size > 0 && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedWorkflows(new Set())
    } else {
      setSelectedWorkflows(new Set(workflows.map((w) => w.id)))
    }
  }

  const handleToggleWorkflow = (id: string) => {
    setSelectedWorkflows((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const validImportFiles = importFiles.filter((f) => f.valid)

  return (
    <div className="flex flex-col overflow-auto -m-6" style={{ minHeight: 'calc(100vh - 48px)' }}>
      {/* Header */}
      <div className="h-12 px-4 border-b border-border flex items-center flex-shrink-0 bg-background">
        <span className="text-sm font-semibold text-text-primary">Import / Export</span>
      </div>

      <div className="flex-1 p-6 max-w-3xl space-y-8">
        {error && (
          <div className="p-4 text-center">
            <div className="text-sm text-error mb-2">{error}</div>
            <button 
              onClick={() => window.location.reload()}
              className="text-xs text-primary hover:underline"
            >
              Retry
            </button>
          </div>
        )}
        {/* ── IMPORT ── */}
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Import Workflows</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Supports .json, .yaml, .yml &mdash; max 10 files, 5 MB each
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed cursor-pointer transition-colors p-8',
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-surface-light'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".json,.yaml,.yml"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <Upload className={cn('w-6 h-6', isDragOver ? 'text-primary' : 'text-text-muted')} />
            <div className="text-center">
              <p className={cn('text-sm font-medium', isDragOver ? 'text-primary' : 'text-text-secondary')}>
                {isDragOver ? 'Drop files here' : 'Drag & drop files here'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">or click to browse</p>
            </div>
          </div>

          {/* File list */}
          {importFiles.length > 0 && (
            <div className="rounded-md border border-border bg-surface divide-y divide-border">
              {importFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-2.5 px-3 py-2">
                  <FileIcon name={file.name} />
                  <span className={cn(
                    'flex-1 text-sm truncate',
                    file.valid ? 'text-text-primary' : 'text-error'
                  )}>
                    {file.name}
                  </span>
                  <span className="text-xs text-text-muted flex-shrink-0">{file.size}</span>
                  {!file.valid && (
                    <span className="text-xs text-error flex-shrink-0">Unsupported</span>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(file.id) }}
                    className="flex-shrink-0 p-0.5 rounded hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {validImportFiles.length > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-muted">
                {validImportFiles.length} file{validImportFiles.length !== 1 ? 's' : ''} ready to import
                {importFiles.length !== validImportFiles.length && (
                  <span className="text-error ml-1">
                    ({importFiles.length - validImportFiles.length} invalid)
                  </span>
                )}
              </span>
              <button className="inline-flex items-center gap-1.5 h-7 px-3 rounded bg-primary text-white text-xs font-medium hover:bg-primary/90 transition-colors">
                <Upload className="w-3 h-3" />
                Import
              </button>
            </div>
          )}
        </section>

        <div className="border-t border-border" />

        {/* ── EXPORT ── */}
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Export Workflows</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Select workflows and choose your export format
            </p>
          </div>

          {/* Workflow checkbox list */}
          <div className="rounded-md border border-border bg-surface divide-y divide-border">
            {/* Select All header */}
            <div className="flex items-center gap-2.5 px-3 py-2 bg-surface-light rounded-t-md">
              <input
                type="checkbox"
                id="select-all"
                checked={allSelected}
                ref={(el) => { if (el) el.indeterminate = someSelected }}
                onChange={handleSelectAll}
                className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
              />
              <label htmlFor="select-all" className="text-xs font-medium text-text-secondary cursor-pointer select-none">
                Select All
              </label>
              {selectedWorkflows.size > 0 && (
                <span className="ml-auto text-xs text-text-muted">
                  {selectedWorkflows.size} selected
                </span>
              )}
            </div>

            {workflows.map((workflow) => (
              <div key={workflow.id} className="flex items-center gap-2.5 px-3 py-2">
                <input
                  type="checkbox"
                  id={`wf-${workflow.id}`}
                  checked={selectedWorkflows.has(workflow.id)}
                  onChange={() => handleToggleWorkflow(workflow.id)}
                  className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                />
                <StatusDot status={workflow.status || 'draft'} />
                <label
                  htmlFor={`wf-${workflow.id}`}
                  className="flex-1 text-sm text-text-primary cursor-pointer select-none"
                >
                  {workflow.name}
                </label>
                <span className="text-xs text-text-muted capitalize">{workflow.status || 'draft'}</span>
              </div>
            ))}
          </div>

          {/* Format picker */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Format</label>
            <div className="inline-flex rounded-md border border-border overflow-hidden">
              {(['json', 'yaml'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={cn(
                    'px-4 h-7 text-xs font-medium transition-colors uppercase tracking-wide',
                    exportFormat === fmt
                      ? 'bg-primary text-white'
                      : 'bg-surface text-text-secondary hover:bg-surface-light hover:text-text-primary'
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Include options */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">Include</label>
            <div className="space-y-2">
              {[
                { label: 'Workflow config', checked: includeConfig, onChange: setIncludeConfig },
                { label: 'Environment vars', checked: includeEnvVars, onChange: setIncludeEnvVars },
                { label: 'Retry policies', checked: includeRetryPolicies, onChange: setIncludeRetryPolicies },
              ].map(({ label, checked, onChange }) => (
                <label key={label} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors select-none">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Export button */}
          <div>
            <button
              disabled={selectedWorkflows.size === 0}
              onClick={async () => {
                try {
                  const selectedWorkflowsData = workflows.filter(w => selectedWorkflows.has(w.id))
                  const exportData = selectedWorkflowsData.map(w => {
                    const data: ExportWorkflowData = {
                      id: w.id,
                      name: w.name,
                      definition: w.definition
                    }
                    if (includeConfig && w.definition) {
                      data.definition = w.definition
                    }
                    return data
                  })
                  
                  const content = JSON.stringify(exportData, null, 2)
                  
                  const blob = new Blob([content], { 
                    type: exportFormat === 'json' ? 'application/json' : 'text/yaml' 
                  })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `workflows.${exportFormat}`
                  a.click()
                  URL.revokeObjectURL(url)
                } catch (err) {
                  const errorMessage = err instanceof Error ? err.message : 'Export failed';
                  console.error('Export failed:', err)
                  setError(errorMessage)
                  toast({
                    type: 'error',
                    title: 'Export Failed',
                    message: 'Unable to export workflows. Please try again.'
                  })
                }
              }}
              className={cn(
                'inline-flex items-center gap-1.5 h-8 px-4 rounded text-xs font-medium transition-colors',
                selectedWorkflows.size > 0
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-surface border border-border text-text-muted cursor-not-allowed'
              )}
            >
              <Download className="w-3.5 h-3.5" />
              Export Selected{selectedWorkflows.size > 0 ? ` (${selectedWorkflows.size})` : ''}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
