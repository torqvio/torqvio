import { DatabaseConnection } from './connection.js';
import { 
  FlowDefinition, 
  FlowExecution, 
  StepResult, 
  Event, 
  Trigger, 
  ExecutionStatus,
  StepStatus,
  CreateFlowRequest 
} from '../types/index.js';
export { EventSubscriptionModel } from './EventSubscriptionModel.js';

export class FlowModel {
  constructor(private db: DatabaseConnection) {}

  async create(flow: CreateFlowRequest): Promise<FlowDefinition> {
    const query = `
      INSERT INTO flows (name, definition, retry_policy)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const [result] = await this.db.query<FlowDefinition>(query, [
      flow.name,
      JSON.stringify(flow),
      flow.retryPolicy ? JSON.stringify(flow.retryPolicy) : null
    ]);
    
    return result;
  }

  async findById(id: string): Promise<FlowDefinition | null> {
    const query = 'SELECT * FROM flows WHERE id = $1';
    return await this.db.queryOne<FlowDefinition>(query, [id]);
  }

  async findByName(name: string): Promise<FlowDefinition | null> {
    const query = 'SELECT * FROM flows WHERE name = $1';
    return await this.db.queryOne<FlowDefinition>(query, [name]);
  }

  async findAll(): Promise<FlowDefinition[]> {
    const query = 'SELECT * FROM flows ORDER BY created_at DESC';
    return await this.db.query<FlowDefinition>(query);
  }

  async update(id: string, updates: Partial<FlowDefinition>): Promise<FlowDefinition | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.name) {
      fields.push(`name = $${paramIndex++}`);
      values.push(updates.name);
    }
    if (updates.definition) {
      fields.push(`definition = $${paramIndex++}`);
      values.push(JSON.stringify(updates.definition));
    }
    if (updates.retryPolicy) {
      fields.push(`retry_policy = $${paramIndex++}`);
      values.push(JSON.stringify(updates.retryPolicy));
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE flows 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [result] = await this.db.query<FlowDefinition>(query, values);
    return result;
  }

  async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM flows WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }
}

export class FlowExecutionModel {
  constructor(private db: DatabaseConnection) {}

  async create(execution: Omit<FlowExecution, 'id' | 'createdAt' | 'updatedAt'>): Promise<FlowExecution> {
    const query = `
      INSERT INTO flow_executions (
        flow_id, status, current_step_id, payload, context,
        started_at, completed_at, next_run_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const [result] = await this.db.query<FlowExecution>(query, [
      execution.flowId,
      execution.status,
      execution.currentStepId || null,
      JSON.stringify(execution.payload),
      JSON.stringify(execution.context),
      execution.startedAt || null,
      execution.completedAt || null,
      execution.nextRunAt || null
    ]);
    
    return result;
  }

  async findById(id: string): Promise<FlowExecution | null> {
    const query = 'SELECT * FROM flow_executions WHERE id = $1';
    return await this.db.queryOne<FlowExecution>(query, [id]);
  }

  async findByFlowId(flowId: string): Promise<FlowExecution[]> {
    const query = 'SELECT * FROM flow_executions WHERE flow_id = $1 ORDER BY created_at DESC';
    return await this.db.query<FlowExecution>(query, [flowId]);
  }

  async findByStatus(status: ExecutionStatus): Promise<FlowExecution[]> {
    const query = 'SELECT * FROM flow_executions WHERE status = $1 ORDER BY created_at DESC';
    return await this.db.query<FlowExecution>(query, [status]);
  }

  async findDueForExecution(): Promise<FlowExecution[]> {
    const query = `
      SELECT * FROM flow_executions 
      WHERE status IN ('pending', 'running', 'sleeping') 
      AND (next_run_at IS NULL OR next_run_at <= NOW())
      ORDER BY next_run_at ASC NULLS LAST, created_at ASC
    `;
    return await this.db.query<FlowExecution>(query);
  }

  async update(id: string, updates: Partial<FlowExecution>): Promise<FlowExecution | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.currentStepId) {
      fields.push(`current_step_id = $${paramIndex++}`);
      values.push(updates.currentStepId);
    }
    if (updates.payload) {
      fields.push(`payload = $${paramIndex++}`);
      values.push(JSON.stringify(updates.payload));
    }
    if (updates.context) {
      fields.push(`context = $${paramIndex++}`);
      values.push(JSON.stringify(updates.context));
    }
    if (updates.startedAt) {
      fields.push(`started_at = $${paramIndex++}`);
      values.push(updates.startedAt);
    }
    if (updates.completedAt) {
      fields.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);
    }
    if (updates.nextRunAt) {
      fields.push(`next_run_at = $${paramIndex++}`);
      values.push(updates.nextRunAt);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE flow_executions 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [result] = await this.db.query<FlowExecution>(query, values);
    return result;
  }
}

export class StepResultModel {
  constructor(private db: DatabaseConnection) {}

