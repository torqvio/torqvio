'use client'

import Link from 'next/link'
import { Plus, XCircle, Webhook, Terminal, ScrollText, KeyRound } from 'lucide-react'

interface QuickAction {
  label: string
  icon: typeof Plus
  href: string
}

const actions: QuickAction[] = [
  { label: 'Create Workflow', icon: Plus, href: '/dashboard/workflows/new' },
  { label: 'Failed Executions', icon: XCircle, href: '/dashboard/executions?status=failed' },
  { label: 'Create Webhook', icon: Webhook, href: '/dashboard/webhooks/new' },
  { label: 'Open Playground', icon: Terminal, href: '/dashboard/playground' },
  { label: 'View Logs', icon: ScrollText, href: '/dashboard/logs' },
  { label: 'Manage API Keys', icon: KeyRound, href: '/dashboard/settings/api-keys' },
]

export function QuickActions() {
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-text-primary">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="flex flex-col items-center gap-2.5 p-4 rounded-lg border border-border bg-surface hover:bg-surface-light hover:border-primary/30 transition-all group"
          >
            <div className="p-2.5 rounded-lg bg-surface-light group-hover:bg-primary/10 transition-colors">
              <action.icon className="w-5 h-5 text-text-secondary group-hover:text-primary transition-colors" />
            </div>
            <span className="text-xs font-medium text-text-secondary group-hover:text-text-primary text-center transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
