'use client'

import Link from 'next/link'
import { GitBranch, FileCode, Upload, ExternalLink, Search, CheckCircle2, Clock } from 'lucide-react'

interface WorkflowEmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
  view?: 'all' | 'deployed' | 'drafts' | 'templates' | 'recent'
}

export function WorkflowEmptyState({ hasFilters = false, onClearFilters, view = 'all' }: WorkflowEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-8">
        <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">No workflows found</h2>
        <p className="text-sm text-text-secondary text-center max-w-xs mb-4">
          No workflows match your filters. Try adjusting your search.
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-primary hover:underline transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    )
  }

  // Deployed empty state
  if (view === 'deployed') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-8">
        <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">No deployed workflows</h2>
        <p className="text-sm text-text-secondary text-center max-w-xs mb-6">
          Deploy a workflow to see it here. Start from your drafts.
        </p>
        <Link
          href="/dashboard/workflows"
          className="inline-flex items-center h-[30px] px-4 text-xs font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition-all"
        >
          Go to Drafts
        </Link>
      </div>
    )
  }

  // Drafts empty state
  if (view === 'drafts') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-8">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
          <FileCode className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">No drafts yet</h2>
        <p className="text-sm text-text-secondary text-center max-w-xs mb-6">
          Start building a new workflow. Drafts are saved automatically until you deploy.
        </p>
        <Link
          href="/dashboard/workflows/new"
          className="inline-flex items-center h-[30px] px-4 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors gap-1.5"
        >
          Create new workflow
        </Link>
      </div>
    )
  }

  // Recently Edited empty state
  if (view === 'recent') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 py-20 px-8">
        <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center mb-6">
          <Clock className="w-8 h-8 text-text-muted" />
        </div>
        <h2 className="text-xl font-semibold text-text-primary mb-2">No recent edits</h2>
        <p className="text-sm text-text-secondary text-center max-w-xs mb-6">
          Workflows you've recently edited will appear here.
        </p>
        <Link
          href="/dashboard/workflows"
          className="inline-flex items-center h-[30px] px-4 text-xs font-medium rounded-md bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-primary/40 transition-all"
        >
          All Workflows
        </Link>
      </div>
    )
  }

  // Default: all workflows empty state
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-20 px-8">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <GitBranch className="w-8 h-8 text-primary" />
      </div>
      <h2 className="text-xl font-semibold text-text-primary mb-2">Create your first workflow</h2>
      <p className="text-sm text-text-secondary text-center max-w-xs mb-8">
        Workflows let you automate complex processes with retries, branching, and durable execution.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full max-w-2xl mb-8">
        <Link
          href="/dashboard/workflows/new"
          className="flex flex-col items-start p-4 bg-surface border border-border rounded-lg hover:border-primary/40 hover:bg-surface-light transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <GitBranch className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-1">Start from scratch</p>
          <p className="text-xs text-text-muted">Build a workflow with the visual editor</p>
        </Link>

        <Link
          href="/dashboard/templates"
          className="flex flex-col items-start p-4 bg-surface border border-border rounded-lg hover:border-primary/40 hover:bg-surface-light transition-all group"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <FileCode className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-1">Use a template</p>
          <p className="text-xs text-text-muted">Start with a pre-built workflow pattern</p>
        </Link>

        <button className="flex flex-col items-start p-4 bg-surface border border-border rounded-lg hover:border-primary/40 hover:bg-surface-light transition-all group text-left">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
            <Upload className="w-4 h-4 text-primary" />
          </div>
          <p className="text-sm font-semibold text-text-primary mb-1">Import</p>
          <p className="text-xs text-text-muted">Load a workflow from JSON or YAML</p>
        </button>
      </div>

      <a
        href="#"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
      >
        View documentation
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  )
}
