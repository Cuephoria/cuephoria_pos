
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Reward, RewardRedemption } from '@/types/customer.types';

interface UseRewardsOptions {
  onSuccess?: (redemption: RewardRedemption) => void;
  onError?: (error: string) => void;
}

export function useRewards(options: UseRewardsOptions = {}) {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const { toast } = useToast();
  
  const redeemReward = async (reward: Reward, customerId: string) => {
    try {
      setIsRedeeming(true);
      
      // First check if customer has enough points
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', customerId)
        .single();
        
      if (customerError || !customerData) {
        toast({
          title: 'Error',
          description: 'Could not retrieve customer information',
          variant: 'destructive'
        });
        options.onError?.('Customer data not found');
        return null;
      }
      
      const currentPoints = customerData.loyalty_points || 0;
      
      if (currentPoints < reward.pointsCost) {
        toast({
          title: 'Not enough points',
          description: `You need ${reward.pointsCost} points to redeem this reward`,
          variant: 'destructive'
        });
        options.onError?.('Insufficient points');
        return null;
      }
      
      // Generate a random redemption code
      const redemptionCode = generateRedemptionCode();
      
      // Create redemption record
      const newRedemption: Omit<RewardRedemption, 'id'> = {
        customerId,
        rewardId: reward.id,
        pointsSpent: reward.pointsCost,
        redemptionDate: new Date(),
        status: 'pending',
        redemptionCode,
        rewardName: reward.name
      };
      
      const { data: redemptionData, error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert(newRedemption)
        .select()
        .single();
        
      if (redemptionError || !redemptionData) {
        toast({
          title: 'Error',
          description: 'Could not create redemption record',
          variant: 'destructive'
        });
        options.onError?.('Failed to create redemption');
        return null;
      }
      
      // Deduct points from customer
      const { error: pointsError } = await supabase
        .from('customers')
        .update({
          loyalty_points: currentPoints - reward.pointsCost
        })
        .eq('id', customerId);
        
      if (pointsError) {
        // Attempt to revert the redemption
        await supabase
          .from('reward_redemptions')
          .delete()
          .eq('id', redemptionData.id);
          
        toast({
          title: 'Error',
          description: 'Could not update loyalty points',
          variant: 'destructive'
        });
        options.onError?.('Failed to update points');
        return null;
      }
      
      // Add record to points history if table exists
      try {
        await supabase
          .from('points_history')
          .insert({
            customer_id: customerId,
            points: -reward.pointsCost,
            action_type: 'redemption',
            description: `Redeemed reward: ${reward.name}`
          });
      } catch (e) {
        // Table might not exist, just continue
        console.log('Points history table might not exist:', e);
      }
      
      toast({
        title: 'Reward redeemed!',
        description: `You've successfully redeemed ${reward.name}`,
      });
      
      const typedRedemption = redemptionData as unknown as RewardRedemption;
      options.onSuccess?.(typedRedemption);
      return typedRedemption;
    } catch (error) {
      console.error('Error in redeemReward:', error);
      toast({
        title: 'Error redeeming reward',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      options.onError?.(String(error));
      return null;
    } finally {
      setIsRedeeming(false);
    }
  };
  
  // Generate a random redemption code
  const generateRedemptionCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };
  
  return {
    redeemReward,
    isRedeeming
  };
}
