
-- Add comment to clarify the hours column
COMMENT ON COLUMN customers.membership_hours_left IS 'Remaining membership time in hours';

-- Make sure all customers have their membership_hours_left filled correctly
UPDATE customers
SET membership_hours_left = membership_seconds_left / 3600
WHERE membership_seconds_left IS NOT NULL AND membership_hours_left IS NULL;
