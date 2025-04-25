
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/integrations/supabase/client';
import { Reward, RedeemedReward } from '@/types/customer.types';
import { useToast } from '@/hooks/use-toast';

const CustomerRewards = () => {
  const { customerUser } = useCustomerAuth();
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchRewardsData = async () => {
      if (!customerUser) return;
      
      try {
        // Get available rewards using RPC
        const { data: rewardsData, error: rewardsError } = await supabase.rpc(
          'get_active_rewards'
        );
        
        if (!rewardsError && rewardsData) {
          setAvailableRewards(rewardsData as Reward[]);
        }
        
        // Get loyalty points using RPC
        const { data: customerData, error: customerError } = await supabase.rpc(
          'get_customer_loyalty_points',
          { customer_id: customerUser.customerId }
        );
        
        if (!customerError && customerData) {
          setLoyaltyPoints(customerData.loyalty_points || 0);
        }
        
        // Get redeemed rewards using RPC
        const { data: redeemedData, error: redeemedError } = await supabase.rpc(
          'get_customer_redeemed_rewards',
          { customer_id: customerUser.customerId }
        );
        
        if (!redeemedError && redeemedData) {
          setRedeemedRewards(redeemedData as RedeemedReward[]);
        }
      } catch (error) {
        console.error('Error fetching rewards data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRewardsData();
  }, [customerUser]);

  const handleRedeemReward = async (rewardId: string, pointsRequired: number) => {
    if (!customerUser) return;
    
    if (loyaltyPoints < pointsRequired) {
      toast({
        title: 'Not enough points',
        description: `You need ${pointsRequired} points to redeem this reward.`,
        variant: 'destructive',
      });
      return;
    }
    
    try {
      // Redeem reward using RPC
      const { data, error } = await supabase.rpc(
        'redeem_customer_reward',
        {
          customer_id: customerUser.customerId,
          reward_id: rewardId
        }
      );
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to redeem reward: ' + error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Reward Redeemed',
          description: 'You have successfully redeemed this reward!',
        });
        
        // Update state
        setLoyaltyPoints(prev => prev - pointsRequired);
        if (data) {
          setRedeemedRewards(prev => [data as RedeemedReward, ...prev]);
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Rewards</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Rewards</h1>
        <div className="bg-card p-3 px-5 rounded-lg flex items-center mt-4 md:mt-0">
          <span className="text-muted-foreground mr-2">Your Points:</span>
          <span className="text-xl font-bold">{loyaltyPoints}</span>
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Available Rewards</h2>
      
      {availableRewards.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg mb-8">
          <p className="text-muted-foreground">No rewards available at this time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {availableRewards.map((reward) => (
            <Card key={reward.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{reward.title}</CardTitle>
                <CardDescription>{reward.points_required} points required</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{reward.description}</p>
                
                {reward.expiry_date && (
                  <p className="text-sm text-muted-foreground mt-4">
                    Available until {new Date(reward.expiry_date).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  disabled={loyaltyPoints < reward.points_required}
                  onClick={() => handleRedeemReward(reward.id, reward.points_required)}
                >
                  {loyaltyPoints >= reward.points_required ? 'Redeem Reward' : 'Not Enough Points'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <h2 className="text-2xl font-semibold mb-4">Your Redeemed Rewards</h2>
      
      {redeemedRewards.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <p className="text-muted-foreground">You haven't redeemed any rewards yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Reward</th>
                <th className="px-4 py-3 text-left">Redemption Code</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Points Used</th>
              </tr>
            </thead>
            <tbody>
              {redeemedRewards.map((reward) => (
                <tr key={reward.id} className="border-b">
                  <td className="px-4 py-3">{reward.reward_title}</td>
                  <td className="px-4 py-3 font-mono text-sm">{reward.redemption_code}</td>
                  <td className="px-4 py-3">{new Date(reward.redeemed_date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      reward.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : reward.status === 'used' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {reward.status.charAt(0).toUpperCase() + reward.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">{reward.points_used}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerRewards;
