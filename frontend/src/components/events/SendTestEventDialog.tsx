'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventSchema } from './EventSchemaCard'

const EVENT_TYPES = [
  'payment.failed',
  'subscription.dunning',
  'webhook.dead_letter',
  'api.retry',
  'user.signup',
  'user.plan_upgraded',
  'system.health_check',
]

const SOURCES = ['manual', 'stripe', 'api', 'webhook', 'system']

interface SendTestEventDialogProps {
  open: boolean
  prefillSchema?: EventSchema | null
  onClose: () => void
  onSent?: (eventId: string) => void
}

export function SendTestEventDialog({ open, prefillSchema, onClose, onSent }: SendTestEventDialogProps) {
  const [eventType, setEventType] = useState('')
  const [source, setSource]       = useState('manual')
  const [payload, setPayload]     = useState('{\n  \n}')
  const [payloadError, setPayloadError] = useState('')
  const [sending, setSending]     = useState(false)
  const [sent, setSent]           = useState(false)
  const [sentId, setSentId]       = useState('')

  const overlayRef = useRef<HTMLDivElement>(null)

  // Pre-fill when opened from a schema card
  useEffect(() => {
    if (!open) return
    setSent(false)
    setSentId('')
    setPayloadError('')
    if (prefillSchema) {
      setEventType(prefillSchema.eventType)
      setSource('manual')
      setPayload(JSON.stringify(prefillSchema.examplePayload, null, 2))
    } else {
      setEventType('')
      setSource('manual')
      setPayload('{\n  \n}')
    }
  }, [open, prefillSchema])

  const validatePayload = (value: string): boolean => {
    try {
      JSON.parse(value)
      setPayloadError('')
      return true
    } catch {
      setPayloadError('Invalid JSON')
      return false
    }
  }

  const handleSend = async () => {
    if (!eventType.trim()) return
    if (!validatePayload(payload)) return

    setSending(true)
    await new Promise((r) => setTimeout(r, 800)) // mock API call
    const id = `evt_${Math.random().toString(36).slice(2, 9)}`
    setSentId(id)
    setSending(false)
    setSent(true)
    onSent?.(id)
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose()
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-lg mx-4 bg-surface border border-border rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Send Test Event</h2>
            <p className="text-xs text-text-muted mt-0.5">Publish an event to the bus for testing</p>
          </div>
          <button onClick={onClose} className="p-1 rounded hover:bg-surface-light text-text-muted hover:text-text-primary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          /* Success state */
          <div className="px-5 py-8 flex flex-col items-center text-center gap-3">
            <CheckCircle className="w-10 h-10 text-success" />
            <div>
              <p className="text-sm font-medium text-text-primary">Event published</p>
              <p className="text-xs text-text-muted font-mono mt-1">ID: {sentId}</p>
            </div>
            <p className="text-xs text-text-muted">Switch to Live Stream to see it appear.</p>
            <div className="flex gap-2 mt-2">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                Go to Live Stream
              </button>
              <button
                onClick={() => setSent(false)}
                className="px-4 py-1.5 text-xs rounded-md bg-surface-light hover:bg-border text-text-secondary transition-colors border border-border"
              >
                Send another
              </button>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="px-5 py-4 space-y-4">
            {/* Event Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Event Type</label>
              <div className="relative">
                <input
                  list="event-type-list"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  placeholder="e.g. payment.failed"
                  className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <datalist id="event-type-list">
                  {EVENT_TYPES.map((t) => <option key={t} value={t} />)}
                </datalist>
              </div>
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Source</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full h-8 px-3 text-xs bg-background border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary/50"
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s} className="bg-surface">{s}</option>
                ))}
              </select>
            </div>

            {/* Payload */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-text-secondary">Payload (JSON)</label>
              <textarea
                value={payload}
                onChange={(e) => { setPayload(e.target.value); if (payloadError) validatePayload(e.target.value) }}
                onBlur={() => validatePayload(payload)}
                rows={8}
                spellCheck={false}
                className={cn(
                  'w-full px-3 py-2 text-xs font-mono bg-background border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none',
                  payloadError ? 'border-error' : 'border-border',
                )}
              />
              {payloadError && (
                <p className="text-[11px] text-error">{payloadError}</p>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onClose}
                className="px-4 py-1.5 text-xs rounded-md bg-surface-light hover:bg-border text-text-secondary border border-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={sending || !eventType.trim()}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-md bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className={cn('w-3.5 h-3.5', sending && 'animate-pulse')} />
                {sending ? 'Sending…' : 'Send'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}