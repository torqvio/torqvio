'use client'

import { useState, useEffect, useRef } from 'react'
import { Bot, CheckCircle } from 'lucide-react'

interface CopyForAIButtonProps {
  content: string
  className?: string
}

export function CopyForAIButton({ content, className = "" }: CopyForAIButtonProps) {
  const [copied, setCopied] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable (non-HTTPS or blocked)
    }
  }

  return (
    <button
      onClick={handleCopy}
      disabled={copied}
      className={`px-4 py-2 text-white rounded-lg font-medium transition-all transform hover:scale-105 flex items-center gap-2 whitespace-nowrap ${
        copied
          ? 'bg-green-500 hover:bg-green-500 cursor-default'
          : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
      } ${className}`}
      title="Copy markdown formatted for AI code editors to clipboard"
    >
      {copied ? (
        <>
          <CheckCircle className="w-4 h-4" />
          Copied!
        </>
      ) : (
        <>
          <Bot className="w-4 h-4" />
          Copy for AI
        </>
      )}
    </button>
  )
}
