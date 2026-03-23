-- Migration 008: Batch Jobs
-- Creates batch_jobs and batch_job_items tables for durable batch processing

CREATE TABLE IF NOT EXISTS batch_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued', 'running', 'paused', 'completed', 'failed', 'cancelled')),
  concurrency INTEGER NOT NULL DEFAULT 5 CHECK (concurrency >= 1 AND concurrency <= 100),
  total_items INTEGER NOT NULL DEFAULT 0,
  completed_items INTEGER NOT NULL DEFAULT 0,
  failed_items INTEGER NOT NULL DEFAULT 0,
  skipped_items INTEGER NOT NULL DEFAULT 0,
  retry_policy JSONB NOT NULL DEFAULT '{"max_attempts": 3, "backoff": "exponential", "initial_delay_ms": 1000, "max_delay_ms": 60000}',
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS batch_job_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_job_id UUID NOT NULL REFERENCES batch_jobs(id) ON DELETE CASCADE,
  payload JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  execution_id UUID REFERENCES flow_executions(id) ON DELETE SET NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  error JSONB,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_batch_jobs_project_id ON batch_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_flow_id ON batch_jobs(flow_id);
CREATE INDEX IF NOT EXISTS idx_batch_jobs_scheduled_at ON batch_jobs(scheduled_at) WHERE scheduled_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_batch_job_items_batch_job_id ON batch_job_items(batch_job_id);
CREATE INDEX IF NOT EXISTS idx_batch_job_items_status ON batch_job_items(batch_job_id, status);

-- Auto-update updated_at on batch_jobs
CREATE OR REPLACE FUNCTION update_batch_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_batch_jobs_updated_at ON batch_jobs;
CREATE TRIGGER trg_batch_jobs_updated_at
  BEFORE UPDATE ON batch_jobs
  FOR EACH ROW EXECUTE FUNCTION update_batch_jobs_updated_at();

DROP TRIGGER IF EXISTS trg_batch_job_items_updated_at ON batch_job_items;
CREATE TRIGGER trg_batch_job_items_updated_at
  BEFORE UPDATE ON batch_job_items
  FOR EACH ROW EXECUTE FUNCTION update_batch_jobs_updated_at();
