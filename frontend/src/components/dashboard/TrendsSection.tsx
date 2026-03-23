'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const executionData = [
  { time: '00:00', executions: 45, success: 42, errors: 3 },
  { time: '04:00', executions: 38, success: 36, errors: 2 },
  { time: '08:00', executions: 62, success: 58, errors: 4 },
  { time: '12:00', executions: 71, success: 68, errors: 3 },
  { time: '16:00', executions: 58, success: 55, errors: 3 },
  { time: '20:00', executions: 49, success: 47, errors: 2 },
]

const successRateData = [
  { date: 'Mon', rate: 94 },
  { date: 'Tue', rate: 92 },
  { date: 'Wed', rate: 95 },
  { date: 'Thu', rate: 93 },
  { date: 'Fri', rate: 96 },
  { date: 'Sat', rate: 94 },
  { date: 'Sun', rate: 91 },
]

const revenueData = [
  { date: 'Week 1', revenue: 12450 },
  { date: 'Week 2', revenue: 15230 },
  { date: 'Week 3', revenue: 18920 },
  { date: 'Week 4', revenue: 22470 },
]

interface TrendsSectionProps {
  timeRange: 'day' | 'week' | 'month'
  onTimeRangeChange: (range: 'day' | 'week' | 'month') => void
}

export function TrendsSection({ timeRange, onTimeRangeChange }: TrendsSectionProps) {
  const [activeChart, setActiveChart] = useState<'executions' | 'success' | 'revenue'>('executions')

  const timeRanges = [
    { value: 'day', label: '24H' },
    { value: 'week', label: '7D' },
    { value: 'month', label: '30D' }
  ] as const

  const chartTypes = [
    { value: 'executions', label: 'Executions' },
    { value: 'success', label: 'Success Rate' },
    { value: 'revenue', label: 'Revenue' }
  ] as const

  const renderChart = () => {
    switch (activeChart) {
      case 'executions':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={executionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
              <XAxis dataKey="time" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F2E', 
                  border: '1px solid #2A3142',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Area type="monotone" dataKey="success" stackId="1" stroke="#00C896" fill="#00C896" fillOpacity={0.6} />
              <Area type="monotone" dataKey="errors" stackId="1" stroke="#FF4D4F" fill="#FF4D4F" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        )
      
      case 'success':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={successRateData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F2E', 
                  border: '1px solid #2A3142',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Line type="monotone" dataKey="rate" stroke="#00C896" strokeWidth={2} dot={{ fill: '#00C896' }} />
            </LineChart>
          </ResponsiveContainer>
        )
      
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1A1F2E', 
                  border: '1px solid #2A3142',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6C5CE7" fill="#6C5CE7" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        )
    }
  }

  return (
    <Card className="bg-surface border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-text-primary">Trends</CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Chart Type Selector */}
            <div className="flex bg-surface-light rounded-lg p-1">
              {chartTypes.map((type) => (
                <Button
                  key={type.value}
                  variant={activeChart === type.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveChart(type.value)}
                  className={`text-xs px-3 py-1 ${
                    activeChart === type.value 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {type.label}
                </Button>
              ))}
            </div>
            
            {/* Time Range Selector */}
            <div className="flex bg-surface-light rounded-lg p-1">
              {timeRanges.map((range) => (
                <Button
                  key={range.value}
                  variant={timeRange === range.value ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onTimeRangeChange(range.value)}
                  className={`text-xs px-3 py-1 ${
                    timeRange === range.value 
                      ? 'bg-primary text-white' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="mb-4">
          {renderChart()}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm font-medium text-text-secondary">Total</div>
            <div className="text-lg font-semibold text-text-primary">
              {activeChart === 'executions' && '323'}
              {activeChart === 'success' && '93.4%'}
              {activeChart === 'revenue' && '$69,070'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-text-secondary">Average</div>
            <div className="text-lg font-semibold text-text-primary">
              {activeChart === 'executions' && '54/h'}
              {activeChart === 'success' && '93.4%'}
              {activeChart === 'revenue' && '$17,268'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-text-secondary">Change</div>
            <div className="text-lg font-semibold text-success">
              {activeChart === 'executions' && '+12%'}
              {activeChart === 'success' && '+2.1%'}
              {activeChart === 'revenue' && '+18%'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
