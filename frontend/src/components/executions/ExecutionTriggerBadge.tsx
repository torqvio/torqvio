'use client'

import { cn } from '@/lib/utils'
import { 
  Webhook, 
  CalendarClock, 
  MousePointerClick, 
  Zap 
} from 'lucide-react'
import type { Execution } from '@/types/execution'

interface ExecutionTriggerBadgeProps {
  trigger: Execution['trigger']
  className?: string
}

export default function ExecutionTriggerBadge({ trigger, className }: ExecutionTriggerBadgeProps) {
  const getTriggerConfig = (trigger: Execution['trigger']) => {
    switch (trigger) {
      case 'webhook':
        return {
          icon: Webhook,
          color: 'text-blue-400 bg-blue-400/10',
          label: 'Webhook'
        }
      case 'schedule':
        return {
          icon: CalendarClock,
          color: 'text-green-400 bg-green-400/10',
          label: 'Scheduled'
        }
      case 'manual':
        return {
          icon: MousePointerClick,
          color: 'text-purple-400 bg-purple-400/10',
          label: 'Manual'
        }
      case 'event':
        return {
          icon: Zap,
          color: 'text-yellow-400 bg-yellow-400/10',
          label: 'Event'
        }
      default:
        return {
          icon: Webhook,
          color: 'text-gray-400 bg-gray-400/10',
          label: 'Unknown'
        }
    }
  }

  const config = getTriggerConfig(trigger)
  const Icon = config.icon

  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium',
      config.color,
      className
    )}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}
