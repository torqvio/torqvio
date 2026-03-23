'use client'

import { useState, useRef } from 'react'
import { Edit2, Trash2, Plus, Save, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type Scope = 'Global' | 'Production' | 'Staging' | 'Development'

interface EnvVar {
  id: string
  key: string
  value: string
  scope: Scope
  updated: string
}

interface RowEditState {
  key: string
  value: string
  scope: Scope
}

const INITIAL_VARS: EnvVar[] = [
  {
    id: '1',
    key: 'API_BASE_URL',
    value: 'https://api.example.com/v2',
    scope: 'Global',
    updated: '2 days ago',
  },
  {
    id: '2',
    key: 'TIMEOUT_MS',
    value: '30000',
    scope: 'Global',
    updated: '1 week ago',
  },
  {
    id: '3',
    key: 'MAX_BATCH_SIZE',
    value: '500',
    scope: 'Production',
    updated: '3 days ago',
  },
  {
    id: '4',
    key: 'WEBHOOK_URL',
    value: 'https://hooks.example.com/ingest/abc123',
    scope: 'Staging',
    updated: '5 hours ago',
  },
]

const SCOPE_COLORS: Record<Scope, string> = {
  Global: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  Production: 'bg-green-500/10 text-green-400 border-green-500/20',
  Staging: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  Development: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
}

function normaliseKey(raw: string): string {
  return raw.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
}

function InlineEditRow({
  editState,
  onChange,
  onSave,
  onCancel,
  isNew,
}: {
  editState: RowEditState
  onChange: (s: RowEditState) => void
  onSave: () => void
  onCancel: () => void
  isNew?: boolean
}) {
  const set = <K extends keyof RowEditState>(k: K, v: RowEditState[K]) =>
    onChange({ ...editState, [k]: v })

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSave()
    if (e.key === 'Escape') onCancel()
  }

  const sharedInputCls =
    'h-7 px-2 text-xs bg-background border border-border rounded text-text-primary focus:outline-none focus:border-primary w-full'

  return (
    <tr className={cn('border-b border-border', isNew && 'bg-primary/5')}>
      <td className="py-2 px-3">
        <input
          type="text"
          value={editState.key}
          onChange={(e) => set('key', normaliseKey(e.target.value))}
          onKeyDown={handleKeyDown}
          className={cn(sharedInputCls, 'font-mono')}
          placeholder="VARIABLE_NAME"
          autoFocus={isNew}
        />
      </td>
      <td className="py-2 px-3">
        <input
          type="text"
          value={editState.value}
          onChange={(e) => set('value', e.target.value)}
          onKeyDown={handleKeyDown}
          className={cn(sharedInputCls, 'font-mono')}
          placeholder="value"
        />
      </td>
      <td className="py-2 px-3">
        <select
          value={editState.scope}
          onChange={(e) => set('scope', e.target.value as Scope)}
          className="h-7 px-2 text-xs bg-background border border-border rounded text-text-secondary focus:outline-none focus:border-primary"
        >
          <option value="Global">Global</option>
          <option value="Production">Production</option>
          <option value="Staging">Staging</option>
          <option value="Development">Development</option>
        </select>
      </td>
      <td className="py-2 px-3 text-xs text-text-muted whitespace-nowrap">—</td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1">
          <button
            onClick={onSave}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-surface-light text-green-400 hover:text-green-300 transition-colors"
            title="Save (Enter)"
          >
            <Save className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCancel}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
            title="Cancel (Escape)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function ReadOnlyRow({
  variable,
  onEdit,
  onDelete,
}: {
  variable: EnvVar
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <tr className="border-b border-border hover:bg-surface-light group transition-colors">
      <td className="py-2 px-3 font-mono text-xs text-text-primary whitespace-nowrap">{variable.key}</td>
      <td className="py-2 px-3 font-mono text-xs text-text-secondary max-w-[200px] truncate">
        {variable.value}
      </td>
      <td className="py-2 px-3">
        <span
          className={cn(
            'inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] font-medium',
            SCOPE_COLORS[variable.scope]
          )}
        >
          {variable.scope}
        </span>
      </td>
      <td className="py-2 px-3 text-xs text-text-muted whitespace-nowrap">{variable.updated}</td>
      <td className="py-2 px-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="h-6 w-6 flex items-center justify-center rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function EnvVarsPage() {
  const [vars, setVars] = useState<EnvVar[]>(INITIAL_VARS)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editState, setEditState] = useState<RowEditState | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newState, setNewState] = useState<RowEditState>({ key: '', value: '', scope: 'Global' })
  const [search, setSearch] = useState('')

  const filtered = vars.filter(
    (v) =>
      search.trim() === '' ||
      v.key.toLowerCase().includes(search.toLowerCase()) ||
      v.value.toLowerCase().includes(search.toLowerCase())
  )

  const handleEdit = (v: EnvVar) => {
    setAddingNew(false)
    setEditingId(v.id)
    setEditState({ key: v.key, value: v.value, scope: v.scope })
  }

  const handleSaveEdit = () => {
    if (!editState || !editingId) return
    setVars((prev) =>
      prev.map((v) =>
        v.id === editingId
          ? { ...v, key: editState.key, value: editState.value, scope: editState.scope, updated: 'just now' }
          : v
      )
    )
    setEditingId(null)
    setEditState(null)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditState(null)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this environment variable?')) {
      setVars((prev) => prev.filter((v) => v.id !== id))
    }
  }

  const handleAddNew = () => {
    setEditingId(null)
    setEditState(null)
    setNewState({ key: '', value: '', scope: 'Global' })
    setAddingNew(true)
  }

  const handleSaveNew = () => {
    const newVar: EnvVar = {
      id: String(Date.now()),
      key: newState.key || 'NEW_VARIABLE',
      value: newState.value,
      scope: newState.scope,
      updated: 'just now',
    }
    setVars((prev) => [newVar, ...prev])
    setAddingNew(false)
    setNewState({ key: '', value: '', scope: 'Global' })
  }

  const handleCancelNew = () => {
    setAddingNew(false)
    setNewState({ key: '', value: '', scope: 'Global' })
  }

  const thCls =
    'py-2 px-3 text-left font-mono text-[11px] uppercase tracking-wider text-text-muted sticky top-0 bg-background z-10 border-b border-border'

  return (
    <div className="flex flex-col overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Toolbar */}
      <div className="h-12 px-4 border-b border-border flex items-center justify-between gap-3 flex-shrink-0 bg-background">
        <span className="text-sm font-semibold text-text-primary">Environment Variables</span>
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search variables…"
              className="h-7 pl-7 pr-3 text-xs bg-surface border border-border rounded text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary w-48"
            />
          </div>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Variable
          </button>
        </div>
      </div>

      {/* Table area */}
      <div className="overflow-auto flex-1">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className={thCls}>Key</th>
              <th className={thCls}>Value</th>
              <th className={thCls}>Scope</th>
              <th className={thCls}>Updated</th>
              <th className={cn(thCls, 'w-20')}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* New row at top */}
            {addingNew && (
              <InlineEditRow
                editState={newState}
                onChange={setNewState}
                onSave={handleSaveNew}
                onCancel={handleCancelNew}
                isNew
              />
            )}

            {filtered.length === 0 && !addingNew ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-text-muted">
                  {search ? `No variables matching "${search}"` : 'No environment variables defined.'}
                </td>
              </tr>
            ) : (
              filtered.map((v) =>
                editingId === v.id && editState ? (
                  <InlineEditRow
                    key={v.id}
                    editState={editState}
                    onChange={setEditState}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <ReadOnlyRow
                    key={v.id}
                    variable={v}
                    onEdit={() => handleEdit(v)}
                    onDelete={() => handleDelete(v.id)}
                  />
                )
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Footer count */}
      <div className="h-9 px-4 border-t border-border flex items-center flex-shrink-0 bg-background">
        <span className="text-xs text-text-muted">
          {filtered.length} variable{filtered.length !== 1 ? 's' : ''}
          {search && ` matching "${search}"`}
        </span>
      </div>
    </div>
  )
}
