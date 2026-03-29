// API utility for consistent backend communication
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  }

  // Add auth token if available
  const token = typeof window !== 'undefined' ? localStorage.getItem('af_access_token') : null
  if (token) {
    (defaultHeaders as any)['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new ApiError(`API request failed: ${response.statusText}`, response.status)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Billing API endpoints
export const billingApi = {
  getPlans: () => apiRequest('/api/v1/billing/plans'),
  getCurrentPlan: () => apiRequest('/api/v1/billing/current'),
  getAddOns: () => apiRequest('/api/v1/billing/addons'),
  subscribe: (planId: string) => apiRequest('/api/v1/billing/subscribe', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  }),
  getUsage: () => apiRequest('/api/v1/billing/usage'),
}

export { ApiError }
