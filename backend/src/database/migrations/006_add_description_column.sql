-- Add description column to flows table
ALTER TABLE flows ADD COLUMN IF NOT EXISTS description TEXT;

-- Add status column to flows table  
ALTER TABLE flows ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- Update existing flows to have default status
UPDATE flows SET status = 'active' WHERE status IS NULL;
