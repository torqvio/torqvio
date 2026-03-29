'use client'

import { useState } from 'react'
import { BarChart3, TrendingUp, TrendingDown, Activity, Brain, AlertTriangle, Wrench, Zap, Target } from 'lucide-react'
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

interface DecisionRecommendation {
  id: string
  type: 'performance' | 'reliability' | 'cost' | 'security'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  impact: string
  confidence: number
  workflowId?: string
  workflowName?: string
  action: string
  autoFixAvailable: boolean
  estimatedEffort: string
}

const DECISION_RECOMMENDATIONS: DecisionRecommendation[] = [
  {
    id: 'rec_001',
    type: 'performance',
    severity: 'high',
    title: 'Data Processing Bottleneck Detected',
    description: 'Your data pipeline shows 45% slower performance due to API latency spikes.',
    impact: 'Reduce processing time by 45%',
    confidence: 94,
    workflowId: '2',
    workflowName: 'Data Processing Pipeline',
    action: 'Add retry buffer and cache intermediate results',
    autoFixAvailable: true,
    estimatedEffort: '5 min'
  },
  {
    id: 'rec_002',
    type: 'reliability',
    severity: 'medium',
    title: 'Email Campaign Failure Pattern',
    description: 'Email failures increase during peak hours - rate limiting detected.',
    impact: 'Increase success rate by 28%',
    confidence: 87,
    workflowId: '3',
    workflowName: 'Email Campaign',
    action: 'Implement exponential backoff and queue management',
    autoFixAvailable: true,
    estimatedEffort: '10 min'
  },
  {
    id: 'rec_003',
    type: 'cost',
    severity: 'low',
    title: 'Weekend Resource Waste',
    description: 'Reports workflow runs on weekends with minimal usage.',
    impact: 'Save 32% on weekend compute costs',
    confidence: 91,
    workflowId: '5',
    workflowName: 'Reports',
    action: 'Adjust schedule to weekdays only',
    autoFixAvailable: true,
    estimatedEffort: '2 min'
  }
]

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d')
  const [showDecisions, setShowDecisions] = useState(true)
  const [recommendations] = useState<DecisionRecommendation[]>(DECISION_RECOMMENDATIONS)

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

  const handleApplyRecommendation = (recommendationId: string) => {
    const recommendation = recommendations.find(r => r.id === recommendationId)
    if (!recommendation) return
    
    console.log('Applying recommendation:', recommendation.title)
  }

  const handleDismissRecommendation = (recommendationId: string) => {
    console.log('Dismissing recommendation:', recommendationId)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'performance': return TrendingUp
      case 'reliability': return Activity
      case 'cost': return BarChart3
      case 'security': return AlertTriangle
      default: return Target
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Decision Engine</h1>
          <p className="text-gray-400">Intelligent recommendations and auto-fix suggestions</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Decision Engine Toggle */}
          <button
            onClick={() => setShowDecisions(!showDecisions)}
            className={`flex items-center gap-1.5 h-8 px-3 text-xs rounded-md transition-colors ${
              showDecisions 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Decisions</span>
            {recommendations.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>
          
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
      </div>

      {/* Decision Intelligence Panel */}
      {showDecisions && recommendations.length > 0 && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Intelligent Recommendations</span>
              <span className="text-xs text-gray-400">{recommendations.length} action{recommendations.length > 1 ? 's' : ''} available</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {recommendations.slice(0, 3).map((recommendation) => {
              const TypeIcon = getTypeIcon(recommendation.type)
              return (
                <div key={recommendation.id} className="flex items-start gap-3 p-3 rounded bg-[#1A1F2E]/50 border border-gray-700/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <TypeIcon className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-white">{recommendation.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(recommendation.severity)}`}>
                        {recommendation.severity}
                      </span>
                      <span className="text-xs text-gray-400">{recommendation.confidence}% confidence</span>
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-2">{recommendation.description}</p>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3 text-green-400" />
                        <span className="text-xs text-green-400">{recommendation.impact}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-blue-400" />
                        <span className="text-xs text-blue-400">{recommendation.estimatedEffort}</span>
                      </div>
                      {recommendation.autoFixAvailable && (
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3 text-yellow-400" />
                          <span className="text-xs text-yellow-400">Auto-fix available</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-purple-400 mb-1">Recommended action:</p>
                        <p className="text-xs text-gray-300">{recommendation.action}</p>
                        {recommendation.workflowName && (
                          <p className="text-xs text-gray-500 mt-1">Workflow: <span className="text-white">{recommendation.workflowName}</span></p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDismissRecommendation(recommendation.id)}
                          className="px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleApplyRecommendation(recommendation.id)}
                          className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                        >
                          {recommendation.autoFixAvailable && <Zap className="w-3 h-3" />}
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

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
