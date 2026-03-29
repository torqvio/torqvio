import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface ErrorContext {
  integrationId: string;
  connectorType: string;
  operation: string;
  endpoint?: string;
  requestId?: string;
  userId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ErrorClassification {
  type: 'transient' | 'permanent' | 'rate_limit' | 'authentication' | 'configuration' | 'unknown';
  severity: 'low' | 'medium' | 'high' | 'critical';
  retryable: boolean;
  userActionRequired: boolean;
  suggestedAction?: string;
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
  retryableErrors: string[];
  retryableStatusCodes: number[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  expectedRecoveryTime: number;
}

export interface ErrorHandlingResult {
  success: boolean;
  attempts: number;
  finalError?: Error;
  retryDelay?: number;
  circuitBreakerTripped?: boolean;
  classification?: ErrorClassification;
}

export class IntegrationErrorHandler {
  private db: DatabaseConnection;
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private defaultRetryConfig: RetryConfig = {
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
    retryableStatusCodes: [429, 500, 502, 503, 504]
  };

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS integration_errors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id VARCHAR(255) NOT NULL,
        connector_type VARCHAR(100) NOT NULL,
        operation VARCHAR(100) NOT NULL,
        error_type VARCHAR(50) NOT NULL,
        error_message TEXT NOT NULL,
        error_stack TEXT,
        error_classification JSONB,
        context JSONB,
        status VARCHAR(20) DEFAULT 'active',
        resolved_at TIMESTAMP,
        resolution_method TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS retry_attempts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        error_id UUID REFERENCES integration_errors(id),
        attempt_number INTEGER NOT NULL,
        delay_ms INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS circuit_breaker_states (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id VARCHAR(255) NOT NULL,
        state VARCHAR(20) NOT NULL DEFAULT 'closed',
        failure_count INTEGER DEFAULT 0,
        last_failure_time TIMESTAMP,
        last_success_time TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(integration_id)
      );
    `);
  }

  async handleError(
    error: Error,
    context: ErrorContext,
    retryConfig?: Partial<RetryConfig>
  ): Promise<ErrorHandlingResult> {
    const classification = this.classifyError(error);
    const config = { ...this.defaultRetryConfig, ...retryConfig };

    // Log error
    const errorId = await this.logError(error, context, classification);

    // Check circuit breaker
    const circuitBreakerState = this.getCircuitBreakerState(context.integrationId);
    if (circuitBreakerState.state === 'open') {
      return {
        success: false,
        attempts: 0,
        circuitBreakerTripped: true,
        classification
      };
    }

    // Handle based on classification
    if (!classification.retryable || !config.retryableErrors.includes(error.name)) {
      await this.updateCircuitBreaker(context.integrationId, false);
      return {
        success: false,
        attempts: 1,
        finalError: error,
        classification
      };
    }

    // Execute retry logic
    return await this.executeWithRetry(errorId, error, context, config);
  }

  private classifyError(error: Error): ErrorClassification {
    const errorMessage = error.message.toLowerCase();
    const errorName = error.name;

    // Rate limiting errors
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
      return {
        type: 'rate_limit',
        severity: 'medium',
        retryable: true,
        userActionRequired: false,
        suggestedAction: 'Wait and retry with exponential backoff'
      };
    }

    // Authentication errors
    if (errorMessage.includes('unauthorized') || errorMessage.includes('authentication failed') || 
        errorMessage.includes('invalid token') || errorMessage.includes('access denied')) {
      return {
        type: 'authentication',
        severity: 'high',
        retryable: false,
        userActionRequired: true,
        suggestedAction: 'Check and update authentication credentials'
      };
    }

    // Configuration errors
    if (errorMessage.includes('invalid configuration') || errorMessage.includes('missing required') ||
        errorMessage.includes('malformed request')) {
      return {
        type: 'configuration',
        severity: 'high',
        retryable: false,
        userActionRequired: true,
        suggestedAction: 'Review and correct integration configuration'
      };
    }

    // Network/transient errors
    if (['ECONNRESET', 'ENOTFOUND', 'ECONNREFUSED', 'ETIMEDOUT', 'NETWORK_ERROR'].includes(errorName) ||
        errorMessage.includes('timeout') || errorMessage.includes('network') || 
        errorMessage.includes('connection')) {
      return {
        type: 'transient',
        severity: 'medium',
        retryable: true,
        userActionRequired: false,
        suggestedAction: 'Retry with exponential backoff'
      };
    }

    // Permanent errors
    if (errorMessage.includes('not found') || errorMessage.includes('invalid') || 
        errorMessage.includes('forbidden') || errorMessage.includes('bad request')) {
      return {
        type: 'permanent',
        severity: 'medium',
        retryable: false,
        userActionRequired: true,
        suggestedAction: 'Review request parameters and permissions'
      };
    }

    // Unknown errors - treat as transient by default
    return {
      type: 'unknown',
      severity: 'medium',
      retryable: true,
      userActionRequired: false,
      suggestedAction: 'Monitor and investigate if pattern persists'
    };
  }

  private async logError(
    error: Error,
    context: ErrorContext,
    classification: ErrorClassification
  ): Promise<string> {
    const result = await this.db.query(`
      INSERT INTO integration_errors (
        integration_id, connector_type, operation, error_type, error_message,
        error_stack, error_classification, context
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      context.integrationId,
      context.connectorType,
      context.operation,
      error.name,
      error.message,
      error.stack,
      JSON.stringify(classification),
      JSON.stringify(context)
    ]);

    return result[0].id;
  }

  private async executeWithRetry(
    errorId: string,
    originalError: Error,
    context: ErrorContext,
    config: RetryConfig
  ): Promise<ErrorHandlingResult> {
    let lastError = originalError;
    let totalDelay = 0;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      if (attempt > 1) {
        const delay = this.calculateDelay(attempt, config);
        totalDelay += delay;
        
        await this.logRetryAttempt(errorId, attempt, delay, false, lastError.message);
        await this.sleep(delay);
      }

      try {
        // Attempt to execute the operation again
        // This would be implemented based on the specific operation
        const result = await this.retryOperation(context);
        
        await this.logRetryAttempt(errorId, attempt, totalDelay, true);
        await this.updateCircuitBreaker(context.integrationId, true);
        
        return {
          success: true,
          attempts: attempt,
          retryDelay: totalDelay
        };
      } catch (error) {
        lastError = error as Error;
        
        // Check if this error is still retryable
        const classification = this.classifyError(lastError);
        if (!classification.retryable) {
          break;
        }
      }
    }

    await this.updateCircuitBreaker(context.integrationId, false);
    
    return {
      success: false,
      attempts: config.maxAttempts,
      finalError: lastError,
      retryDelay: totalDelay
    };
  }

  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    delay = Math.min(delay, config.maxDelay);

    if (config.jitter) {
      // Add jitter to prevent thundering herd
      const jitterAmount = delay * 0.1 * Math.random();
      delay += jitterAmount;
    }

    return Math.floor(delay);
  }

  private async logRetryAttempt(
    errorId: string,
    attemptNumber: number,
    delay: number,
    success: boolean,
    errorMessage?: string
  ): Promise<void> {
    await this.db.query(`
      INSERT INTO retry_attempts (error_id, attempt_number, delay_ms, success, error_message)
      VALUES ($1, $2, $3, $4, $5)
    `, [errorId, attemptNumber, delay, success, errorMessage]);
  }

  private async retryOperation(context: ErrorContext): Promise<any> {
    // This would be implemented based on the specific operation being retried
    // For now, throw an error to simulate failure
    throw new Error('Operation retry not implemented');
  }

  private getCircuitBreakerState(integrationId: string): CircuitBreakerState {
    if (!this.circuitBreakers.has(integrationId)) {
      this.circuitBreakers.set(integrationId, {
        state: 'closed',
        failureCount: 0,
        lastFailureTime: null,
        lastSuccessTime: null
      });
    }
    return this.circuitBreakers.get(integrationId)!;
  }

  private async updateCircuitBreaker(integrationId: string, success: boolean): Promise<void> {
    const state = this.getCircuitBreakerState(integrationId);
    const now = new Date();

    if (success) {
      state.failureCount = 0;
      state.lastSuccessTime = now;
      if (state.state === 'open') {
        state.state = 'closed';
      }
    } else {
      state.failureCount++;
      state.lastFailureTime = now;
      
      if (state.failureCount >= 5 && state.state === 'closed') {
        state.state = 'open';
      }
    }

    await this.persistCircuitBreakerState(integrationId, state);
  }

  private async persistCircuitBreakerState(integrationId: string, state: CircuitBreakerState): Promise<void> {
    await this.db.query(`
      INSERT INTO circuit_breaker_states (
        integration_id, state, failure_count, last_failure_time, last_success_time
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (integration_id)
      DO UPDATE SET
        state = EXCLUDED.state,
        failure_count = EXCLUDED.failure_count,
        last_failure_time = EXCLUDED.last_failure_time,
        last_success_time = EXCLUDED.last_success_time,
        updated_at = NOW()
    `, [
      integrationId,
      state.state,
      state.failureCount,
      state.lastFailureTime,
      state.lastSuccessTime
    ]);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async getErrorMetrics(integrationId?: string, timeRange?: { from: Date; to: Date }): Promise<{
    totalErrors: number;
    errorsByType: Record<string, number>;
    errorsBySeverity: Record<string, number>;
    retrySuccessRate: number;
    circuitBreakerTrips: number;
    averageRetryAttempts: number;
  }> {
    let whereClause = '1=1';
    const params: any[] = [];

    if (integrationId) {
      whereClause += ' AND integration_id = $' + (params.length + 1);
      params.push(integrationId);
    }

    if (timeRange) {
      whereClause += ' AND created_at BETWEEN $' + (params.length + 1) + ' AND $' + (params.length + 2);
      params.push(timeRange.from, timeRange.to);
    }

    const metrics = await this.db.query(`
      SELECT 
        COUNT(*) as total_errors,
        error_classification->>'type' as error_type,
        error_classification->>'severity' as severity
      FROM integration_errors 
      WHERE ${whereClause}
      GROUP BY error_classification->>'type', error_classification->>'severity'
    `, params);

    const retryMetrics = await this.db.query(`
      SELECT 
        COUNT(DISTINCT error_id) as total_retries,
        AVG(CASE WHEN success THEN attempt_number ELSE NULL END) as avg_successful_attempts,
        COUNT(CASE WHEN success THEN 1 END) as successful_retries
      FROM retry_attempts ra
      JOIN integration_errors ie ON ra.error_id = ie.id
      WHERE ${whereClause}
    `, params);

    const circuitBreakerMetrics = await this.db.query(`
      SELECT COUNT(*) as trips
      FROM circuit_breaker_states
      WHERE state = 'open'
      ${integrationId ? 'AND integration_id = $' + (params.length + 1) : ''}
    `, integrationId ? [...params, integrationId] : params);

    // Process metrics
    const errorsByType: Record<string, number> = {};
    const errorsBySeverity: Record<string, number> = {};
    let totalErrors = 0;

    metrics.forEach(row => {
      totalErrors += parseInt(row.total_errors);
      errorsByType[row.error_type] = (errorsByType[row.error_type] || 0) + parseInt(row.total_errors);
      errorsBySeverity[row.severity] = (errorsBySeverity[row.severity] || 0) + parseInt(row.total_errors);
    });

    const retryData = retryMetrics[0] || {};
    const retrySuccessRate = retryData.total_retries > 0 
      ? (retryData.successful_retries / retryData.total_retries) * 100 
      : 0;

    return {
      totalErrors,
      errorsByType,
      errorsBySeverity,
      retrySuccessRate,
      circuitBreakerTrips: parseInt(circuitBreakerMetrics[0]?.trips || '0'),
      averageRetryAttempts: parseFloat(retryData.avg_successful_attempts || '0')
    };
  }

  async resolveError(errorId: string, resolutionMethod: string): Promise<void> {
    await this.db.query(`
      UPDATE integration_errors 
      SET status = 'resolved', resolved_at = NOW(), resolution_method = $1
      WHERE id = $2
    `, [resolutionMethod, errorId]);
  }
}

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half_open';
  failureCount: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
}
