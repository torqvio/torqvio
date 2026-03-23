-- Add Avatar URL Column Migration
-- This migration adds avatar_url column to users table for storing profile pictures

-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Add index for avatar_url for potential queries
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);
