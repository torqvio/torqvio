'use client'

import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BarChart, Bar, XAxis, ResponsiveContainer, Tooltip } from 'recharts'
import Link from 'next/link'

interface MetricCardData {
  title: string
  href: string
  total: string
  data: { label: string; value: number }[]
}

interface MetricsCarouselProps {
  metrics: MetricCardData[]
  timeRange: '24H' | '7D' | '30D'
  onTimeRangeChange: (range: '24H' | '7D' | '30D') => void
}

function MetricChartCard({ metric }: { metric: MetricCardData }) {
  return (
    <div className="min-w-[280px] flex-shrink-0 snap-start">
      <div className="rounded-lg border border-border bg-surface p-5 hover:bg-surface-light transition-colors h-full">
        <div className="flex items-center justify-between mb-1">
          <Link
            href={metric.href}
            className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            {metric.title}
          </Link>
        </div>
        <div className="text-2xl font-bold text-text-primary mb-4">{metric.total}</div>
        <div className="h-[100px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metric.data} barSize={8}>
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 10 }}
                interval="preserveStartEnd"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A1F2E',
                  border: '1px solid #2A3142',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#FFFFFF' }}
                itemStyle={{ color: '#9CA3AF' }}
                cursor={{ fill: 'rgba(108, 92, 231, 0.1)' }}
              />
              <Bar dataKey="value" fill="#6C5CE7" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export function MetricsCarousel({ metrics, timeRange, onTimeRangeChange }: MetricsCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const timeRanges: ('24H' | '7D' | '30D')[] = ['24H', '7D', '30D']

  const checkScroll = () => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setCanScrollLeft(scrollLeft > 0)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
  }

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const scrollAmount = 300
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
    setTimeout(checkScroll, 350)
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Execution Metrics</h2>
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-surface rounded-lg p-0.5 border border-border">
            {timeRanges.map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          {/* Scroll Arrows */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-md border border-border hover:bg-surface-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-md border border-border hover:bg-surface-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {metrics.map((metric, index) => (
          <MetricChartCard key={index} metric={metric} />
        ))}
      </div>
    </div>
  )
}
