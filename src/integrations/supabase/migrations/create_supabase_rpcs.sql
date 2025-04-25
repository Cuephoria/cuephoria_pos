
-- Function to get available rewards
CREATE OR REPLACE FUNCTION get_available_rewards()
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  points_required integer,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.description, r.points_required, r.is_active
  FROM rewards r
  WHERE r.is_active = true
  ORDER BY r.points_required ASC;
END;
$$ LANGUAGE plpgsql;

-- Function to get active promotions
CREATE OR REPLACE FUNCTION get_active_promotions(current_time timestamp with time zone)
RETURNS TABLE (
  id uuid,
  title text,
  description text,
  discount_percentage integer,
  discount_amount integer,
  code text,
  starts_at timestamp with time zone,
  ends_at timestamp with time zone,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.title, p.description, p.discount_percentage, p.discount_amount, 
         p.code, p.starts_at, p.ends_at, p.is_active
  FROM promotions p
  WHERE p.is_active = true
    AND (p.ends_at IS NULL OR p.ends_at > current_time)
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to process referral points
CREATE OR REPLACE FUNCTION process_referral_points(p_bill_id text, p_customer_id text)
RETURNS boolean AS $$
DECLARE
  v_count integer;
  v_referred_by_code text;
  v_referrer_id uuid;
  v_referrer_points integer;
  v_new_customer_points integer;
BEGIN
  -- First check if this is the customer's first bill
  SELECT COUNT(*) INTO v_count
  FROM bills
  WHERE customer_id = p_customer_id::uuid;
  
  -- If not the first bill, don't proceed
  IF v_count > 1 THEN
    RETURN false;
  END IF;
  
  -- Check if customer was referred
  SELECT referred_by_code INTO v_referred_by_code
  FROM customers
  WHERE id = p_customer_id::uuid;
  
  IF v_referred_by_code IS NULL THEN
    RETURN false;
  END IF;
  
  -- Find the referrer using the code
  SELECT id, loyalty_points INTO v_referrer_id, v_referrer_points
  FROM customers
  WHERE referral_code = v_referred_by_code;
  
  IF v_referrer_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Update the referral record
  UPDATE referrals
  SET points_awarded = true
  WHERE referee_id = p_customer_id::uuid AND referrer_id = v_referrer_id;
  
  -- Award 100 points to the referrer
  UPDATE customers
  SET loyalty_points = (v_referrer_points + 100)
  WHERE id = v_referrer_id;
  
  -- Also give 50 points to the new customer
  SELECT loyalty_points INTO v_new_customer_points
  FROM customers
  WHERE id = p_customer_id::uuid;
  
  UPDATE customers
  SET loyalty_points = (v_new_customer_points + 50)
  WHERE id = p_customer_id::uuid;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- Function to create a reward
CREATE OR REPLACE FUNCTION create_reward(
  p_name text,
  p_description text,
  p_points_required integer,
  p_is_active boolean
)
RETURNS uuid AS $$
DECLARE
  v_reward_id uuid;
BEGIN
  INSERT INTO rewards (
    name, 
    description, 
    points_required, 
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    p_name, 
    p_description, 
    p_points_required, 
    p_is_active,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_reward_id;
  
  RETURN v_reward_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update a reward
CREATE OR REPLACE FUNCTION update_reward(
  p_id uuid,
  p_name text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_points_required integer DEFAULT NULL,
  p_is_active boolean DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE rewards
  SET 
    name = COALESCE(p_name, name),
    description = COALESCE(p_description, description),
    points_required = COALESCE(p_points_required, points_required),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to create a promotion
CREATE OR REPLACE FUNCTION create_promotion(
  p_title text,
  p_description text,
  p_discount_percentage integer DEFAULT NULL,
  p_discount_amount integer DEFAULT NULL,
  p_code text DEFAULT NULL,
  p_starts_at timestamp with time zone,
  p_ends_at timestamp with time zone DEFAULT NULL,
  p_is_active boolean DEFAULT true
)
RETURNS uuid AS $$
DECLARE
  v_promotion_id uuid;
BEGIN
  INSERT INTO promotions (
    title,
    description,
    discount_percentage,
    discount_amount,
    code,
    starts_at,
    ends_at,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    p_title,
    p_description,
    p_discount_percentage,
    p_discount_amount,
    p_code,
    p_starts_at,
    p_ends_at,
    p_is_active,
    NOW(),
    NOW()
  )
  RETURNING id INTO v_promotion_id;
  
  RETURN v_promotion_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update a promotion
CREATE OR REPLACE FUNCTION update_promotion(
  p_id uuid,
  p_title text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_discount_percentage integer DEFAULT NULL,
  p_discount_amount integer DEFAULT NULL,
  p_code text DEFAULT NULL,
  p_starts_at timestamp with time zone DEFAULT NULL,
  p_ends_at timestamp with time zone DEFAULT NULL,
  p_is_active boolean DEFAULT NULL
)
RETURNS boolean AS $$
BEGIN
  UPDATE promotions
  SET 
    title = COALESCE(p_title, title),
    description = COALESCE(p_description, description),
    discount_percentage = COALESCE(p_discount_percentage, discount_percentage),
    discount_amount = COALESCE(p_discount_amount, discount_amount),
    code = COALESCE(p_code, code),
    starts_at = COALESCE(p_starts_at, starts_at),
    ends_at = COALESCE(p_ends_at, ends_at),
    is_active = COALESCE(p_is_active, is_active),
    updated_at = NOW()
  WHERE id = p_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function to get a reward by ID
CREATE OR REPLACE FUNCTION get_reward_by_id(p_reward_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  points_required integer,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id, r.name, r.description, r.points_required, r.is_active
  FROM rewards r
  WHERE r.id = p_reward_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a referral
CREATE OR REPLACE FUNCTION create_referral(
  p_referrer_id uuid, 
  p_referee_id uuid, 
  p_code text
)
RETURNS uuid AS $$
DECLARE
  v_referral_id uuid;
BEGIN
  INSERT INTO referrals (
    referrer_id,
    referee_id,
    code,
    points_awarded,
    created_at
  )
  VALUES (
    p_referrer_id,
    p_referee_id,
    p_code,
    false,
    NOW()
  )
  RETURNING id INTO v_referral_id;
  
  RETURN v_referral_id;
END;
$$ LANGUAGE plpgsql;
