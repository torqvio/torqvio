'use client'

import { useState } from 'react'
import { Plus, Search, Copy, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import EmptyState from '@/components/ui/empty-state'

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState([
    {
      id: 'wh_001',
      name: 'User Events',
      url: 'https://api.torqvio.com/webhooks/user-events',
      status: 'active',
      lastEvent: '2 minutes ago',
      totalEvents: 1247,
    },
    {
      id: 'wh_002',
      name: 'Data Events',
      url: 'https://api.torqvio.com/webhooks/data',
      status: 'active',
      lastEvent: '15 minutes ago',
      totalEvents: 892,
    },
    {
      id: 'wh_003',
      name: 'Email Events',
      url: 'https://api.torqvio.com/webhooks/emails',
      status: 'paused',
      lastEvent: '1 hour ago',
      totalEvents: 456,
    },
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Webhooks</h1>
          <p className="text-text-secondary">Manage webhook endpoints and event delivery</p>
        </div>
        
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Endpoint
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted w-4 h-4" />
          <input
            type="text"
            placeholder="Search webhooks..."
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
                        <span className={`text-xs ${
                          webhook.status === 'active' ? 'status-success' : 'status-running'
                        }`}>
                          {webhook.status.charAt(0).toUpperCase() + webhook.status.slice(1)}
                        </span>
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
          title="No webhooks yet"
          description="Create your first webhook endpoint to start receiving events"
          actionText="Create Webhook"
          actionHref="/dashboard/webhooks/new"
        />
      )}
    </div>
  )
}
