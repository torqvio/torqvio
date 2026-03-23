'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')

  const executionData = [
    { date: 'Mon', executions: 240, failures: 4 },
    { date: 'Tue', executions: 320, failures: 6 },
    { date: 'Wed', executions: 280, failures: 3 },
    { date: 'Thu', executions: 390, failures: 8 },
    { date: 'Fri', executions: 420, failures: 5 },
    { date: 'Sat', executions: 180, failures: 2 },
    { date: 'Sun', executions: 150, failures: 1 },
  ]

  const failureData = [
    { workflow: 'User Onboarding', failures: 12, rate: 2.3, executions: 342, duration: 2.1, lastRun: 15 },
    { workflow: 'Data Processing', failures: 8, rate: 0.9, executions: 528, duration: 1.8, lastRun: 42 },
    { workflow: 'Email Campaign', failures: 15, rate: 3.2, executions: 256, duration: 2.5, lastRun: 8 },
    { workflow: 'Data Sync', failures: 3, rate: 0.5, executions: 189, duration: 1.2, lastRun: 31 },
    { workflow: 'Reports', failures: 7, rate: 1.8, executions: 445, duration: 3.1, lastRun: 55 },
  ]

  const metrics = [
    {
      title: 'Total Executions',
      value: '1,980',
      change: '+12%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      title: 'Success Rate',
      value: '98.5%',
      change: '+0.3%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      title: 'Avg Duration',
      value: '2.1s',
      change: '-15%',
      changeType: 'positive',
      icon: TrendingDown,
    },
    {
      title: 'Failed Executions',
      value: '29',
      change: '-8%',
      changeType: 'positive',
      icon: BarChart3,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-gray-400">Monitor workflow performance and metrics</p>
        </div>
        
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">
                    {metric.value}
                  </p>
                  <p className="text-sm text-green-400 mt-1">
                    {metric.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-900/20 rounded-full flex items-center justify-center">
                  <metric.icon className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Executions Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={executionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2E', 
                    border: '1px solid #2A3142',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="executions" 
                  stroke="#6C5CE7" 
                  strokeWidth={2}
                  dot={{ fill: '#6C5CE7' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="failures" 
                  stroke="#FF4D4F" 
                  strokeWidth={2}
                  dot={{ fill: '#FF4D4F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failure Rate by Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={failureData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
                <XAxis dataKey="workflow" stroke="#9CA3AF" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1A1F2E', 
                    border: '1px solid #2A3142',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="failures" fill="#FF4D4F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left p-4 font-medium text-gray-400">Workflow</th>
                  <th className="text-left p-4 font-medium text-gray-400">Executions</th>
                  <th className="text-left p-4 font-medium text-gray-400">Success Rate</th>
                  <th className="text-left p-4 font-medium text-gray-400">Avg Duration</th>
                  <th className="text-left p-4 font-medium text-gray-400">Last Run</th>
                </tr>
              </thead>
              <tbody>
                {failureData.map((workflow) => (
                  <tr key={workflow.workflow} className="border-b border-gray-700 hover:bg-gray-800">
                    <td className="p-4 font-medium text-white">{workflow.workflow}</td>
                    <td className="p-4 text-gray-400">{workflow.executions}</td>
                    <td className="p-4">
                      <span className="bg-green-900/20 text-green-400 px-2 py-1 rounded text-sm font-medium">{(100 - workflow.rate).toFixed(1)}%</span>
                    </td>
                    <td className="p-4 text-gray-400">{workflow.duration}s</td>
                    <td className="p-4 text-gray-400">{workflow.lastRun} min ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
