
-- Function to update a customer's loyalty points
CREATE OR REPLACE FUNCTION award_referral_points(customer_identifier UUID, points_to_award INTEGER)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE customers
  SET loyalty_points = COALESCE(loyalty_points, 0) + points_to_award
  WHERE id = customer_identifier;
  
  -- Insert record in points_history table if it exists
  BEGIN
    INSERT INTO points_history (customer_id, points, action_type, description)
    VALUES (customer_identifier, points_to_award, 'referral', 'Points earned from referral program');
  EXCEPTION 
    WHEN undefined_table THEN
      -- Table doesn't exist, ignore this part
      NULL;
  END;
END;
$$;
