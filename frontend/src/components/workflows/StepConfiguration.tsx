'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Step } from '@/types/workflow'

interface StepConfigurationProps {
  selectedStep: string | null
  steps: Step[]
  onUpdateStep: (stepId: string, updates: Partial<Step>) => void
  onDeleteStep: (stepId: string) => void
}

export default function StepConfiguration({ 
  selectedStep, 
  steps, 
  onUpdateStep, 
  onDeleteStep 
}: StepConfigurationProps) {
  if (!selectedStep) return null

  const step = steps.find(s => s.id === selectedStep)
  if (!step) return null

  return (
    <div className="w-80 border-l border-gray-600 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">Step Configuration</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDeleteStep(selectedStep)}
          className="text-red-400 hover:bg-red-400/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Step Name
          </label>
          <input
            type="text"
            value={step.name}
            onChange={(e) => onUpdateStep(selectedStep, { name: e.target.value })}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {step.type === 'http' && <HttpStepConfig step={step} onUpdateStep={onUpdateStep} />}
        {step.type === 'delay' && <DelayStepConfig step={step} onUpdateStep={onUpdateStep} />}
        {step.type === 'condition' && <ConditionStepConfig step={step} onUpdateStep={onUpdateStep} />}
        {step.type === 'retry' && <RetryStepConfig step={step} onUpdateStep={onUpdateStep} />}
        {step.type === 'custom' && <CustomStepConfig step={step} onUpdateStep={onUpdateStep} />}
      </div>
    </div>
  )
}

function HttpStepConfig({ step, onUpdateStep }: { step: Step; onUpdateStep: Function }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">URL</label>
        <input
          type="url"
          value={step.config.url || ''}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, url: e.target.value } 
          })}
          placeholder="https://api.example.com"
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Method</label>
        <select
          value={step.config.method || 'GET'}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, method: e.target.value } 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
          <option value="PATCH">PATCH</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Headers (JSON)</label>
        <textarea
          value={JSON.stringify(step.config.headers || {}, null, 2)}
          onChange={(e) => {
            try {
              const headers = JSON.parse(e.target.value)
              onUpdateStep(step.id, { 
                config: { ...step.config, headers } 
              })
            } catch (error) {
              // Invalid JSON, ignore for now
            }
          }}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          placeholder='{"Content-Type": "application/json"}'
        />
      </div>
    </>
  )
}

function DelayStepConfig({ step, onUpdateStep }: { step: Step; onUpdateStep: Function }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">Duration</label>
      <div className="flex space-x-2">
        <input
          type="number"
          value={step.config.duration || 1000}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, duration: parseInt(e.target.value) } 
          })}
          className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          min="1"
        />
        <select
          value={step.config.unit || 'milliseconds'}
          onChange={(e) => {
            const unit = e.target.value
            let duration = step.config.duration || 1000
            if (unit === 'seconds' && step.config.unit === 'milliseconds') {
              duration = Math.floor(duration / 1000)
            } else if (unit === 'milliseconds' && step.config.unit === 'seconds') {
              duration = duration * 1000
            }
            onUpdateStep(step.id, { 
              config: { ...step.config, duration, unit } 
            })
          }}
          className="px-3 py-2 bg-surface border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="milliseconds">ms</option>
          <option value="seconds">sec</option>
          <option value="minutes">min</option>
        </select>
      </div>
    </div>
  )
}

function ConditionStepConfig({ step, onUpdateStep }: { step: Step; onUpdateStep: Function }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Condition Expression</label>
        <textarea
          value={step.config.condition || ''}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, condition: e.target.value } 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={4}
          placeholder="response.status === 200"
        />
        <div className="mt-1 text-xs text-white">
          Available: response, input, step outputs
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">True Path</label>
        <select
          value={step.config.truePath || 'continue'}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, truePath: e.target.value } 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="continue">Continue to next step</option>
          <option value="end">End workflow</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">False Path</label>
        <select
          value={step.config.falsePath || 'continue'}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, falsePath: e.target.value } 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="continue">Continue to next step</option>
          <option value="end">End workflow</option>
        </select>
      </div>
    </>
  )
}

function RetryStepConfig({ step, onUpdateStep }: { step: Step; onUpdateStep: Function }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Max Attempts</label>
        <input
          type="number"
          value={step.config.maxAttempts || 3}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, maxAttempts: parseInt(e.target.value) } 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          min="1"
          max="10"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Backoff Strategy</label>
        <select
          value={step.config.backoff || 'exponential'}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, backoff: e.target.value } 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="exponential">Exponential Backoff</option>
          <option value="linear">Linear Backoff</option>
          <option value="fixed">Fixed Delay</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-2">Base Delay (ms)</label>
        <input
          type="number"
          value={step.config.baseDelay || 1000}
          onChange={(e) => onUpdateStep(step.id, { 
            config: { ...step.config, baseDelay: parseInt(e.target.value) } 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          min="100"
        />
      </div>
    </>
  )
}

function CustomStepConfig({ step, onUpdateStep }: { step: Step; onUpdateStep: Function }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">JavaScript Code</label>
      <textarea
        value={step.config.code || ''}
        onChange={(e) => onUpdateStep(step.id, { 
          config: { ...step.config, code: e.target.value } 
        })}
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        rows={8}
        placeholder="// Your custom JavaScript code&#10;// Available: input, previous steps&#10;return { result: 'success' };"
      />
      <div className="mt-1 text-xs text-white">
        Return an object with the step results
      </div>
    </div>
  )
}
