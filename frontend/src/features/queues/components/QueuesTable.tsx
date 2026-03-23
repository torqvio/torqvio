'use client'

import { CheckCircle, Pause, Play, Trash2, Settings, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Queue } from '../types'

interface QueuesTableProps {
  queues: Queue[]
  onQueueAction: (action: string, queueId: string) => void
}

export function QueuesTable({ queues, onQueueAction }: QueuesTableProps) {
  const getQueueStatusIcon = (status: Queue['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />
    }
  }
  
  const getQueueStatusColor = (status: Queue['status']) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10'
      case 'paused': return 'text-yellow-400 bg-yellow-400/10'
      case 'error': return 'text-red-400 bg-red-400/10'
    }
  }

  if (queues.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Pause className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No queues found</h3>
        <p className="text-muted-foreground mb-4">Create your first queue to start processing background jobs</p>
        <Button onClick={() => onQueueAction('create', '')}>
          Create Queue
        </Button>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 font-medium text-muted-foreground">Queue</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Type</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Size</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Processed</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Failed</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Consumers</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Avg Time</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Last Activity</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {queues.map((queue) => (
                <tr key={queue.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{queue.name}</p>
                      <p className="text-sm text-muted-foreground">{queue.description}</p>
                      <p className="text-xs text-muted font-mono">{queue.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={cn('flex items-center gap-2 px-2 py-1 rounded-md text-xs font-medium', getQueueStatusColor(queue.status))}>
                      {getQueueStatusIcon(queue.status)}
                      <span className="capitalize">{queue.status}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium capitalize">
                      {queue.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="font-medium">{queue.currentSize.toLocaleString()}</p>
                      <p className="text-muted">/ {queue.maxSize.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="p-4">{queue.processedCount.toLocaleString()}</td>
                  <td className="p-4 text-destructive">{queue.failedCount.toLocaleString()}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 text-muted" />
                      <span>{queue.consumers}</span>
                    </div>
                  </td>
                  <td className="p-4">{queue.avgProcessingTime}</td>
                  <td className="p-4 text-muted-foreground">{queue.lastActivity}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {queue.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onQueueAction('pause', queue.id)}
                          className="text-yellow-600 hover:text-yellow-700"
                        >
                          <Pause className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onQueueAction('resume', queue.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQueueAction('settings', queue.id)}
                      >
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onQueueAction('delete', queue.id)}
                        className="text-destructive hover:text-destructive/90"
                      >
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
  )
}
