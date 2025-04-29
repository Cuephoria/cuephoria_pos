import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Award, Gift, Star, Clock, Check, AlertCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Reward, RewardRedemption } from '@/types/customer.types';
import { generateId } from '@/utils/pos.utils';

const CustomerRewards: React.FC = () => {
  const { customerUser, isLoading } = useCustomerAuth();
  const { toast } = useToast();
  const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
  const [isLoadingPoints, setIsLoadingPoints] = useState<boolean>(true);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoadingRewards, setIsLoadingRewards] = useState<boolean>(true);
  const [myRedemptions, setMyRedemptions] = useState<RewardRedemption[]>([]);
  const [isLoadingRedemptions, setIsLoadingRedemptions] = useState<boolean>(true);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeemDialogOpen, setIsRedeemDialogOpen] = useState<boolean>(false);
  const [isRedeeming, setIsRedeeming] = useState<boolean>(false);
  const [redemptionCode, setRedemptionCode] = useState<string>('');
  const [isRedemptionSuccess, setIsRedemptionSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchLoyaltyPoints = async () => {
      if (customerUser?.customerId) {
        try {
          const { data, error } = await supabase
            .from('customers')
            .select('loyalty_points')
            .eq('id', customerUser.customerId)
            .single();

          if (error) {
            console.error('Error fetching loyalty points:', error);
          } else {
            setLoyaltyPoints(data.loyalty_points || 0);
          }
        } catch (err) {
          console.error('Error in fetchLoyaltyPoints:', err);
        } finally {
          setIsLoadingPoints(false);
        }
      } else {
        setIsLoadingPoints(false);
      }
    };

    fetchLoyaltyPoints();
  }, [customerUser]);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const { data, error } = await supabase
          .from('rewards')
          .select('*')
          .eq('is_active', true)
          .order('points_cost', { ascending: true });

        if (error) {
          console.error('Error fetching rewards:', error);
        } else {
          const formattedRewards = data.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            pointsCost: item.points_cost,
            isActive: item.is_active,
            imageUrl: item.image_url,
            createdAt: new Date(item.created_at),
            updatedAt: new Date(item.updated_at)
          }));
          setRewards(formattedRewards);
        }
      } catch (err) {
        console.error('Error in fetchRewards:', err);
      } finally {
        setIsLoadingRewards(false);
      }
    };

    fetchRewards();
  }, []);

  useEffect(() => {
    const fetchRedemptions = async () => {
      if (customerUser?.customerId) {
        try {
          const { data, error } = await supabase
            .from('reward_redemptions')
            .select(`
              *,
              rewards (
                name
              )
            `)
            .eq('customer_id', customerUser.customerId)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Error fetching redemptions:', error);
          } else {
            const formattedRedemptions: RewardRedemption[] = data.map(item => ({
              id: item.id,
              customerId: item.customer_id,
              rewardId: item.reward_id,
              pointsSpent: item.points_spent,
              redemptionDate: new Date(item.created_at),
              status: item.status as "pending" | "completed" | "cancelled", // Ensure type safety
              redemptionCode: item.redemption_code,
              rewardName: item.rewards?.name
            }));
            setMyRedemptions(formattedRedemptions);
          }
        } catch (err) {
          console.error('Error in fetchRedemptions:', err);
        } finally {
          setIsLoadingRedemptions(false);
        }
      } else {
        setIsLoadingRedemptions(false);
      }
    };

    fetchRedemptions();
  }, [customerUser]);

  const handleRedeemClick = (reward: Reward) => {
    setSelectedReward(reward);
    setIsRedeemDialogOpen(true);
    setIsRedemptionSuccess(false);
    setRedemptionCode('');
  };

  const handleConfirmRedeem = async () => {
    if (!customerUser?.customerId || !selectedReward) return;

    setIsRedeeming(true);
    
    try {
      // Check if user has enough points
      if (loyaltyPoints < selectedReward.pointsCost) {
        toast({
          title: "Not enough points",
          description: `You need ${selectedReward.pointsCost - loyaltyPoints} more points to redeem this reward.`,
          variant: "destructive",
        });
        setIsRedeeming(false);
        return;
      }
      
      // Generate unique redemption code
      const code = `CQPR-${generateId().substring(0, 6).toUpperCase()}`;
      setRedemptionCode(code);

      // Create redemption record
      const { error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert({
          customer_id: customerUser.customerId,
          reward_id: selectedReward.id,
          points_spent: selectedReward.pointsCost,
          redemption_code: code,
          status: 'pending'
        });

      if (redemptionError) {
        throw new Error(redemptionError.message);
      }

      // Update customer's loyalty points
      const { error: pointsError } = await supabase
        .from('customers')
        .update({ loyalty_points: loyaltyPoints - selectedReward.pointsCost })
        .eq('id', customerUser.customerId);

      if (pointsError) {
        throw new Error(pointsError.message);
      }

      // Add transaction record
      await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: customerUser.customerId,
          points: -selectedReward.pointsCost,
          source: 'reward',
          description: `Redeemed reward: ${selectedReward.name}`
        });
      
      // Update local state
      setLoyaltyPoints(loyaltyPoints - selectedReward.pointsCost);
      setIsRedemptionSuccess(true);
      
      // Refresh redemptions list
      const { data } = await supabase
        .from('reward_redemptions')
        .select(`
          *,
          rewards (
            name
          )
        `)
        .eq('customer_id', customerUser.customerId)
        .order('created_at', { ascending: false });
        
      if (data) {
        const formattedRedemptions: RewardRedemption[] = data.map(item => ({
          id: item.id,
          customerId: item.customer_id,
          rewardId: item.reward_id,
          pointsSpent: item.points_spent,
          redemptionDate: new Date(item.created_at),
          status: item.status as "pending" | "completed" | "cancelled", // Ensure type safety
          redemptionCode: item.redemption_code,
          rewardName: item.rewards?.name
        }));
        setMyRedemptions(formattedRedemptions);
      }
      
      toast({
        title: "Reward redeemed!",
        description: "Your reward has been successfully redeemed. Show the code to staff to claim your reward.",
      });
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: "Redemption failed",
        description: "There was a problem redeeming your reward. Please try again.",
        variant: "destructive",
      });
      setIsRedemptionSuccess(false);
    } finally {
      setIsRedeeming(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const getStatusBadge = (status: "pending" | "completed" | "cancelled") => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600 flex gap-1 items-center"><Clock className="h-3 w-3" /> Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-600 hover:bg-green-700 flex gap-1 items-center"><Check className="h-3 w-3" /> Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-600 hover:bg-red-700 flex gap-1 items-center"><AlertCircle className="h-3 w-3" /> Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading || isLoadingPoints || isLoadingRewards || isLoadingRedemptions) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="mb-6" variants={fadeInUp}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          Rewards
        </h1>
        <p className="text-muted-foreground mt-1">
          Redeem your loyalty points for exciting rewards.
        </p>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-cuephoria-orange" />
              Available Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-cuephoria-lightpurple">
                {loyaltyPoints}
              </div>
              <div className="text-muted-foreground text-sm">
                points available to redeem
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-cuephoria-orange" />
              Available Rewards
            </CardTitle>
            <CardDescription>Redeem your points for these exciting rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {rewards.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <Card 
                    key={reward.id} 
                    className={`border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/50 transition-all duration-300 ${loyaltyPoints >= reward.pointsCost ? 'bg-gradient-to-br from-cuephoria-darker/80 to-cuephoria-darker/60' : 'bg-cuephoria-darker/80 opacity-70'}`}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-white">{reward.name}</h3>
                        <Badge className="bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90">{reward.pointsCost} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                      <Button 
                        className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        disabled={loyaltyPoints < reward.pointsCost}
                        onClick={() => handleRedeemClick(reward)}
                      >
                        {loyaltyPoints >= reward.pointsCost ? 'Redeem Now' : `Need ${reward.pointsCost - loyaltyPoints} more points`}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No rewards available at the moment. Check back soon!</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5 text-cuephoria-orange" />
              My Redemptions
            </CardTitle>
            <CardDescription>Track the status of your redeemed rewards</CardDescription>
          </CardHeader>
          <CardContent>
            {myRedemptions.length > 0 ? (
              <div className="space-y-4">
                {myRedemptions.map((redemption) => (
                  <div key={redemption.id} className="bg-cuephoria-darker/60 p-4 rounded-lg border border-cuephoria-lightpurple/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white">{redemption.rewardName}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {redemption.redemptionDate.toLocaleDateString()} • {redemption.pointsSpent} points
                        </p>
                      </div>
                      {getStatusBadge(redemption.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">You haven't redeemed any rewards yet.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      <Dialog open={isRedeemDialogOpen} onOpenChange={setIsRedeemDialogOpen}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30 sm:max-w-md">
          {!isRedemptionSuccess ? (
            <>
              <DialogHeader>
                <DialogTitle>Redeem Reward</DialogTitle>
                <DialogDescription>
                  {selectedReward && `Are you sure you want to redeem "${selectedReward.name}" for ${selectedReward.pointsCost} points?`}
                </DialogDescription>
              </DialogHeader>
              <div className="p-4 mb-2 bg-cuephoria-dark/50 rounded-md">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-cuephoria-orange mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    Once redeemed, you will receive a unique code to show to our staff to claim your reward. 
                    Points will be deducted from your account immediately.
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsRedeemDialogOpen(false)} disabled={isRedeeming}>
                  Cancel
                </Button>
                <Button
                  className="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90 transition-all duration-300"
                  onClick={handleConfirmRedeem}
                  disabled={isRedeeming}
                >
                  {isRedeeming ? <LoadingSpinner size="sm" /> : 'Confirm Redemption'}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-green-400 flex items-center gap-2">
                  <Check className="h-5 w-5" /> Reward Redeemed Successfully!
                </DialogTitle>
                <DialogDescription>
                  Show this code to our staff to claim your reward
                </DialogDescription>
              </DialogHeader>
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="bg-cuephoria-darker border border-cuephoria-lightpurple/50 rounded-lg p-4 mb-4 w-full text-center">
                  <p className="text-xs text-muted-foreground mb-1">Your redemption code</p>
                  <h3 className="text-3xl font-mono tracking-wider text-white">{redemptionCode}</h3>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  This code has been saved to your account. You can view all your redeemed rewards in the "My Redemptions" section.
                </p>
              </div>
              <DialogFooter>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 transition-all duration-300"
                  onClick={() => setIsRedeemDialogOpen(false)}
                >
                  Done
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CustomerRewards;
