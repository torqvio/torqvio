export interface HttpClientConfig {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private config: HttpClientConfig;

  constructor(config: HttpClientConfig = {}) {
    this.config = config;
  }

  async get(url: string, options?: RequestInit): Promise<Response> {
    const fullUrl = this.config.baseURL ? `${this.config.baseURL}${url}` : url;
    return fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers
      },
      ...options
    });
  }

  async post(url: string, data?: any, options?: RequestInit): Promise<Response> {
    const fullUrl = this.config.baseURL ? `${this.config.baseURL}${url}` : url;
    return fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  async put(url: string, data?: any, options?: RequestInit): Promise<Response> {
    const fullUrl = this.config.baseURL ? `${this.config.baseURL}${url}` : url;
    return fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options
    });
  }

  async delete(url: string, options?: RequestInit): Promise<Response> {
    const fullUrl = this.config.baseURL ? `${this.config.baseURL}${url}` : url;
    return fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
        ...options?.headers
      },
      ...options
    });
  }
}
