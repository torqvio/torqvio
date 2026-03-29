-- Link named API keys to a project so tenant isolation works correctly
ALTER TABLE api_keys ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_api_keys_project_id ON api_keys(project_id);
