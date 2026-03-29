import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
  retryableStatusCodes: number[];
  exponentialBase?: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedRecoveryTime: number;
  halfOpenMaxCalls: number;
}

export interface BulkheadConfig {
  maxConcurrentCalls: number;
  maxQueueSize: number;
  timeout: number;
}

export interface TimeoutConfig {
  duration: number;
  unit: 'milliseconds' | 'seconds' | 'minutes';
}

export interface ResiliencePolicy {
  id: string;
  name: string;
  description: string;
  retry?: RetryConfig;
  circuitBreaker?: CircuitBreakerConfig;
  bulkhead?: BulkheadConfig;
  timeout?: TimeoutConfig;
  fallback?: FallbackConfig;
  isActive: boolean;
  priority: number;
  appliesTo: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface FallbackConfig {
  enabled: boolean;
  strategy: 'default_value' | 'cached_value' | 'alternative_service' | 'custom_function';
  config: Record<string, any>;
}

export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  halfOpenCalls: number;
  nextAttemptTime: Date | null;
}

export interface RetryAttempt {
  attemptNumber: number;
  delay: number;
  error: Error;
  timestamp: Date;
  success: boolean;
}

export interface ResilienceMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  retryAttempts: number;
  circuitBreakerTrips: number;
  averageResponseTime: number;
  timeoutCount: number;
  fallbackActivations: number;
  lastUpdated: Date;
}

export class ResiliencePatterns {
  private db: DatabaseConnection;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private bulkheads: Map<string, BulkheadState> = new Map();
  private metrics: Map<string, ResilienceMetrics> = new Map();

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS resilience_policies (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        retry_config JSONB,
        circuit_breaker_config JSONB,
        bulkhead_config JSONB,
        timeout_config JSONB,
        fallback_config JSONB,
        is_active BOOLEAN DEFAULT true,
        priority INTEGER DEFAULT 0,
        applies_to TEXT[] DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS resilience_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        policy_id UUID REFERENCES resilience_policies(id) ON DELETE CASCADE,
        integration_id VARCHAR(255) NOT NULL,
        total_calls INTEGER DEFAULT 0,
        successful_calls INTEGER DEFAULT 0,
        failed_calls INTEGER DEFAULT 0,
        retry_attempts INTEGER DEFAULT 0,
        circuit_breaker_trips INTEGER DEFAULT 0,
        average_response_time INTEGER DEFAULT 0,
        timeout_count INTEGER DEFAULT 0,
        fallback_activations INTEGER DEFAULT 0,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(policy_id, integration_id, date)
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS circuit_breaker_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id VARCHAR(255) NOT NULL,
        old_state VARCHAR(20) NOT NULL,
        new_state VARCHAR(20) NOT NULL,
        reason TEXT,
        failure_count INTEGER,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS retry_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id VARCHAR(255) NOT NULL,
        call_id VARCHAR(255) NOT NULL,
        attempt_number INTEGER NOT NULL,
        delay_ms INTEGER NOT NULL,
        error_message TEXT,
        success BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_resilience_policies_active ON resilience_policies(is_active)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_resilience_metrics_integration_date ON resilience_metrics(integration_id, date)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_circuit_breaker_history_integration ON circuit_breaker_history(integration_id)');
  }

