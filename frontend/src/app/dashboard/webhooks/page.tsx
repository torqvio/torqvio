'use client'

import { useState } from 'react'
import { Plus, Search, Copy, Trash2, Eye, Brain, AlertTriangle, TrendingUp, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EmptyState from '@/components/ui/empty-state'

interface EventAnomaly {
  id: string
  type: 'spike' | 'pattern' | 'unusual'
  severity: 'high' | 'medium' | 'low'
  title: string
  description: string
  metric: string
  value: string
  normal: string
  confidence: number
  suggestedAction: string
  webhookId: string
}

interface EventStream {
  id: string
  name: string
  url: string
  status: 'active' | 'paused' | 'warning'
  lastEvent: string
  totalEvents: number
  eventsPerHour: number
  anomalyCount: number
  healthScore: number
}

const EVENT_ANOMALIES: EventAnomaly[] = [
  {
    id: 'anom_001',
    type: 'spike',
    severity: 'high',
    title: 'Stripe Events Increased 240%',
    description: 'Unusual spike in payment events suggests potential fraud or system issue.',
    metric: 'Events/hour',
    value: '1,247',
    normal: '~520',
    confidence: 96,
    suggestedAction: 'Create fraud monitoring workflow',
    webhookId: 'wh_001'
  },
  {
    id: 'anom_002',
    type: 'pattern',
    severity: 'medium',
    title: 'Data Sync Pattern Disruption',
    description: 'Regular data sync pattern broken - possible integration issue.',
    metric: 'Frequency',
    value: 'Every 45 min',
    normal: 'Every 30 min',
    confidence: 82,
    suggestedAction: 'Investigate API latency',
    webhookId: 'wh_002'
  },
  {
    id: 'anom_003',
    type: 'unusual',
    severity: 'low',
    title: 'Email Event Quiet Period',
    description: 'Unusual drop in email events - check campaign status.',
    metric: 'Events/hour',
    value: '12',
    normal: '~85',
    confidence: 78,
    suggestedAction: 'Verify email service status',
    webhookId: 'wh_003'
  }
]

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<EventStream[]>([
    {
      id: 'wh_001',
      name: 'User Events',
      url: 'https://api.torqvio.com/webhooks/user-events',
      status: 'warning',
      lastEvent: '2 minutes ago',
      totalEvents: 1247,
      eventsPerHour: 1247,
      anomalyCount: 2,
      healthScore: 72
    },
    {
      id: 'wh_002',
      name: 'Data Events',
      url: 'https://api.torqvio.com/webhooks/data',
      status: 'active',
      lastEvent: '15 minutes ago',
      totalEvents: 892,
      eventsPerHour: 89,
      anomalyCount: 1,
      healthScore: 88
    },
    {
      id: 'wh_003',
      name: 'Email Events',
      url: 'https://api.torqvio.com/webhooks/emails',
      status: 'warning',
      lastEvent: '1 hour ago',
      totalEvents: 456,
      eventsPerHour: 12,
      anomalyCount: 1,
      healthScore: 65
    },
  ])
  
  const [showIntelligence, setShowIntelligence] = useState(true)
  const [anomalies] = useState<EventAnomaly[]>(EVENT_ANOMALIES)

  const handleCreateWorkflow = (anomalyId: string) => {
    const anomaly = anomalies.find(a => a.id === anomalyId)
    if (!anomaly) return
    
    // In real app, this would trigger workflow creation
    console.log('Creating workflow for:', anomaly.title)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'status-success'
      case 'warning': return 'status-warning'
      case 'paused': return 'status-running'
      default: return 'status-muted'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/30'
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'low': return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Event Stream Brain</h1>
          <p className="text-text-secondary">Intelligent webhook monitoring with anomaly detection</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Intelligence Toggle */}
          <button
            onClick={() => setShowIntelligence(!showIntelligence)}
            className={`flex items-center gap-1.5 h-8 px-3 text-xs rounded-md transition-colors ${
              showIntelligence 
                ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-400 border border-purple-500/30' 
                : 'bg-surface border border-border text-text-muted hover:text-text-secondary'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Event Intelligence</span>
            {anomalies.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            )}
          </button>
          
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Endpoint
          </Button>
        </div>
      </div>

      {/* Event Intelligence Panel */}
      {showIntelligence && anomalies.length > 0 && (
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Event Stream Intelligence</span>
              <span className="text-xs text-gray-400">{anomalies.length} anomaly{anomalies.length > 1 ? 's' : ''} detected</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {anomalies.slice(0, 3).map((anomaly) => (
              <div key={anomaly.id} className="flex items-start gap-3 p-3 rounded bg-[#1A1F2E]/50 border border-gray-700/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className={`w-4 h-4 ${
                      anomaly.severity === 'high' ? 'text-red-400' :
                      anomaly.severity === 'medium' ? 'text-yellow-400' : 'text-blue-400'
                    }`} />
                    <span className="text-sm font-medium text-white">{anomaly.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(anomaly.severity)}`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-400 mb-2">{anomaly.description}</p>
                  
                  <div className="flex items-center gap-4 mb-2">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 text-red-400" />
                      <span className="text-xs text-gray-300">{anomaly.metric}: <span className="text-red-400 font-mono">{anomaly.value}</span> (normal: <span className="text-gray-500 font-mono">{anomaly.normal}</span>)</span>
                    </div>
                    <span className="text-xs text-gray-400">{anomaly.confidence}% confidence</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-purple-400">{anomaly.suggestedAction}</p>
                    <button
                      onClick={() => handleCreateWorkflow(anomaly.id)}
                      className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Create Workflow
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search event streams..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-md text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {webhooks.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-text-secondary">Name</th>
                    <th className="text-left p-4 font-medium text-text-secondary">URL</th>
                    <th className="text-left p-4 font-medium text-text-secondary">Status</th>
                    <th className="text-left p-4 font-medium text-text-secondary">Health</th>
                    <th className="text-left p-4 font-medium text-text-secondary">Events/Hour</th>
                    <th className="text-left p-4 font-medium text-text-secondary">Anomalies</th>
                    <th className="text-left p-4 font-medium text-text-secondary">Last Event</th>
                    <th className="text-left p-4 font-medium text-text-secondary">Total Events</th>
                    <th className="text-left p-4 font-medium text-text-secondary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((webhook) => (
                    <tr key={webhook.id} className="border-b border-border hover:bg-surface-light">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-text-primary">{webhook.name}</p>
                          <p className="text-sm text-text-secondary font-mono">{webhook.id}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-text-primary font-mono truncate max-w-xs">
                          {webhook.url}
                        </p>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs ${getStatusColor(webhook.status)}`}>
                          {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                webhook.healthScore >= 80 ? 'bg-green-500' :
                                webhook.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${webhook.healthScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 font-mono">{webhook.healthScore}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-text-primary font-mono">{webhook.eventsPerHour}</span>
                      </td>
                      <td className="p-4">
                        {webhook.anomalyCount > 0 ? (
                          <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
                            {webhook.anomalyCount} alert{webhook.anomalyCount > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-xs text-green-400">Clean</span>
                        )}
                      </td>
                      <td className="p-4 text-text-secondary">{webhook.lastEvent}</td>
                      <td className="p-4 text-text-secondary">{webhook.totalEvents.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-error">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          title="No event streams yet"
          description="Create your first webhook endpoint to start receiving intelligent event monitoring"
          actionText="Create Event Stream"
          actionHref="/dashboard/webhooks/new"
        />
      )}
    </div>
  )
}
