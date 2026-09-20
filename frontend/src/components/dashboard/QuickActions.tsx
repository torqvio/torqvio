'use client'

import Link from 'next/link'
import { Plus, XCircle, Webhook, Terminal, ScrollText, KeyRound } from 'lucide-react'

interface QuickAction {
  label: string
  icon: typeof Plus
  href: string
  primary?: boolean
}

const actions: QuickAction[] = [
  { label: 'New Workflow', icon: Plus, href: '/dashboard/workflows/new', primary: true },
  { label: 'Playground',   icon: Terminal, href: '/dashboard/playground' },
  { label: 'Webhooks',     icon: Webhook,  href: '/dashboard/webhooks/new' },
  { label: 'Logs',         icon: ScrollText, href: '/dashboard/logs' },
  { label: 'API Keys',     icon: KeyRound, href: '/dashboard/settings/api-keys' },
  { label: 'Failed',       icon: XCircle,  href: '/dashboard/executions?status=failed' },
]

export function QuickActions() {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {actions.map((action) => (
        <Link
          key={action.label}
          href={action.href}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
            action.primary
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:border-border/80 hover:bg-surface-light'
          }`}
        >
          <action.icon className="w-3.5 h-3.5" />
          {action.label}
        </Link>
      ))}
    </div>
  )
}
