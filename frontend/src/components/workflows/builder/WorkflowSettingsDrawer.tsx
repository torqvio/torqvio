'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

export interface WorkflowSettings {
  name: string
  description: string
  trigger: string
  retryPolicy: string
  timeout: number
  tags: string
}

interface WorkflowSettingsDrawerProps {
  open: boolean
  settings: WorkflowSettings
  onSettingsChange: (s: WorkflowSettings) => void
  onClose: () => void
}

export default function WorkflowSettingsDrawer({
  open,
  settings,
  onSettingsChange,
  onClose,
}: WorkflowSettingsDrawerProps) {
  const set = (key: keyof WorkflowSettings, value: string | number) =>
    onSettingsChange({ ...settings, [key]: value })

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[60]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-[61] w-[360px] bg-surface border-l border-border flex flex-col shadow-2xl"
            initial={{ x: 360 }}
            animate={{ x: 0 }}
            exit={{ x: 360 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">Workflow Settings</h2>
                <p className="text-[11px] text-text-muted mt-0.5">Global configuration for this workflow</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              <Field label="Workflow Name">
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => set('name', e.target.value)}
                  className={inputCls}
                  placeholder="e.g., Process User Registration"
                />
              </Field>

              <Field label="Description">
                <textarea
                  value={settings.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Describe what this workflow does and when it should run…"
                />
              </Field>

              <Field label="Default Trigger" hint="How this workflow starts">
                <select
                  value={settings.trigger}
                  onChange={(e) => set('trigger', e.target.value)}
                  className={inputCls}
                >
                  <option value="webhook">Webhook — HTTP endpoint</option>
                  <option value="scheduled">Scheduled — Time-based</option>
                  <option value="manual">Manual — User triggered</option>
                  <option value="event">Event — System events</option>
                </select>
              </Field>

              <Field label="Retry Policy" hint="How to handle step failures">
                <select
                  value={settings.retryPolicy}
                  onChange={(e) => set('retryPolicy', e.target.value)}
                  className={inputCls}
                >
                  <option value="default">Default (3 retries)</option>
                  <option value="exponential">Exponential Backoff (1, 2, 4, 8 min)</option>
                  <option value="linear">Linear Backoff (1, 2, 3, 4 min)</option>
                  <option value="none">No Retries</option>
                </select>
              </Field>

              <Field label="Global Timeout (seconds)" hint="Max execution time for the whole workflow">
                <input
                  type="number"
                  value={settings.timeout}
                  onChange={(e) => set('timeout', parseInt(e.target.value))}
                  min={1}
                  max={3600}
                  className={inputCls}
                />
              </Field>

              <Field label="Tags" hint="Comma-separated, e.g. billing, notifications">
                <input
                  type="text"
                  value={settings.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder="billing, user-onboarding"
                  className={inputCls}
                />
              </Field>

              {/* Divider */}
              <div className="border-t border-border pt-4">
                <p className="text-[10px] font-mono uppercase tracking-wider text-text-muted mb-3">
                  Version Notes
                </p>
                <textarea
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Optional notes for this version…"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-border flex-shrink-0">
              <button
                onClick={onClose}
                className="w-full h-9 rounded bg-primary hover:bg-primary/90 text-white text-sm font-medium transition-colors"
              >
                Done
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

const inputCls =
  'w-full px-3 py-2 text-sm bg-surface-light border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors'

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[10px] font-medium uppercase tracking-wider text-text-muted mb-1">
        {label}
      </label>
      {hint && <p className="text-[10px] text-text-muted mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}
