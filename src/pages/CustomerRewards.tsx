
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Award, Star, Gift, Calendar, Coins, Check, Copy, ArrowRight } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { showSuccessToast } from '@/utils/toast-utils';
import CustomerLayout from '@/components/CustomerLayout';

const REWARD_ITEMS = [
  {
    id: 'reward-1',
    title: '30-minute Free Game',
    description: 'Get a free 30-minute game session',
    points: 100,
    type: 'game',
  },
  {
    id: 'reward-2',
    title: 'Free Beverage',
    description: 'Enjoy a complimentary drink of your choice',
    points: 50,
    type: 'food',
  },
  {
    id: 'reward-3',
    title: '₹200 Discount Voucher',
    description: 'Use this voucher on your next visit',
    points: 200,
    type: 'voucher',
  },
  {
    id: 'reward-4',
    title: 'Free Coaching Session',
    description: '1-hour professional coaching',
    points: 300,
    type: 'premium',
  },
  {
    id: 'reward-5',
    title: '10% Off Monthly Membership',
    description: 'Discount on monthly membership plan',
    points: 250,
    type: 'membership',
  },
  {
    id: 'reward-6',
    title: 'Free Entry to Tournament',
    description: 'Enter our weekend tournament for free',
    points: 150,
    type: 'event',
  },
];

const PROMOTIONS = [
  {
    id: 'promo-1',
    title: '10% OFF Online Bookings',
    description: 'Book any table online and get 10% off',
    code: 'ONLINE10',
    validUntil: '2025-06-30',
    background: 'from-pink-500/20 to-purple-500/20 border-pink-500/20',
    buttonColor: 'text-pink-600 bg-white hover:bg-white/90',
  },
  {
    id: 'promo-2',
    title: 'Happy Hours Discount',
    description: '20% off on all games between 2PM - 5PM',
    code: 'HAPPY20',
    validUntil: '2025-05-15',
    background: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
    buttonColor: 'text-blue-600 bg-white hover:bg-white/90',
  },
  {
    id: 'promo-3',
    title: 'Weekend Tournament',
    description: 'Participate in our weekend tournament for exciting prizes',
    validUntil: '2025-07-15',
    background: 'from-amber-500/20 to-orange-500/20 border-amber-500/20',
    buttonColor: 'text-orange-600 bg-white hover:bg-white/90',
  },
];

