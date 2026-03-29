-- Add indexes to optimize webhook cleanup queries
-- These indexes will improve performance of the SUBSTRING operations used in SmartCleanupSystem

-- Create index on url for faster domain extraction
CREATE INDEX IF NOT EXISTS idx_webhooks_url_text ON webhooks USING gin (url gin_trgm_ops);

-- Create index on created_at for time-based filtering
CREATE INDEX IF NOT EXISTS idx_webhooks_created_at ON webhooks(created_at);

-- Composite index for active + created_at queries
CREATE INDEX IF NOT EXISTS idx_webhooks_active_created_at ON webhooks(active, created_at);

-- Enable pg_trgm extension for text similarity searches (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;
