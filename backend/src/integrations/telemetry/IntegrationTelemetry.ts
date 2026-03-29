import { DatabaseConnection } from '../../database/connection';
import { v4 as uuidv4 } from 'uuid';

export interface TelemetryEvent {
  id: string;
  integrationId: string;
  connectorType: string;
  eventType: 'api_call' | 'webhook_received' | 'workflow_triggered' | 'error' | 'performance' | 'business_metric';
  eventName: string;
  timestamp: Date;
  duration?: number;
  metadata: Record<string, any>;
  tags: string[];
  userId?: string;
  requestId?: string;
}

export interface TelemetryMetric {
  id: string;
  integrationId: string;
  metricName: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags: Record<string, string>;
  aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max';
}

export interface PerformanceTrace {
  id: string;
  integrationId: string;
  operation: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'timeout';
  steps: TraceStep[];
  metadata: Record<string, any>;
}

export interface TraceStep {
  id: string;
  name: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: 'started' | 'completed' | 'failed' | 'skipped';
  metadata?: Record<string, any>;
  parentStepId?: string;
}

export interface IntegrationHealth {
  integrationId: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  lastChecked: Date;
  uptime: number;
  averageResponseTime: number;
  errorRate: number;
  throughput: number;
  lastError?: string;
  score: number; // 0-100
}

export class IntegrationTelemetry {
  private db: DatabaseConnection;
  private activeTraces: Map<string, PerformanceTrace> = new Map();
  private metricsBuffer: TelemetryMetric[] = [];
  private eventsBuffer: TelemetryEvent[] = [];
  private flushInterval: NodeJS.Timeout | null = null;
  private bufferSize = 100;

  constructor(db: DatabaseConnection) {
    this.db = db;
    this.initializeTables();
    this.startFlushInterval();
  }

