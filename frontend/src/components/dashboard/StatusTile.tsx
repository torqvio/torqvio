'use client'

import Link from 'next/link'
import { type LucideIcon } from 'lucide-react'

interface StatusTileProps {
  icon: LucideIcon
  label: string
  value: string
  href?: string
  statusColor?: 'success' | 'warning' | 'error' | 'default'
}

export function StatusTile({ icon: Icon, label, value, href, statusColor = 'default' }: StatusTileProps) {
  const colorMap = {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    default: 'text-text-primary',
  }

  const dotColorMap = {
    success: 'bg-success',
    warning: 'bg-warning',
    error: 'bg-error',
    default: 'bg-text-muted',
  }

  const content = (
    <div className="flex items-center gap-3 p-4 rounded-lg bg-surface border border-border hover:bg-surface-light transition-colors group cursor-pointer">
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-light group-hover:bg-background transition-colors">
        <Icon className="w-5 h-5 text-text-secondary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {statusColor !== 'default' && (
            <span className={`w-2 h-2 rounded-full ${dotColorMap[statusColor]}`} />
          )}
          <p className={`text-sm font-semibold truncate ${colorMap[statusColor]}`}>{value}</p>
        </div>
      </div>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
