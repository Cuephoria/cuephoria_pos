
import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Gift, Star, Sparkles, Ticket, Coffee, Gamepad, Pizza, BadgeDollarSign, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { LoyaltyRedemption } from '@/types/loyalty-redemptions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: React.ReactNode;
}

interface RedemptionHistory {
  id: string;
  rewardName: string;
  pointsSpent: number;
  redemptionCode: string;
  redeemed: boolean;
  createdAt: Date;
}

// Define the parameter types for RPC functions
type GetLoyaltyRedemptionsParams = {
  customer_uuid: string;
};

type CreateLoyaltyRedemptionParams = {
  customer_uuid: string;
  points_redeemed_val: number;
  redemption_code_val: string;
  reward_name_val: string;
};

const Rewards = () => {
  const { user, refreshProfile } = useCustomerAuth();
  const { toast } = useToast();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redemptionDialogOpen, setRedemptionDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redeemingReward, setRedeemingReward] = useState(false);
  const [redemptionCode, setRedemptionCode] = useState('');

  useEffect(() => {
    loadRewards();
    if (user?.id) {
      loadRedemptionHistory();
    }
  }, [user?.id]);

  const loadRewards = () => {
    setRewards([
      {
        id: '1',
        name: 'Free Drink',
        description: 'Redeem a free beverage of your choice',
        pointsCost: 50,
        icon: <Coffee className="h-5 w-5 text-blue-400" />
      },
      {
        id: '2',
        name: '1 Hour Free Play',
        description: '1 hour of gameplay at any station',
        pointsCost: 100,
        icon: <Gamepad className="h-5 w-5 text-cuephoria-lightpurple" />
      },
      {
        id: '3',
        name: 'Food Combo',
        description: 'Any food combo of your choice',
        pointsCost: 75,
        icon: <Pizza className="h-5 w-5 text-orange-400" />
      },
      {
        id: '4',
        name: 'Discount Coupon',
        description: '15% off your next bill',
        pointsCost: 150,
        icon: <Ticket className="h-5 w-5 text-pink-400" />
      },
      {
        id: '5',
        name: 'Challenge Entry',
        description: 'Free entry to any challenge event',
        pointsCost: 200,
        icon: <Award className="h-5 w-5 text-amber-400" />
      },
      {
        id: '6',
        name: 'Membership Discount',
        description: '10% discount on membership renewal',
        pointsCost: 300,
        icon: <BadgeDollarSign className="h-5 w-5 text-green-400" />
      }
    ]);
    setIsLoading(false);
  };

  const loadRedemptionHistory = async () => {
    if (!user?.id) return;
    
    try {
      // Use type assertion for the RPC call result
      const { data, error } = await supabase.rpc(
        'get_loyalty_redemptions', 
        { customer_uuid: user.id } as GetLoyaltyRedemptionsParams
      );
        
      if (error) {
        console.error('Error loading redemption history:', error);
        return;
      }
      
      if (data) {
        // Use type assertion for the data
        const typedData = data as any[];
        const history = typedData.map((item: LoyaltyRedemption) => ({
          id: item.id,
          rewardName: item.reward_name || 'Reward',
          pointsSpent: item.points_redeemed,
          redemptionCode: item.redemption_code,
          redeemed: item.is_used,
          createdAt: new Date(item.created_at)
        }));
        
        setRedemptionHistory(history);
      }
    } catch (error) {
      console.error('Error loading redemption history:', error);
    }
  };

  const handleOpenRedemption = (reward: Reward) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please log in to redeem rewards',
        variant: 'destructive'
      });
      return;
    }
    
    if ((user.loyaltyPoints || 0) < reward.pointsCost) {
      toast({
        title: 'Insufficient Points',
        description: `You need ${reward.pointsCost} points to redeem this reward`,
        variant: 'destructive'
      });
      return;
    }
    
    setSelectedReward(reward);
    setRedemptionDialogOpen(true);
  };

  const generateRedemptionCode = () => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const handleRedeemPoints = async () => {
    if (!user || !selectedReward) return;
    
    setRedeemingReward(true);
    
    try {
      const newCode = generateRedemptionCode();
      setRedemptionCode(newCode);
      
      // Use type assertion for the RPC call parameters
      const { data, error } = await supabase.rpc(
        'create_loyalty_redemption', 
        {
          customer_uuid: user.id,
          points_redeemed_val: selectedReward.pointsCost,
          redemption_code_val: newCode,
          reward_name_val: selectedReward.name
        } as CreateLoyaltyRedemptionParams
      );
        
      if (error) throw error;
      
      const { error: updateError } = await supabase
        .from('customers')
        .update({ 
          loyalty_points: (user.loyaltyPoints || 0) - selectedReward.pointsCost 
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;
      
      await refreshProfile();
      
      await loadRedemptionHistory();
      
      toast({
        title: 'Reward Redeemed!',
        description: `You've successfully redeemed ${selectedReward.name}`,
      });
    } catch (error) {
      console.error('Error redeeming points:', error);
      toast({
        title: 'Redemption Failed',
        description: 'There was a problem redeeming your points. Please try again.',
        variant: 'destructive'
      });
      setRedemptionDialogOpen(false);
    } finally {
      setRedeemingReward(false);
    }
  };

  const closeRedemptionDialog = () => {
    setRedemptionDialogOpen(false);
    setSelectedReward(null);
    setRedemptionCode('');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="container p-4 sm:p-6 space-y-6 max-w-5xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Loyalty Rewards</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Redeem your loyalty points for exclusive rewards</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-purple-900/30 to-cuephoria-lightpurple/20 border-cuephoria-lightpurple/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-cuephoria-lightpurple/20 p-3 rounded-full">
                  <Star className="h-7 w-7 text-cuephoria-lightpurple" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white">Your Loyalty Points</p>
                  <p className="text-3xl font-bold text-white">{user?.loyaltyPoints || 0}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground max-w-xs">
                Earn 1 point for every ₹10 spent at Cuephoria. Use your points to redeem exclusive rewards and experiences.
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Gift className="h-5 w-5 text-cuephoria-lightpurple" />
          Available Rewards
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id} className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20 hover:bg-cuephoria-darker/80 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {reward.icon}
                    {reward.name}
                  </CardTitle>
                  <div className="bg-cuephoria-lightpurple/20 px-2 py-1 rounded-full text-xs font-medium text-cuephoria-lightpurple">
                    {reward.pointsCost} Points
                  </div>
                </div>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <Button 
                  variant="secondary" 
                  className="w-full"
                  onClick={() => handleOpenRedemption(reward)}
                  disabled={!user || (user.loyaltyPoints || 0) < reward.pointsCost}
                >
                  {!user ? 'Log in to redeem' : 
                   (user.loyaltyPoints || 0) < reward.pointsCost ? 'Not enough points' : 'Redeem Now'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </motion.div>

      {redemptionHistory.length > 0 && (
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-cuephoria-lightpurple" />
            Your Redemption History
          </h2>
          
          <Card className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cuephoria-darker/50">
                  <tr>
                    <th className="text-left p-4 text-sm">Reward</th>
                    <th className="text-left p-4 text-sm">Points</th>
                    <th className="text-left p-4 text-sm">Date</th>
                    <th className="text-left p-4 text-sm">Code</th>
                    <th className="text-left p-4 text-sm">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cuephoria-lightpurple/10">
                  {redemptionHistory.map((redemption) => (
                    <tr key={redemption.id} className="hover:bg-cuephoria-lightpurple/5 transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-white">{redemption.rewardName}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white">{redemption.pointsSpent}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white">
                          {format(redemption.createdAt, 'dd MMM yyyy')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm font-mono bg-black/20 px-2 py-1 rounded text-cuephoria-lightpurple">
                          {redemption.redemptionCode}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          redemption.redeemed 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-blue-500/20 text-blue-400'
                        }`}>
                          {redemption.redeemed ? 'Used' : 'Active'}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      <motion.div variants={itemVariants} className="text-center pt-4 border-t border-cuephoria-lightpurple/10 mt-8">
        <p className="text-xs text-muted-foreground/60">Designed and developed by RK</p>
      </motion.div>

      <Dialog open={redemptionDialogOpen} onOpenChange={closeRedemptionDialog}>
        <DialogContent className="sm:max-w-md bg-background border-cuephoria-lightpurple/30">
          {!redemptionCode ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  Confirm Redemption
                </DialogTitle>
                <DialogDescription>
                  You're about to redeem points for this reward
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Card className="bg-cuephoria-darker/60 border-0">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="bg-cuephoria-darker p-3 rounded-full">
                      {selectedReward?.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-medium text-white">{selectedReward?.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedReward?.description}</p>
                      <div className="bg-cuephoria-lightpurple/20 px-2 py-1 rounded-full text-xs font-medium text-cuephoria-lightpurple inline-block mt-1">
                        {selectedReward?.pointsCost} Points
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="mt-4 bg-yellow-900/20 border border-yellow-600/20 rounded-lg p-4">
                  <p className="text-sm font-medium text-white mb-1">Are you sure?</p>
                  <p className="text-xs text-muted-foreground">
                    This will deduct {selectedReward?.pointsCost} points from your balance. This action cannot be undone.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={closeRedemptionDialog}>Cancel</Button>
                <Button 
                  onClick={handleRedeemPoints} 
                  disabled={redeemingReward}
                  className="bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90"
                >
                  {redeemingReward ? "Processing..." : "Confirm Redemption"}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-400" />
                  Reward Redeemed!
                </DialogTitle>
                <DialogDescription>
                  Your points have been successfully redeemed
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 text-center">
                <div className="mb-4">
                  <Sparkles className="h-12 w-12 text-cuephoria-lightpurple mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-white">{selectedReward?.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedReward?.description}</p>
                </div>
                
                <div className="bg-cuephoria-darker/80 p-6 rounded-lg max-w-xs mx-auto mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Your Redemption Code</p>
                  <p className="text-2xl font-mono font-bold tracking-wider text-cuephoria-lightpurple">{redemptionCode}</p>
                </div>
                
                <p className="text-sm text-white">Show this code to a staff member to claim your reward</p>
              </div>
              <DialogFooter>
                <Button 
                  onClick={closeRedemptionDialog} 
                  className="w-full bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default Rewards;