  private async initializeTables(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS telemetry_events (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id VARCHAR(255) NOT NULL,
        connector_type VARCHAR(100) NOT NULL,
        event_type VARCHAR(50) NOT NULL,
        event_name VARCHAR(200) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        duration INTEGER,
        metadata JSONB,
        tags TEXT[],
        user_id VARCHAR(255),
        request_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS telemetry_metrics (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id VARCHAR(255) NOT NULL,
        metric_name VARCHAR(200) NOT NULL,
        value NUMERIC NOT NULL,
        unit VARCHAR(50) NOT NULL,
        timestamp TIMESTAMP NOT NULL,
        tags JSONB,
        aggregation VARCHAR(20),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS performance_traces (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        integration_id VARCHAR(255) NOT NULL,
        operation VARCHAR(200) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER,
        status VARCHAR(20) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS trace_steps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        trace_id UUID REFERENCES performance_traces(id) ON DELETE CASCADE,
        name VARCHAR(200) NOT NULL,
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        duration INTEGER,
        status VARCHAR(20) NOT NULL,
        metadata JSONB,
        parent_step_id UUID REFERENCES trace_steps(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await this.db.query(`
      CREATE TABLE IF NOT EXISTS integration_health (
        integration_id VARCHAR(255) PRIMARY KEY,
        status VARCHAR(20) NOT NULL,
        last_checked TIMESTAMP NOT NULL,
        uptime NUMERIC DEFAULT 0,
        average_response_time INTEGER DEFAULT 0,
        error_rate NUMERIC DEFAULT 0,
        throughput NUMERIC DEFAULT 0,
        last_error TEXT,
        score INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create indexes for performance
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_telemetry_events_integration_timestamp ON telemetry_events(integration_id, timestamp)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_telemetry_metrics_integration_timestamp ON telemetry_metrics(integration_id, timestamp)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_performance_traces_integration ON performance_traces(integration_id)');
    await this.db.query('CREATE INDEX IF NOT EXISTS idx_trace_steps_trace_id ON trace_steps(trace_id)');
  }

  private startFlushInterval(): void {
    this.flushInterval = setInterval(() => {
      this.flushBuffers();
    }, 5000); // Flush every 5 seconds
  }

  async logEvent(
    integrationId: string,
    connectorType: string,
    eventName: string,
    eventType: TelemetryEvent['eventType'],
    metadata: Record<string, any> = {},
    tags: string[] = [],
    duration?: number
  ): Promise<void> {
    const event: TelemetryEvent = {
      id: uuidv4(),
      integrationId,
      connectorType,
      eventType,
      eventName,
      timestamp: new Date(),
      duration,
      metadata,
      tags
    };

    this.eventsBuffer.push(event);

    if (this.eventsBuffer.length >= this.bufferSize) {
      await this.flushEvents();
    }
  }

  async recordMetric(
    integrationId: string,
    metricName: string,
    value: number,
    unit: string,
    tags: Record<string, string> = {},
    aggregation?: TelemetryMetric['aggregation']
  ): Promise<void> {
    const metric: TelemetryMetric = {
      id: uuidv4(),
      integrationId,
      metricName,
      value,
      unit,
      timestamp: new Date(),
      tags,
      aggregation
    };

    this.metricsBuffer.push(metric);

    if (this.metricsBuffer.length >= this.bufferSize) {
      await this.flushMetrics();
    }
  }

  startTrace(
    integrationId: string,
    operation: string,
    metadata: Record<string, any> = {}
  ): string {
    const trace: PerformanceTrace = {
      id: uuidv4(),
      integrationId,
      operation,
      startTime: new Date(),
      status: 'started',
      steps: [],
      metadata
    };

    this.activeTraces.set(trace.id, trace);
    
    // Persist trace start
    this.db.query(`
      INSERT INTO performance_traces (id, integration_id, operation, start_time, status, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [trace.id, integrationId, operation, trace.startTime, trace.status, JSON.stringify(metadata)]);

    return trace.id;
  }

  async addTraceStep(
    traceId: string,
    stepName: string,
    metadata?: Record<string, any>,
    parentStepId?: string
  ): Promise<string> {
    const trace = this.activeTraces.get(traceId);
    if (!trace) {
      throw new Error(`Trace ${traceId} not found`);
    }

    const step: TraceStep = {
      id: uuidv4(),
      name: stepName,
      startTime: new Date(),
      status: 'started',
      metadata,
      parentStepId
    };

    trace.steps.push(step);

    // Persist step start
    await this.db.query(`
      INSERT INTO trace_steps (id, trace_id, name, start_time, status, metadata, parent_step_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [step.id, traceId, stepName, step.startTime, step.status, JSON.stringify(metadata), parentStepId]);

    return step.id;
  }

  async completeTraceStep(
    traceId: string,
    stepId: string,
    status: 'completed' | 'failed' | 'skipped' = 'completed',
    metadata?: Record<string, any>
  ): Promise<void> {
    const trace = this.activeTraces.get(traceId);
    if (!trace) {
      throw new Error(`Trace ${traceId} not found`);
    }

    const step = trace.steps.find(s => s.id === stepId);
    if (!step) {
      throw new Error(`Step ${stepId} not found in trace ${traceId}`);
    }

    step.endTime = new Date();
    step.duration = step.endTime.getTime() - step.startTime.getTime();
    step.status = status;
    if (metadata) {
      step.metadata = { ...step.metadata, ...metadata };
    }

    // Update step completion
    await this.db.query(`
      UPDATE trace_steps 
      SET end_time = $1, duration = $2, status = $3, metadata = $4
      WHERE id = $5
    `, [step.endTime, step.duration, step.status, JSON.stringify(step.metadata), stepId]);
  }

  async completeTrace(
    traceId: string,
    status: 'completed' | 'failed' | 'timeout' = 'completed',
    metadata?: Record<string, any>
  ): Promise<void> {
    const trace = this.activeTraces.get(traceId);
    if (!trace) {
      throw new Error(`Trace ${traceId} not found`);
    }

    trace.endTime = new Date();
    trace.duration = trace.endTime.getTime() - trace.startTime.getTime();
    trace.status = status;
    if (metadata) {
      trace.metadata = { ...trace.metadata, ...metadata };
    }

    // Update trace completion
    await this.db.query(`
      UPDATE performance_traces 
      SET end_time = $1, duration = $2, status = $3, metadata = $4
      WHERE id = $5
    `, [trace.endTime, trace.duration, trace.status, JSON.stringify(trace.metadata)]);

    this.activeTraces.delete(traceId);

    // Record performance metrics
    await this.recordMetric(trace.integrationId, 'operation_duration', trace.duration, 'ms', {
      operation: trace.operation,
      status: trace.status
    });
  }

  async updateHealth(
    integrationId: string,
    status: IntegrationHealth['status'],
    metrics: Partial<Pick<IntegrationHealth, 'uptime' | 'averageResponseTime' | 'errorRate' | 'throughput' | 'lastError'>> = {}
  ): Promise<void> {
    const health: IntegrationHealth = {
      integrationId,
      status,
      lastChecked: new Date(),
      uptime: metrics.uptime || 0,
      averageResponseTime: metrics.averageResponseTime || 0,
      errorRate: metrics.errorRate || 0,
      throughput: metrics.throughput || 0,
      lastError: metrics.lastError,
      score: this.calculateHealthScore(status, metrics)
    };

    await this.db.query(`
      INSERT INTO integration_health (
        integration_id, status, last_checked, uptime, average_response_time,
        error_rate, throughput, last_error, score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (integration_id)
      DO UPDATE SET
        status = EXCLUDED.status,
        last_checked = EXCLUDED.last_checked,
        uptime = EXCLUDED.uptime,
        average_response_time = EXCLUDED.average_response_time,
        error_rate = EXCLUDED.error_rate,
        throughput = EXCLUDED.throughput,
        last_error = EXCLUDED.last_error,
        score = EXCLUDED.score,
        updated_at = NOW()
    `, [
      health.integrationId,
      health.status,
      health.lastChecked,
      health.uptime,
      health.averageResponseTime,
      health.errorRate,
      health.throughput,
      health.lastError,
      health.score
    ]);
  }

  private calculateHealthScore(
    status: IntegrationHealth['status'],
    metrics: Partial<Pick<IntegrationHealth, 'uptime' | 'averageResponseTime' | 'errorRate' | 'throughput'>>
  ): number {
    let score = 100;

    // Status impact
    switch (status) {
      case 'healthy':
        break; // No penalty
      case 'degraded':
        score -= 30;
        break;
      case 'unhealthy':
        score -= 60;
        break;
      case 'unknown':
        score -= 20;
        break;
    }

    // Error rate impact (0-20% penalty)
    if (metrics.errorRate !== undefined) {
      score -= Math.min(metrics.errorRate * 100, 20);
    }

    // Response time impact (0-20% penalty for >1s)
    if (metrics.averageResponseTime !== undefined) {
      const responseTimePenalty = Math.max(0, (metrics.averageResponseTime - 1000) / 100);
      score -= Math.min(responseTimePenalty, 20);
    }

    // Uptime impact (0-30% penalty for <95% uptime)
    if (metrics.uptime !== undefined) {
      const uptimePenalty = Math.max(0, (95 - metrics.uptime) * 0.6);
      score -= Math.min(uptimePenalty, 30);
    }

    return Math.max(0, Math.round(score));
  }

  private async flushEvents(): Promise<void> {
    if (this.eventsBuffer.length === 0) return;

    const events = this.eventsBuffer.splice(0);
    
    await this.db.query(`
      INSERT INTO telemetry_events (
        id, integration_id, connector_type, event_type, event_name, timestamp,
        duration, metadata, tags, user_id, request_id
      ) VALUES ${events.map((_, i) => `($${i * 9 + 1}, $${i * 9 + 2}, $${i * 9 + 3}, $${i * 9 + 4}, $${i * 9 + 5}, $${i * 9 + 6}, $${i * 9 + 7}, $${i * 9 + 8}, $${i * 9 + 9})`).join(', ')}
    `, events.flatMap(event => [
      event.id,
      event.integrationId,
      event.connectorType,
      event.eventType,
      event.eventName,
      event.timestamp,
      event.duration,
      JSON.stringify(event.metadata),
      event.tags,
      event.userId,
      event.requestId
    ]));
  }

  private async flushMetrics(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const metrics = this.metricsBuffer.splice(0);
    
    await this.db.query(`
      INSERT INTO telemetry_metrics (
        id, integration_id, metric_name, value, unit, timestamp, tags, aggregation
      ) VALUES ${metrics.map((_, i) => `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`).join(', ')}
    `, metrics.flatMap(metric => [
      metric.id,
      metric.integrationId,
      metric.metricName,
      metric.value,
      metric.unit,
      metric.timestamp,
      JSON.stringify(metric.tags),
      metric.aggregation
    ]));
  }

  private async flushBuffers(): Promise<void> {
    await Promise.all([
      this.flushEvents(),
      this.flushMetrics()
    ]);
  }

  async getMetrics(
    integrationId: string,
    metricName: string,
    timeRange: { from: Date; to: Date },
    aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max'
  ): Promise<TelemetryMetric[]> {
    let query = `
      SELECT * FROM telemetry_metrics 
      WHERE integration_id = $1 AND metric_name = $2 
        AND timestamp BETWEEN $3 AND $4
    `;
    const params = [integrationId, metricName, timeRange.from, timeRange.to];

    if (aggregation) {
      query += ` GROUP BY metric_name, unit, tags
        ORDER BY timestamp DESC`;
    } else {
      query += ` ORDER BY timestamp DESC`;
    }

    const result = await this.db.query(query, params);
    return result;
  }

  async getEvents(
    integrationId: string,
    eventType?: TelemetryEvent['eventType'],
    timeRange?: { from: Date; to: Date },
    limit = 100
  ): Promise<TelemetryEvent[]> {
    let query = 'SELECT * FROM telemetry_events WHERE integration_id = $1';
    const params = [integrationId];

    if (eventType) {
      query += ` AND event_type = $${params.length + 1}`;
      params.push(eventType);
    }

    if (timeRange) {
      query += ` AND timestamp BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(timeRange.from.toISOString(), timeRange.to.toISOString());
    }

    query += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit.toString());

    const result = await this.db.query(query, params);
    return result;
  }

  async getTraces(
    integrationId: string,
    operation?: string,
    timeRange?: { from: Date; to: Date },
    limit = 50
  ): Promise<PerformanceTrace[]> {
    let query = `
      SELECT t.*, 
             array_agg(row_to_json(s.*)) as steps
      FROM performance_traces t
      LEFT JOIN trace_steps s ON t.id = s.trace_id
      WHERE t.integration_id = $1
    `;
    const params = [integrationId];

    if (operation) {
      query += ` AND t.operation = $${params.length + 1}`;
      params.push(operation);
    }

    if (timeRange) {
      query += ` AND t.start_time BETWEEN $${params.length + 1} AND $${params.length + 2}`;
      params.push(timeRange.from.toISOString(), timeRange.to.toISOString());
    }

    query += ` GROUP BY t.id ORDER BY t.start_time DESC LIMIT $${params.length + 1}`;
    params.push(limit.toString());

    const result = await this.db.query(query, params);
    return result;
  }

  async getHealth(integrationId: string): Promise<IntegrationHealth | null> {
    const result = await this.db.query(`
      SELECT * FROM integration_health WHERE integration_id = $1
    `, [integrationId]);

    return result[0] || null;
  }

  async getHealthSummary(): Promise<{
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
    unknown: number;
    averageScore: number;
  }> {
    const result = await this.db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy,
        COUNT(CASE WHEN status = 'degraded' THEN 1 END) as degraded,
        COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy,
        COUNT(CASE WHEN status = 'unknown' THEN 1 END) as unknown,
        AVG(score) as average_score
      FROM integration_health
    `);

    return result[0];
  }

  async cleanup(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    await this.flushBuffers();
  }
}

export interface IntegrationTelemetryInterface {
  logEvent(
    integrationId: string,
    connectorType: string,
    eventName: string,
    eventType: 'api_call' | 'webhook_received' | 'workflow_triggered' | 'error' | 'performance' | 'business_metric',
    metadata?: Record<string, any>,
    tags?: string[],
    duration?: number
  ): Promise<void>;

  recordMetric(
    integrationId: string,
    metricName: string,
    value: number,
    unit: string,
    tags?: Record<string, string>,
    aggregation?: 'sum' | 'average' | 'count' | 'min' | 'max'
  ): Promise<void>;

  startTrace(
    integrationId: string,
    operation: string,
    metadata?: Record<string, any>
  ): string;

  addTraceStep(
    traceId: string,
    stepName: string,
    metadata?: Record<string, any>,
    parentStepId?: string
  ): Promise<string>;

  completeTraceStep(
    traceId: string,
    stepId: string,
    status?: 'completed' | 'failed' | 'skipped',
    metadata?: Record<string, any>
  ): Promise<void>;

  completeTrace(
    traceId: string,
    status?: 'completed' | 'failed' | 'timeout',
    metadata?: Record<string, any>
  ): Promise<void>;

  updateHealth(
    integrationId: string,
    status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown',
    metrics?: Partial<Pick<IntegrationHealth, 'uptime' | 'averageResponseTime' | 'errorRate' | 'throughput' | 'lastError'>>
  ): Promise<void>;
}
