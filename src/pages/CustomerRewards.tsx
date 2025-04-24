
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/components/CustomerLayout';
import { Award, Gift, Ticket, Share2, Copy, Check, CopyCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { fetchAvailableRewards } from '@/services/rewardsService';
import { Reward, RedeemedReward } from '@/types/customer.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showErrorToast, showSuccessToast } from '@/utils/toast-utils';
import { motion } from 'framer-motion';

const CustomerRewards = () => {
  const { user, isLoading, redeemPoints, getReferralCode } = useCustomerAuth();
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redemptionCode, setRedemptionCode] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isRedemptionModalOpen, setIsRedemptionModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  const [isLoadingRewards, setIsLoadingRewards] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRewards = async () => {
      setIsLoadingRewards(true);
      const rewards = await fetchAvailableRewards();
      setAvailableRewards(rewards);
      setIsLoadingRewards(false);
    };

    loadRewards();
  }, []);

  const handleRedeemPoints = async (reward: Reward) => {
    if (!user) return;

    if (user.loyaltyPoints < reward.pointsRequired) {
      showErrorToast('Insufficient Points', `You need ${reward.pointsRequired} points to redeem this reward.`);
      return;
    }

    setSelectedReward(reward);
    const code = await redeemPoints(reward.id, reward.pointsRequired);
    if (code) {
      setRedemptionCode(code);
      setIsRedemptionModalOpen(true);
    }
  };

  const handleGetReferralCode = async () => {
    const code = await getReferralCode();
    setReferralCode(code);
    setIsReferralModalOpen(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true);
        showSuccessToast('Copied!', 'Referral code copied to clipboard');
        setTimeout(() => setCopied(false), 3000);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        showErrorToast('Error', 'Failed to copy to clipboard');
      }
    );
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
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">Rewards & Referrals</h1>
          <p className="text-muted-foreground">Earn and redeem loyalty points for exclusive benefits</p>
        </div>

        <div className="mb-6 bg-cuephoria-darker/70 p-4 rounded-lg border border-cuephoria-lightpurple/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-amber-500/30 to-amber-700/30 p-3 rounded-full">
                <Award className="text-amber-400 h-8 w-8" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Your Loyalty Points</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-amber-400">{user?.loyaltyPoints || 0}</h2>
              </div>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button 
                onClick={handleGetReferralCode} 
                className="flex-1 md:flex-none bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Refer a Friend
              </Button>
              <Button 
                onClick={() => navigate('/customer/membership')} 
                variant="outline" 
                className="flex-1 md:flex-none border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
              >
                <Gift className="mr-2 h-4 w-4" />
                Get Membership
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="available" className="mt-6">
          <TabsList className="bg-cuephoria-darker border border-cuephoria-lightpurple/20">
            <TabsTrigger value="available" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
              Available Rewards
            </TabsTrigger>
            <TabsTrigger value="redeemed" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
              Redeemed Rewards
            </TabsTrigger>
            <TabsTrigger value="referral" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
              Referral Program
            </TabsTrigger>
          </Tabs>

          <TabsContent value="available" className="mt-6">
            {isLoadingRewards ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
              </div>
            ) : availableRewards.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible" 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {availableRewards.map((reward) => (
                  <motion.div key={reward.id} variants={itemVariants}>
                    <Card className="bg-cuephoria-darker/70 hover:shadow-lg hover:shadow-cuephoria-lightpurple/10 transition-all border border-cuephoria-lightpurple/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                          {reward.name}
                          <Badge className="bg-amber-600 text-white">
                            {reward.pointsRequired} Points
                          </Badge>
                        </CardTitle>
                        <CardDescription>{reward.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Gift className="mr-2 h-4 w-4 text-amber-500" />
                          <span>Available for redemption now</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => handleRedeemPoints(reward)} 
                          className="w-full bg-gradient-to-r from-amber-500 to-amber-700"
                          disabled={(user?.loyaltyPoints || 0) < reward.pointsRequired}
                        >
                          Redeem Now
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Award className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-xl font-medium mb-1">No rewards available</h3>
                <p className="text-muted-foreground">
                  Check back later for exciting rewards
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="redeemed" className="mt-6">
            {user?.redeemedRewards && user.redeemedRewards.length > 0 ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible" 
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {user.redeemedRewards.map((reward, index) => (
                  <motion.div key={index} variants={itemVariants}>
                    <Card className="bg-cuephoria-darker/70 border border-cuephoria-lightpurple/20">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{reward.name}</CardTitle>
                          <Badge className="bg-emerald-600 text-white">Redeemed</Badge>
                        </div>
                        <CardDescription>
                          Redeemed on {reward.redeemedAt.toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-cuephoria-darkpurple p-3 rounded-md border border-cuephoria-lightpurple/10">
                          <p className="text-sm font-medium mb-1">Redemption Code</p>
                          <div className="flex items-center justify-between">
                            <code className="font-mono text-lg text-amber-400">{reward.redemptionCode}</code>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-cuephoria-lightpurple" 
                              onClick={() => copyToClipboard(reward.redemptionCode)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="w-full">
                          <p className="text-xs text-muted-foreground text-center">
                            Show this code to our staff to claim your reward
                          </p>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <h3 className="text-xl font-medium mb-1">No redeemed rewards yet</h3>
                <p className="text-muted-foreground mb-6">
                  Redeem your points to see your rewards here
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => document.querySelector('[data-value="available"]')?.click()}
                  className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                >
                  View Available Rewards
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="referral" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-cuephoria-darker/70 border border-cuephoria-lightpurple/20">
                <CardHeader>
                  <CardTitle>Referral Program</CardTitle>
                  <CardDescription>Invite friends and earn rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-cuephoria-darkpurple p-4 rounded-md border border-cuephoria-lightpurple/10">
                    <h3 className="font-medium text-lg mb-2">How it works</h3>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start">
                        <span className="bg-cuephoria-lightpurple/20 text-cuephoria-lightpurple w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5">1</span>
                        <span>Share your unique referral code with friends</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-cuephoria-lightpurple/20 text-cuephoria-lightpurple w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5">2</span>
                        <span>Friends sign up using your code</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-cuephoria-lightpurple/20 text-cuephoria-lightpurple w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5">3</span>
                        <span>When they make their first purchase, you earn 100 points</span>
                      </li>
                      <li className="flex items-start">
                        <span className="bg-cuephoria-lightpurple/20 text-cuephoria-lightpurple w-5 h-5 rounded-full flex items-center justify-center mr-2 mt-0.5">4</span>
                        <span>They also earn 50 points as a welcome bonus</span>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-lightpurple/20 p-4 rounded-md border border-cuephoria-lightpurple/20">
                    <h3 className="font-medium mb-3">Your Referral Code</h3>
                    {user?.referralCode ? (
                      <div className="bg-cuephoria-darker/70 p-3 rounded-md flex items-center justify-between">
                        <code className="font-mono text-lg text-cuephoria-lightpurple">{user.referralCode}</code>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-cuephoria-lightpurple" 
                          onClick={() => copyToClipboard(user.referralCode || '')}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={handleGetReferralCode}
                        className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple"
                      >
                        Generate Referral Code
                      </Button>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={handleGetReferralCode} 
                    className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90"
                    disabled={!user?.referralCode}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Referral Code
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-gradient-to-br from-cuephoria-darkpurple to-purple-900/70 border border-cuephoria-lightpurple/20">
                <CardHeader>
                  <CardTitle>Referral Benefits</CardTitle>
                  <CardDescription className="text-white/70">Exclusive rewards for you and your friends</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-black/20 p-4 rounded-md">
                    <h3 className="font-medium text-lg mb-3">For You</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="bg-amber-500/20 p-1.5 rounded-full mr-3">
                          <Award className="h-4 w-4 text-amber-400" />
                        </div>
                        <span>100 loyalty points per successful referral</span>
                      </li>
                      <li className="flex items-center">
                        <div className="bg-amber-500/20 p-1.5 rounded-full mr-3">
                          <Gift className="h-4 w-4 text-amber-400" />
                        </div>
                        <span>Special rewards after 5 referrals</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/20 p-4 rounded-md">
                    <h3 className="font-medium text-lg mb-3">For Your Friends</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center">
                        <div className="bg-amber-500/20 p-1.5 rounded-full mr-3">
                          <Award className="h-4 w-4 text-amber-400" />
                        </div>
                        <span>50 welcome loyalty points</span>
                      </li>
                      <li className="flex items-center">
                        <div className="bg-amber-500/20 p-1.5 rounded-full mr-3">
                          <Ticket className="h-4 w-4 text-amber-400" />
                        </div>
                        <span>First-time visitor special offers</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Redemption Success Dialog */}
      <Dialog open={isRedemptionModalOpen} onOpenChange={setIsRedemptionModalOpen}>
        <DialogContent className="bg-cuephoria-darkpurple border border-cuephoria-lightpurple/30">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Reward Redeemed!</DialogTitle>
            <DialogDescription className="text-center">
              Your points have been successfully redeemed.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gradient-to-r from-amber-500/20 to-amber-700/20 p-4 rounded-lg border border-amber-500/20 text-center">
            <Award className="h-12 w-12 mx-auto text-amber-400 mb-2" />
            <h3 className="text-lg font-medium mb-1">{selectedReward?.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {selectedReward?.description}
            </p>
            
            <div className="bg-cuephoria-darker/80 p-3 rounded-md mb-4">
              <p className="text-xs text-muted-foreground mb-1">Your Redemption Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono text-xl text-amber-400">{redemptionCode}</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-amber-400 p-0 h-auto" 
                  onClick={() => copyToClipboard(redemptionCode || '')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Show this code to our staff to claim your reward
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsRedemptionModalOpen(false)} 
              className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Referral Code Dialog */}
      <Dialog open={isReferralModalOpen} onOpenChange={setIsReferralModalOpen}>
        <DialogContent className="bg-cuephoria-darkpurple border border-cuephoria-lightpurple/30">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Share Your Referral Code</DialogTitle>
            <DialogDescription className="text-center">
              Invite friends and earn loyalty points
            </DialogDescription>
          </DialogHeader>
          <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-lightpurple/20 p-6 rounded-lg border border-cuephoria-lightpurple/20 text-center">
            <Share2 className="h-12 w-12 mx-auto text-cuephoria-lightpurple mb-4" />
            
            <div className="bg-cuephoria-darker/80 p-3 rounded-md mb-4">
              <p className="text-xs text-muted-foreground mb-1">Your Referral Code</p>
              <div className="flex items-center justify-center gap-2">
                <code className="font-mono text-xl text-cuephoria-lightpurple">{referralCode}</code>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-cuephoria-lightpurple p-0 h-auto" 
                  onClick={() => copyToClipboard(referralCode)}
                >
                  {copied ? <CopyCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground mb-3">
              Share this code with your friends. When they sign up and make their first purchase,
              you'll both receive loyalty points!
            </p>
            
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => copyToClipboard(referralCode)} 
                variant="outline" 
                className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple flex-1"
              >
                {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </Button>
              <Button 
                onClick={() => {
                  try {
                    navigator.share({
                      title: 'Join me on Cuephoria!',
                      text: `Use my referral code ${referralCode} to get bonus points when you sign up for Cuephoria 8-Ball Club!`,
                      url: 'https://cuephoria.in',
                    });
                  } catch (err) {
                    copyToClipboard(referralCode);
                  }
                }} 
                className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple flex-1"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setIsReferralModalOpen(false)} 
              variant="outline" 
              className="w-full border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
};

export default CustomerRewards;
