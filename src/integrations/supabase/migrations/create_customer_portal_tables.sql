
-- Customer Users table to store login credentials
CREATE TABLE IF NOT EXISTS customer_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID NOT NULL UNIQUE,
  customer_id TEXT NOT NULL REFERENCES customers(id),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL UNIQUE,
  referral_code VARCHAR(10) NOT NULL UNIQUE,
  pin VARCHAR(10) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Rewards table
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  points_required INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  expiry_date TIMESTAMPTZ,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Redeemed rewards table
CREATE TABLE IF NOT EXISTS redeemed_rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  reward_id UUID NOT NULL REFERENCES rewards(id),
  reward_title VARCHAR(100) NOT NULL,
  points_used INTEGER NOT NULL,
  redeemed_date TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ,
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'used', 'expired')),
  redemption_code VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Promotions table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10,2) NOT NULL,
  terms_conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  membership_required BOOLEAN DEFAULT false,
  minimum_purchase_amount DECIMAL(10,2),
  promotion_code VARCHAR(20) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id TEXT NOT NULL REFERENCES customers(id),
  referred_id TEXT NOT NULL REFERENCES customers(id),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  converted_at TIMESTAMPTZ,
  points_earned INTEGER
);

-- Loyalty transactions table
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id TEXT NOT NULL REFERENCES customers(id),
  points INTEGER NOT NULL,
  source VARCHAR(30) NOT NULL CHECK (source IN ('purchase', 'referral', 'reward_redemption', 'admin_adjustment', 'welcome_bonus')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add loyalty points stored procedure
CREATE OR REPLACE FUNCTION add_loyalty_points(customer_id TEXT, points_to_add INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE customers
  SET loyalty_points = loyalty_points + points_to_add
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;

-- Deduct loyalty points stored procedure
CREATE OR REPLACE FUNCTION deduct_loyalty_points(customer_id TEXT, points_to_deduct INTEGER)
RETURNS void AS $$
DECLARE
  current_points INTEGER;
BEGIN
  -- Get current points
  SELECT loyalty_points INTO current_points
  FROM customers
  WHERE id = customer_id;
  
  -- Check if there are enough points
  IF current_points < points_to_deduct THEN
    RAISE EXCEPTION 'Not enough loyalty points';
  END IF;
  
  -- Deduct points
  UPDATE customers
  SET loyalty_points = loyalty_points - points_to_deduct
  WHERE id = customer_id;
END;
$$ LANGUAGE plpgsql;