const CustomerRewards = () => {
  const { user } = useCustomerAuth();
  const navigate = useNavigate();
  
  const [selectedReward, setSelectedReward] = useState<(typeof REWARD_ITEMS)[0] | null>(null);
  const [redeemDialog, setRedeemDialog] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [activeTab, setActiveTab] = useState('rewards');
  
  const loyaltyPoints = user?.loyaltyPoints || 0;
  
  const handleRedeemReward = (reward: typeof REWARD_ITEMS[0]) => {
    if (!user || reward.points > loyaltyPoints) return;
    
    setSelectedReward(reward);
    setRedeemDialog(true);
  };
  
  const confirmRedeem = () => {
    if (!selectedReward) return;
    
    // Generate a random redemption code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setRedeemCode(code);
    setRedeemSuccess(true);
    
    // In a real app, we would call an API to update the user's loyalty points
    showSuccessToast('Reward Redeemed', `You've successfully redeemed ${selectedReward.title}`);
  };
  
  const resetRedeemState = () => {
    setRedeemDialog(false);
    setRedeemSuccess(false);
    setSelectedReward(null);
    setRedeemCode('');
  };
  
  const handleCopyCode = () => {
    navigator.clipboard.writeText(redeemCode);
    showSuccessToast('Code Copied', 'Redemption code copied to clipboard');
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-cuephoria-lightpurple to-accent bg-clip-text text-transparent">
              Rewards & Promotions
            </h1>
            <p className="text-muted-foreground mt-1">
              Earn loyalty points, redeem rewards, and access exclusive promotions
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
              onClick={() => navigate('/customer/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="rewards" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 p-1">
            <TabsTrigger 
              value="rewards" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Rewards
            </TabsTrigger>
            <TabsTrigger 
              value="promotions" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Promotions
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rewards" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Coins size={18} className="text-cuephoria-lightpurple" />
                  Your Loyalty Points
                </CardTitle>
                <CardDescription>
                  Earn points with every visit and redeem for rewards
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 p-4 sm:p-6 rounded-lg border border-amber-500/20">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                    <div>
                      <h3 className="font-medium text-amber-400">Current Balance</h3>
                      <div className="flex items-center gap-2">
                        <Star size={18} className="text-amber-400" />
                        <span className="text-3xl font-bold text-amber-300">{loyaltyPoints}</span>
                        <span className="text-amber-400 font-medium">points</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 sm:mt-0">
                      <h4 className="font-medium text-sm text-amber-400">Next Reward</h4>
                      <div className="space-y-1 mt-1">
                        <div className="flex justify-between text-xs">
                          <span>Progress</span>
                          <span>{loyaltyPoints % 50}/50 points</span>
                        </div>
                        <Progress 
                          value={(loyaltyPoints % 50) * 2} 
                          className="h-2 bg-cuephoria-darker"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                  <h4 className="font-medium">How It Works</h4>
                  <ul className="mt-2 space-y-2">
                    <li className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check size={14} className="text-green-400" />
                      Earn 1 point for every ₹10 spent
                    </li>
                    <li className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check size={14} className="text-green-400" />
                      Bonus points for referrals and special events
                    </li>
                    <li className="text-sm text-muted-foreground flex items-center gap-2">
                      <Check size={14} className="text-green-400" />
                      Members earn 2x points on all purchases
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
            
            <h3 className="text-xl font-medium text-white mt-6">Rewards Catalog</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REWARD_ITEMS.map((reward) => (
                <Card key={reward.id} className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden hover:border-cuephoria-lightpurple/60 transition-all hover:shadow-lg hover:shadow-cuephoria-lightpurple/10 hover:-translate-y-1">
                  <CardHeader className="pb-2">
                    <Badge 
                      className={`
                        ${reward.type === 'game' ? 'bg-blue-600' : ''}
                        ${reward.type === 'food' ? 'bg-green-600' : ''}
                        ${reward.type === 'voucher' ? 'bg-purple-600' : ''}
                        ${reward.type === 'premium' ? 'bg-amber-600' : ''}
                        ${reward.type === 'membership' ? 'bg-pink-600' : ''}
                        ${reward.type === 'event' ? 'bg-orange-600' : ''}
                      `}
                    >
                      {reward.type}
                    </Badge>
                    <CardTitle className="text-lg mt-1">{reward.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {reward.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between items-center border-t border-cuephoria-lightpurple/10 p-4">
                    <div className="flex items-center">
                      <Star size={16} className="text-amber-400 mr-1" />
                      <span className="font-bold">{reward.points}</span>
                      <span className="text-sm text-muted-foreground ml-1">points</span>
                    </div>
                    <Button
                      size="sm"
                      disabled={loyaltyPoints < reward.points}
                      onClick={() => handleRedeemReward(reward)}
                      className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                    >
                      Redeem
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="promotions" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Gift size={18} className="text-cuephoria-lightpurple" />
                  Special Offers
                </CardTitle>
                <CardDescription>
                  Current promotions and special offers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {PROMOTIONS.map((promo) => (
                    <div 
                      key={promo.id} 
                      className={`bg-gradient-to-r ${promo.background} border p-4 rounded-lg overflow-hidden`}
                    >
                      <div className="space-y-3">
                        <h4 className="text-lg font-bold text-white">{promo.title}</h4>
                        <p className="text-white/80 text-sm">{promo.description}</p>
                        
                        {promo.code && (
                          <div className="bg-white/20 p-2 rounded flex items-center justify-between">
                            <code className="font-mono font-bold text-white">{promo.code}</code>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-6 w-6 p-0 text-white hover:bg-white/20"
                              onClick={() => {
                                navigator.clipboard.writeText(promo.code || '');
                                showSuccessToast('Code Copied', 'Promotion code copied to clipboard');
                              }}
                            >
                              <Copy size={12} />
                            </Button>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-white/70">
                            Valid until {new Date(promo.validUntil).toLocaleDateString()}
                          </p>
                          <Button 
                            size="sm" 
                            className={promo.buttonColor}
                          >
                            Use Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calendar size={18} className="text-cuephoria-lightpurple" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Special tournaments and events
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-white">Weekend Tournament</h4>
                  <p className="text-sm text-white/80 mt-1">Join our weekend tournament and compete for exciting prizes!</p>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/70" />
                        <span className="text-sm text-white/80">Every Sunday, 2:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Coins size={14} className="text-white/70" />
                        <span className="text-sm text-white/80">Entry Fee: ₹500 (Free for members)</span>
                      </div>
                    </div>
                    <Button className="bg-white text-blue-600 hover:bg-white/90">
                      Register Now
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/20 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-white">Ladies Night</h4>
                  <p className="text-sm text-white/80 mt-1">Special discounts and free coaching sessions for ladies</p>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-white/70" />
                        <span className="text-sm text-white/80">Every Wednesday, 6:00 PM - 9:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Gift size={14} className="text-white/70" />
                        <span className="text-sm text-white/80">50% off on all games</span>
                      </div>
                    </div>
                    <Button className="bg-white text-pink-600 hover:bg-white/90">
                      Learn More
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Star size={18} className="text-cuephoria-lightpurple" />
                  Points History
                </CardTitle>
                <CardDescription>
                  Track your loyalty points activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Pool Session</h3>
                        <p className="text-sm text-muted-foreground">2 hours of gameplay</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium">+20 points</p>
                        <p className="text-xs text-muted-foreground">May 15, 2025</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Beverage Purchase</h3>
                        <p className="text-sm text-muted-foreground">Drinks and snacks</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium">+15 points</p>
                        <p className="text-xs text-muted-foreground">May 10, 2025</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Free Beverage Reward</h3>
                        <p className="text-sm text-muted-foreground">Reward redemption</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-400 font-medium">-50 points</p>
                        <p className="text-xs text-muted-foreground">May 5, 2025</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Tournament Entry</h3>
                        <p className="text-sm text-muted-foreground">Weekend tournament</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-medium">+50 points</p>
                        <p className="text-xs text-muted-foreground">Apr 28, 2025</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-cuephoria-lightpurple/10 p-4">
                <Button 
                  variant="outline" 
                  className="ml-auto border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                >
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Award size={18} className="text-cuephoria-lightpurple" />
                  Rewards History
                </CardTitle>
                <CardDescription>
                  Your redeemed rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Free Beverage</h3>
                        <p className="text-sm text-muted-foreground">Complimentary drink</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Redeemed</Badge>
                        <p className="text-xs text-muted-foreground mt-1">May 5, 2025</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-cuephoria-lightpurple/10">
                      <p className="text-xs text-muted-foreground">Redemption Code: DRINK1234</p>
                    </div>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">30-minute Free Game</h3>
                        <p className="text-sm text-muted-foreground">Free game time</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">Redeemed</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Apr 20, 2025</p>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-cuephoria-lightpurple/10">
                      <p className="text-xs text-muted-foreground">Redemption Code: GAME5678</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <Dialog open={redeemDialog} onOpenChange={resetRedeemState}>
          <DialogContent className="bg-cuephoria-darker border border-cuephoria-lightpurple/40">
            {!redeemSuccess ? (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl flex justify-center items-center gap-2">
                    <Award size={20} className="text-cuephoria-lightpurple" />
                    Redeem Reward
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    Are you sure you want to redeem this reward?
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/20">
                    <h3 className="font-medium text-lg">{selectedReward?.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selectedReward?.description}</p>
                    
                    <div className="flex items-center mt-4">
                      <div className="flex items-center">
                        <Star size={16} className="text-amber-400 mr-1" />
                        <span className="font-bold">{selectedReward?.points}</span>
                        <span className="text-sm text-muted-foreground ml-1">points</span>
                      </div>
                      <Separator className="mx-4 h-4" orientation="vertical" />
                      <div className="flex items-center">
                        <span className="text-sm text-muted-foreground mr-1">Your balance:</span>
                        <Star size={14} className="text-amber-400 mx-1" />
                        <span className="font-bold">{loyaltyPoints}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <DialogFooter className="flex sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={resetRedeemState}
                    className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                    onClick={confirmRedeem}
                  >
                    Confirm Redemption
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl text-center flex justify-center items-center gap-2">
                    <Check size={20} className="text-green-400" />
                    Redemption Successful
                  </DialogTitle>
                </DialogHeader>
                
                <div className="py-6">
                  <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                      <Check size={32} className="text-green-400" />
                    </div>
                    
                    <h3 className="font-medium text-lg">{selectedReward?.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Your reward has been redeemed successfully
                    </p>
                    
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/20 mt-6">
                      <p className="text-sm text-muted-foreground">Your Redemption Code</p>
                      <div className="flex items-center justify-center gap-2 mt-2">
                        <code className="font-mono text-lg font-bold">{redeemCode}</code>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={handleCopyCode}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mt-4">
                      Show this code to staff to claim your reward
                    </p>
                  </div>
                </div>
                
                <DialogFooter className="flex justify-center">
                  <Button
                    className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 w-full"
                    onClick={resetRedeemState}
                  >
                    Done
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
          <p className="mt-1 text-xs">Designed and developed by RK</p>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerRewards;
