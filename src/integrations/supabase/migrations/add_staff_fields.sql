
-- This migration adds the extended staff fields to the admin_users table
-- First create a function to add columns if they don't exist

CREATE OR REPLACE FUNCTION execute_staff_fields_migration()
RETURNS TEXT LANGUAGE PLPGSQL AS $$
DECLARE
  col_exists INTEGER;
BEGIN
  -- Add position column if it doesn't exist
  SELECT COUNT(*) INTO col_exists 
  FROM information_schema.columns 
  WHERE table_name = 'admin_users' AND column_name = 'position';
  
  IF col_exists = 0 THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN position TEXT';
  END IF;

  -- Add salary column if it doesn't exist
  SELECT COUNT(*) INTO col_exists 
  FROM information_schema.columns 
  WHERE table_name = 'admin_users' AND column_name = 'salary';
  
  IF col_exists = 0 THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN salary NUMERIC';
  END IF;

  -- Add joining_date column if it doesn't exist
  SELECT COUNT(*) INTO col_exists 
  FROM information_schema.columns 
  WHERE table_name = 'admin_users' AND column_name = 'joining_date';
  
  IF col_exists = 0 THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN joining_date TEXT';
  END IF;

  -- Add shift_start column if it doesn't exist
  SELECT COUNT(*) INTO col_exists 
  FROM information_schema.columns 
  WHERE table_name = 'admin_users' AND column_name = 'shift_start';
  
  IF col_exists = 0 THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN shift_start TEXT';
  END IF;

  -- Add shift_end column if it doesn't exist
  SELECT COUNT(*) INTO col_exists 
  FROM information_schema.columns 
  WHERE table_name = 'admin_users' AND column_name = 'shift_end';
  
  IF col_exists = 0 THEN
    EXECUTE 'ALTER TABLE admin_users ADD COLUMN shift_end TEXT';
  END IF;

  RETURN 'Staff fields migration executed successfully';
END;
$$;

-- Create a utility function for adding columns (used as fallback)
CREATE OR REPLACE FUNCTION add_column_if_not_exists(
  table_name TEXT,
  column_name TEXT,
  column_type TEXT
) RETURNS TEXT LANGUAGE PLPGSQL AS $$
DECLARE
  col_exists INTEGER;
BEGIN
  SELECT COUNT(*) INTO col_exists 
  FROM information_schema.columns 
  WHERE table_name = $1 AND column_name = $2;
  
  IF col_exists = 0 THEN
    EXECUTE 'ALTER TABLE ' || $1 || ' ADD COLUMN ' || $2 || ' ' || $3;
    RETURN 'Column ' || $2 || ' added to ' || $1;
  END IF;
  
  RETURN 'Column ' || $2 || ' already exists in ' || $1;
END;
$$;

-- Execute the migration function
SELECT execute_staff_fields_migration();
