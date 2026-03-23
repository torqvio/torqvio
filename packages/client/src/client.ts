import axios, { AxiosInstance, AxiosError } from 'axios';
import { io, Socket } from 'socket.io-client';
import { TorqvioEventEmitter } from './events.js';
import type {
  TorqvioClientConfig,
  Workflow,
  WorkflowExecution,
  WorkflowEvent,
  CreateWorkflowRequest,
  ExecuteWorkflowRequest,
  ApiResponse,
  ListWorkflowsResponse,
  ListExecutionsResponse,
  WorkflowStatus
} from './types.js';

export class TorqvioClient {
  private config: Required<TorqvioClientConfig>;
  private httpClient: AxiosInstance;
  private socket?: Socket;
  private eventEmitter: TorqvioEventEmitter;

  constructor(config: TorqvioClientConfig) {
    // Simple environment-based URL detection
    const getBaseUrl = (): string => {
      if (config.baseUrl) return config.baseUrl;
      
      // Check environment variables
      if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env) {
        const env = (globalThis as any).process.env;
        return env.API_URL || env.NEXT_PUBLIC_API_URL || 
               (env.NODE_ENV === 'production' ? 'https://api.torqvio.com' : 'http://localhost:8459');
      }
      
      // Browser/Next.js environment
      if (typeof window !== 'undefined' && (window as any).__NEXT_DATA__?.env?.NEXT_PUBLIC_API_URL) {
        return (window as any).__NEXT_DATA__.env.NEXT_PUBLIC_API_URL;
      }
      
      // Default fallback
      return 'https://api.torqvio.com';
    };

    this.config = {
      baseUrl: getBaseUrl(),
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      enableEvents: config.enableEvents ?? true,
      apiKey: config.apiKey
    };

    this.httpClient = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    this.eventEmitter = new TorqvioEventEmitter();

    if (this.config.enableEvents) {
      this.initializeEventSocket();
    }

    this.setupRequestInterceptors();
  }

  private setupRequestInterceptors(): void {
    this.httpClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && originalRequest && !originalRequest.headers['x-retry']) {
          originalRequest.headers['x-retry'] = 'true';
          return this.httpClient(originalRequest);
        }
        
        throw error;
      }
    );
  }

  private initializeEventSocket(): void {
    try {
      this.socket = io(`${this.config.baseUrl}`, {
        auth: {
          apiKey: this.config.apiKey
        },
        transports: ['websocket']
      });

      this.socket.on('workflow.event', (event: WorkflowEvent) => {
        this.eventEmitter.emitWorkflowEvent(event);
      });

      this.socket.on('connect', () => {
        console.log('Connected to Torqvio event stream');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from Torqvio event stream');
      });

      this.socket.on('error', (error) => {
        console.error('Socket error:', error);
      });

    } catch (error) {
      console.warn('Failed to initialize event socket:', error);
    }
  }

  get events() {
    return this.eventEmitter;
  }

  // Workflow Management
  async workflows(): Promise<WorkflowManager> {
    return new WorkflowManager(this.httpClient);
  }

  // Execution Management
  async executions(): Promise<ExecutionManager> {
    return new ExecutionManager(this.httpClient);
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data.status === 'ok';
    } catch {
      return false;
    }
  }

  // Close connection
  close(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }
}

export class WorkflowManager {
  constructor(private httpClient: AxiosInstance) {}

  async create(data: CreateWorkflowRequest): Promise<Workflow> {
    const response = await this.httpClient.post<ApiResponse<Workflow>>('/workflows', data);
    return response.data.data!;
  }

  async list(options: { page?: number; limit?: number } = {}): Promise<ListWorkflowsResponse> {
    const response = await this.httpClient.get<ApiResponse<ListWorkflowsResponse>>('/workflows', {
      params: options
    });
    return response.data.data!;
  }

  async get(id: string): Promise<Workflow> {
    const response = await this.httpClient.get<ApiResponse<Workflow>>(`/workflows/${id}`);
    return response.data.data!;
  }

  async update(id: string, data: Partial<CreateWorkflowRequest>): Promise<Workflow> {
    const response = await this.httpClient.put<ApiResponse<Workflow>>(`/workflows/${id}`, data);
    return response.data.data!;
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/workflows/${id}`);
  }

  async trigger(id: string, payload: ExecuteWorkflowRequest): Promise<WorkflowExecution> {
    const response = await this.httpClient.post<ApiResponse<WorkflowExecution>>(`/workflows/${id}/trigger`, payload);
    return response.data.data!;
  }
}

export class ExecutionManager {
  constructor(private httpClient: AxiosInstance) {}

  async list(options: { page?: number; limit?: number; workflow_id?: string } = {}): Promise<ListExecutionsResponse> {
    const response = await this.httpClient.get<ApiResponse<ListExecutionsResponse>>('/executions', {
      params: options
    });
    return response.data.data!;
  }

  async get(id: string): Promise<WorkflowExecution> {
    const response = await this.httpClient.get<ApiResponse<WorkflowExecution>>(`/executions/${id}`);
    return response.data.data!;
  }

  async getStatus(id: string): Promise<WorkflowStatus> {
    const response = await this.httpClient.get<ApiResponse<{ status: WorkflowStatus }>>(`/executions/${id}/status`);
    return response.data.data!.status;
  }

  async getLogs(id: string): Promise<string[]> {
    const response = await this.httpClient.get<ApiResponse<{ logs: string[] }>>(`/executions/${id}/logs`);
    return response.data.data!.logs;
  }

  async cancel(id: string): Promise<void> {
    await this.httpClient.post(`/executions/${id}/cancel`);
  }

  async retry(id: string): Promise<WorkflowExecution> {
    const response = await this.httpClient.post<ApiResponse<WorkflowExecution>>(`/executions/${id}/retry`);
    return response.data.data!;
  }
}
