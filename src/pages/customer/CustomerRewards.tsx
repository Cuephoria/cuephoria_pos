
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Reward, RedeemedReward } from '@/types/customer.types';
import { useToast } from '@/hooks/use-toast';

const CustomerRewards = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRewardsData = async () => {
      if (!customerUser) return;
      
      try {
        // Get available rewards
        const { data: rewardsData, error: rewardsError } = await supabase.rpc(
          'get_available_rewards'
        );
        
        if (!rewardsError && rewardsData) {
          setRewards(rewardsData as Reward[]);
        }
        
        // Get customer's loyalty points
        const { data: customerData, error: customerError } = await supabase.rpc(
          'get_customer_loyalty_points',
          { customer_id: customerUser.customerId }
        );
        
        if (!customerError && customerData) {
          setLoyaltyPoints(customerData.loyalty_points || 0);
        }
        
        // Get customer's redeemed rewards
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

  const handleRedeemReward = async (reward: Reward) => {
    if (!customerUser) return;
    
    if (loyaltyPoints < reward.points_required) {
      toast({
        title: "Not enough points",
        description: `You need ${reward.points_required - loyaltyPoints} more points to redeem this reward`,
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc(
        'redeem_reward', 
        { 
          customer_id: customerUser.customerId,
          reward_id: reward.id
        }
      );
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to redeem reward",
          variant: "destructive",
        });
        return;
      }
      
      // Update local state
      setLoyaltyPoints(prev => prev - reward.points_required);
      
      // Add to redeemed rewards if we got data back
      if (data) {
        setRedeemedRewards(prev => [data as RedeemedReward, ...prev]);
      }
      
      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${reward.title}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Rewards</h1>
        <div className="bg-primary/10 p-2 px-4 rounded-lg flex items-center mt-2 md:mt-0">
          <span className="text-sm text-muted-foreground mr-2">Your Points:</span>
          <span className="text-xl font-bold text-primary">{loyaltyPoints}</span>
        </div>
      </div>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Available Rewards</h2>
          {rewards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No rewards available at this time</p>
                <p className="text-sm mt-2">Check back soon for new rewards!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div>{reward.title}</div>
                      <Badge variant="secondary">{reward.points_required} pts</Badge>
                    </CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    {reward.image_url && (
                      <div className="mb-4 aspect-video bg-muted rounded overflow-hidden">
                        <img 
                          src={reward.image_url} 
                          alt={reward.title}
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    )}
                    
                    {reward.expiry_date && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Valid until: {new Date(reward.expiry_date).toLocaleDateString()}
                      </p>
                    )}
                    
                    {reward.terms_conditions && (
                      <details className="mt-3">
                        <summary className="text-sm text-muted-foreground cursor-pointer">
                          Terms & Conditions
                        </summary>
                        <p className="text-xs text-muted-foreground mt-2 pl-3">
                          {reward.terms_conditions}
                        </p>
                      </details>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => handleRedeemReward(reward)}
                      disabled={loyaltyPoints < reward.points_required}
                    >
                      {loyaltyPoints >= reward.points_required ? 'Redeem Reward' : 'Not Enough Points'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Redeemed Rewards</h2>
          {redeemedRewards.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">You haven't redeemed any rewards yet</p>
                <p className="text-sm mt-2">Use your loyalty points to redeem rewards above!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="bg-card rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Reward</th>
                      <th className="px-4 py-3 text-left">Redemption Date</th>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-left">Expires</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redeemedRewards.map((reward) => (
                      <tr key={reward.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 font-medium">{reward.reward_title}</td>
                        <td className="px-4 py-3">{new Date(reward.redeemed_date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-mono">{reward.redemption_code}</td>
                        <td className="px-4 py-3">
                          {reward.expires_at ? new Date(reward.expires_at).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-4 py-3">
                          <Badge 
                            variant={reward.status === 'active' ? 'default' : 
                                    reward.status === 'used' ? 'secondary' : 'destructive'}
                          >
                            {reward.status === 'active' ? 'Active' : 
                             reward.status === 'used' ? 'Used' : 'Expired'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerRewards;
