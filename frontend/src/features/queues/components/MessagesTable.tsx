'use client'

import { Eye, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { QueueMessage } from '../types'
import { MOCK_QUEUES } from '../mock-data'

interface MessagesTableProps {
  messages: QueueMessage[]
  onMessageAction: (action: string, messageId: string) => void
  onShowMessageDetails: (messageId: string) => void
}

export function MessagesTable({ messages, onMessageAction, onShowMessageDetails }: MessagesTableProps) {
  const getMessageStatusColor = (status: QueueMessage['status']) => {
    switch (status) {
      case 'pending': return 'text-blue-400 bg-blue-400/10'
      case 'processing': return 'text-yellow-400 bg-yellow-400/10'
      case 'completed': return 'text-green-400 bg-green-400/10'
      case 'failed': return 'text-red-400 bg-red-400/10'
    }
  }

  if (messages.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <div className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No messages found</h3>
        <p className="text-muted-foreground">No messages match the current filters</p>
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
                <th className="text-left p-4 font-medium text-muted-foreground">Message ID</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Queue</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Priority</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Attempts</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Created</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Payload Preview</th>
                <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => {
                const queue = MOCK_QUEUES.find(q => q.id === message.queueId)
                return (
                  <tr key={message.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <p className="font-mono text-sm">{message.id}</p>
                    </td>
                    <td className="p-4">
                      <p>{queue?.name || 'Unknown'}</p>
                    </td>
                    <td className="p-4">
                      <div className={cn('px-2 py-1 rounded-md text-xs font-medium', getMessageStatusColor(message.status))}>
                        <span className="capitalize">{message.status}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {message.priority !== undefined ? (
                        <span className="px-2 py-1 bg-muted rounded-md text-xs font-medium">
                          P{message.priority}
                        </span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p>{message.attempts}</p>
                        <p className="text-muted">/ {message.maxAttempts}</p>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{message.createdAt}</td>
                    <td className="p-4">
                      <p className="text-sm font-mono max-w-xs truncate">
                        {JSON.stringify(message.payload).substring(0, 100)}...
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onShowMessageDetails(message.id)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {message.status === 'failed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onMessageAction('retry', message.id)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
