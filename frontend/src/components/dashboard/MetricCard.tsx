'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus, ArrowUp, ArrowDown, Activity } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  trend: 'up' | 'down' | 'stable'
  trendValue?: string
  sparklineData?: number[]
}

export function MetricCard({ title, value, trend, trendValue, sparklineData = [] }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-3 h-3" />
      case 'down': return <ArrowDown className="w-3 h-3" />
      default: return <Minus className="w-3 h-3" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'down': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getSparklineColor = () => {
    switch (trend) {
      case 'up': return '#10b981'
      case 'down': return '#ef4444'
      default: return '#6b7280'
    }
  }

  // Enhanced sparkline with gradient and area
  const renderSparkline = () => {
    if (sparklineData.length < 2) return null
    
    const width = 75
    const height = 30
    const padding = 4
    const max = Math.max(...sparklineData)
    const min = Math.min(...sparklineData)
    const range = max - min || 1
    
    const points = sparklineData.map((value, index) => {
      const x = padding + (index / (sparklineData.length - 1)) * (width - 2 * padding)
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    }).join(' ')

    const color = getSparklineColor()
    const gradientId = `gradient-${title.replace(/\s+/g, '-').toLowerCase()}`

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" style={{ margin: '0' }}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.05" />
          </linearGradient>
        </defs>
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Add area fill */}
        <polyline
          points={`${points} ${width - padding},${height} ${padding},${height}`}
          fill={`url(#${gradientId})`}
          stroke="none"
        />
      </svg>
    )
  }

  return (
    <Card className="group relative overflow-hidden bg-surface border border-border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="relative !p-6 !pt-6">
        {/* Header with title and sparkline */}
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wide">{title}</h3>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-text-muted" />
              <span className="text-xs text-text-muted">Live data</span>
            </div>
          </div>
          <div className="transform transition-transform duration-300 group-hover:scale-105 flex-shrink-0">
            {renderSparkline()}
          </div>
        </div>
        
        {/* Main value */}
        <div className="space-y-3">
          <div className="flex items-baseline gap-2">
            <div className="text-3xl font-bold text-text-primary tracking-tight">{value}</div>
          </div>
          
          {/* Trend indicator */}
          {trendValue && (
            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium ${getTrendColor()}`}>
              {getTrendIcon()}
              <span>{trendValue}</span>
            </div>
          )}
        </div>

        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-30" />
      </CardContent>
    </Card>
  )
}
