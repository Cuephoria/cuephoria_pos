
import { supabase } from '@/integrations/supabase/client';
import { LoyaltyRedemption } from '@/types/loyalty-redemptions';

export const generateRedemptionCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

export const fetchRedemptionHistory = async (userId: string): Promise<LoyaltyRedemption[]> => {
  // Use type assertion to bypass TypeScript's strict checking for RPC functions
  // that aren't automatically typed in the Supabase client
  const { data, error } = await (supabase.rpc as any)(
    'get_loyalty_redemptions',
    { customer_uuid: userId }
  );
  
  if (error) {
    throw error;
  }
  
  return data as LoyaltyRedemption[];
};

export const createRedemption = async (
  customerId: string,
  rewardName: string,
  pointsRedeemed: number
): Promise<string> => {
  const code = generateRedemptionCode();
  
  // Use type assertion to bypass TypeScript's strict checking
  const { data, error } = await (supabase.rpc as any)(
    'create_loyalty_redemption',
    {
      customer_uuid: customerId,
      points_redeemed_val: pointsRedeemed,
      redemption_code_val: code,
      reward_name_val: rewardName
    }
  );
  
  if (error) {
    throw error;
  }
  
  return code;
};

export const deductLoyaltyPoints = async (
  customerId: string,
  pointsToDeduct: number
): Promise<void> => {
  // Use type assertion to bypass TypeScript's strict checking
  const { error } = await (supabase.rpc as any)(
    'deduct_loyalty_points',
    {
      user_id: customerId,
      points_to_deduct: pointsToDeduct
    }
  );
  
  if (error) {
    throw error;
  }
};

export const checkIfEnoughPoints = (
  userPoints: number = 0,
  requiredPoints: number
): boolean => {
  return userPoints >= requiredPoints;
};
