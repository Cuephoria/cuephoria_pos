
-- Create function to get loyalty redemptions for a customer
CREATE OR REPLACE FUNCTION get_loyalty_redemptions(customer_uuid UUID)
RETURNS SETOF loyalty_redemptions
AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM loyalty_redemptions
  WHERE customer_id = customer_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to create a new loyalty redemption
CREATE OR REPLACE FUNCTION create_loyalty_redemption(
  customer_uuid UUID,
  points_redeemed_val INTEGER,
  redemption_code_val TEXT,
  reward_name_val TEXT
)
RETURNS UUID
AS $$
DECLARE
  new_id UUID;
BEGIN
  INSERT INTO loyalty_redemptions (
    customer_id,
    points_redeemed,
    redemption_code,
    reward_name,
    is_used,
    created_at
  )
  VALUES (
    customer_uuid,
    points_redeemed_val,
    redemption_code_val,
    reward_name_val,
    false,
    now()
  )
  RETURNING id INTO new_id;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_loyalty_redemptions(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_loyalty_redemption(UUID, INTEGER, TEXT, TEXT) TO authenticated;
