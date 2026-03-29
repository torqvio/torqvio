'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Search, Plus, ChevronDown, List, CalendarDays, Brain, TrendingUp, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduleTable, type Schedule } from '@/components/scheduler/ScheduleTable'
import { ScheduleCalendar } from '@/components/scheduler/ScheduleCalendar'

type StatusFilter = 'all' | 'active' | 'paused'
type ViewMode = 'table' | 'calendar'

// Seconds until next run for countdowns
function parseNextRunToSeconds(nextRunIn: string): number | null {
  if (!nextRunIn || nextRunIn === '—') return null
  const m = nextRunIn.match(/in (\d+)\s*(s|sec|min|hr|day)/)
  if (!m) return null
  const n = parseInt(m[1], 10)
  switch (m[2]) {
    case 's': case 'sec': return n
    case 'min': return n * 60
    case 'hr':  return n * 3600
    case 'day': return n * 86400
    default: return null
  }
}

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'now'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (d > 0) return `${d}d ${h}h`
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

// Build initial countdown map from schedules
function buildCountdownMap(schedules: Schedule[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const s of schedules) {
    if (s.active) {
      const secs = parseNextRunToSeconds(s.nextRunIn)
      if (secs !== null) map[s.id] = secs
    }
  }
  return map
}

interface AutonomousSuggestion {
  id: string
  type: 'pattern' | 'optimization' | 'cost_saving'
  title: string
  description: string
  impact: string
  confidence: number
  workflowId: string
  workflowName: string
  currentSchedule: string
  suggestedSchedule: string
  estimatedSavings?: number
}

const AUTONOMOUS_SUGGESTIONS: AutonomousSuggestion[] = [
  {
    id: 'sug_001',
    type: 'pattern',
    title: 'Monday Morning Data Spike Detected',
    description: 'Your data processing workload spikes every Monday at 9 AM. We can optimize timing.',
    impact: 'Reduce execution cost by 32%',
    confidence: 94,
    workflowId: '2',
    workflowName: 'Data Processing Pipeline',
    currentSchedule: 'Every 15 min',
    suggestedSchedule: 'Mon 8:45 AM, Mon 9:15 AM, Mon 2:00 PM',
    estimatedSavings: 127
  },
  {
    id: 'sug_002',
    type: 'cost_saving',
    title: 'Weekend Backup Optimization',
    description: 'Backup jobs run during low usage periods. We can consolidate for efficiency.',
    impact: 'Save 45% on weekend compute costs',
    confidence: 87,
    workflowId: '9',
    workflowName: 'Backup Job',
    currentSchedule: 'Sun 3:00 AM',
    suggestedSchedule: 'Sun 1:00 AM (bi-weekly)',
    estimatedSavings: 89
  },
  {
    id: 'sug_003',
    type: 'pattern',
    title: 'Email Campaign Pattern Learning',
    description: 'Your campaigns perform best on Tue/Wed/Thu at 10 AM. Auto-adjust schedule?',
    impact: 'Increase engagement by 28%',
    confidence: 91,
    workflowId: '3',
    workflowName: 'Email Campaign',
    currentSchedule: 'Weekdays 10:00 AM',
    suggestedSchedule: 'Tue,Wed,Thu 10:00 AM',
    estimatedSavings: -45
  }
]

const INITIAL_SCHEDULES: Schedule[] = [
  {
    id: '1',
    workflowId: '2',
    workflowName: 'Data Processing Pipeline',
    cronExpression: '*/15 * * * *',
    humanReadable: 'Every 15 min',
    nextRunIn: 'in 3 min',
    lastRun: '12 min ago',
    lastStatus: 'success',
    active: true,
  },
  {
    id: '2',
    workflowId: '6',
    workflowName: 'Weekly Report Generator',
    cronExpression: '0 9 * * 1',
    humanReadable: 'Mon 9:00 AM',
    nextRunIn: 'in 3 day',
    lastRun: '7 days ago',
    lastStatus: 'success',
    active: true,
  },
  {
    id: '3',
    workflowId: '7',
    workflowName: 'CSV Import',
    cronExpression: '0 2 * * *',
    humanReadable: 'Daily 2:00 AM',
    nextRunIn: 'in 8 hr',
    lastRun: '16 hrs ago',
    lastStatus: 'success',
    active: true,
  },
  {
    id: '4',
    workflowId: '3',
    workflowName: 'Email Campaign',
    cronExpression: '0 10 * * 1-5',
    humanReadable: 'Weekdays 10:00 AM',
    nextRunIn: '—',
    lastRun: '2 days ago',
    lastStatus: 'failed',
    active: false,
  },
  {
    id: '5',
    workflowId: '8',
    workflowName: 'Data Sync',
    cronExpression: '*/30 * * * *',
    humanReadable: 'Every 30 min',
    nextRunIn: 'in 18 min',
    lastRun: '12 min ago',
    lastStatus: 'success',
    active: true,
  },
  {
    id: '6',
    workflowId: '9',
    workflowName: 'Backup Job',
    cronExpression: '0 3 * * 0',
    humanReadable: 'Sun 3:00 AM',
    nextRunIn: 'in 5 day',
    lastRun: '6 days ago',
    lastStatus: 'success',
    active: true,
  },
]

const STATUS_OPTIONS: { value: StatusFilter; label: string; dotClass?: string }[] = [
  { value: 'all',    label: 'All Status' },
  { value: 'active', label: 'Active', dotClass: 'bg-success' },
  { value: 'paused', label: 'Paused', dotClass: 'bg-warning' },
]

