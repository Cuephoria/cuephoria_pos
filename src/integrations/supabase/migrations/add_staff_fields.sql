
-- This migration adds the extended staff fields to the admin_users table
-- First check if each column exists before adding it

DO $$
BEGIN

-- Add position column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'admin_users'
    AND column_name = 'position'
) THEN
    ALTER TABLE admin_users ADD COLUMN position TEXT;
END IF;

-- Add salary column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'admin_users'
    AND column_name = 'salary'
) THEN
    ALTER TABLE admin_users ADD COLUMN salary NUMERIC;
END IF;

-- Add joining_date column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'admin_users'
    AND column_name = 'joining_date'
) THEN
    ALTER TABLE admin_users ADD COLUMN joining_date TEXT;
END IF;

-- Add shift_start column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'admin_users'
    AND column_name = 'shift_start'
) THEN
    ALTER TABLE admin_users ADD COLUMN shift_start TEXT;
END IF;

-- Add shift_end column if it doesn't exist
IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'admin_users'
    AND column_name = 'shift_end'
) THEN
    ALTER TABLE admin_users ADD COLUMN shift_end TEXT;
END IF;

END $$;

-- Output a message about the migration
SELECT 'Staff fields migration executed' as message;
