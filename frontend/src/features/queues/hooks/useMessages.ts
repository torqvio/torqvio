'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { queuesApi } from '../api'
import { QueueMessage, MessageStatusFilter, MessageAction } from '../types'

export function useMessages() {
  const [messages, setMessages] = useState<QueueMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedQueueId, setSelectedQueueId] = useState<string>('')
  const [messageStatusFilter, setMessageStatusFilter] = useState<MessageStatusFilter>('all')
  const [messageSearch, setMessageSearch] = useState('')
  
  // Load messages
  const loadMessages = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const params: any = {}
      if (selectedQueueId) params.queue_id = selectedQueueId
      if (messageStatusFilter !== 'all') params.status = messageStatusFilter
      params.limit = 100 // Default limit
      
      const response = await queuesApi.getMessages(params)
      setMessages(response.messages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [selectedQueueId, messageStatusFilter])
  
  // Initial load and filter changes
  useEffect(() => {
    loadMessages()
  }, [loadMessages])
  
  // Filter messages
  const filteredMessages = useMemo(() => {
    let filtered = [...messages]
    
    if (messageSearch.trim()) {
      const query = messageSearch.toLowerCase()
      filtered = filtered.filter(msg => 
        JSON.stringify(msg.payload).toLowerCase().includes(query) ||
        msg.id.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [messages, messageSearch])
  
  // Message actions
  const handleMessageAction = useCallback(async ({ action, messageId }: MessageAction) => {
    try {
      switch (action) {
        case 'retry':
          await queuesApi.retryMessage(messageId)
          break
        case 'delete':
          await queuesApi.deleteMessage(messageId)
          break
        default:
          console.log(`Unknown action: ${action}`)
      }
      // Refresh messages after action
      await loadMessages()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} message`)
    }
  }, [loadMessages])
  
  return {
    messages,
    filteredMessages,
    isLoading,
    error,
    filters: {
      selectedQueueId,
      messageStatusFilter,
      messageSearch,
    },
    actions: {
      setSelectedQueueId,
      setMessageStatusFilter,
      setMessageSearch,
      handleMessageAction,
      refreshMessages: loadMessages,
    }
  }
}
