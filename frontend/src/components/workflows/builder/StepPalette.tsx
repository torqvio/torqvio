'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { paletteCategories, stepTypeConfig } from './step-config'
import type { StepType } from './types'

export default function StepPalette() {
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(['trigger', 'action', 'flow', 'integration']),
  )

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleDragStart = (e: React.DragEvent, type: StepType) => {
    e.dataTransfer.setData('stepType', type)
    e.dataTransfer.effectAllowed = 'copy'
  }

  // ── Collapsed: icons-only strip ────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="w-12 flex-shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
        {/* Expand button */}
        <button
          onClick={() => setCollapsed(false)}
          title="Expand step library"
          className="w-12 h-12 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors flex-shrink-0 border-b border-border"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>

        {/* All step type icons */}
        <div className="flex-1 overflow-y-auto py-1 flex flex-col items-center gap-1">
          {paletteCategories.map((cat) =>
            cat.types.map((type) => {
              const cfg = stepTypeConfig[type]
              const Icon = cfg.icon
              return (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  title={cfg.label}
                  className="w-8 h-8 rounded-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-surface-light transition-colors"
                >
                  <div className={`w-6 h-6 rounded-md flex items-center justify-center ${cfg.iconBg}`}>
                    <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                  </div>
                </div>
              )
            }),
          )}
        </div>
      </div>
    )
  }

  // ── Expanded: full palette ─────────────────────────────────────────────────
  return (
    <div className="w-[220px] flex-shrink-0 border-r border-border bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-border flex-shrink-0 flex items-center justify-between">
        <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted">
          Step Library
        </p>
        <button
          onClick={() => setCollapsed(true)}
          title="Collapse panel"
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <PanelLeftClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {paletteCategories.map((cat) => (
          <div key={cat.id} className="mb-0.5">
            <button
              onClick={() => toggle(cat.id)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors"
            >
              {cat.label}
              {expanded.has(cat.id) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </button>

            {expanded.has(cat.id) && (
              <div className="px-2 pb-1 space-y-0.5">
                {cat.types.map((type) => {
                  const cfg = stepTypeConfig[type]
                  const Icon = cfg.icon
                  return (
                    <div
                      key={type}
                      draggable
                      onDragStart={(e) => handleDragStart(e, type)}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-surface-light transition-colors group select-none"
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${cfg.iconBg}`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors truncate leading-none mb-0.5">
                          {cfg.label}
                        </p>
                        <p className="text-[10px] text-text-muted truncate leading-none">
                          {cfg.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