  async create(stepResult: Omit<StepResult, 'id' | 'startedAt'>): Promise<StepResult> {
    const query = `
      INSERT INTO step_results (
        execution_id, step_id, step_name, status, output, error, completed_at, duration_ms
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const [result] = await this.db.query<StepResult>(query, [
      stepResult.executionId,
      stepResult.stepId,
      stepResult.stepName,
      stepResult.status,
      stepResult.output ? JSON.stringify(stepResult.output) : null,
      stepResult.error ? JSON.stringify(stepResult.error) : null,
      stepResult.completedAt,
      stepResult.duration
    ]);
    
    return result;
  }

  async findByExecutionId(executionId: string): Promise<StepResult[]> {
    const query = 'SELECT * FROM step_results WHERE execution_id = $1 ORDER BY started_at ASC';
    return await this.db.query<StepResult>(query, [executionId]);
  }

  async findByStepId(executionId: string, stepId: string): Promise<StepResult | null> {
    const query = 'SELECT * FROM step_results WHERE execution_id = $1 AND step_id = $2';
    return await this.db.queryOne<StepResult>(query, [executionId, stepId]);
  }

  async update(id: string, updates: Partial<StepResult>): Promise<StepResult | null> {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    if (updates.status) {
      fields.push(`status = $${paramIndex++}`);
      values.push(updates.status);
    }
    if (updates.output) {
      fields.push(`output = $${paramIndex++}`);
      values.push(JSON.stringify(updates.output));
    }
    if (updates.error) {
      fields.push(`error = $${paramIndex++}`);
      values.push(JSON.stringify(updates.error));
    }
    if (updates.completedAt) {
      fields.push(`completed_at = $${paramIndex++}`);
      values.push(updates.completedAt);
    }
    if (updates.duration) {
      fields.push(`duration_ms = $${paramIndex++}`);
      values.push(updates.duration);
    }

    if (fields.length === 0) return null;

    values.push(id);
    const query = `
      UPDATE step_results 
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const [result] = await this.db.query<StepResult>(query, values);
    return result;
  }
}

export class BatchJobModel {
  constructor(private db: DatabaseConnection) {}

  async create(
    projectId: string,
    data: import('../types/index.js').CreateBatchJobRequest
  ): Promise<import('../types/index.js').BatchJob> {
    const retryPolicy = {
      max_attempts: 3,
      backoff: 'exponential',
      initial_delay_ms: 1000,
      max_delay_ms: 60000,
      ...(data.retry_policy ?? {})
    };

    const [job] = await this.db.query<import('../types/index.js').BatchJob>(
      `INSERT INTO batch_jobs
         (project_id, name, flow_id, concurrency, total_items, retry_policy, scheduled_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        projectId,
        data.name,
        data.flow_id,
        data.concurrency ?? 5,
        data.items.length,
        JSON.stringify(retryPolicy),
        data.scheduled_at ?? null
      ]
    );
    return job!;
  }

  async insertItems(batchJobId: string, items: Record<string, any>[]): Promise<void> {
    if (items.length === 0) return;
    // Insert in chunks of 100 to avoid huge parameter lists
    const chunkSize = 100;
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      const values = chunk.map((_, j) => `($1, $${j + 2})`).join(', ');
      const params: any[] = [batchJobId, ...chunk.map(p => JSON.stringify(p))];
      await this.db.query(
        `INSERT INTO batch_job_items (batch_job_id, payload) VALUES ${values}`,
        params
      );
    }
  }

  async findById(id: string): Promise<import('../types/index.js').BatchJob | null> {
    return this.db.queryOne<import('../types/index.js').BatchJob>(
      'SELECT * FROM batch_jobs WHERE id = $1',
      [id]
    );
  }

  async findAll(projectId: string, status?: string, limit = 20, offset = 0): Promise<import('../types/index.js').BatchJob[]> {
    if (status) {
      return this.db.query<import('../types/index.js').BatchJob>(
        `SELECT * FROM batch_jobs WHERE project_id = $1 AND status = $2
         ORDER BY created_at DESC LIMIT $3 OFFSET $4`,
        [projectId, status, limit, offset]
      );
    }
    return this.db.query<import('../types/index.js').BatchJob>(
      `SELECT * FROM batch_jobs WHERE project_id = $1
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [projectId, limit, offset]
    );
  }

  async updateStatus(
    id: string,
    status: import('../types/index.js').BatchJobStatus,
    extra: { started_at?: Date | null; completed_at?: Date | null } = {}
  ): Promise<import('../types/index.js').BatchJob | null> {
    const fields = ['status = $2'];
    const params: any[] = [id, status];
    let idx = 3;
    if (extra.started_at !== undefined) { fields.push(`started_at = $${idx++}`); params.push(extra.started_at); }
    if (extra.completed_at !== undefined) { fields.push(`completed_at = $${idx++}`); params.push(extra.completed_at); }
    const [job] = await this.db.query<import('../types/index.js').BatchJob>(
      `UPDATE batch_jobs SET ${fields.join(', ')} WHERE id = $1 RETURNING *`,
      params
    );
    return job ?? null;
  }

