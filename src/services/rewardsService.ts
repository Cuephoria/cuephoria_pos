
import { supabase } from '@/integrations/supabase/client';
import { Reward, RedeemedReward } from '@/types/customer.types';

export const rewardsService = {
  // Get all active rewards
  async getRewards(): Promise<Reward[]> {
    const { data, error } = await supabase.rpc('get_active_rewards');
      
    if (error) {
      console.error('Error fetching rewards:', error);
      throw new Error(error.message);
    }
    
    return data as Reward[];
  },
  
  // Get customer's redeemed rewards
  async getRedeemedRewards(customerId: string): Promise<RedeemedReward[]> {
    const { data, error } = await supabase.rpc('get_customer_redeemed_rewards', {
      customer_id: customerId
    });
      
    if (error) {
      console.error('Error fetching redeemed rewards:', error);
      throw new Error(error.message);
    }
    
    return data as RedeemedReward[];
  },
  
  // Redeem a reward
  async redeemReward(customerId: string, rewardId: string): Promise<RedeemedReward> {
    // Use RPC to handle the entire redemption process
    const { data, error } = await supabase.rpc('redeem_customer_reward', {
      customer_id: customerId,
      reward_id: rewardId
    });
      
    if (error) {
      console.error('Error redeeming reward:', error);
      throw new Error(error.message || 'Failed to redeem reward');
    }
    
    return data as RedeemedReward;
  },
  
  // Mark a redeemed reward as used
  async useReward(customerId: string, redeemedRewardId: string): Promise<void> {
    const { error } = await supabase.rpc('use_redeemed_reward', {
      customer_id: customerId,
      redeemed_reward_id: redeemedRewardId
    });
      
    if (error) {
      console.error('Error using reward:', error);
      throw new Error(error.message);
    }
  },
  
  // Admin functions
  // Create a new reward
  async createReward(reward: Omit<Reward, 'id'>): Promise<Reward> {
    const { data, error } = await supabase.rpc('create_reward', {
      title: reward.title,
      description: reward.description,
      image_url: reward.image_url,
      points_required: reward.points_required,
      is_active: reward.is_active,
      expiry_date: reward.expiry_date,
      terms_conditions: reward.terms_conditions
    });
      
    if (error) {
      console.error('Error creating reward:', error);
      throw new Error(error.message);
    }
    
    return data as Reward;
  },
  
  // Update a reward
  async updateReward(id: string, reward: Partial<Reward>): Promise<void> {
    const { error } = await supabase.rpc('update_reward', {
      reward_id: id,
      title: reward.title,
      description: reward.description,
      image_url: reward.image_url,
      points_required: reward.points_required,
      is_active: reward.is_active,
      expiry_date: reward.expiry_date,
      terms_conditions: reward.terms_conditions
    });
      
    if (error) {
      console.error('Error updating reward:', error);
      throw new Error(error.message);
    }
  },
  
  // Delete a reward
  async deleteReward(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_reward', {
      reward_id: id
    });
      
    if (error) {
      console.error('Error deleting reward:', error);
      throw new Error(error.message);
    }
  }
};
