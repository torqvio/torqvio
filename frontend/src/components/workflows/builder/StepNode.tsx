'use client'

import { cn } from '@/lib/utils'
import { stepTypeConfig } from './step-config'
import type { WorkflowNode } from './types'

export const NODE_WIDTH = 224
export const NODE_HEIGHT = 80

interface StepNodeProps {
  node: WorkflowNode
  isSelected: boolean
  onMouseDown: (e: React.MouseEvent) => void
}

export default function StepNode({ node, isSelected, onMouseDown }: StepNodeProps) {
  const cfg = stepTypeConfig[node.type]
  const Icon = cfg?.icon
  const summary = getConfigSummary(node)
  const category = cfg?.category

  return (
    <div
      className={cn(
        'absolute select-none cursor-grab active:cursor-grabbing overflow-hidden',
        'bg-surface shadow-md transition-all duration-150',
        // shape per category
        category === 'flow' ? 'rounded-2xl border-2 border-dashed' : 'rounded-xl border',
        // selection / hover
        isSelected
          ? 'border-primary/70 ring-1 ring-primary/30 shadow-lg shadow-primary/20'
          : category === 'flow'
            ? cn('hover:shadow-lg', cfg?.headerColor?.replace('bg-', 'border-') ?? 'border-border/60')
            : 'border-border/60 hover:border-primary/40 hover:shadow-lg',
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
      {category === 'trigger' && (
        <TriggerCard node={node} cfg={cfg} Icon={Icon} summary={summary} />
      )}
      {category === 'action' && (
        <ActionCard node={node} cfg={cfg} Icon={Icon} summary={summary} />
      )}
      {category === 'flow' && (
        <FlowCard node={node} cfg={cfg} Icon={Icon} summary={summary} />
      )}
      {category === 'integration' && (
        <IntegrationCard node={node} cfg={cfg} Icon={Icon} summary={summary} />
      )}

      {/* Input handle */}
      <div className="absolute -left-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-surface border-2 border-border hover:border-primary transition-colors" />
      {/* Output handle */}
      <div className="absolute -right-[5px] top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-surface border-2 border-border hover:border-primary transition-colors" />
    </div>
  )
}

// ─── Trigger: top header band with icon + label, name + summary below ─────────
function TriggerCard({ node, cfg, Icon, summary }: CardProps) {
  return (
    <>
      <div className={cn('flex items-center gap-2 px-3 py-2', cfg?.iconBg ?? 'bg-gray-500/20')}>
        {Icon && (
          <div className={cn('w-5 h-5 rounded-md flex items-center justify-center', cfg?.headerColor ?? 'bg-gray-500')}>
            <Icon className="w-3 h-3 text-white" />
          </div>
        )}
        <span className={cn('text-[9px] font-bold uppercase tracking-widest', cfg?.iconColor ?? 'text-gray-400')}>
          Trigger
        </span>
      </div>
      <div className={cn('h-px opacity-20', cfg?.headerColor ?? 'bg-gray-500')} />
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold text-text-primary leading-tight">{node.name}</p>
        {summary && (
          <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">{summary}</p>
        )}
      </div>
    </>
  )
}

// ─── Action: left icon column + right content ─────────────────────────────────
function ActionCard({ node, cfg, Icon, summary }: CardProps) {
  return (
    <div className="flex">
      <div
        className={cn('flex items-center justify-center flex-shrink-0', cfg?.iconBg ?? 'bg-gray-500/20')}
        style={{ width: 52, minHeight: NODE_HEIGHT }}
      >
        {Icon && <Icon className={cn('w-[18px] h-[18px]', cfg?.iconColor ?? 'text-gray-400')} />}
      </div>
      <div className={cn('w-px flex-shrink-0 opacity-20', cfg?.headerColor ?? 'bg-gray-500')} />
      <div className="flex-1 px-3 py-2.5 min-w-0 flex flex-col justify-center">
        <span className={cn('text-[9px] font-bold uppercase tracking-widest leading-none mb-1', cfg?.iconColor ?? 'text-gray-400')}>
          Action
        </span>
        <p className="text-[12px] font-semibold text-text-primary truncate leading-tight">{node.name}</p>
        {summary && (
          <p className="text-[10px] text-text-muted font-mono leading-tight mt-0.5 truncate">{summary}</p>
        )}
      </div>
    </div>
  )
}

// ─── Flow: centered icon box + name, dashed border (set on outer div) ─────────
function FlowCard({ node, cfg, Icon, summary }: CardProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-3">
      <div
        className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cfg?.iconBg ?? 'bg-gray-500/20')}
      >
        {Icon && <Icon className={cn('w-4 h-4', cfg?.iconColor ?? 'text-gray-400')} />}
      </div>
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-text-primary truncate leading-tight">{node.name}</p>
        {summary && (
          <p className="text-[10px] text-text-muted font-mono truncate leading-tight mt-0.5">{summary}</p>
        )}
      </div>
    </div>
  )
}

// ─── Integration: service name band on top, action info below ─────────────────
function IntegrationCard({ node, cfg, Icon, summary }: CardProps) {
  return (
    <>
      <div className={cn('flex items-center gap-2 px-3 py-2', cfg?.headerColor ?? 'bg-gray-500')}>
        {Icon && <Icon className="w-3.5 h-3.5 text-white/90" />}
        <span className="text-[11px] font-semibold text-white/90">{cfg?.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[12px] font-semibold text-text-primary leading-tight">{node.name}</p>
        {summary && (
          <p className="text-[10px] text-text-muted font-mono mt-0.5 truncate">{summary}</p>
        )}
      </div>
    </>
  )
}

// ─── shared prop type ─────────────────────────────────────────────────────────
type CardProps = {
  node: WorkflowNode
  cfg: ReturnType<typeof stepTypeConfig[keyof typeof stepTypeConfig]> | undefined
  Icon: React.ElementType | undefined
  summary: string
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
