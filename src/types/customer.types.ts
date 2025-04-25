
// Customer portal related types
export interface CustomerUser {
  id: string;
  email: string;
  customerId: string;
  name: string;
  phone: string;
  referralCode: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  points_required: number;
  is_active: boolean;
  expiry_date?: string;
  terms_conditions?: string;
}

export interface RedeemedReward {
  id: string;
  customer_id: string;
  reward_id: string;
  reward_title: string;
  points_used: number;
  redeemed_date: string;
  expires_at?: string;
  status: 'active' | 'used' | 'expired';
  redemption_code: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  terms_conditions?: string;
  is_active: boolean;
  membership_required: boolean;
  minimum_purchase_amount?: number;
  promotion_code?: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  referred_name: string;
  referred_email: string;
  status: 'pending' | 'completed';
  created_at: string;
  converted_at?: string;
  points_earned?: number;
}

export interface CustomerSession {
  id: string;
  station_name: string;
  station_type: string;
  start_time: string;
  end_time?: string;
  duration: number; // in minutes
  cost: number;
}

export interface LoyaltyTransaction {
  id: string;
  customer_id: string;
  points: number; // positive for earned, negative for spent
  source: 'purchase' | 'referral' | 'reward_redemption' | 'admin_adjustment' | 'welcome_bonus';
  description: string;
  created_at: string;
}
