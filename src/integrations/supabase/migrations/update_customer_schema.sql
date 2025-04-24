
-- Add reset_pin column to customer_profiles table
ALTER TABLE IF EXISTS public.customers
ADD COLUMN IF NOT EXISTS reset_pin VARCHAR(20);

-- Add a comment to explain the purpose of this column
COMMENT ON COLUMN public.customers.reset_pin IS 'PIN used for password reset functionality';

