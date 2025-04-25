
import { supabase } from '@/integrations/supabase/client';
import { Reward, RedeemedReward } from '@/types/customer.types';

export const rewardsService = {
  // Get all active rewards
  async getRewards(): Promise<Reward[]> {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });
      
    if (error) {
      console.error('Error fetching rewards:', error);
      throw new Error(error.message);
    }
    
    return data as Reward[];
  },
  
  // Get customer's redeemed rewards
  async getRedeemedRewards(customerId: string): Promise<RedeemedReward[]> {
    const { data, error } = await supabase
      .from('redeemed_rewards')
      .select('*')
      .eq('customer_id', customerId)
      .order('redeemed_date', { ascending: false });
      
    if (error) {
      console.error('Error fetching redeemed rewards:', error);
      throw new Error(error.message);
    }
    
    return data as RedeemedReward[];
  },
  
  // Redeem a reward
  async redeemReward(customerId: string, rewardId: string): Promise<RedeemedReward> {
    // Get the reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .single();
      
    if (rewardError || !reward) {
      console.error('Error fetching reward:', rewardError);
      throw new Error(rewardError?.message || 'Reward not found');
    }
    
    // Get current loyalty points
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', customerId)
      .single();
      
    if (customerError || !customer) {
      console.error('Error fetching customer:', customerError);
      throw new Error(customerError?.message || 'Customer not found');
    }
    
    // Check if customer has enough points
    if (customer.loyalty_points < reward.points_required) {
      throw new Error('Not enough loyalty points to redeem this reward');
    }
    
    // Generate redemption code
    const redemptionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Set expiry date to 30 days from now if not specified in the reward
    const expiryDate = reward.expiry_date || 
      new Date(new Date().setDate(new Date().getDate() + 30)).toISOString();
    
    // Add the redeemed reward
    const { data: redeemedReward, error: redeemedError } = await supabase
      .from('redeemed_rewards')
      .insert({
        customer_id: customerId,
        reward_id: rewardId,
        reward_title: reward.title,
        points_used: reward.points_required,
        redeemed_date: new Date().toISOString(),
        expires_at: expiryDate,
        status: 'active',
        redemption_code: redemptionCode
      })
      .select()
      .single();
      
    if (redeemedError || !redeemedReward) {
      console.error('Error redeeming reward:', redeemedError);
      throw new Error(redeemedError?.message || 'Failed to redeem reward');
    }
    
    // Deduct points from customer
    const { error: pointsError } = await supabase.rpc('deduct_loyalty_points', { 
      customer_id: customerId, 
      points_to_deduct: reward.points_required
    });
    
    if (pointsError) {
      // Rollback the redemption if points couldn't be deducted
      await supabase
        .from('redeemed_rewards')
        .delete()
        .eq('id', redeemedReward.id);
        
      throw new Error(pointsError.message || 'Failed to deduct loyalty points');
    }
    
    // Record loyalty transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: customerId,
        points: -reward.points_required,
        source: 'reward_redemption',
        description: `Redeemed reward: ${reward.title}`
      });
      
    return redeemedReward as RedeemedReward;
  },
  
  // Mark a redeemed reward as used
  async useReward(customerId: string, redeemedRewardId: string): Promise<void> {
    const { error } = await supabase
      .from('redeemed_rewards')
      .update({ status: 'used' })
      .eq('id', redeemedRewardId)
      .eq('customer_id', customerId);
      
    if (error) {
      console.error('Error using reward:', error);
      throw new Error(error.message);
    }
  },
  
  // Admin functions
  // Create a new reward
  async createReward(reward: Omit<Reward, 'id'>): Promise<Reward> {
    const { data, error } = await supabase
      .from('rewards')
      .insert(reward)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating reward:', error);
      throw new Error(error.message);
    }
    
    return data as Reward;
  },
  
  // Update a reward
  async updateReward(id: string, reward: Partial<Reward>): Promise<void> {
    const { error } = await supabase
      .from('rewards')
      .update(reward)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating reward:', error);
      throw new Error(error.message);
    }
  },
  
  // Delete a reward
  async deleteReward(id: string): Promise<void> {
    const { error } = await supabase
      .from('rewards')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting reward:', error);
      throw new Error(error.message);
    }
  }
};
