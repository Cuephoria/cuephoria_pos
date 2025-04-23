
import React, { useState } from 'react';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CircleDollarSign,
  Gift,
  Clock,
  Calendar,
  Ticket,
  Award,
  Info,
} from 'lucide-react';

interface RewardItem {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  type: 'discount' | 'freeplay' | 'merchandise' | 'food';
  image?: string;
}

const CustomerRewards: React.FC = () => {
  const { user, refreshUser } = useCustomerAuth();
  const { toast } = useToast();
  const [redeemingReward, setRedeemingReward] = useState<string | null>(null);

  // Mock rewards data - would come from backend in production
  const availableRewards: RewardItem[] = [
    {
      id: '1',
      name: '15% Discount',
      description: 'Get 15% off on your next visit',
      pointsCost: 100,
      type: 'discount',
    },
    {
      id: '2',
      name: '30-Min Free Play',
      description: 'Enjoy 30 minutes of free table time',
      pointsCost: 150,
      type: 'freeplay',
    },
    {
      id: '3',
      name: 'Free Beverage',
      description: 'Redeem for any drink from our menu',
      pointsCost: 75,
      type: 'food',
    },
    {
      id: '4',
      name: 'Cuephoria T-Shirt',
      description: 'Exclusive branded t-shirt',
      pointsCost: 300,
      type: 'merchandise',
    },
    {
      id: '5',
      name: '1-Hour Free Play',
      description: 'Enjoy a full hour of free table time',
      pointsCost: 250,
      type: 'freeplay',
    },
  ];

  const totalPoints = user?.loyaltyPoints || 0;
  
  // Progress to next tier
  const pointsForNextTier = 500;
  const currentTierPoints = totalPoints % pointsForNextTier;
  const tierProgress = (currentTierPoints / pointsForNextTier) * 100;
  const pointsToNextTier = pointsForNextTier - currentTierPoints;
  
  // User's current tier
  const getTierName = (points: number) => {
    if (points >= 2000) return "Diamond";
    if (points >= 1000) return "Platinum";
    if (points >= 500) return "Gold";
    if (points >= 200) return "Silver";
    return "Bronze";
  };
  
  const userTier = getTierName(totalPoints);
  
  // Handle reward redemption
  const handleRedeemReward = async (reward: RewardItem) => {
    if (!user) return;
    
    if (totalPoints < reward.pointsCost) {
      toast({
        variant: "destructive",
        title: "Insufficient points",
        description: `You need ${reward.pointsCost - totalPoints} more points to redeem this reward`,
      });
      return;
    }
    
    setRedeemingReward(reward.id);
    
    try {
      // In production, this would create a redemption record
      // and update the user's points in the database
      
      // Update points in user record
      const { error } = await supabase
        .from('customers')
        .update({
          loyalty_points: totalPoints - reward.pointsCost
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Refresh user data to update points
      await refreshUser();
      
      toast({
        title: "Reward redeemed!",
        description: `You've successfully redeemed: ${reward.name}`,
      });
      
      // In production, this would generate a code or ticket for the user
      
    } catch (error: any) {
      console.error('Redemption error:', error);
      toast({
        variant: "destructive",
        title: "Redemption failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setRedeemingReward(null);
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rewards Center</h1>
          <p className="text-muted-foreground">
            Redeem your loyalty points for exclusive rewards and benefits
          </p>
        </div>
        
        {/* Loyalty status */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  {userTier} Tier
                </CardTitle>
                <CardDescription>
                  You have {totalPoints} loyalty points available
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <CircleDollarSign className="h-4 w-4 mr-1" />
                {totalPoints}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to next tier</span>
                <span>{currentTierPoints}/{pointsForNextTier}</span>
              </div>
              <Progress value={tierProgress} className="h-2" />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Earn {pointsToNextTier} more points to reach the next tier
            </p>
          </CardFooter>
        </Card>
        
        {/* Rewards tabs */}
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="discount">Discounts</TabsTrigger>
            <TabsTrigger value="freeplay">Free Play</TabsTrigger>
            <TabsTrigger value="food">Food/Drinks</TabsTrigger>
            <TabsTrigger value="merchandise">Merch</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRewards.map(reward => (
                <Card key={reward.id} className="card-hover overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{reward.name}</CardTitle>
                      <Badge variant="outline" className="capitalize">
                        {reward.type}
                      </Badge>
                    </div>
                    <CardDescription>{reward.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium text-lg">{reward.pointsCost} points</span>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/30">
                    <Button 
                      className="w-full"
                      disabled={
                        redeemingReward === reward.id || 
                        (user?.loyaltyPoints || 0) < reward.pointsCost
                      }
                      variant={(user?.loyaltyPoints || 0) >= reward.pointsCost ? "default" : "outline"}
                      onClick={() => handleRedeemReward(reward)}
                    >
                      {redeemingReward === reward.id ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Redeeming
                        </span>
                      ) : (user?.loyaltyPoints || 0) >= reward.pointsCost ? (
                        <span className="flex items-center">
                          <Gift className="mr-2 h-4 w-4" />
                          Redeem Reward
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Info className="mr-2 h-4 w-4" />
                          Need {reward.pointsCost - (user?.loyaltyPoints || 0)} more points
                        </span>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          {['discount', 'freeplay', 'food', 'merchandise'].map(type => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRewards
                  .filter(reward => reward.type === type)
                  .map(reward => (
                    <Card key={reward.id} className="card-hover overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{reward.name}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {reward.type}
                          </Badge>
                        </div>
                        <CardDescription>{reward.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
                          <span className="font-medium text-lg">{reward.pointsCost} points</span>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/30">
                        <Button 
                          className="w-full"
                          disabled={
                            redeemingReward === reward.id || 
                            (user?.loyaltyPoints || 0) < reward.pointsCost
                          }
                          variant={(user?.loyaltyPoints || 0) >= reward.pointsCost ? "default" : "outline"}
                          onClick={() => handleRedeemReward(reward)}
                        >
                          {redeemingReward === reward.id ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Redeeming
                            </span>
                          ) : (user?.loyaltyPoints || 0) >= reward.pointsCost ? (
                            <span className="flex items-center">
                              <Gift className="mr-2 h-4 w-4" />
                              Redeem Reward
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <Info className="mr-2 h-4 w-4" />
                              Need {reward.pointsCost - (user?.loyaltyPoints || 0)} more points
                            </span>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
              </div>
              
              {availableRewards.filter(reward => reward.type === type).length === 0 && (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">No {type} rewards currently available</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        {/* How to earn points */}
        <Card>
          <CardHeader>
            <CardTitle>How to Earn Points</CardTitle>
            <CardDescription>
              Earn loyalty points with these activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium">Book and Play</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn 1 point for every minute you play at our facility
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <CircleDollarSign className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium">Make Purchases</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn 10 points for every ₹100 spent on food, drinks or merchandise
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-secondary/20 p-2 rounded-full">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-medium">Refer Friends</h4>
                  <p className="text-sm text-muted-foreground">
                    Earn 50 points for each friend you refer who makes their first booking
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerRewards;
