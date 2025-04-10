
-- Add membership_seconds_left column to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS membership_seconds_left BIGINT;

-- Update existing customers with membershipHoursLeft to use seconds
-- This will convert hours to seconds (1 hour = 3600 seconds)
UPDATE customers
SET membership_seconds_left = membership_hours_left * 3600
WHERE membership_hours_left IS NOT NULL AND membership_seconds_left IS NULL;

-- Add comment to explain the column
COMMENT ON COLUMN customers.membership_seconds_left IS 'Remaining membership time in seconds';

