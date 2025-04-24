
export interface LoyaltyRedemption {
  id: string;
  customer_id: string;
  points_redeemed: number;
  redemption_code: string;
  reward_name?: string;
  is_used: boolean;
  created_at: string;
  used_at?: string;
}
