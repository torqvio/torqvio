import { Router, Response } from 'express';
import { createDatabaseConnection } from '../../database/connection.js';
import { authenticateApiKey, AuthenticatedRequest } from '../../utils/auth.js';
import { BatchJobService } from '../../services/BatchJobService.js';
import { logger } from '../../utils/logger.js';

const router: Router = Router();

// All batch-job routes require API key auth
router.use(authenticateApiKey);

function getService(): BatchJobService {
  return new BatchJobService(createDatabaseConnection());
}

// ─── POST /api/v1/batch-jobs ─────────────────────────────────────────────────
// Create a new batch job
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.projectId!;
    const { name, flow_id, items, concurrency, retry_policy, scheduled_at } = req.body;

    if (!name || !flow_id || !Array.isArray(items)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'name, flow_id, and items[] are required'
      });
    }

    const service = getService();
    const job = await service.create(projectId, { name, flow_id, items, concurrency, retry_policy, scheduled_at });

    logger.info('Batch job created via API', { batchJobId: job.id, projectId });

    return res.status(201).json(job);
  } catch (err: any) {
    logger.error('POST /api/v1/batch-jobs failed', { error: err.message });
    const status = err.message.includes('not found') ? 404
      : err.message.includes('required') || err.message.includes('must') ? 400
      : 500;
    return res.status(status).json({ error: 'Failed to create batch job', message: err.message });
  }
});

// ─── GET /api/v1/batch-jobs ──────────────────────────────────────────────────
// List batch jobs (optionally filter by status, paginate)
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const projectId = req.projectId!;
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const validStatuses = ['queued', 'running', 'paused', 'completed', 'failed', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: `status must be one of: ${validStatuses.join(', ')}`
      });
    }

    const service = getService();
    const jobs = await service.list(projectId, status, limitNum, offset);

    return res.json({
      data: jobs,
      pagination: { page: pageNum, limit: limitNum, count: jobs.length }
    });
  } catch (err: any) {
    logger.error('GET /api/v1/batch-jobs failed', { error: err.message });
    return res.status(500).json({ error: 'Failed to list batch jobs', message: err.message });
  }
});

// ─── GET /api/v1/batch-jobs/:id ──────────────────────────────────────────────
// Get a single batch job with progress
router.get('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = req.projectId!;

    const service = getService();
    const job = await service.get(id as string, projectId);

    if (!job) {
      return res.status(404).json({ error: 'Batch job not found', message: `No batch job with id ${id}` });
    }

    const progress_percent = job.total_items > 0
      ? Math.round(((job.completed_items + job.failed_items + job.skipped_items) / job.total_items) * 1000) / 10
      : 0;

    return res.json({ ...job, progress_percent });
  } catch (err: any) {
    logger.error('GET /api/v1/batch-jobs/:id failed', { error: err.message });
    return res.status(500).json({ error: 'Failed to get batch job', message: err.message });
  }
});

// ─── GET /api/v1/batch-jobs/:id/items ────────────────────────────────────────
// List items for a batch job
router.get('/:id/items', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const projectId = req.projectId!;
    const { status, page = '1', limit = '50' } = req.query as Record<string, string>;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10) || 50));
    const offset = (pageNum - 1) * limitNum;

    const service = getService();
    const items = await service.getItems(id as string, projectId, status, limitNum, offset);

    return res.json({
      data: items,
      pagination: { page: pageNum, limit: limitNum, count: items.length }
    });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404 : 500;
    return res.status(status).json({ error: 'Failed to get batch job items', message: err.message });
  }
});

// ─── POST /api/v1/batch-jobs/:id/pause ───────────────────────────────────────
router.post('/:id/pause', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const service = getService();
    const job = await service.pause(id as string, req.projectId!);
    return res.json({ message: 'Batch job paused', job });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Cannot') ? 409 : 500;
    return res.status(status).json({ error: 'Failed to pause batch job', message: err.message });
  }
});

// ─── POST /api/v1/batch-jobs/:id/resume ──────────────────────────────────────
router.post('/:id/resume', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const service = getService();
    const job = await service.resume(id as string, req.projectId!);
    return res.json({ message: 'Batch job resumed', job });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Cannot') ? 409 : 500;
    return res.status(status).json({ error: 'Failed to resume batch job', message: err.message });
  }
});

// ─── POST /api/v1/batch-jobs/:id/cancel ──────────────────────────────────────
router.post('/:id/cancel', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const service = getService();
    const job = await service.cancel(id as string, req.projectId!);
    return res.json({ message: 'Batch job cancelled', job });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Cannot') ? 409 : 500;
    return res.status(status).json({ error: 'Failed to cancel batch job', message: err.message });
  }
});

// ─── POST /api/v1/batch-jobs/:id/retry ───────────────────────────────────────
router.post('/:id/retry', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { failed_only = true } = req.body;
    const service = getService();
    const result = await service.retryFailed(id as string, req.projectId!, Boolean(failed_only));
    return res.json({ message: 'Retry triggered', ...result });
  } catch (err: any) {
    const status = err.message.includes('not found') ? 404
      : err.message.includes('Can only') ? 409 : 500;
    return res.status(status).json({ error: 'Failed to retry batch job', message: err.message });
  }
});

export default router;
