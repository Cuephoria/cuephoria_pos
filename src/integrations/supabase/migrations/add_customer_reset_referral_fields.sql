
-- Add reset_pin and referred_by fields to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS reset_pin TEXT;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS referred_by TEXT;
