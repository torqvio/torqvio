'use client'

import { X, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { stepTypeConfig } from './step-config'
import type { WorkflowNode } from './types'

interface StepConfigPanelProps {
  node: WorkflowNode
  onUpdate: (updates: Partial<WorkflowNode>) => void
  onDelete: () => void
  onClose: () => void
}

export default function StepConfigPanel({ node, onUpdate, onDelete, onClose }: StepConfigPanelProps) {
  const cfg = stepTypeConfig[node.type]
  const Icon = cfg?.icon

  const set = (key: string, value: unknown) =>
    onUpdate({ config: { ...node.config, [key]: value } })

  return (
    <div className="w-[300px] flex-shrink-0 border-l border-border bg-surface flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={cn('w-6 h-6 rounded flex items-center justify-center', cfg?.iconBg)}>
              <Icon className={cn('w-3.5 h-3.5', cfg?.iconColor)} />
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-text-primary leading-none mb-0.5">{cfg?.label}</p>
            <p className="text-[10px] text-text-muted leading-none">Configuration</p>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-text-muted hover:text-error hover:bg-error/10 transition-colors"
            title="Delete step (Delete)"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
            title="Close panel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Step name */}
        <Field label="Step Name">
          <input
            type="text"
            value={node.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className={inputCls}
          />
        </Field>

        {/* ── HTTP Request ─────────────────────────────────────────────── */}
        {node.type === 'http' && (
          <>
            <Field label="Method">
              <select
                value={node.config.method ?? 'GET'}
                onChange={(e) => set('method', e.target.value)}
                className={inputCls}
              >
                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="URL">
              <input
                type="url"
                value={node.config.url ?? ''}
                onChange={(e) => set('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
                className={cn(inputCls, 'font-mono text-[11px]')}
              />
            </Field>
            <Field label="Headers (JSON)">
              <textarea
                value={JSON.stringify(node.config.headers ?? {}, null, 2)}
                onChange={(e) => {
                  try {
                    set('headers', JSON.parse(e.target.value))
                  } catch {}
                }}
                rows={3}
                placeholder='{"Content-Type": "application/json"}'
                className={cn(inputCls, 'font-mono text-[11px] resize-none')}
              />
            </Field>
            <Field label="Timeout (seconds)">
              <input
                type="number"
                value={node.config.timeout ?? 30}
                onChange={(e) => set('timeout', parseInt(e.target.value))}
                min={1}
                className={inputCls}
              />
            </Field>
          </>
        )}

        {/* ── Webhook ──────────────────────────────────────────────────── */}
        {node.type === 'webhook' && (
          <>
            <Field label="Method">
              <select
                value={node.config.method ?? 'POST'}
                onChange={(e) => set('method', e.target.value)}
                className={inputCls}
              >
                {['POST', 'GET', 'PUT'].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Field label="Path">
              <input
                type="text"
                value={node.config.path ?? '/webhook'}
                onChange={(e) => set('path', e.target.value)}
                className={cn(inputCls, 'font-mono text-[11px]')}
              />
            </Field>
          </>
        )}

        {/* ── Schedule ─────────────────────────────────────────────────── */}
        {node.type === 'schedule' && (
          <>
            <Field label="Cron Expression">
              <input
                type="text"
                value={node.config.cron ?? '0 9 * * 1'}
                onChange={(e) => set('cron', e.target.value)}
                placeholder="0 9 * * 1"
                className={cn(inputCls, 'font-mono text-[11px]')}
              />
              <p className="text-[10px] text-text-muted mt-1">min hr dom mon dow</p>
            </Field>
            <Field label="Timezone">
              <input
                type="text"
                value={node.config.timezone ?? 'UTC'}
                onChange={(e) => set('timezone', e.target.value)}
                className={inputCls}
              />
            </Field>
          </>
        )}

        {/* ── Delay ────────────────────────────────────────────────────── */}
        {node.type === 'delay' && (
          <Field label="Duration">
            <div className="flex gap-2">
              <input
                type="number"
                value={node.config.duration ?? 1}
                onChange={(e) => set('duration', parseFloat(e.target.value))}
                min={0.1}
                step={0.1}
                className={cn(inputCls, 'flex-1')}
              />
              <select
                value={node.config.unit ?? 'seconds'}
                onChange={(e) => set('unit', e.target.value)}
                className={inputCls}
              >
                <option value="milliseconds">ms</option>
                <option value="seconds">sec</option>
                <option value="minutes">min</option>
                <option value="hours">hrs</option>
              </select>
            </div>
          </Field>
        )}

        {/* ── Condition ────────────────────────────────────────────────── */}
        {node.type === 'condition' && (
          <>
            <Field label="Condition Expression">
              <textarea
                value={node.config.expression ?? ''}
                onChange={(e) => set('expression', e.target.value)}
                rows={4}
                placeholder="response.status === 200"
                className={cn(inputCls, 'font-mono text-[11px] resize-none')}
              />
              <p className="text-[10px] text-text-muted mt-1">
                Available: response, input, steps
              </p>
            </Field>
          </>
        )}

        {/* ── Retry ────────────────────────────────────────────────────── */}
        {node.type === 'retry' && (
          <>
            <Field label="Max Attempts">
              <input
                type="number"
                value={node.config.maxAttempts ?? 3}
                onChange={(e) => set('maxAttempts', parseInt(e.target.value))}
                min={1}
                max={10}
                className={inputCls}
              />
            </Field>
            <Field label="Backoff Strategy">
              <select
                value={node.config.backoff ?? 'exponential'}
                onChange={(e) => set('backoff', e.target.value)}
                className={inputCls}
              >
                <option value="exponential">Exponential</option>
                <option value="linear">Linear</option>
                <option value="fixed">Fixed</option>
              </select>
            </Field>
            <Field label="Base Delay (ms)">
              <input
                type="number"
                value={node.config.baseDelay ?? 1000}
                onChange={(e) => set('baseDelay', parseInt(e.target.value))}
                min={100}
                className={inputCls}
              />
            </Field>
          </>
        )}

        {/* ── Custom Code ──────────────────────────────────────────────── */}
        {node.type === 'code' && (
          <Field label="JavaScript Code">
            <textarea
              value={node.config.code ?? ''}
              onChange={(e) => set('code', e.target.value)}
              rows={12}
              className={cn(inputCls, 'font-mono text-[11px] resize-none')}
            />
            <p className="text-[10px] text-text-muted mt-1">
              Available: input, steps. Return an object.
            </p>
          </Field>
        )}

        {/* ── Email ────────────────────────────────────────────────────── */}
        {node.type === 'email' && (
          <>
            <Field label="To">
              <input
                type="email"
                value={node.config.to ?? ''}
                onChange={(e) => set('to', e.target.value)}
                placeholder="recipient@example.com"
                className={inputCls}
              />
            </Field>
            <Field label="Subject">
              <input
                type="text"
                value={node.config.subject ?? ''}
                onChange={(e) => set('subject', e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Body">
              <textarea
                value={node.config.body ?? ''}
                onChange={(e) => set('body', e.target.value)}
                rows={5}
                className={cn(inputCls, 'resize-none')}
              />
            </Field>
          </>
        )}

        {/* ── Database ─────────────────────────────────────────────────── */}
        {node.type === 'db' && (
          <>
            <Field label="SQL Query">
              <textarea
                value={node.config.query ?? ''}
                onChange={(e) => set('query', e.target.value)}
                rows={5}
                placeholder="SELECT * FROM users WHERE id = :id"
                className={cn(inputCls, 'font-mono text-[11px] resize-none')}
              />
            </Field>
          </>
        )}

        {/* ── Slack ─────────────────────────────────────────────────────── */}
        {node.type === 'slack' && (
          <>
            <Field label="Channel">
              <input
                type="text"
                value={node.config.channel ?? ''}
                onChange={(e) => set('channel', e.target.value)}
                placeholder="#general"
                className={inputCls}
              />
            </Field>
            <Field label="Message">
              <textarea
                value={node.config.message ?? ''}
                onChange={(e) => set('message', e.target.value)}
                rows={4}
                className={cn(inputCls, 'resize-none')}
              />
            </Field>
          </>
        )}
      </div>
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 text-xs bg-surface-light border border-border rounded-md text-text-primary focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-medium uppercase tracking-wider text-text-muted mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
