import {
  Globe,
  Clock,
  Zap,
  MousePointerClick,
  Mail,
  Database,
  Shuffle,
  Code,
  GitBranch,
  RefreshCw,
  Layers,
  Timer,
  RotateCcw,
  MessageSquare,
  CreditCard,
  Github,
  Link2,
} from 'lucide-react'
import type { StepType } from './types'

export type StepCategory = 'trigger' | 'action' | 'flow' | 'integration'

interface StepConfig {
  label: string
  icon: React.ElementType
  description: string
  category: StepCategory
  headerColor: string
  iconBg: string
  iconColor: string
}

export const stepTypeConfig: Record<StepType, StepConfig> = {
  webhook: {
    label: 'Webhook',
    icon: Link2,
    description: 'HTTP endpoint trigger',
    category: 'trigger',
    headerColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  schedule: {
    label: 'Schedule',
    icon: Clock,
    description: 'Cron / interval trigger',
    category: 'trigger',
    headerColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  event: {
    label: 'Event',
    icon: Zap,
    description: 'System event listener',
    category: 'trigger',
    headerColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  manual: {
    label: 'Manual',
    icon: MousePointerClick,
    description: 'User-triggered',
    category: 'trigger',
    headerColor: 'bg-blue-500',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  http: {
    label: 'HTTP Request',
    icon: Globe,
    description: 'Call external API',
    category: 'action',
    headerColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  email: {
    label: 'Send Email',
    icon: Mail,
    description: 'SMTP / provider',
    category: 'action',
    headerColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  db: {
    label: 'Database Query',
    icon: Database,
    description: 'SQL execution',
    category: 'action',
    headerColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  transform: {
    label: 'Transform',
    icon: Shuffle,
    description: 'Map / filter data',
    category: 'action',
    headerColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  code: {
    label: 'Custom Code',
    icon: Code,
    description: 'JavaScript / TypeScript',
    category: 'action',
    headerColor: 'bg-purple-500',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  condition: {
    label: 'Condition',
    icon: GitBranch,
    description: 'If / else branching',
    category: 'flow',
    headerColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  loop: {
    label: 'Loop',
    icon: RefreshCw,
    description: 'For each / while',
    category: 'flow',
    headerColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  parallel: {
    label: 'Parallel',
    icon: Layers,
    description: 'Run concurrently',
    category: 'flow',
    headerColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  delay: {
    label: 'Delay',
    icon: Timer,
    description: 'Wait duration',
    category: 'flow',
    headerColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  retry: {
    label: 'Retry',
    icon: RotateCcw,
    description: 'Retry with backoff',
    category: 'flow',
    headerColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  slack: {
    label: 'Slack',
    icon: MessageSquare,
    description: 'Send message',
    category: 'integration',
    headerColor: 'bg-orange-500',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
  stripe: {
    label: 'Stripe',
    icon: CreditCard,
    description: 'Payment actions',
    category: 'integration',
    headerColor: 'bg-orange-500',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
  github: {
    label: 'GitHub',
    icon: Github,
    description: 'Repo / PR actions',
    category: 'integration',
    headerColor: 'bg-orange-500',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
}

export const paletteCategories: { id: StepCategory; label: string; types: StepType[] }[] = [
  {
    id: 'trigger',
    label: 'TRIGGERS',
    types: ['webhook', 'schedule', 'event', 'manual'],
  },
  {
    id: 'action',
    label: 'ACTIONS',
    types: ['http', 'email', 'db', 'transform', 'code'],
  },
  {
    id: 'flow',
    label: 'FLOW CONTROL',
    types: ['condition', 'loop', 'parallel', 'delay', 'retry'],
  },
  {
    id: 'integration',
    label: 'INTEGRATIONS',
    types: ['slack', 'stripe', 'github'],
  },
]

export function getDefaultName(type: StepType): string {
  return stepTypeConfig[type]?.label ?? type
}

export function getDefaultConfig(type: StepType): Record<string, any> {
  switch (type) {
    case 'http':
      return { url: 'https://api.example.com', method: 'GET', headers: {}, timeout: 30 }
    case 'delay':
      return { duration: 1, unit: 'seconds' }
    case 'condition':
      return { expression: '', trueBranch: 'continue', falseBranch: 'end' }
    case 'retry':
      return { maxAttempts: 3, backoff: 'exponential', baseDelay: 1000 }
    case 'code':
      return { code: '// Available: input, steps\nreturn { result: input };' }
    case 'webhook':
      return { method: 'POST', path: '/webhook' }
    case 'schedule':
      return { cron: '0 9 * * 1', timezone: 'UTC' }
    case 'email':
      return { to: '', subject: '', body: '' }
    case 'db':
      return { query: 'SELECT * FROM table WHERE id = :id', params: {} }
    default:
      return {}
  }
}
