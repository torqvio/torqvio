import { Queue, QueueMessage } from './types'

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class QueuesApi {
  private baseUrl: string

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = typeof window !== 'undefined' ? localStorage.getItem('af_token') : null
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new ApiError(
          data.message || `HTTP error! status: ${response.status}`,
          response.status,
          data
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      )
    }
  }

  // Queues endpoints
  async getQueues() {
    return this.request<{ queues: Queue[]; count: number }>('/api/v1/queues')
  }

  async getQueue(id: string) {
    return this.request<Queue>(`/api/v1/queues/${id}`)
  }

  async createQueue(data: Omit<Queue, 'id' | 'createdAt' | 'lastActivity'>) {
    return this.request<{ queue: Queue; message: string }>('/api/v1/queues', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateQueue(id: string, updates: Partial<Queue>) {
    return this.request<{ queue: Queue; message: string }>(`/api/v1/queues/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async deleteQueue(id: string) {
    return this.request<{ message: string }>(`/api/v1/queues/${id}`, {
      method: 'DELETE',
    })
  }

  async pauseQueue(id: string) {
    return this.request<{ queue: Queue; message: string }>(`/api/v1/queues/${id}/pause`, {
      method: 'POST',
    })
  }

  async resumeQueue(id: string) {
    return this.request<{ queue: Queue; message: string }>(`/api/v1/queues/${id}/resume`, {
      method: 'POST',
    })
  }

  // Messages endpoints
  async getMessages(params?: {
    queue_id?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.queue_id) searchParams.append('queue_id', params.queue_id)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{
      messages: QueueMessage[]
      count: number
      limit: number
      offset: number
    }>(`/api/v1/queues/messages${query ? `?${query}` : ''}`)
  }

  async getMessage(id: string) {
    return this.request<QueueMessage>(`/api/v1/queues/messages/${id}`)
  }

  async retryMessage(id: string) {
    return this.request<{ message: QueueMessage; response: string }>(
      `/api/v1/queues/messages/${id}/retry`,
      {
        method: 'POST',
      }
    )
  }

  async deleteMessage(id: string) {
    return this.request<{ response: string }>(`/api/v1/queues/messages/${id}`, {
      method: 'DELETE',
    })
  }

  // Metrics endpoints
  async getQueueMetrics(id?: string) {
    const endpoint = id ? `/api/v1/queues/${id}/metrics` : '/api/v1/queues/metrics'
    return this.request<{
      totalQueues: number
      activeQueues: number
      pausedQueues: number
      errorQueues: number
      totalMessages: number
      processedMessages: number
      failedMessages: number
      avgProcessingTime: number
    }>(endpoint)
  }
}

export const queuesApi = new QueuesApi()
