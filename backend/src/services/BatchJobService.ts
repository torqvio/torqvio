import { DatabaseConnection } from '../database/connection.js';
import { BatchJobModel } from '../database/models.js';
import { logger } from '../utils/logger.js';
import type { BatchJob, BatchJobItem, BatchJobStatus, CreateBatchJobRequest } from '../types/index.js';

export class BatchJobService {
  private model: BatchJobModel;

  constructor(private db: DatabaseConnection) {
    this.model = new BatchJobModel(db);
  }

  async create(projectId: string, data: CreateBatchJobRequest): Promise<BatchJob> {
    if (!data.name?.trim()) throw new Error('Batch job name is required');
    if (!data.flow_id) throw new Error('flow_id is required');
    if (!Array.isArray(data.items) || data.items.length === 0) throw new Error('items array must not be empty');
    if (data.concurrency !== undefined && (data.concurrency < 1 || data.concurrency > 100)) {
      throw new Error('concurrency must be between 1 and 100');
    }

    // Verify the flow exists and belongs to this project
    const flow = await this.db.queryOne(
      'SELECT id FROM flows WHERE id = $1',
      [data.flow_id]
    );
    if (!flow) throw new Error(`Flow ${data.flow_id} not found`);

    return this.db.transaction(async (client) => {
      const retryPolicy = {
        max_attempts: 3,
        backoff: 'exponential',
        initial_delay_ms: 1000,
        max_delay_ms: 60000,
        ...(data.retry_policy ?? {})
      };

      const jobResult = await client.query(
        `INSERT INTO batch_jobs
           (project_id, name, flow_id, concurrency, total_items, retry_policy, scheduled_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          projectId,
          data.name.trim(),
          data.flow_id,
          data.concurrency ?? 5,
          data.items.length,
          JSON.stringify(retryPolicy),
          data.scheduled_at ?? null
        ]
      );
      const job: BatchJob = jobResult.rows[0];

      // Insert items in chunks of 100
      const chunkSize = 100;
      for (let i = 0; i < data.items.length; i += chunkSize) {
        const chunk = data.items.slice(i, i + chunkSize);
        const values = chunk.map((_, j) => `($1, $${j + 2})`).join(', ');
        const params: any[] = [job.id, ...chunk.map(p => JSON.stringify(p))];
        await client.query(
          `INSERT INTO batch_job_items (batch_job_id, payload) VALUES ${values}`,
          params
        );
      }

      logger.info('Batch job created', { batchJobId: job.id, totalItems: data.items.length, projectId });

      // If no scheduled_at, kick off processing immediately
      if (!data.scheduled_at) {
        setImmediate(() => this.processJob(job.id).catch(err => {
          logger.error('Batch job processing error', { batchJobId: job.id, error: err.message });
        }));
      }

      return job;
    });
  }

  async list(projectId: string, status?: string, limit = 20, offset = 0): Promise<BatchJob[]> {
    return this.model.findAll(projectId, status, Math.min(limit, 100), offset);
  }

  async get(id: string, projectId: string): Promise<BatchJob | null> {
    const job = await this.model.findById(id);
    if (!job || job.project_id !== projectId) return null;
    return job;
  }

  async pause(id: string, projectId: string): Promise<BatchJob> {
    const job = await this.requireJob(id, projectId);
    if (job.status !== 'running') throw new Error(`Cannot pause a job with status '${job.status}'`);
    const updated = await this.model.updateStatus(id, 'paused');
    logger.info('Batch job paused', { batchJobId: id });
    return updated!;
  }

  async resume(id: string, projectId: string): Promise<BatchJob> {
    const job = await this.requireJob(id, projectId);
    if (job.status !== 'paused') throw new Error(`Cannot resume a job with status '${job.status}'`);
    const updated = await this.model.updateStatus(id, 'running');
    logger.info('Batch job resumed', { batchJobId: id });
    setImmediate(() => this.processJob(id).catch(err => {
      logger.error('Batch job resume processing error', { batchJobId: id, error: err.message });
    }));
    return updated!;
  }

  async cancel(id: string, projectId: string): Promise<BatchJob> {
    const job = await this.requireJob(id, projectId);
    if (['completed', 'failed', 'cancelled'].includes(job.status)) {
      throw new Error(`Cannot cancel a job with status '${job.status}'`);
    }
    const updated = await this.model.updateStatus(id, 'cancelled', { completed_at: new Date() });
    // Mark all pending/running items as skipped
    await this.db.query(
      `UPDATE batch_job_items SET status = 'skipped'
       WHERE batch_job_id = $1 AND status IN ('pending', 'running')`,
      [id]
    );
    logger.info('Batch job cancelled', { batchJobId: id });
    return updated!;
  }

  async retryFailed(id: string, projectId: string, failedOnly = true): Promise<{ reset_count: number }> {
    const job = await this.requireJob(id, projectId);
    if (!['completed', 'failed', 'paused'].includes(job.status)) {
      throw new Error(`Can only retry jobs with status completed, failed, or paused`);
    }
    const reset_count = failedOnly ? await this.model.resetFailedItems(id) : 0;
    if (!failedOnly) {
      // Reset all non-completed items
      await this.db.query(
        `UPDATE batch_job_items SET status = 'pending', error = NULL, attempt = 0
         WHERE batch_job_id = $1 AND status != 'completed'`,
        [id]
      );
      await this.db.query(
        `UPDATE batch_jobs SET failed_items = 0, status = 'queued' WHERE id = $1`,
        [id]
      );
    }

    if (reset_count > 0 || !failedOnly) {
      await this.model.updateStatus(id, 'queued');
      setImmediate(() => this.processJob(id).catch(err => {
        logger.error('Batch job retry processing error', { batchJobId: id, error: err.message });
      }));
    }

    logger.info('Batch job retry triggered', { batchJobId: id, reset_count });
    return { reset_count };
  }

  async getItems(id: string, projectId: string, status?: string, limit = 50, offset = 0): Promise<BatchJobItem[]> {
    await this.requireJob(id, projectId);
    return this.model.getItems(id, status, Math.min(limit, 200), offset);
  }

  // ─── Internal processor ────────────────────────────────────────────────────

  private async processJob(batchJobId: string): Promise<void> {
    const job = await this.model.findById(batchJobId);
    if (!job || ['cancelled', 'completed', 'paused'].includes(job.status)) return;

    // Transition to running
    if (job.status === 'queued') {
      await this.model.updateStatus(batchJobId, 'running', { started_at: new Date() });
    }

    const concurrency = job.concurrency;

    // Process until no pending items remain
    while (true) {
      // Re-check status in case of pause/cancel
      const current = await this.model.findById(batchJobId);
      if (!current || ['cancelled', 'paused', 'completed', 'failed'].includes(current.status)) break;

      const batch = await this.model.findPendingItems(batchJobId, concurrency);
      if (batch.length === 0) break;

      await Promise.allSettled(batch.map(item => this.processItem(batchJobId, item, job.flow_id!, job.retry_policy)));
    }

    // Finalize
    const final = await this.model.findById(batchJobId);
    if (!final || ['cancelled', 'paused'].includes(final.status)) return;

    const allDone = final.completed_items + final.failed_items + final.skipped_items >= final.total_items;
    if (allDone) {
      const finalStatus: BatchJobStatus = final.failed_items > 0 && final.completed_items === 0
        ? 'failed'
        : 'completed';
      await this.model.updateStatus(batchJobId, finalStatus, { completed_at: new Date() });
      logger.info('Batch job finished', { batchJobId, status: finalStatus, ...final });
    }
  }

  private async processItem(
    batchJobId: string,
    item: BatchJobItem,
    flowId: string,
    retryPolicy: BatchJob['retry_policy']
  ): Promise<void> {
    await this.model.updateItemStatus(item.id, 'running', {
      started_at: new Date(),
      attempt: item.attempt + 1
    });

    try {
      // Create a flow execution for this item
      const [execution] = await this.db.query(
        `INSERT INTO flow_executions (flow_id, status, payload, created_at, updated_at)
         VALUES ($1, 'pending', $2, NOW(), NOW())
         RETURNING id`,
        [flowId, JSON.stringify(item.payload)]
      );

      await this.model.updateItemStatus(item.id, 'completed', {
        execution_id: execution.id,
        completed_at: new Date()
      });
      await this.model.incrementCounters(batchJobId, 1, 0);

    } catch (err: any) {
      const attempt = item.attempt + 1;
      const maxAttempts = retryPolicy.max_attempts;

      if (attempt < maxAttempts) {
        // Schedule retry — reset to pending after delay
        const delay = this.calcDelay(retryPolicy, attempt);
        setTimeout(async () => {
          await this.model.updateItemStatus(item.id, 'pending', { attempt });
        }, delay);
      } else {
        await this.model.updateItemStatus(item.id, 'failed', {
          error: { message: err.message, code: err.code },
          completed_at: new Date(),
          attempt
        });
        await this.model.incrementCounters(batchJobId, 0, 1);
        logger.warn('Batch item failed permanently', { itemId: item.id, batchJobId, error: err.message });
      }
    }
  }

  private calcDelay(policy: BatchJob['retry_policy'], attempt: number): number {
    const { backoff, initial_delay_ms, max_delay_ms } = policy;
    let delay: number;
    if (backoff === 'exponential') {
      delay = initial_delay_ms * Math.pow(2, attempt - 1);
    } else if (backoff === 'linear') {
      delay = initial_delay_ms * attempt;
    } else {
      delay = initial_delay_ms;
    }
    return Math.min(delay, max_delay_ms);
  }

  private async requireJob(id: string, projectId: string): Promise<BatchJob> {
    const job = await this.model.findById(id);
    if (!job || job.project_id !== projectId) throw new Error('Batch job not found');
    return job;
  }
}
