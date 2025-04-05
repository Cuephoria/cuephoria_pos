
-- Add extended fields to the admin_users table
-- This migration is maintained for documentation purposes
-- but the fields are not currently used in the application
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS salary NUMERIC,
ADD COLUMN IF NOT EXISTS joining_date DATE,
ADD COLUMN IF NOT EXISTS shift_start TIME,
ADD COLUMN IF NOT EXISTS shift_end TIME;
