
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useRewards } from '@/hooks/useRewards';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Award, Gift, Sparkles, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { Reward, RewardRedemption } from '@/types/customer.types';

const CustomerRewards = () => {
  const navigate = useNavigate();
  const { user, customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const { redeemReward, isRedeeming } = useRewards({
    onSuccess: (redemption) => {
      setRedemptionDetails(redemption);
      setShowSuccessDialog(true);
    },
    onError: (error) => {
      console.error('Reward redemption error:', error);
    }
  });
  
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [rewardsLoading, setRewardsLoading] = useState(true);
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);
  const [redemptionsLoading, setRedemptionsLoading] = useState(true);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [redemptionDetails, setRedemptionDetails] = useState<RewardRedemption | null>(null);
  const [customerData, setCustomerData] = useState<any>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/customer/login');
      return;
    }
    
    fetchRewards();
    
    if (customerUser?.customerId) {
      fetchCustomerData(customerUser.customerId);
      fetchRedemptions(customerUser.customerId);
    }
  }, [user, customerUser, navigate]);
  
  const fetchCustomerData = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (!error && data) {
        setCustomerData(data);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
    }
  };
  
  const fetchRewards = async () => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('is_active', true)
        .order('points_cost', { ascending: true });
      
      if (error) throw error;
      
      if (data) {
        // Transform the database records to match our Reward type
        const typedRewards: Reward[] = data.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description || undefined,
          pointsCost: item.points_cost,
          isActive: item.is_active,
          imageUrl: item.image_url || undefined,
          createdAt: new Date(item.created_at || Date.now()),
          updatedAt: new Date(item.updated_at || Date.now())
        }));
        setRewards(typedRewards);
      }
    } catch (error) {
      console.error('Error fetching rewards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load rewards. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setRewardsLoading(false);
    }
  };
  
  const fetchRedemptions = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('*, rewards(name)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        // Transform the database records to match our RewardRedemption type
        const typedRedemptions: RewardRedemption[] = data.map(item => ({
          id: item.id,
          customerId: item.customer_id,
          rewardId: item.reward_id,
          pointsSpent: item.points_spent,
          redemptionDate: new Date(item.created_at || Date.now()),
          status: item.status as "pending" | "completed" | "cancelled",
          redemptionCode: item.redemption_code,
          rewardName: item.rewards?.name || 'Reward'
        }));
        setRedemptions(typedRedemptions);
      }
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your redemption history.',
        variant: 'destructive',
      });
    } finally {
      setRedemptionsLoading(false);
    }
  };
  
  const handleRedeemClick = (reward: Reward) => {
    if (!customerData) {
      toast({
        title: 'Error',
        description: 'You must be logged in to redeem rewards.',
        variant: 'destructive',
      });
      return;
    }
    
    if (customerData.loyalty_points < reward.pointsCost) {
      toast({
        title: 'Not enough points',
        description: `You need ${reward.pointsCost} points to redeem this reward.`,
        variant: 'destructive',
      });
      return;
    }
    
    setCurrentReward(reward);
    setShowRedeemDialog(true);
  };
  
  const confirmRedemption = async () => {
    if (!currentReward || !customerData) return;
    
    const result = await redeemReward(currentReward, customerData.id);
    if (result) {
      // Refresh redemptions list
      fetchRedemptions(customerData.id);
      // Update the customer data to reflect the new points balance
      if (customerData) {
        customerData.loyalty_points -= currentReward.pointsCost;
      }
    }
    
    setShowRedeemDialog(false);
  };
  
  const getStatusBadge = (status: "pending" | "completed" | "cancelled") => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600"><Check className="h-3 w-3 mr-1" /> Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600"><X className="h-3 w-3 mr-1" /> Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-500 hover:bg-gray-600">Unknown</Badge>;
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent flex items-center">
            <Award className="mr-2 h-6 w-6 text-cuephoria-orange" />
            Rewards
          </h1>
          <p className="text-gray-400">Redeem your loyalty points for exclusive rewards</p>
        </div>
        {customerData && (
          <div className="bg-gradient-to-r from-cuephoria-darker to-black p-3 rounded-lg border border-cuephoria-lightpurple/30">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-cuephoria-orange" />
              <span className="text-gray-300 font-medium">Your Points:</span>
              <span className="text-xl font-bold text-cuephoria-lightpurple">{customerData.loyalty_points}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Available Rewards Section */}
      <Card className="mb-8 shadow-lg bg-cuephoria-darker border-cuephoria-lightpurple/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Gift className="mr-2 h-5 w-5 text-cuephoria-orange" />
            Available Rewards
          </CardTitle>
          <CardDescription>
            Choose from our selection of rewards to redeem with your points
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rewardsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-cuephoria-lightpurple border-t-transparent rounded-full"></div>
            </div>
          ) : rewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id} className="bg-cuephoria-dark border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/50 transition-all overflow-hidden">
                  <div className="relative">
                    <div className="h-32 bg-gradient-to-r from-cuephoria-lightpurple/20 to-cuephoria-blue/20 flex items-center justify-center">
                      {reward.imageUrl ? (
                        <img 
                          src={reward.imageUrl} 
                          alt={reward.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Gift className="h-12 w-12 text-cuephoria-lightpurple opacity-50" />
                      )}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-cuephoria-purple hover:bg-cuephoria-purple/90">
                        {reward.pointsCost} Points
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-gray-400">
                      {reward.description || 'Redeem this exclusive reward with your loyalty points.'}
                    </p>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-blue hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-blue/90"
                      disabled={!customerData || customerData.loyalty_points < reward.pointsCost || isRedeeming}
                      onClick={() => handleRedeemClick(reward)}
                    >
                      {isRedeeming ? 'Processing...' : 'Redeem Reward'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No rewards are currently available. Check back soon!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Redemption History Section */}
      <Card className="shadow-lg bg-cuephoria-darker border-cuephoria-lightpurple/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Clock className="mr-2 h-5 w-5 text-cuephoria-orange" />
            Redemption History
          </CardTitle>
          <CardDescription>
            View your previously redeemed rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          {redemptionsLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin h-8 w-8 border-4 border-cuephoria-lightpurple border-t-transparent rounded-full"></div>
            </div>
          ) : redemptions.length > 0 ? (
            <div className="rounded-md border border-cuephoria-lightpurple/20 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-cuephoria-dark hover:bg-cuephoria-dark/80">
                    <TableHead className="text-cuephoria-lightpurple">Reward</TableHead>
                    <TableHead className="text-cuephoria-lightpurple">Points</TableHead>
                    <TableHead className="text-cuephoria-lightpurple">Date</TableHead>
                    <TableHead className="text-cuephoria-lightpurple">Code</TableHead>
                    <TableHead className="text-cuephoria-lightpurple">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {redemptions.map((redemption) => (
                    <TableRow key={redemption.id} className="hover:bg-cuephoria-dark/50">
                      <TableCell className="font-medium">{redemption.rewardName}</TableCell>
                      <TableCell>{redemption.pointsSpent}</TableCell>
                      <TableCell>{format(new Date(redemption.redemptionDate), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        <span className="font-mono bg-cuephoria-darker/50 px-2 py-1 rounded text-sm">
                          {redemption.redemptionCode}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">You haven't redeemed any rewards yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Redeem Confirmation Dialog */}
      <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
          <DialogHeader>
            <DialogTitle>Confirm Redemption</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward?
            </DialogDescription>
          </DialogHeader>
          
          {currentReward && (
            <div className="py-4">
              <div className="bg-cuephoria-dark border border-cuephoria-lightpurple/20 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-medium">{currentReward.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">{currentReward.description}</span>
                  <Badge className="bg-cuephoria-purple hover:bg-cuephoria-purple/90">
                    {currentReward.pointsCost} Points
                  </Badge>
                </div>
              </div>
              
              {customerData && (
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <span className="text-gray-400">Your current balance:</span>
                    <span className="ml-2 font-bold text-white">{customerData.loyalty_points} points</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Balance after redemption:</span>
                    <span className="ml-2 font-bold text-cuephoria-orange">
                      {customerData.loyalty_points - currentReward.pointsCost} points
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              className="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90"
              onClick={confirmRedemption}
              disabled={isRedeeming}
            >
              {isRedeeming ? 'Processing...' : 'Confirm Redemption'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
          <DialogHeader>
            <DialogTitle className="text-center flex items-center justify-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              Redemption Successful!
            </DialogTitle>
          </DialogHeader>
          
          {redemptionDetails && (
            <div className="py-4">
              <div className="flex items-center justify-center my-4">
                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </div>
              
              <div className="text-center mb-4">
                <h3 className="text-lg font-medium">{redemptionDetails.rewardName}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  You've successfully redeemed this reward for {redemptionDetails.pointsSpent} points
                </p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="bg-cuephoria-dark border border-cuephoria-lightpurple/20 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-400 mb-2">Redemption Code:</div>
                <div className="font-mono text-xl text-center bg-black/30 py-2 rounded">
                  {redemptionDetails.redemptionCode}
                </div>
                <div className="text-xs text-center mt-2 text-gray-500">
                  Present this code to staff to claim your reward
                </div>
              </div>
              
              {customerData && (
                <div className="text-sm text-center">
                  <span className="text-gray-400">Your updated balance:</span>
                  <span className="ml-2 font-bold text-cuephoria-lightpurple">
                    {customerData.loyalty_points} points
                  </span>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-center">
            <Button 
              className="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerRewards;
