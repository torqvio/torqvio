const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

// Import types
import type { 
  Workflow, 
  WorkflowExecution, 
  User, 
  JsonObject,
  WorkflowDefinition,
  ExecutionLog
} from '@/types/api'

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

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('af_token')
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = getStoredToken()
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

  // Workflows API
  async getWorkflows() {
    return this.request<{ flows: Workflow[]; count: number }>('/api/v1/flows')
  }

  async getWorkflow(id: string) {
    return this.request<Workflow>(`/api/v1/flows/${id}`)
  }

  async createWorkflow(name: string, definition: WorkflowDefinition) {
    return this.request<{ flow: Workflow; message: string }>('/api/v1/flows', {
      method: 'POST',
      body: JSON.stringify({ name, definition }),
    })
  }

  async updateWorkflow(id: string, name?: string, definition?: WorkflowDefinition) {
    return this.request<{ flow: Workflow; message: string }>(`/api/v1/flows/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, definition }),
    })
  }

  async deleteWorkflow(id: string) {
    return this.request<{ message: string }>(`/api/v1/flows/${id}`, {
      method: 'DELETE',
    })
  }

  async executeWorkflow(id: string, payload?: JsonObject) {
    return this.request<{ execution: WorkflowExecution; message: string }>(
      `/api/v1/flows/${id}/execute`,
      {
        method: 'POST',
        body: JSON.stringify({ payload }),
      }
    )
  }

  // Executions API
  async getExecutions(params?: {
    flow_id?: string
    status?: string
    limit?: number
    offset?: number
  }) {
    const searchParams = new URLSearchParams()
    if (params?.flow_id) searchParams.append('flow_id', params.flow_id)
    if (params?.status) searchParams.append('status', params.status)
    if (params?.limit) searchParams.append('limit', params.limit.toString())
    if (params?.offset) searchParams.append('offset', params.offset.toString())

    const query = searchParams.toString()
    return this.request<{
      executions: WorkflowExecution[]
      count: number
      limit: number
      offset: number
    }>(`/api/v1/executions${query ? `?${query}` : ''}`)
  }

  async getExecution(id: string) {
    return this.request<WorkflowExecution>(`/api/v1/executions/${id}`)
  }

  async getExecutionStatus(id: string) {
    return this.request<{ status: string; timestamp: string }>(`/api/v1/executions/${id}/status`)
  }

  async getExecutionLogs(id: string) {
    return this.request<{ execution_id: string; logs: ExecutionLog[]; count: number }>(
      `/api/v1/executions/${id}/logs`
    )
  }

  async cancelExecution(id: string) {
    return this.request<{ message: string }>(`/api/v1/executions/${id}/cancel`, {
      method: 'POST',
    })
  }

  async retryExecution(id: string) {
    return this.request<{ execution: WorkflowExecution; message: string }>(
      `/api/v1/executions/${id}/retry`,
      {
        method: 'POST',
      }
    )
  }

  // Auth
  async login(email: string, password: string) {
    return this.request<{ token: string; user: User }>('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async register(email: string, password: string, name: string) {
    return this.request<{ token: string; user: User }>('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    })
  }

  async getMe() {
    return this.request<{ user: User }>('/api/v1/auth/me')
  }

  // Health check
  async healthCheck() {
    return this.request<{ status: string; timestamp: string; database: string }>(
      '/health'
    )
  }
}

export const apiClient = new ApiClient()
export type { ApiError }
