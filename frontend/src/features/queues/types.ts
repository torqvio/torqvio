export interface Queue {
  id: string
  name: string
  description?: string
  status: 'active' | 'paused' | 'error'
  type: 'fifo' | 'priority' | 'delayed'
  maxSize: number
  currentSize: number
  processedCount: number
  failedCount: number
  avgProcessingTime: string
  createdAt: string
  lastActivity: string
  consumers: number
  priorityLevels?: number
  delaySeconds?: number
}

export interface QueueMessage {
  id: string
  queueId: string
  payload: Record<string, unknown>
  status: 'pending' | 'processing' | 'completed' | 'failed'
  priority?: number
  attempts: number
  maxAttempts: number
  createdAt: string
  scheduledAt?: string
  processedAt?: string
  error?: string
}

export type QueueTab = 'queues' | 'messages' | 'metrics'
export type QueueStatusFilter = 'all' | 'active' | 'paused' | 'error'
export type QueueTypeFilter = 'all' | 'fifo' | 'priority' | 'delayed'
export type MessageStatusFilter = 'all' | 'pending' | 'processing' | 'completed' | 'failed'

export interface QueueStats {
  total: number
  active: number
  paused: number
  error: number
  totalMessages: number
}

export interface QueueAction {
  action: string
  queueId: string
}

export interface MessageAction {
  action: string
  messageId: string
}
