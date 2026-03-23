import { cn } from '@/lib/utils'

export function getEventTypeStyle(type: string): string {
  if (type.startsWith('payment.'))      return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  if (type.startsWith('subscription.')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
  if (type.startsWith('webhook.'))      return 'bg-orange-500/10 text-orange-400 border-orange-500/20'
  if (type.startsWith('api.'))          return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
  if (type.startsWith('user.'))         return 'bg-green-500/10 text-green-400 border-green-500/20'
  if (type.startsWith('system.'))       return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
  return 'bg-surface-light text-text-secondary border-border'
}

interface EventTypeBadgeProps {
  type: string
  className?: string
}

export function EventTypeBadge({ type, className }: EventTypeBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono border whitespace-nowrap',
        getEventTypeStyle(type),
        className,
      )}
    >
      {type}
    </span>
  )
}