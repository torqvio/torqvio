-- Performance optimization indexes for Torqvio backend
-- These indexes target frequently queried columns that are causing full table scans

-- Index for workflows table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_project_id ON flows(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_created_at ON flows(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_name ON flows(name);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_definition_type ON flows USING gin((definition->>'type'));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_definition_jsonb ON flows USING gin(definition);
-- Full-text search indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_search_text ON flows USING gin(to_tsvector('simple', name || ' ' || COALESCE(definition::text, '')));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_name_trigram ON flows USING gin(name gin_trgm_ops);

-- Index for flow_executions table  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_flow_id ON flow_executions(flow_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_status ON flow_executions(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_created_at ON flow_executions(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_flow_id_created_at ON flow_executions(flow_id, created_at DESC);

-- Index for users table (authentication queries)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_id ON users(id);

-- Index for api_keys table (API authentication)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_api_keys_last_used_at ON api_keys(last_used_at);

-- Index for projects table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_api_key ON projects(api_key);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_projects_is_active ON projects(is_active);

-- Index for batch_jobs table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batch_jobs_project_id ON batch_jobs(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batch_jobs_status ON batch_jobs(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batch_jobs_scheduled_at ON batch_jobs(scheduled_at);

-- Index for batch_job_items table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batch_job_items_batch_job_id ON batch_job_items(batch_job_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_batch_job_items_status ON batch_job_items(status);

-- Index for webhook_subscriptions table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_subscriptions_active ON webhook_subscriptions(active);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_subscriptions_next_retry_at ON webhook_subscriptions(next_retry_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_subscriptions_project_id ON webhook_subscriptions(project_id);

-- Index for integrations table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integrations_project_id ON integrations(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integrations_type ON integrations(type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integrations_status ON integrations(status);

-- Index for integration_events table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integration_events_integration_id ON integration_events(integration_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integration_events_status ON integration_events(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_integration_events_created_at ON integration_events(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_flow_status_created ON flow_executions(flow_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flows_project_created ON flows(project_id, created_at DESC);

-- Partial indexes for better performance on filtered queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flow_executions_running ON flow_executions(flow_id, created_at DESC) WHERE status = 'running';
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_webhook_subscriptions_retry ON webhook_subscriptions(id, next_retry_at) WHERE active = true AND retry_count < 3;

-- Analyze tables to update query planner statistics
ANALYZE flows;
ANALYZE flow_executions;
ANALYZE users;
ANALYZE api_keys;
ANALYZE projects;
ANALYZE batch_jobs;
ANALYZE batch_job_items;
ANALYZE webhook_subscriptions;
ANALYZE integrations;
ANALYZE integration_events;
