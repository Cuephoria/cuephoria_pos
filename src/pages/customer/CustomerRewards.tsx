
import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { rewardsService } from '@/services/rewardsService';
import { Reward, RedeemedReward } from '@/types/customer.types';
import { Gift, AlertCircle, Check, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const CustomerRewards = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  useEffect(() => {
    const fetchRewardsData = async () => {
      if (!customerUser) return;
      
      try {
        setIsLoading(true);
        
        // Fetch active rewards
        const rewardsList = await rewardsService.getRewards();
        setRewards(rewardsList);
        
        // Fetch customer's redeemed rewards
        const redeemedList = await rewardsService.getRedeemedRewards(customerUser.customerId);
        setRedeemedRewards(redeemedList);
        
        // Get customer's current points
        const { data: customerData } = await supabase
          .from('customers')
          .select('loyalty_points')
          .eq('id', customerUser.customerId)
          .single();
          
        if (customerData) {
          setLoyaltyPoints(customerData.loyalty_points || 0);
        }
      } catch (error) {
        console.error('Error loading rewards:', error);
        toast({
          title: 'Error',
          description: 'Failed to load rewards. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRewardsData();
  }, [customerUser, toast]);

  const handleRedeem = async (reward: Reward) => {
    if (!customerUser) return;
    
    try {
      setIsRedeeming(true);
      
      // Attempt to redeem the reward
      const redeemedReward = await rewardsService.redeemReward(customerUser.customerId, reward.id);
      
      // Update redeemed rewards list
      setRedeemedRewards(prev => [redeemedReward, ...prev]);
      
      // Update points
      setLoyaltyPoints(prev => prev - reward.points_required);
      
      toast({
        title: 'Reward Redeemed!',
        description: `You've successfully redeemed ${reward.title}`,
      });
      
      // Close the dialog
      setSelectedReward(null);
    } catch (error: any) {
      toast({
        title: 'Redemption Failed',
        description: error.message || 'Failed to redeem reward. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsRedeeming(false);
    }
  };
  
  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Rewards</h1>
        <div className="flex items-center gap-2">
          <Gift className="text-primary h-5 w-5" />
          <span className="font-medium">{loyaltyPoints} points available</span>
        </div>
      </div>

      <Tabs defaultValue="available">
        <TabsList className="mb-6">
          <TabsTrigger value="available">Available Rewards</TabsTrigger>
          <TabsTrigger value="redeemed">Your Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="available">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <Card key={reward.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{reward.title}</CardTitle>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  {reward.image_url && (
                    <div className="px-6 pb-2">
                      <img src={reward.image_url} alt={reward.title} className="rounded-md w-full h-32 object-cover" />
                    </div>
                  )}
                  <CardContent className="flex-grow">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{reward.points_required} points</Badge>
                      {reward.expiry_date && <p className="text-xs text-muted-foreground">Expires: {formatDate(reward.expiry_date)}</p>}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant={loyaltyPoints >= reward.points_required ? "default" : "outline"} 
                          className="w-full"
                          disabled={loyaltyPoints < reward.points_required}
                          onClick={() => setSelectedReward(reward)}
                        >
                          {loyaltyPoints >= reward.points_required ? 'Redeem Reward' : 'Not Enough Points'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Redeem {selectedReward?.title}</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to redeem this reward? This will deduct {selectedReward?.points_required} points from your account.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                          <p className="text-sm mb-2"><strong>Description:</strong> {selectedReward?.description}</p>
                          {selectedReward?.terms_conditions && (
                            <div className="mt-4 text-sm">
                              <p className="font-semibold mb-1">Terms & Conditions:</p>
                              <p className="text-muted-foreground">{selectedReward?.terms_conditions}</p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setSelectedReward(null)}>Cancel</Button>
                          <Button 
                            onClick={() => selectedReward && handleRedeem(selectedReward)}
                            disabled={isRedeeming}
                          >
                            {isRedeeming ? 'Redeeming...' : 'Confirm Redemption'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Rewards Available</h3>
              <p className="text-muted-foreground">Check back soon for new rewards!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="redeemed">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : redeemedRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {redeemedRewards.map((reward) => (
                <Card key={reward.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle>{reward.reward_title}</CardTitle>
                      <StatusBadge status={reward.status} />
                    </div>
                    <CardDescription>Redeemed on {formatDate(reward.redeemed_date)}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-md text-center mb-4">
                      <p className="text-sm font-medium mb-1">Redemption Code</p>
                      <p className="text-xl font-mono font-bold letter-spacing-wide">{reward.redemption_code}</p>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Points used:</span>
                      <span className="font-medium">{reward.points_used}</span>
                    </div>
                    {reward.expires_at && (
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="font-medium">{formatDate(reward.expires_at)}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-medium mb-2">No Redeemed Rewards</h3>
              <p className="text-muted-foreground">You haven't redeemed any rewards yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper component for status badges
const StatusBadge = ({ status }: { status: 'active' | 'used' | 'expired' }) => {
  switch (status) {
    case 'active':
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <Clock className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    case 'used':
      return (
        <Badge variant="secondary">
          <Check className="h-3 w-3 mr-1" />
          Used
        </Badge>
      );
    case 'expired':
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      );
    default:
      return null;
  }
};

export default CustomerRewards;
