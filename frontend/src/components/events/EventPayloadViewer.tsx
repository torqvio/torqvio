'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EventPayloadViewerProps {
  payload: Record<string, unknown>
  className?: string
}

function syntaxHighlight(json: string): string {
  return json
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
      (match) => {
        let style = 'color:#60a5fa' // blue – numbers
        if (/^"/.test(match)) {
          if (/:$/.test(match)) style = 'color:#a78bfa' // purple – keys
          else style = 'color:#34d399'                  // green – strings
        } else if (/true|false/.test(match)) style = 'color:#fb923c' // orange – booleans
        else if (/null/.test(match))         style = 'color:#6b7280' // gray – null
        return `<span style="${style}">${match}</span>`
      },
    )
}

export function EventPayloadViewer({ payload, className }: EventPayloadViewerProps) {
  const [copied, setCopied] = useState(false)
  const json = JSON.stringify(payload, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn('relative group', className)}>
      <button
        onClick={handleCopy}
        title="Copy JSON"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded bg-surface-light hover:bg-border text-text-muted hover:text-text-primary"
      >
        {copied
          ? <Check className="w-3.5 h-3.5 text-success" />
          : <Copy className="w-3.5 h-3.5" />
        }
      </button>
      <pre className="text-xs font-mono text-text-secondary bg-background rounded-md p-3 overflow-auto max-h-64 leading-relaxed border border-border">
        <code dangerouslySetInnerHTML={{ __html: syntaxHighlight(json) }} />
      </pre>
    </div>
  )
}