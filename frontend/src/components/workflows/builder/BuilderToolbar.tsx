'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Play,
  Save,
  Rocket,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface BuilderToolbarProps {
  workflowName: string
  onNameChange: (name: string) => void
  saveStatus: 'idle' | 'saving' | 'saved' | 'error'
  lastSaved: Date | null
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onDeploy: () => void
  onBack: () => void
  onSettings: () => void
}

export default function BuilderToolbar({
  workflowName,
  onNameChange,
  saveStatus,
  lastSaved,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onDeploy,
  onBack,
  onSettings,
}: BuilderToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false)

  return (
    <div className="h-12 flex items-center justify-between px-3 border-b border-border bg-surface flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded hover:bg-surface-light flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Workflows
        </button>

        <div className="w-px h-4 bg-border flex-shrink-0" />

        {/* Workflow Name (inline editable) */}
        {isEditingName ? (
          <input
            value={workflowName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setIsEditingName(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
            autoFocus
            className="text-sm font-medium text-text-primary bg-surface-light border border-primary rounded px-2 py-0.5 focus:outline-none min-w-[180px] max-w-[280px]"
          />
        ) : (
          <button
            onClick={() => setIsEditingName(true)}
            title="Click to rename"
            className="text-sm font-medium text-text-primary hover:text-white px-2 py-0.5 rounded hover:bg-surface-light transition-colors truncate max-w-[280px]"
          >
            {workflowName}
          </button>
        )}

        {/* Draft badge */}
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-light text-text-muted border border-border font-mono uppercase tracking-wide flex-shrink-0">
          Draft
        </span>

        {/* Auto-save indicator */}
        <div className="flex items-center gap-1 text-[11px] flex-shrink-0">
          {saveStatus === 'saving' && (
            <>
              <Loader2 className="w-3 h-3 animate-spin text-text-muted" />
              <span className="text-text-muted">Saving...</span>
            </>
          )}
          {saveStatus === 'saved' && (
            <>
              <CheckCircle className="w-3 h-3 text-success" />
              <span className="text-success">Saved</span>
            </>
          )}
          {saveStatus === 'error' && (
            <>
              <AlertCircle className="w-3 h-3 text-error" />
              <span className="text-error">Save failed</span>
            </>
          )}
          {saveStatus === 'idle' && lastSaved && (
            <span className="text-text-muted">Saved {formatRelative(lastSaved)}</span>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {/* Undo / Redo */}
        <ToolbarIconBtn onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 className="w-3.5 h-3.5" />
        </ToolbarIconBtn>
        <ToolbarIconBtn onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 className="w-3.5 h-3.5" />
        </ToolbarIconBtn>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Settings */}
        <ToolbarIconBtn onClick={onSettings} title="Workflow settings">
          <Settings className="w-3.5 h-3.5" />
        </ToolbarIconBtn>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Test Run */}
        <button
          className="flex items-center gap-1.5 text-xs h-[26px] px-2.5 rounded border border-border text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
          title="Test run (coming soon)"
        >
          <Play className="w-3 h-3" />
          Test Run
        </button>

        <div className="w-px h-4 bg-border mx-1" />

        {/* Save Draft */}
        <button
          onClick={onSave}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-1.5 text-xs h-[26px] px-2.5 rounded border border-border text-text-secondary hover:text-text-primary hover:border-border/80 hover:bg-surface-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save className="w-3 h-3" />
          Save Draft
        </button>

        {/* Deploy */}
        <button
          onClick={onDeploy}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-1.5 text-xs h-[26px] px-2.5 rounded bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket className="w-3 h-3" />
          Deploy
        </button>
      </div>
    </div>
  )
}

function ToolbarIconBtn({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick?: () => void
  disabled?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        'flex items-center justify-center w-[26px] h-[26px] rounded text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors',
        disabled && 'opacity-30 cursor-not-allowed hover:text-text-muted hover:bg-transparent',
      )}
    >
      {children}
    </button>
  )
}

function formatRelative(date: Date): string {
  const s = Math.round((Date.now() - date.getTime()) / 1000)
  if (s < 10) return 'just now'
  if (s < 60) return `${s}s ago`
  return date.toLocaleTimeString()
}
