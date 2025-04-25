
-- Add view for customer management in admin panel
CREATE OR REPLACE VIEW admin_customer_view AS
SELECT 
  c.id,
  c.name,
  c.phone,
  c.email,
  c.is_member,
  c.membership_expiry_date,
  c.membership_start_date,
  c.membership_plan,
  c.membership_hours_left,
  c.membership_duration,
  c.loyalty_points,
  c.total_spent,
  c.total_play_time,
  c.created_at,
  cu.auth_id,
  cu.referral_code,
  cu.pin,
  (SELECT COUNT(*) FROM referrals WHERE referrer_id = c.id) as referrals_made,
  (SELECT COUNT(*) FROM redeemed_rewards WHERE customer_id = c.id) as rewards_redeemed
FROM 
  customers c
LEFT JOIN 
  customer_users cu ON c.id = cu.customer_id;

-- Add computed column to customers for total sessions
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_sessions INTEGER GENERATED ALWAYS AS (
  (SELECT COUNT(*) FROM sessions WHERE customer_id = customers.id)
) STORED;
