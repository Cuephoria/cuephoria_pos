
-- Create loyalty_redemptions table
CREATE TABLE IF NOT EXISTS loyalty_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL,
  points_redeemed INTEGER NOT NULL,
  redemption_code TEXT NOT NULL,
  reward_name TEXT,
  is_used BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  used_at TIMESTAMPTZ
);

-- Add comment to table
COMMENT ON TABLE loyalty_redemptions IS 'Stores loyalty point redemptions by customers';

-- Add foreign key constraint
ALTER TABLE loyalty_redemptions 
  ADD CONSTRAINT fk_loyalty_redemptions_customer
  FOREIGN KEY (customer_id)
  REFERENCES customers(id)
  ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE loyalty_redemptions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see their own redemptions
CREATE POLICY "Users can view their own redemptions"
  ON loyalty_redemptions
  FOR SELECT
  USING (auth.uid()::text = customer_id::text);

-- Create policy to allow inserting redemptions
CREATE POLICY "Users can create redemptions"
  ON loyalty_redemptions
  FOR INSERT
  WITH CHECK (auth.uid()::text = customer_id::text);

-- Create function to deduct loyalty points
CREATE OR REPLACE FUNCTION deduct_loyalty_points(user_id UUID, points_to_deduct INTEGER)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the customer's loyalty points
  UPDATE customers
  SET loyalty_points = loyalty_points - points_to_deduct
  WHERE id = user_id AND loyalty_points >= points_to_deduct;
END;
$$;

-- Grant execution permission
GRANT EXECUTE ON FUNCTION deduct_loyalty_points TO authenticated;
