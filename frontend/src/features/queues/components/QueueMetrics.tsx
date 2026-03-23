'use client'

import { CheckCircle, Pause, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Queue, QueueStats } from '../types'

interface QueueMetricsProps {
  queues: Queue[]
  stats: QueueStats
}

export function QueueMetrics({ queues, stats }: QueueMetricsProps) {
  const getQueueStatusIcon = (status: Queue['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'paused': return <Pause className="w-4 h-4 text-yellow-400" />
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {queues.map((queue) => (
        <Card key={queue.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{queue.name}</CardTitle>
              {getQueueStatusIcon(queue.status)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{queue.type}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Size</span>
                <span>{queue.currentSize.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Processed</span>
                <span>{queue.processedCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Failed</span>
                <span className="text-destructive">{queue.failedCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Processing Time</span>
                <span>{queue.avgProcessingTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Consumers</span>
                <span>{queue.consumers}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
