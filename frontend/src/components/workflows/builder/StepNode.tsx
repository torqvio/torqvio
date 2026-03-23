'use client'

import { cn } from '@/lib/utils'
import { stepTypeConfig } from './step-config'
import type { WorkflowNode } from './types'

// Node dimensions — used for edge calculation too
export const NODE_WIDTH = 176
export const NODE_HEIGHT = 72

interface StepNodeProps {
  node: WorkflowNode
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export default function StepNode({ node, isSelected, onMouseDown }: StepNodeProps) {
  const cfg = stepTypeConfig[node.type]
  const Icon = cfg?.icon
  const summary = getConfigSummary(node)

  return (
    <div
      className={cn(
        'absolute rounded-lg border select-none cursor-grab active:cursor-grabbing',
        'bg-surface shadow-lg transition-all duration-100',
        isSelected
          ? 'border-primary ring-1 ring-primary/50 shadow-primary/20 shadow-lg'
          : 'border-border hover:border-primary/40 hover:shadow-md',
      )}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: NODE_WIDTH,
        minHeight: NODE_HEIGHT,
      }}
      onMouseDown={onMouseDown}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Colored top bar */}
      <div className={cn('h-1 rounded-t-lg', cfg?.headerColor ?? 'bg-gray-500')} />

      {/* Body */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2 mb-1">
          {Icon && (
            <div
              className={cn(
                'w-5 h-5 rounded flex items-center justify-center flex-shrink-0',
                cfg?.iconBg ?? 'bg-gray-500/20',
              )}
            >
              <Icon className={cn('w-3 h-3', cfg?.iconColor ?? 'text-gray-400')} />
            </div>
          )}
          <span className="text-[11px] font-medium text-text-primary truncate leading-none">
            {node.name}
          </span>
        </div>
        {summary && (
          <p className="text-[10px] text-text-muted truncate font-mono leading-none">{summary}</p>
        )}
      </div>

      {/* Input handle */}
      <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-surface border-2 border-border hover:border-primary transition-colors" />

      {/* Output handle */}
      <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-surface border-2 border-border hover:border-primary transition-colors" />
    </div>
  )
}

function getConfigSummary(node: WorkflowNode): string {
  const { type, config } = node
  switch (type) {
    case 'http':
      return `${config.method ?? 'GET'} ${config.url ?? ''}`
    case 'delay':
      return `Wait ${config.duration ?? 1} ${config.unit ?? 'seconds'}`
    case 'condition':
      return config.expression || 'No condition set'
    case 'retry':
      return `${config.maxAttempts ?? 3} attempts · ${config.backoff ?? 'exponential'}`
    case 'code':
      return 'Custom JavaScript'
    case 'webhook':
      return `${config.method ?? 'POST'} ${config.path ?? '/webhook'}`
    case 'schedule':
      return config.cron ?? '0 9 * * 1'
    case 'email':
      return config.to ? `To: ${config.to}` : 'Configure recipient'
    case 'db':
      return config.query ? config.query.slice(0, 28) + '…' : 'No query'
    default:
      return ''
  }
}
