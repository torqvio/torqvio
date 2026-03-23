'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { queuesApi } from '../api'
import { Queue, QueueStatusFilter, QueueTypeFilter, QueueStats, QueueAction } from '../types'

export function useQueues() {
  const [queues, setQueues] = useState<Queue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<QueueStatusFilter>('all')
  const [typeFilter, setTypeFilter] = useState<QueueTypeFilter>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  // Load queues
  const loadQueues = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await queuesApi.getQueues()
      setQueues(response.queues)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queues')
    } finally {
      setIsLoading(false)
    }
  }, [])
  
  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(loadQueues, 5000)
    return () => clearInterval(interval)
  }, [autoRefresh, loadQueues])
  
  // Initial load
  useEffect(() => {
    loadQueues()
  }, [loadQueues])
  
  // Filter queues
  const filteredQueues = useMemo(() => {
    let filtered = [...queues]
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(queue => 
        queue.name.toLowerCase().includes(query) ||
        queue.description?.toLowerCase().includes(query)
      )
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(queue => queue.status === statusFilter)
    }
    
    if (typeFilter !== 'all') {
      filtered = filtered.filter(queue => queue.type === typeFilter)
    }
    
    return filtered
  }, [queues, searchQuery, statusFilter, typeFilter])
  
  // Queue stats
  const stats = useMemo((): QueueStats => {
    const total = queues.length
    const active = queues.filter(q => q.status === 'active').length
    const paused = queues.filter(q => q.status === 'paused').length
    const error = queues.filter(q => q.status === 'error').length
    const totalMessages = queues.reduce((sum, q) => sum + q.currentSize, 0)
    
    return { total, active, paused, error, totalMessages }
  }, [queues])
  
  // Queue actions
  const handleQueueAction = useCallback(async ({ action, queueId }: QueueAction) => {
    try {
      switch (action) {
        case 'pause':
          await queuesApi.pauseQueue(queueId)
          break
        case 'resume':
          await queuesApi.resumeQueue(queueId)
          break
        case 'delete':
          await queuesApi.deleteQueue(queueId)
          break
        default:
          console.log(`Unknown action: ${action}`)
      }
      // Refresh queues after action
      await loadQueues()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} queue`)
    }
  }, [loadQueues])
  
  return {
    queues,
    filteredQueues,
    isLoading,
    error,
    stats,
    filters: {
      searchQuery,
      statusFilter,
      typeFilter,
      autoRefresh,
    },
    actions: {
      setSearchQuery,
      setStatusFilter,
      setTypeFilter,
      setAutoRefresh,
      handleQueueAction,
      refreshQueues: loadQueues,
    }
  }
}