  async createPolicy(policy: Omit<ResiliencePolicy, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResiliencePolicy> {
    const result = await this.db.query(`
      INSERT INTO resilience_policies (
        name, description, retry_config, circuit_breaker_config, bulkhead_config,
        timeout_config, fallback_config, is_active, priority, applies_to
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      policy.name,
      policy.description,
      JSON.stringify(policy.retry),
      JSON.stringify(policy.circuitBreaker),
      JSON.stringify(policy.bulkhead),
      JSON.stringify(policy.timeout),
      JSON.stringify(policy.fallback),
      policy.isActive,
      policy.priority,
      policy.appliesTo
    ]);

    return this.mapDbRowToPolicy(result[0]);
  }

  async executeWithResilience<T>(
    integrationId: string,
    operation: () => Promise<T>,
    policyId?: string
  ): Promise<T> {
    const policy = await this.getApplicablePolicy(integrationId, policyId);
    if (!policy) {
      return await operation();
    }

    const startTime = Date.now();
    let metrics = this.getOrCreateMetrics(integrationId, policy.id);

    try {
      // Check circuit breaker first
      if (policy.circuitBreaker) {
        const circuitState = this.getCircuitBreakerState(integrationId);
        if (circuitState.state === 'open') {
          throw new Error('Circuit breaker is open');
        }
      }

      // Check bulkhead
      if (policy.bulkhead) {
        const bulkheadState = this.getBulkheadState(integrationId);
        if (bulkheadState.activeCalls >= policy.bulkhead.maxConcurrentCalls) {
          throw new Error('Bulkhead capacity exceeded');
        }
        bulkheadState.activeCalls++;
      }

      // Execute with retry
      let result: T;
      if (policy.retry) {
        result = await this.executeWithRetry(operation, policy.retry, integrationId);
      } else {
        result = await operation();
      }

      // Update success metrics
      metrics.successfulCalls++;
      metrics.lastUpdated = new Date();

      // Update circuit breaker on success
      if (policy.circuitBreaker) {
        this.updateCircuitBreakerOnSuccess(integrationId);
      }

      // Update bulkhead
      if (policy.bulkhead) {
        const bulkheadState = this.getBulkheadState(integrationId);
        bulkheadState.activeCalls--;
      }

      return result;

    } catch (error) {
      // Update failure metrics
      metrics.failedCalls++;
      metrics.lastUpdated = new Date();

      // Update circuit breaker on failure
      if (policy.circuitBreaker) {
        this.updateCircuitBreakerOnFailure(integrationId, policy.circuitBreaker);
      }

      // Update bulkhead on failure
      if (policy.bulkhead) {
        const bulkheadState = this.getBulkheadState(integrationId);
        bulkheadState.activeCalls--;
      }

      // Try fallback
      if (policy.fallback && policy.fallback.enabled) {
        metrics.fallbackActivations++;
        return await this.executeFallback(error as Error, policy.fallback, integrationId);
      }

      throw error;

    } finally {
      // Update response time
      const responseTime = Date.now() - startTime;
      metrics.averageResponseTime = Math.round(
        (metrics.averageResponseTime + responseTime) / 2
      );
      metrics.totalCalls++;

      // Persist metrics
      await this.persistMetrics(integrationId, policy.id, metrics);
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig,
    integrationId: string
  ): Promise<T> {
    let lastError: Error;
    const attempts: RetryAttempt[] = [];

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        const result = await operation();
        
        // Log successful attempt
        if (attempt > 1) {
          await this.logRetryAttempt(integrationId, attempt, 0, '', true);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        attempts.push({
          attemptNumber: attempt,
          delay: 0,
          error: lastError,
          timestamp: new Date(),
          success: false
        });

        // Check if error is retryable
        if (!this.isRetryableError(lastError, config)) {
          break;
        }

        // Don't wait after the last attempt
        if (attempt === config.maxAttempts) {
          break;
        }

        // Calculate delay
        const delay = this.calculateRetryDelay(attempt, config);
        
        // Log retry attempt
        await this.logRetryAttempt(integrationId, attempt, delay, lastError.message, false);

        // Wait before retry
        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  private isRetryableError(error: Error, config: RetryConfig): boolean {
    // Check error name
    if (config.retryableErrors.includes(error.name)) {
      return true;
    }

    // Check HTTP status codes for HTTP errors
    const httpErrorMatch = error.message.match(/HTTP (\d+)/);
    if (httpErrorMatch) {
      const statusCode = parseInt(httpErrorMatch[1]);
      return config.retryableStatusCodes.includes(statusCode);
    }

    // Check for common retryable error patterns
    const retryablePatterns = [
      /timeout/i,
      /connection/i,
      /network/i,
      /rate limit/i,
      /too many requests/i,
      /temporary/i,
      /unavailable/i
    ];

    return retryablePatterns.some(pattern => pattern.test(error.message));
  }

  private calculateRetryDelay(attempt: number, config: RetryConfig): number {
    let delay: number;

    if (config.exponentialBase) {
      // Exponential backoff with custom base
      delay = config.baseDelay * Math.pow(config.exponentialBase, attempt - 1);
    } else {
      // Exponential backoff with multiplier
      delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    }

    // Apply jitter
    if (config.jitter) {
      const jitterAmount = delay * 0.1 * Math.random();
      delay += jitterAmount;
    }

    // Cap at max delay
    delay = Math.min(delay, config.maxDelay);

    return Math.round(delay);
  }

  private getCircuitBreakerState(integrationId: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(integrationId)) {
      this.circuitBreakers.set(integrationId, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        lastSuccessTime: null,
        halfOpenCalls: 0,
        nextAttemptTime: null
      });
    }
    return this.circuitBreakers.get(integrationId)!;
  }

  private updateCircuitBreakerOnSuccess(integrationId: string): void {
    const state = this.getCircuitBreakerState(integrationId);
    state.failureCount = 0;
    state.lastSuccessTime = new Date();
    
    if (state.state === 'half_open') {
      state.halfOpenCalls++;
      // If enough successful calls in half-open state, close the circuit
      if (state.halfOpenCalls >= 3) { // Configurable threshold
        state.state = 'closed';
        state.halfOpenCalls = 0;
      }
    }
  }

  private updateCircuitBreakerOnFailure(integrationId: string, config: CircuitBreakerConfig): void {
    const state = this.getCircuitBreakerState(integrationId);
    state.failureCount++;
    state.lastFailureTime = new Date();

    if (state.state === 'closed' && state.failureCount >= config.failureThreshold) {
      state.state = 'open';
      state.nextAttemptTime = new Date(Date.now() + config.recoveryTimeout);
      this.logCircuitBreakerTrip(integrationId, 'closed', 'open', `Failure threshold reached: ${state.failureCount}`);
    } else if (state.state === 'half_open') {
      state.state = 'open';
      state.nextAttemptTime = new Date(Date.now() + config.recoveryTimeout);
      this.logCircuitBreakerTrip(integrationId, 'half_open', 'open', 'Failure in half-open state');
    }
  }

  private getBulkheadState(integrationId: string): BulkheadState {
    if (!this.bulkheads.has(integrationId)) {
      this.bulkheads.set(integrationId, {
        activeCalls: 0,
        queuedCalls: 0,
        rejectedCalls: 0
      });
    }
    return this.bulkheads.get(integrationId)!;
  }

  private async executeFallback<T>(
    error: Error,
    config: FallbackConfig,
    integrationId: string
  ): Promise<T> {
    switch (config.strategy) {
      case 'default_value':
        return config.config.defaultValue as T;
      
      case 'cached_value':
        // Implement cached value retrieval
        throw new Error('Cached value fallback not implemented');
      
      case 'alternative_service':
        // Implement alternative service call
        throw new Error('Alternative service fallback not implemented');
      
      case 'custom_function':
        // Implement custom function execution
        throw new Error('Custom function fallback not implemented');
      
      default:
        throw error;
    }
  }

  private getOrCreateMetrics(integrationId: string, policyId: string): ResilienceMetrics {
    const key = `${integrationId}:${policyId}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        retryAttempts: 0,
        circuitBreakerTrips: 0,
        averageResponseTime: 0,
        timeoutCount: 0,
        fallbackActivations: 0,
        lastUpdated: new Date()
      });
    }
    return this.metrics.get(key)!;
  }

  private async persistMetrics(integrationId: string, policyId: string, metrics: ResilienceMetrics): Promise<void> {
    await this.db.query(`
      INSERT INTO resilience_metrics (
        policy_id, integration_id, total_calls, successful_calls, failed_calls,
        retry_attempts, circuit_breaker_trips, average_response_time, timeout_count,
        fallback_activations, date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (policy_id, integration_id, date) DO UPDATE SET
        total_calls = EXCLUDED.total_calls,
        successful_calls = EXCLUDED.successful_calls,
        failed_calls = EXCLUDED.failed_calls,
        retry_attempts = EXCLUDED.retry_attempts,
        circuit_breaker_trips = EXCLUDED.circuit_breaker_trips,
        average_response_time = EXCLUDED.average_response_time,
        timeout_count = EXCLUDED.timeout_count,
        fallback_activations = EXCLUDED.fallback_activations,
        created_at = NOW()
    `, [
      policyId,
      integrationId,
      metrics.totalCalls,
      metrics.successfulCalls,
      metrics.failedCalls,
      metrics.retryAttempts,
      metrics.circuitBreakerTrips,
      metrics.averageResponseTime,
      metrics.timeoutCount,
      metrics.fallbackActivations,
      new Date()
    ]);
  }

  private async logRetryAttempt(
    integrationId: string,
    attemptNumber: number,
    delay: number,
    errorMessage: string,
    success: boolean
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO retry_history (integration_id, call_id, attempt_number, delay_ms, error_message, success)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      integrationId,
      uuidv4(),
      attemptNumber,
      delay,
      errorMessage,
      success
    ]);
  }

  private async logCircuitBreakerTrip(
    integrationId: string,
    oldState: string,
    newState: string,
    reason: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO circuit_breaker_history (integration_id, old_state, new_state, reason, failure_count)
      VALUES ($1, $2, $3, $4, $5)
    `, [integrationId, oldState, newState, reason, this.getCircuitBreakerState(integrationId).failureCount]);
  }

  private async getApplicablePolicy(integrationId: string, policyId?: string): Promise<ResiliencePolicy | null> {
    if (policyId) {
      const result = await this.db.query(`
        SELECT * FROM resilience_policies WHERE id = $1 AND is_active = true
      `, [policyId]);
      return result.length > 0 ? this.mapDbRowToPolicy(result[0]) : null;
    }

    // Find applicable policy based on integration type
    const result = await this.db.query(`
      SELECT * FROM resilience_policies 
      WHERE is_active = true AND ($1 = ANY(applies_to) OR applies_to = '{}')
      ORDER BY priority DESC, created_at DESC
      LIMIT 1
    `, [integrationId]);

    return result.length > 0 ? this.mapDbRowToPolicy(result[0]) : null;
  }

  private mapDbRowToPolicy(row: any): ResiliencePolicy {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      retry: row.retry_config,
      circuitBreaker: row.circuit_breaker_config,
      bulkhead: row.bulkhead_config,
      timeout: row.timeout_config,
      fallback: row.fallback_config,
      isActive: row.is_active,
      priority: row.priority,
      appliesTo: row.applies_to,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getMetrics(integrationId: string, timeRange?: { from: Date; to: Date }): Promise<ResilienceMetrics> {
    let query = `
      SELECT 
        SUM(total_calls) as total_calls,
        SUM(successful_calls) as successful_calls,
        SUM(failed_calls) as failed_calls,
        SUM(retry_attempts) as retry_attempts,
        SUM(circuit_breaker_trips) as circuit_breaker_trips,
        AVG(average_response_time) as average_response_time,
        SUM(timeout_count) as timeout_count,
        SUM(fallback_activations) as fallback_activations
      FROM resilience_metrics 
      WHERE integration_id = $1
    `;
    
    const params = [integrationId];

    if (timeRange) {
      query += ` AND date BETWEEN $2 AND $3`;
      params.push(timeRange.from.toISOString().split('T')[0], timeRange.to.toISOString().split('T')[0]);
    }

    const result = await this.db.query(query, params);
    
    if (result.length === 0 || result[0].total_calls === null) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        retryAttempts: 0,
        circuitBreakerTrips: 0,
        averageResponseTime: 0,
        timeoutCount: 0,
        fallbackActivations: 0,
        lastUpdated: new Date()
      };
    }

    return {
      totalCalls: parseInt(result[0].total_calls),
      successfulCalls: parseInt(result[0].successful_calls),
      failedCalls: parseInt(result[0].failed_calls),
      retryAttempts: parseInt(result[0].retry_attempts),
      circuitBreakerTrips: parseInt(result[0].circuit_breaker_trips),
      averageResponseTime: Math.round(parseFloat(result[0].average_response_time)),
      timeoutCount: parseInt(result[0].timeout_count),
      fallbackActivations: parseInt(result[0].fallback_activations),
      lastUpdated: new Date()
    };
  }

  async getCircuitBreakerStatus(integrationId: string): Promise<CircuitBreakerState | null> {
    return this.circuitBreakers.get(integrationId) || null;
  }

  async resetCircuitBreaker(integrationId: string): Promise<void> {
    this.circuitBreakers.set(integrationId, {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
      halfOpenCalls: 0,
      nextAttemptTime: null
    });

    await this.logCircuitBreakerTrip(integrationId, 'unknown', 'closed', 'Manual reset');
  }

  async getPolicies(): Promise<ResiliencePolicy[]> {
    const result = await this.db.query(`
      SELECT * FROM resilience_policies WHERE is_active = true ORDER BY priority DESC
    `);

    return result.map(row => this.mapDbRowToPolicy(row));
  }

  async getDefaultRetryConfig(): Promise<RetryConfig> {
    return {
      maxAttempts: 3,
      baseDelay: 1000,
      maxDelay: 30000,
      backoffMultiplier: 2,
      jitter: true,
      retryableErrors: [
        'ECONNRESET',
        'ENOTFOUND',
        'ECONNREFUSED',
        'ETIMEDOUT',
        'NETWORK_ERROR',
        'TIMEOUT',
        'RATE_LIMIT_EXCEEDED'
      ],
      retryableStatusCodes: [429, 500, 502, 503, 504],
      exponentialBase: 2
    };
  }

  async getDefaultCircuitBreakerConfig(): Promise<CircuitBreakerConfig> {
    return {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1 minute
      monitoringPeriod: 10000, // 10 seconds
      expectedRecoveryTime: 30000, // 30 seconds
      halfOpenMaxCalls: 3
    };
  }

  async createDefaultPolicies(): Promise<void> {
    const defaultRetry = await this.getDefaultRetryConfig();
    const defaultCircuitBreaker = await this.getDefaultCircuitBreakerConfig();

    // Create a general purpose policy
    await this.createPolicy({
      name: 'Default Resilience Policy',
      description: 'Default resilience patterns for all integrations',
      retry: defaultRetry,
      circuitBreaker: defaultCircuitBreaker,
      bulkhead: {
        maxConcurrentCalls: 10,
        maxQueueSize: 50,
        timeout: 30000
      },
      timeout: {
        duration: 30,
        unit: 'seconds'
      },
      fallback: {
        enabled: true,
        strategy: 'default_value',
        config: { defaultValue: null }
      },
      isActive: true,
      priority: 1,
      appliesTo: []
    });

    // Create high-priority policy for critical integrations
    await this.createPolicy({
      name: 'Critical Integration Policy',
      description: 'Enhanced resilience for critical integrations',
      retry: {
        ...defaultRetry,
        maxAttempts: 5,
        baseDelay: 500
      },
      circuitBreaker: {
        ...defaultCircuitBreaker,
        failureThreshold: 3,
        recoveryTimeout: 30000
      },
      bulkhead: {
        maxConcurrentCalls: 20,
        maxQueueSize: 100,
        timeout: 60000
      },
      timeout: {
        duration: 60,
        unit: 'seconds'
      },
      fallback: {
        enabled: true,
        strategy: 'alternative_service',
        config: { alternativeService: 'backup-api' }
      },
      isActive: true,
      priority: 10,
      appliesTo: ['stripe', 'shopify', 'salesforce']
    });
  }
}

interface BulkheadState {
  activeCalls: number;
  queuedCalls: number;
  rejectedCalls: number;
}
