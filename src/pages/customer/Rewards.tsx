
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Gift, Award, Star, Clock, CalendarDays } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { LoyaltyRedemption } from '@/types/loyalty-redemptions';

interface RedemptionRecord {
  id: string;
  user_id: string;
  reward_name: string;
  points_used: number;
  code: string;
  redeemed_at: string;
}

const Rewards = () => {
  const { user, refreshProfile } = useCustomerAuth();
  const [activeTab, setActiveTab] = useState('loyalty');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  const [redemptionHistory, setRedemptionHistory] = useState<RedemptionRecord[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { toast } = useToast();

  const rewards = [
    { id: '1', name: '30-minute Free Play', points: 100, description: 'Get a free 30-minute play session' },
    { id: '2', name: 'Free Soft Drink', points: 50, description: 'Enjoy a complimentary soft drink on us' },
    { id: '3', name: '10% Off Next Visit', points: 200, description: 'Save 10% on your next bill' },
    { id: '4', name: 'Friend Plays Free', points: 300, description: 'Bring a friend to play for free (30 min)' }
  ];

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
      transition: { duration: 0.3 }
    }
  };

  useEffect(() => {
    if (user) {
      fetchRedemptionHistory();
    }
  }, [user]);

  const fetchRedemptionHistory = async () => {
    if (!user) return;
    
    setIsLoadingHistory(true);
    try {
      // Use RPC function to get redemption history
      const { data, error } = await supabase.rpc(
        'get_loyalty_redemptions',
        { customer_uuid: user.id }
      );
      
      if (error) throw error;
      
      setRedemptionHistory(data as RedemptionRecord[] || []);
    } catch (error) {
      console.error('Error fetching redemption history:', error);
      toast({
        title: 'Error',
        description: 'Failed to load redemption history',
        variant: 'destructive'
      });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleRewardSelect = (rewardId: string) => {
    setSelectedReward(rewardId);
  };

  const generateRedemptionCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleRedeemReward = async () => {
    if (!user || !selectedReward) return;
    
    const reward = rewards.find(r => r.id === selectedReward);
    if (!reward) return;
    
    if ((user.loyaltyPoints || 0) < reward.points) {
      toast({
        title: 'Not enough points',
        description: `You need ${reward.points} points to redeem this reward`,
        variant: 'destructive'
      });
      return;
    }
    
    setIsRedeeming(true);
    try {
      const code = generateRedemptionCode();
      
      // Use RPC function to create a redemption
      const { data: redemptionId, error: createError } = await supabase.rpc(
        'create_loyalty_redemption',
        {
          customer_uuid: user.id,
          points_redeemed_val: reward.points,
          redemption_code_val: code,
          reward_name_val: reward.name
        }
      );
      
      if (createError) throw createError;
      
      // Then, update user's loyalty points
      const { error: pointsError } = await supabase.rpc(
        'deduct_loyalty_points', 
        { 
          user_id: user.id,
          points_to_deduct: reward.points
        }
      );
      
      if (pointsError) throw pointsError;

      // Refresh user profile to get updated points
      await refreshProfile();
      
      // Update redemption history
      await fetchRedemptionHistory();
      
      // Show success message and visual feedback
      triggerConfetti();
      
      toast({
        title: 'Reward Redeemed!',
        description: `Your redemption code is: ${code}`,
      });
      
      setSelectedReward(null);
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: 'Redemption Failed',
        description: 'There was an error processing your redemption. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-3xl font-bold mb-6 bg-gradient-to-r from-cuephoria-lightpurple to-accent bg-clip-text text-transparent"
          variants={itemVariants}
        >
          Rewards & Loyalty
        </motion.h1>
        
        <motion.div variants={itemVariants}>
          <Card className="mb-8 bg-cuephoria-darker border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/5">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="mr-2 text-cuephoria-lightpurple" size={24} />
                Your Loyalty Status
              </CardTitle>
              <CardDescription>
                Earn points with every game and redeem them for exclusive rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Points</p>
                  <div className="flex items-center">
                    <Star className="text-amber-400 mr-2" size={20} />
                    <span className="text-2xl font-bold text-amber-400">{user?.loyaltyPoints || 0}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Next Reward At</p>
                  <div className="flex items-center">
                    <Gift className="text-cuephoria-lightpurple mr-2" size={20} />
                    <span className="text-2xl font-bold text-cuephoria-lightpurple">50</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress to next reward</span>
                  <span className="text-cuephoria-lightpurple">{user?.loyaltyPoints ? user.loyaltyPoints % 50 : 0}/50</span>
                </div>
                <Progress value={(user?.loyaltyPoints ? user.loyaltyPoints % 50 : 0) * 2} className="h-2 bg-cuephoria-darker" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="loyalty">
                <Gift className="mr-2 h-4 w-4" /> Redeem Rewards
              </TabsTrigger>
              <TabsTrigger value="history">
                <Clock className="mr-2 h-4 w-4" /> Redemption History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="loyalty" className="space-y-6">
              <h2 className="text-xl font-semibold mb-4">Available Rewards</h2>
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
                {rewards.map((reward) => (
                  <Card 
                    key={reward.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedReward === reward.id ? 'border-cuephoria-lightpurple bg-cuephoria-lightpurple/5' : 'border-cuephoria-lightpurple/30 bg-cuephoria-darker'
                    }`}
                    onClick={() => handleRewardSelect(reward.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Award className={`mr-2 ${selectedReward === reward.id ? 'text-cuephoria-lightpurple' : 'text-muted-foreground'}`} size={18} />
                        {reward.name}
                      </CardTitle>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between pt-2">
                      <div className="flex items-center">
                        <Star className="text-amber-400 mr-1" size={16} />
                        <span className="font-semibold">{reward.points} points</span>
                      </div>
                      <Button
                        size="sm"
                        className={`${
                          (user?.loyaltyPoints || 0) >= reward.points
                            ? 'bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90'
                            : 'bg-gray-600 hover:bg-gray-700 cursor-not-allowed'
                        }`}
                        disabled={(user?.loyaltyPoints || 0) < reward.points}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedReward(reward.id);
                          handleRedeemReward();
                        }}
                      >
                        {(user?.loyaltyPoints || 0) >= reward.points ? 'Redeem' : 'Not Enough Points'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
              
              {selectedReward && (
                <div className="flex justify-center mt-6">
                  <Button 
                    className="bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90 w-full max-w-md"
                    onClick={handleRedeemReward}
                    disabled={isRedeeming}
                  >
                    {isRedeeming ? 'Processing...' : 'Confirm Redemption'}
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history">
              <h2 className="text-xl font-semibold mb-4">Your Redemption History</h2>
              {isLoadingHistory ? (
                <div className="text-center py-10">
                  <div className="animate-spin h-8 w-8 border-4 border-cuephoria-lightpurple border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading your history...</p>
                </div>
              ) : redemptionHistory.length > 0 ? (
                <div className="space-y-4">
                  {redemptionHistory.map((record) => (
                    <Card key={record.id} className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
                      <CardHeader className="py-4">
                        <CardTitle className="text-base flex justify-between items-start">
                          <div className="flex items-center">
                            <Gift className="text-cuephoria-lightpurple mr-2" size={16} />
                            {record.reward_name}
                          </div>
                          <span className="text-sm font-normal text-muted-foreground flex items-center">
                            <CalendarDays size={14} className="mr-1" />
                            {formatDate(record.redeemed_at)}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm mb-1">Redemption Code</p>
                            <p className="font-mono font-bold">{record.code}</p>
                          </div>
                          <div className="flex items-center">
                            <Star className="text-amber-400 mr-1" size={14} />
                            <span className="font-semibold">{record.points_used} points</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-cuephoria-darker rounded-lg border border-cuephoria-lightpurple/20 p-6">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Redemptions Yet</h3>
                  <p className="text-muted-foreground mb-4">You haven't redeemed any rewards yet. Start earning points and claim exciting rewards!</p>
                  <Button 
                    variant="outline" 
                    className="border-cuephoria-lightpurple text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10"
                    onClick={() => setActiveTab('loyalty')}
                  >
                    View Available Rewards
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Rewards;