  async incrementCounters(id: string, completed: number, failed: number): Promise<void> {
    await this.db.query(
      `UPDATE batch_jobs
       SET completed_items = completed_items + $2,
           failed_items    = failed_items    + $3
       WHERE id = $1`,
      [id, completed, failed]
    );
  }

  async findPendingItems(batchJobId: string, limit: number): Promise<import('../types/index.js').BatchJobItem[]> {
    return this.db.query<import('../types/index.js').BatchJobItem>(
      `SELECT * FROM batch_job_items
       WHERE batch_job_id = $1 AND status = 'pending'
       ORDER BY created_at ASC LIMIT $2`,
      [batchJobId, limit]
    );
  }

  async updateItemStatus(
    itemId: string,
    status: import('../types/index.js').BatchJobItemStatus,
    extra: { execution_id?: string | null; error?: { message: string; code?: string } | null; started_at?: Date | null; completed_at?: Date | null; attempt?: number } = {}
  ): Promise<void> {
    const fields = ['status = $2'];
    const params: any[] = [itemId, status];
    let idx = 3;
    if (extra.execution_id !== undefined) { fields.push(`execution_id = $${idx++}`); params.push(extra.execution_id); }
    if (extra.error !== undefined) { fields.push(`error = $${idx++}`); params.push(extra.error ? JSON.stringify(extra.error) : null); }
    if (extra.started_at !== undefined) { fields.push(`started_at = $${idx++}`); params.push(extra.started_at); }
    if (extra.completed_at !== undefined) { fields.push(`completed_at = $${idx++}`); params.push(extra.completed_at); }
    if (extra.attempt !== undefined) { fields.push(`attempt = $${idx++}`); params.push(extra.attempt); }
    await this.db.query(
      `UPDATE batch_job_items SET ${fields.join(', ')} WHERE id = $1`,
      params
    );
  }

  async getItems(batchJobId: string, status?: string, limit = 50, offset = 0): Promise<import('../types/index.js').BatchJobItem[]> {
    if (status) {
      return this.db.query<import('../types/index.js').BatchJobItem>(
        `SELECT * FROM batch_job_items WHERE batch_job_id = $1 AND status = $2
         ORDER BY created_at ASC LIMIT $3 OFFSET $4`,
        [batchJobId, status, limit, offset]
      );
    }
    return this.db.query<import('../types/index.js').BatchJobItem>(
      `SELECT * FROM batch_job_items WHERE batch_job_id = $1
       ORDER BY created_at ASC LIMIT $2 OFFSET $3`,
      [batchJobId, limit, offset]
    );
  }

  async resetFailedItems(batchJobId: string): Promise<number> {
    const result = await this.db.query(
      `UPDATE batch_job_items
       SET status = 'pending', error = NULL, attempt = 0
       WHERE batch_job_id = $1 AND status = 'failed'
       RETURNING id`,
      [batchJobId]
    );
    if (result.length > 0) {
      await this.db.query(
        `UPDATE batch_jobs SET failed_items = 0 WHERE id = $1`,
        [batchJobId]
      );
    }
    return result.length;
  }
}

export class EventModel {
  constructor(private db: DatabaseConnection) {}

  async create(event: Omit<Event, 'id' | 'timestamp'>): Promise<Event> {
    const query = `
      INSERT INTO events (type, payload, source, flow_id, execution_id, processed)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const [result] = await this.db.query<Event>(query, [
      event.type,
      JSON.stringify(event.payload),
      event.source || null,
      event.flowId || null,
      event.executionId || null,
      event.processed || false
    ]);
    
    return result;
  }

  async findUnprocessed(): Promise<Event[]> {
    const query = 'SELECT * FROM events WHERE processed = false ORDER BY created_at ASC';
    return await this.db.query<Event>(query);
  }

  async markAsProcessed(id: string): Promise<boolean> {
    const query = 'UPDATE events SET processed = true WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }

  async findByType(type: string): Promise<Event[]> {
    const query = 'SELECT * FROM events WHERE type = $1 ORDER BY created_at DESC';
    return await this.db.query<Event>(query, [type]);
  }
}

export class TriggerModel {
  constructor(private db: DatabaseConnection) {}

  async create(trigger: Omit<Trigger, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trigger> {
    const query = `
      INSERT INTO triggers (flow_id, type, config, active)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    
    const [result] = await this.db.query<Trigger>(query, [
      trigger.flowId,
      trigger.type,
      JSON.stringify(trigger.config),
      trigger.active
    ]);
    
    return result;
  }

  async findByFlowId(flowId: string): Promise<Trigger[]> {
    const query = 'SELECT * FROM triggers WHERE flow_id = $1 AND active = true';
    return await this.db.query<Trigger>(query, [flowId]);
  }

  async findByType(type: string): Promise<Trigger[]> {
    const query = 'SELECT * FROM triggers WHERE type = $1 AND active = true';
    return await this.db.query<Trigger>(query, [type]);
  }

  async activate(id: string): Promise<boolean> {
    const query = 'UPDATE triggers SET active = true WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }

  async deactivate(id: string): Promise<boolean> {
    const query = 'UPDATE triggers SET active = false WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.length > 0;
  }
}
