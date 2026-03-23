import { Queue, QueueMessage } from './types'

export const MOCK_QUEUES: Queue[] = [
  {
    id: 'q_001',
    name: 'email-notifications',
    description: 'High-priority email delivery queue',
    status: 'active',
    type: 'priority',
    maxSize: 10000,
    currentSize: 1247,
    processedCount: 45892,
    failedCount: 127,
    avgProcessingTime: '2.3s',
    createdAt: '3 months ago',
    lastActivity: '2 minutes ago',
    consumers: 3,
    priorityLevels: 5
  },
  {
    id: 'q_002',
    name: 'payment-processing',
    description: 'Payment webhook processing queue',
    status: 'active',
    type: 'fifo',
    maxSize: 5000,
    currentSize: 89,
    processedCount: 12458,
    failedCount: 23,
    avgProcessingTime: '1.8s',
    createdAt: '2 months ago',
    lastActivity: '45 seconds ago',
    consumers: 2
  },
  {
    id: 'q_003',
    name: 'data-sync',
    description: 'Background data synchronization tasks',
    status: 'paused',
    type: 'delayed',
    maxSize: 2000,
    currentSize: 456,
    processedCount: 8921,
    failedCount: 89,
    avgProcessingTime: '4.2s',
    createdAt: '1 month ago',
    lastActivity: '1 hour ago',
    consumers: 0,
    delaySeconds: 300
  },
  {
    id: 'q_004',
    name: 'analytics-events',
    description: 'Analytics event processing queue',
    status: 'error',
    type: 'fifo',
    maxSize: 50000,
    currentSize: 12470,
    processedCount: 234567,
    failedCount: 1247,
    avgProcessingTime: '0.8s',
    createdAt: '6 months ago',
    lastActivity: '5 minutes ago',
    consumers: 1
  },
  {
    id: 'q_005',
    name: 'cleanup-tasks',
    description: 'Periodic cleanup and maintenance tasks',
    status: 'active',
    type: 'delayed',
    maxSize: 1000,
    currentSize: 23,
    processedCount: 1247,
    failedCount: 2,
    avgProcessingTime: '12.1s',
    createdAt: '2 weeks ago',
    lastActivity: '30 minutes ago',
    consumers: 1,
    delaySeconds: 3600
  }
]

export const MOCK_MESSAGES: QueueMessage[] = [
  {
    id: 'msg_001',
    queueId: 'q_001',
    payload: { userId: 'usr_123', type: 'welcome', email: 'user@example.com' },
    status: 'pending',
    priority: 1,
    attempts: 0,
    maxAttempts: 3,
    createdAt: '30 seconds ago'
  },
  {
    id: 'msg_002',
    queueId: 'q_002',
    payload: { paymentId: 'pay_456', amount: 4999, currency: 'usd' },
    status: 'processing',
    attempts: 1,
    maxAttempts: 5,
    createdAt: '2 minutes ago',
    processedAt: '1 minute ago'
  },
  {
    id: 'msg_003',
    queueId: 'q_003',
    payload: { syncType: 'user_data', userId: 'usr_789' },
    status: 'failed',
    attempts: 3,
    maxAttempts: 3,
    createdAt: '15 minutes ago',
    error: 'Connection timeout to external service'
  },
  {
    id: 'msg_004',
    queueId: 'q_004',
    payload: { eventType: 'page_view', userId: 'usr_abc', timestamp: '2024-01-15T10:30:00Z' },
    status: 'pending',
    attempts: 0,
    maxAttempts: 3,
    createdAt: '1 minute ago'
  }
]
