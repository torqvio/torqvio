import { useState, useEffect } from 'react'
import type { Execution } from '@/types/execution'

// Real API calls to your backend
const fetchExecutions = async (): Promise<Execution[]> => {
  const response = await fetch('http://localhost:8459/api/v1/executions')
  if (!response.ok) {
    throw new Error('Failed to fetch executions')
  }
  const data = await response.json()
  return data.executions
}

const retryExecution = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:8459/api/v1/executions/${id}/retry`, {
    method: 'POST'
  })
  if (!response.ok) {
    throw new Error('Failed to retry execution')
  }
}

const cancelExecution = async (id: string): Promise<void> => {
  const response = await fetch(`http://localhost:8459/api/v1/executions/${id}/cancel`, {
    method: 'POST'
  })
  if (!response.ok) {
    throw new Error('Failed to cancel execution')
  }
}

export function useExecutions() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadExecutions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchExecutions()
      setExecutions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load executions')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = async (id: string) => {
    try {
      await retryExecution(id)
      await loadExecutions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry execution')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelExecution(id)
      await loadExecutions() // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel execution')
    }
  }

  useEffect(() => {
    loadExecutions()
  }, [])

  return {
    executions,
    loading,
    error,
    retry: handleRetry,
    cancel: handleCancel,
    refresh: loadExecutions,
  }
}
