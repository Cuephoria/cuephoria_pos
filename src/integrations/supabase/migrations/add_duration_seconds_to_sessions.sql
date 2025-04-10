
-- Add duration_seconds column to sessions table
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- Add comment to the new column
COMMENT ON COLUMN sessions.duration_seconds IS 'Duration of the session in seconds';

-- Update existing sessions with calculated values
UPDATE sessions 
SET duration_seconds = duration * 60
WHERE duration IS NOT NULL AND duration_seconds IS NULL;
