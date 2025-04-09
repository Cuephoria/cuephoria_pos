
-- Add duration_seconds column to sessions table for precise time tracking
ALTER TABLE sessions 
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Add comment to the column
COMMENT ON COLUMN sessions.duration_seconds IS 'Stores exact session duration in seconds for precise membership hour calculations';
