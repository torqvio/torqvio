'use client'

import { cn } from '@/lib/utils'
import type { Schedule } from './ScheduleTable'

interface ScheduleCalendarProps {
  schedules: Schedule[]
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const HOURS = [0, 3, 6, 9, 12, 15, 18, 21]
const HOUR_LABELS: Record<number, string> = {
  0: '12 AM',
  3: '3 AM',
  6: '6 AM',
  9: '9 AM',
  12: '12 PM',
  15: '3 PM',
  18: '6 PM',
  21: '9 PM',
}

// Maps a schedule's cron expression to the day+hour slots it occupies
// Returns a set of "day:hour" strings (day 0=Mon, ..., 6=Sun)
function getScheduleSlots(s: Schedule): { day: number; hour: number }[] {
  const cron = s.cronExpression
  const parts = cron.trim().split(/\s+/)
  // cron: minute hour dayOfMonth month dayOfWeek
  if (parts.length < 5) return []

  const minutePart = parts[0]
  const hourPart = parts[1]
  const dowPart = parts[4]

  const slots: { day: number; hour: number }[] = []

  // Resolve hours
  const resolvedHours: number[] = []
  if (hourPart === '*') {
    // runs every hour — show on all hour rows
    HOURS.forEach((h) => resolvedHours.push(h))
  } else if (hourPart.match(/^\d+$/)) {
    const h = parseInt(hourPart, 10)
    // find nearest displayed hour bucket
    const bucket = HOURS.reduce((prev, cur) =>
      Math.abs(cur - h) < Math.abs(prev - h) ? cur : prev
    )
    resolvedHours.push(bucket)
  }

  // Resolve days of week (0=Sun,1=Mon,...,6=Sat in cron; we use Mon=0..Sun=6)
  const resolvedDays: number[] = []
  if (dowPart === '*') {
    // every day
    for (let d = 0; d < 7; d++) resolvedDays.push(d)
  } else if (dowPart === '0') {
    // Sunday = index 6 in our Mon-Sun display
    resolvedDays.push(6)
  } else if (dowPart === '1') {
    resolvedDays.push(0) // Monday
  } else if (dowPart.includes('-')) {
    // range like 1-5 (Mon-Fri)
    const [start, end] = dowPart.split('-').map(Number)
    for (let d = start; d <= end; d++) {
      // cron: 1=Mon..5=Fri -> our: 0=Mon..4=Fri
      resolvedDays.push(d - 1)
    }
  } else if (dowPart.includes(',')) {
    dowPart.split(',').forEach((d) => {
      const di = parseInt(d, 10)
      resolvedDays.push(di === 0 ? 6 : di - 1)
    })
  }

  // If minute part is a step (*/15, */30) and hour is *, mark all hour rows
  const isFrequent = minutePart.startsWith('*/')

  if (isFrequent) {
    // Show in every displayed hour for every resolved day
    for (const day of resolvedDays) {
      for (const hour of HOURS) {
        slots.push({ day, hour })
      }
    }
  } else {
    for (const day of resolvedDays) {
      for (const hour of resolvedHours) {
        slots.push({ day, hour })
      }
    }
  }

  return slots
}

export function ScheduleCalendar({ schedules: rawSchedules }: ScheduleCalendarProps) {
  const schedules = rawSchedules.filter((s) => s.active)

  // Build mapping: day -> hour -> Schedule[]
  const calendarData: Record<number, Record<number, Schedule[]>> = {}
  for (let d = 0; d < 7; d++) {
    calendarData[d] = {}
    for (const h of HOURS) {
      calendarData[d][h] = []
    }
  }

  for (const s of schedules) {
    const slots = getScheduleSlots(s)
    for (const { day, hour } of slots) {
      if (calendarData[day] && calendarData[day][hour] !== undefined) {
        calendarData[day][hour].push(s)
      }
    }
  }

  return (
    <div className="overflow-auto flex-1 p-4">
      <div className="min-w-[600px]">
        {/* Header row: day labels */}
        <div className="flex">
          {/* Hour label column spacer */}
          <div className="w-16 flex-shrink-0" />
          {DAYS.map((day) => (
            <div
              key={day}
              className="flex-1 text-center font-mono text-[11px] uppercase tracking-wider text-text-muted pb-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {HOURS.map((hour) => (
          <div key={hour} className="flex items-start mb-1">
            {/* Hour label */}
            <div className="w-16 flex-shrink-0 font-mono text-[11px] text-text-muted pt-1 pr-2 text-right leading-none">
              {HOUR_LABELS[hour]}
            </div>

            {/* Day cells */}
            {DAYS.map((day, dayIndex) => {
              const cellSchedules = calendarData[dayIndex][hour] ?? []
              return (
                <div
                  key={day}
                  className={cn(
                    'flex-1 min-h-[36px] border border-border/40 rounded-sm mx-0.5',
                    'w-full flex items-start justify-start p-0.5 flex-wrap gap-0.5',
                    cellSchedules.length > 0 ? 'bg-surface' : 'bg-surface/30'
                  )}
                >
                  {cellSchedules.map((s, i) => (
                    <span
                      key={`${s.id}-${i}`}
                      className="w-2 h-2 rounded-full bg-primary/60 hover:bg-primary cursor-pointer transition-colors flex-shrink-0"
                      title={`${s.workflowName} — ${HOUR_LABELS[hour]}`}
                    />
                  ))}
                </div>
              )
            })}
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-3 text-[11px] text-text-muted">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary/60 inline-block" />
            Scheduled run
          </span>
          <span className="text-text-muted/50">•</span>
          <span>Only active schedules shown</span>
        </div>
      </div>
    </div>
  )
}
