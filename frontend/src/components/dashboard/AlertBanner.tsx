'use client'

import { useState } from 'react'
import { AlertTriangle, X, ArrowRight, AlertCircle, Info } from 'lucide-react'

interface AlertBannerProps {
  severity: 'error' | 'warning' | 'info'
  message: string
  ctaLabel?: string
  ctaHref?: string
  onDismiss?: () => void
}

export function AlertBanner({ severity, message, ctaLabel, ctaHref, onDismiss }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const severityStyles = {
    error: 'bg-error/10 border-error/30 text-error',
    warning: 'bg-warning/10 border-warning/30 text-warning',
    info: 'bg-primary/10 border-primary/30 text-primary',
  }

  const severityIcon = {
    error: <AlertCircle className="w-4 h-4 flex-shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 flex-shrink-0" />,
    info: <Info className="w-4 h-4 flex-shrink-0" />,
  }

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <div className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between gap-4 ${severityStyles[severity]}`}>
      <div className="flex items-center gap-3 min-w-0">
        {severityIcon[severity]}
        <p className="text-sm font-medium truncate">{message}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {ctaLabel && ctaHref && (
          <a
            href={ctaHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
          >
            {ctaLabel}
            <ArrowRight className="w-3 h-3" />
          </a>
        )}
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
