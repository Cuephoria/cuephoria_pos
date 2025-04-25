
import { supabase } from '@/integrations/supabase/client';
import { Reward, RedeemedReward } from '@/types/customer.types';

export const rewardsService = {
  // Get all available rewards
  async getAvailableRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .rpc('get_available_rewards');
      
    if (error) {
      console.error('Error fetching rewards:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as Reward[];
  },
  
  // Get a specific reward by ID
  async getRewardById(rewardId: string): Promise<Reward | null> {
    const { data, error } = await supabase
      .rpc('get_reward_by_id', {
        reward_id: rewardId
      });
      
    if (error) {
      console.error('Error fetching reward:', error);
      throw new Error(error.message);
    }
    
    return data as Reward;
  },
  
  // Get all rewards redeemed by a customer
  async getCustomerRedeemedRewards(customerId: string): Promise<RedeemedReward[]> {
    const { data, error } = await supabase
      .rpc('get_customer_redeemed_rewards', {
        customer_id: customerId
      });
      
    if (error) {
      console.error('Error fetching redeemed rewards:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as RedeemedReward[];
  },
  
  // Redeem a reward for a customer
  async redeemReward(customerId: string, rewardId: string): Promise<RedeemedReward | null> {
    const { data, error } = await supabase
      .rpc('redeem_reward', {
        customer_id: customerId,
        reward_id: rewardId
      });
      
    if (error) {
      console.error('Error redeeming reward:', error);
      throw new Error(error.message);
    }
    
    return data as RedeemedReward;
  },
  
  // Use a redeemed reward (mark as used)
  async useRedeemedReward(redemptionId: string): Promise<boolean> {
    const { error } = await supabase
      .rpc('use_redeemed_reward', {
        redemption_id: redemptionId
      });
      
    if (error) {
      console.error('Error using redeemed reward:', error);
      throw new Error(error.message);
    }
    
    return true;
  }
};