function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return
      handler()
    }
    document.addEventListener('mousedown', listener)
    return () => document.removeEventListener('mousedown', listener)
  }, [ref, handler])
}

export default function SchedulerPage() {
  const [schedules, setSchedules] = useState<Schedule[]>(INITIAL_SCHEDULES)
  const [countdowns, setCountdowns] = useState<Record<string, number>>(() => buildCountdownMap(INITIAL_SCHEDULES))
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [statusOpen, setStatusOpen] = useState(false)
  const [showIntelligence, setShowIntelligence] = useState(true)
  const [suggestions, setSuggestions] = useState<AUTONOMOUS_SUGGESTIONS>(AUTONOMOUS_SUGGESTIONS)

  const statusRef = useRef<HTMLDivElement>(null)
  useClickOutside(statusRef, () => setStatusOpen(false))

  // Live countdown ticker
  useEffect(() => {
    const id = setInterval(() => {
      setCountdowns((prev) => {
        const next = { ...prev }
        for (const key of Object.keys(next)) {
          if (next[key] > 0) next[key] -= 1
        }
        return next
      })
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const handleToggle = useCallback((id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    )
  }, [])

  const handleDelete = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id))
    setCountdowns((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }, [])

  // Inject live countdown into schedule's nextRunIn field for display
  const schedulesWithCountdown = schedules.map((s) => {
    if (!s.active || countdowns[s.id] === undefined) return s
    return { ...s, nextRunIn: `in ${formatCountdown(countdowns[s.id])}` }
  })

  const filteredSchedules = schedulesWithCountdown.filter((s) => {
    if (statusFilter === 'active' && !s.active) return false
    if (statusFilter === 'paused' && s.active) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      if (!s.workflowName.toLowerCase().includes(q) && !s.humanReadable.toLowerCase().includes(q)) {
        return false
      }
    }
    return true
  })

  const currentStatus = STATUS_OPTIONS.find((o) => o.value === statusFilter)!

  const handleApplySuggestion = useCallback((suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId)
    if (!suggestion) return
    
    // Update the schedule with the intelligent suggestion
    setSchedules(prev => prev.map(s => 
      s.workflowId === suggestion.workflowId 
        ? { ...s, humanReadable: suggestion.suggestedSchedule }
        : s
    ))
    
    // Remove the suggestion after applying
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }, [suggestions])

  const handleDismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId))
  }, [])

  return (
    <div className="flex flex-col overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border gap-3 flex-shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search schedules…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[26px] pl-8 pr-3 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>

          <div ref={statusRef} className="relative">
            <button
              onClick={() => setStatusOpen((o) => !o)}
              className="flex items-center gap-1.5 h-[26px] px-2 text-xs bg-surface border border-border rounded-md text-text-secondary hover:border-primary/40 focus:outline-none transition-colors"
            >
              {statusFilter !== 'all' && currentStatus.dotClass && (
                <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', currentStatus.dotClass)} />
              )}
              {currentStatus.label}
              <ChevronDown className={cn('w-3 h-3 text-text-muted transition-transform', statusOpen && 'rotate-180')} />
            </button>
            {statusOpen && (
              <div className="absolute top-full mt-1 left-0 z-50 w-36 bg-surface border border-border rounded-md shadow-lg py-1 text-xs">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setStatusFilter(opt.value); setStatusOpen(false) }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-surface-light transition-colors',
                      statusFilter === opt.value ? 'text-primary' : 'text-text-secondary'
                    )}
                  >
                    {opt.dotClass
                      ? <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', opt.dotClass)} />
                      : <span className="w-1.5 flex-shrink-0" />
                    }
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Intelligence Toggle */}
          <button
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={cn(
              'flex items-center gap-1.5 h-[26px] px-2 text-xs rounded-md transition-colors',
              showIntelligence 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
            )}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Intelligence</span>
            {suggestions.length > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>

          <div className="flex items-center border border-border rounded-md overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'h-[26px] px-2.5 flex items-center gap-1.5 text-xs transition-colors',
                viewMode === 'table' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                'h-[26px] px-2.5 flex items-center gap-1.5 text-xs transition-colors border-l border-border',
                viewMode === 'calendar' ? 'bg-primary/20 text-primary' : 'text-text-muted hover:text-text-secondary'
              )}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>
          </div>

          <button className="inline-flex items-center h-[30px] px-3 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New Schedule
          </button>
        </div>
      </div>

      {/* Autonomous Suggestion Bar */}
      {showIntelligence && suggestions.length > 0 && (
        <div className="mx-4 mt-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-300">Autonomous Scheduling</span>
              <span className="text-xs text-gray-400">{suggestions.length} optimization{ suggestions.length > 1 ? 's' : '' } available</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {suggestions.slice(0, 2).map((suggestion) => (
              <div key={suggestion.id} className="flex items-start gap-3 p-2 rounded bg-[#1A1F2E]/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-medium text-white">{suggestion.title}</p>
                    <span className="text-xs text-gray-400">{suggestion.confidence}% confidence</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{suggestion.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-green-400">{suggestion.impact}</span>
                    </div>
                    {suggestion.estimatedSavings && (
                      <span className="text-xs text-purple-400">
                        {suggestion.estimatedSavings > 0 ? 'Save' : 'Cost'} €{Math.abs(suggestion.estimatedSavings)}/mo
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleApplySuggestion(suggestion.id)}
                    className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => handleDismissSuggestion(suggestion.id)}
                    className="p-1 text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {viewMode === 'table' ? (
        <ScheduleTable
          schedules={filteredSchedules}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ) : (
        <ScheduleCalendar schedules={filteredSchedules} />
      )}
    </div>
  )
}
