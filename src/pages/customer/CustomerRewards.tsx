
import { useState, useEffect } from 'react';
import { getRewards, redeemReward } from '@/services/rewardsService';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Award, Gift, AlertCircle, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Reward } from '@/types/customer.types';

const CustomerRewards = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemDialog, setRedeemDialog] = useState(false);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  
  const { customerProfile, refreshProfile } = useCustomerAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchRewards = async () => {
      setIsLoading(true);
      try {
        const rewardsData = await getRewards();
        setRewards(rewardsData);
      } catch (error) {
        console.error('Error fetching rewards:', error);
        toast({
          title: 'Error',
          description: 'Failed to load rewards',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRewards();
  }, [toast]);
  
  const handleOpenRedeemDialog = (reward: Reward) => {
    if (!customerProfile) {
      toast({
        title: 'Error',
        description: 'You must be logged in to redeem rewards',
        variant: 'destructive',
      });
      return;
    }
    
    if (customerProfile.loyaltyPoints < reward.pointsRequired) {
      toast({
        title: 'Not enough points',
        description: `You need ${reward.pointsRequired} points but only have ${customerProfile.loyaltyPoints}`,
        variant: 'destructive',
      });
      return;
    }
    
    setSelectedReward(reward);
    setRedeemDialog(true);
  };
  
  const handleRedeem = async () => {
    if (!selectedReward || !customerProfile) return;
    
    try {
      const result = await redeemReward(selectedReward.id, customerProfile.id);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message,
        });
        
        // Refresh profile to get updated points
        await refreshProfile();
        
        setRedeemDialog(false);
      } else {
        toast({
          title: 'Error',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast({
        title: 'Error',
        description: 'Failed to redeem reward',
        variant: 'destructive',
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Rewards</h1>
          <p className="text-muted-foreground">Redeem your loyalty points for exciting rewards</p>
        </div>
        
        {customerProfile && (
          <Badge variant="secondary" className="px-3 py-2 bg-cuephoria-lightpurple text-white">
            <Award size={16} className="mr-2" />
            {customerProfile.loyaltyPoints} Points
          </Badge>
        )}
      </div>
      
      <Separator className="mb-6" />
      
      {rewards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Gift size={48} className="text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No rewards available</h3>
          <p className="text-muted-foreground">Check back later for exciting rewards</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => (
            <Card key={reward.id} className="overflow-hidden">
              <CardHeader className="bg-slate-50">
                <CardTitle>{reward.name}</CardTitle>
                <CardDescription>{reward.description}</CardDescription>
              </CardHeader>
              <CardContent className="py-4">
                <div className="flex items-center justify-center bg-slate-50 p-4 rounded-md">
                  {reward.image ? (
                    <img 
                      src={reward.image} 
                      alt={reward.name}
                      className="h-32 object-contain"
                    />
                  ) : (
                    <Gift size={64} className="text-cuephoria-lightpurple/50" />
                  )}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <Badge className="bg-cuephoria-orange border-none">
                      <Award size={14} className="mr-1" />
                      {reward.pointsRequired} Points
                    </Badge>
                  </div>
                  
                  {customerProfile && customerProfile.loyaltyPoints >= reward.pointsRequired ? (
                    <Badge className="bg-green-500 border-none">
                      <Check size={14} className="mr-1" />
                      Eligible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-500">
                      <AlertCircle size={14} className="mr-1" />
                      {customerProfile ? `Need ${reward.pointsRequired - (customerProfile.loyaltyPoints || 0)} more` : 'Login to check'}
                    </Badge>
                  )}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90"
                  onClick={() => handleOpenRedeemDialog(reward)}
                  disabled={!customerProfile || customerProfile.loyaltyPoints < reward.pointsRequired}
                >
                  <Gift size={16} className="mr-2" />
                  Redeem
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <Dialog open={redeemDialog} onOpenChange={setRedeemDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Redeem Reward</DialogTitle>
            <DialogDescription>
              Are you sure you want to redeem this reward? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedReward && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">{selectedReward.name}</h4>
                <Badge className="bg-cuephoria-orange border-none">
                  {selectedReward.pointsRequired} Points
                </Badge>
              </div>
              
              <p className="text-muted-foreground text-sm">
                {selectedReward.description}
              </p>
              
              {customerProfile && (
                <div className="mt-4 bg-slate-50 p-3 rounded-md">
                  <div className="text-sm">Your points: <span className="font-semibold">{customerProfile.loyaltyPoints}</span></div>
                  <div className="text-sm">After redemption: <span className="font-semibold">{customerProfile.loyaltyPoints - selectedReward.pointsRequired}</span></div>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setRedeemDialog(false)}>Cancel</Button>
            <Button 
              className="bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90"
              onClick={handleRedeem}
            >
              <Gift size={16} className="mr-2" />
              Confirm Redemption
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerRewards;
