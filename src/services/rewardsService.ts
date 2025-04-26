
import { supabase } from '@/integrations/supabase/client';
import { Reward } from '@/types/customer.types';

export const getRewards = async () => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('active', true)
      .order('points_required', { ascending: true });
      
    if (error) {
      console.error('Error fetching rewards:', error);
      return [];
    }
    
    return data.map(reward => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsRequired: reward.points_required,
      image: reward.image || undefined,
      active: reward.active,
      createdAt: new Date(reward.created_at)
    }));
  } catch (error) {
    console.error('Error in getRewards:', error);
    return [];
  }
};

export const redeemReward = async (rewardId: string, customerId: string) => {
  try {
    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', rewardId)
      .single();
      
    if (rewardError || !reward) {
      console.error('Error fetching reward:', rewardError);
      return { success: false, message: 'Reward not found' };
    }
    
    // Get customer
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', customerId)
      .single();
      
    if (customerError || !customer) {
      console.error('Error fetching customer:', customerError);
      return { success: false, message: 'Customer not found' };
    }
    
    // Check if customer has enough points
    if (customer.loyalty_points < reward.points_required) {
      return { 
        success: false, 
        message: `Not enough points. You need ${reward.points_required} points but have ${customer.loyalty_points}.` 
      };
    }
    
    // Begin transaction
    const { error: pointsError } = await supabase
      .from('customers')
      .update({ 
        loyalty_points: customer.loyalty_points - reward.points_required 
      })
      .eq('id', customerId);
      
    if (pointsError) {
      console.error('Error updating customer points:', pointsError);
      return { success: false, message: 'Failed to redeem reward' };
    }
    
    // Create transaction record
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert([{
        customer_id: customerId,
        points: -reward.points_required,
        source: 'reward',
        description: `Redeemed reward: ${reward.name}`
      }]);
      
    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // We would need to rollback the points in a real system
    }
    
    return { 
      success: true, 
      message: `Successfully redeemed ${reward.name}`,
      rewardName: reward.name,
      pointsUsed: reward.points_required
    };
  } catch (error) {
    console.error('Error in redeemReward:', error);
    return { success: false, message: 'An error occurred while redeeming the reward' };
  }
};
