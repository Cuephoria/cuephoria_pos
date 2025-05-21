
-- Add coupon related columns to bookings table if they don't exist
DO $$
BEGIN
  -- Add coupon_code column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE public.bookings
    ADD COLUMN coupon_code TEXT NULL;
  END IF;

  -- Add discount_percentage column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE public.bookings
    ADD COLUMN discount_percentage NUMERIC NULL;
  END IF;

  -- Add original_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'original_price'
  ) THEN
    ALTER TABLE public.bookings
    ADD COLUMN original_price NUMERIC NULL;
  END IF;

  -- Add final_price column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'bookings' AND column_name = 'final_price'
  ) THEN
    ALTER TABLE public.bookings
    ADD COLUMN final_price NUMERIC NULL;
  END IF;
END $$;
