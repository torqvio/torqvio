-- Add missing columns to webhooks table for cleanup system
-- This migration adds the retry_count and other columns needed by SmartCleanupSystem

ALTER TABLE webhooks 
ADD COLUMN IF NOT EXISTS events TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_webhooks_retry_count ON webhooks(retry_count);
CREATE INDEX IF NOT EXISTS idx_webhooks_last_triggered ON webhooks(last_triggered_at) WHERE last_triggered_at IS NOT NULL;
