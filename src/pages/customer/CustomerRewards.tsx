
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getAvailableRewards, redeemReward } from '@/services/rewardsService';
import { Gift, Award, CheckCircle, AlertTriangle } from 'lucide-react';
import { Reward } from '@/types/customer.types';

const CustomerRewards = () => {
  const { customerUser, customerProfile, refreshProfile } = useCustomerAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadRewards = async () => {
      if (customerUser) {
        try {
          setIsLoading(true);
          const rewardsData = await getAvailableRewards(customerUser.customer_id);
          setRewards(rewardsData);
        } catch (error) {
          console.error('Error loading rewards:', error);
          toast({
            title: 'Error',
            description: 'Failed to load available rewards',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadRewards();
  }, [customerUser, toast]);

  const handleRedeemReward = async (reward: Reward) => {
    if (!customerProfile || customerProfile.loyaltyPoints < reward.points_required) {
      toast({
        title: 'Not enough points',
        description: `You need ${reward.points_required - (customerProfile?.loyaltyPoints || 0)} more points to redeem this reward.`,
        variant: 'destructive',
      });
      return;
    }
    
    setRedeeming(reward.id);
    
    try {
      if (customerUser) {
        const success = await redeemReward(customerUser.customer_id, reward.id);
        
        if (success) {
          toast({
            title: 'Reward Redeemed',
            description: `You have successfully redeemed ${reward.name}!`,
          });
          
          // Refresh profile to get updated points
          await refreshProfile();
        }
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: 'Redemption Failed',
        description: 'Failed to redeem reward',
        variant: 'destructive',
      });
    } finally {
      setRedeeming(null);
    }
  };

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Loyalty Rewards</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Redeem your points for exclusive rewards</p>
      </div>
      
      <Card className="mb-8">
        <CardHeader className="bg-cuephoria-dark">
          <CardTitle className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span>Available Points</span>
            <span className="text-3xl flex items-center gap-2 mt-2 md:mt-0">
              <Award className="text-cuephoria-orange" size={24} />
              {customerProfile?.loyaltyPoints || 0} points
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <p className="text-center text-muted-foreground">
            Use your points to redeem rewards below
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : rewards.length > 0 ? (
          rewards.map((reward) => {
            const canRedeem = customerProfile && customerProfile.loyaltyPoints >= reward.points_required;
            
            return (
              <Card key={reward.id} className={`overflow-hidden ${!canRedeem ? 'opacity-70' : ''}`}>
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  {reward.image ? (
                    <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                  ) : (
                    <Gift className="h-16 w-16 text-muted-foreground/40" />
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{reward.name}</h3>
                    <div className="flex items-center gap-1 bg-primary/10 px-2 py-1 rounded-md text-xs font-medium">
                      <Award size={14} className="text-primary" />
                      <span>{reward.points_required}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                  
                  {!canRedeem ? (
                    <div className="text-xs flex items-center gap-1 text-amber-500 mb-3">
                      <AlertTriangle size={14} />
                      <span>You need {reward.points_required - (customerProfile?.loyaltyPoints || 0)} more points</span>
                    </div>
                  ) : (
                    <div className="text-xs flex items-center gap-1 text-green-500 mb-3">
                      <CheckCircle size={14} />
                      <span>You have enough points!</span>
                    </div>
                  )}
                  
                  <Button 
                    className="w-full" 
                    disabled={!canRedeem || redeeming === reward.id}
                    onClick={() => handleRedeemReward(reward)}
                  >
                    {redeeming === reward.id ? (
                      <>
                        <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        Redeeming...
                      </>
                    ) : 'Redeem Reward'}
                  </Button>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            <p className="mb-2">No rewards available at this time.</p>
            <p>Check back soon for new rewards!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerRewards;
