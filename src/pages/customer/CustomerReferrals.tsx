
import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Referral } from '@/types/customer.types';
import { Copy, CheckCircle, Clock, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { referralsService } from '@/services/referralsService';

const CustomerReferrals = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  useEffect(() => {
    const fetchReferrals = async () => {
      if (!customerUser) return;
      
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', customerUser.customerId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setReferrals(data as Referral[]);
      } catch (error) {
        console.error('Error fetching referrals:', error);
        toast({
          title: 'Error',
          description: 'Failed to load referral data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReferrals();
  }, [customerUser, toast]);

  const handleInviteFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerUser) return;
    
    if (!friendName || !friendEmail) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both name and email of your friend',
        variant: 'destructive',
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(friendEmail)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await referralsService.inviteFriend({
        referrerName: customerUser.name,
        referrerId: customerUser.customerId,
        referralCode: customerUser.referralCode,
        friendName,
        friendEmail,
      });
      
      toast({
        title: 'Invitation Sent',
        description: `An invitation has been sent to ${friendName}`,
      });
      
      setFriendName('');
      setFriendEmail('');
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const copyReferralCode = () => {
    if (customerUser?.referralCode) {
      navigator.clipboard.writeText(customerUser.referralCode);
      toast({
        title: 'Copied!',
        description: 'Referral code copied to clipboard',
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Refer Friends</h1>
          <p className="text-muted-foreground">Invite friends and earn rewards</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Users className="h-4 w-4" />
                Invite a Friend
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite a Friend</DialogTitle>
                <DialogDescription>
                  Send an invitation to your friend and earn 50 points when they sign up, plus 100 more when they make their first purchase.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleInviteFriend}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="friend-name">Friend's Name</Label>
                    <Input
                      id="friend-name"
                      value={friendName}
                      onChange={(e) => setFriendName(e.target.value)}
                      placeholder="Enter your friend's name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="friend-email">Friend's Email</Label>
                    <Input
                      id="friend-email"
                      type="email"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      placeholder="Enter your friend's email"
                      required
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Sending...' : 'Send Invitation'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>Share this code with friends to earn rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-2 p-3 bg-muted rounded-md flex-1">
              <p className="font-mono text-lg font-bold flex-1 text-center">
                {customerUser?.referralCode || 'N/A'}
              </p>
              <Button size="icon" variant="outline" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-md p-3 flex-1">
              <p className="font-bold">
                Earn 50 points per referral + 100 bonus points
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Referrals</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ReferralsList 
            referrals={referrals} 
            isLoading={isLoading}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <ReferralsList 
            referrals={referrals.filter(r => r.status === 'pending')} 
            isLoading={isLoading}
            formatDate={formatDate}
          />
        </TabsContent>
        
        <TabsContent value="completed">
          <ReferralsList 
            referrals={referrals.filter(r => r.status === 'completed')} 
            isLoading={isLoading}
            formatDate={formatDate}
          />
        </TabsContent>
      </Tabs>
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How Our Referral Program Works</CardTitle>
          <CardDescription>Earn rewards by inviting friends</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-4">
            <li className="pl-2">
              <span className="font-medium">Share your referral code</span>
              <p className="text-muted-foreground text-sm mt-1">Send your unique code to friends via email or copy and share it however you like.</p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Friends sign up using your code</span>
              <p className="text-muted-foreground text-sm mt-1">When they register, they'll enter your referral code to connect their account to yours.</p>
            </li>
            <li className="pl-2">
              <span className="font-medium">You earn 50 points immediately</span>
              <p className="text-muted-foreground text-sm mt-1">As soon as a friend signs up with your code, you'll receive 50 loyalty points.</p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Earn an additional 100 points</span>
              <p className="text-muted-foreground text-sm mt-1">When your referred friend makes their first purchase, you'll receive an additional 100 points.</p>
            </li>
            <li className="pl-2">
              <span className="font-medium">Your friend gets a bonus too</span>
              <p className="text-muted-foreground text-sm mt-1">Your friend will receive 20 bonus points when signing up with your referral code.</p>
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper component to display the referrals list
const ReferralsList = ({ 
  referrals, 
  isLoading,
  formatDate
}: { 
  referrals: Referral[],
  isLoading: boolean,
  formatDate: (date: string) => string
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
      </div>
    );
  }
  
  if (referrals.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-xl font-medium mb-2">No Referrals Yet</h3>
        <p className="text-muted-foreground">Start inviting friends to earn rewards!</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {referrals.map((referral) => (
        <Card key={referral.id}>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-lg">{referral.referred_name}</h3>
                <p className="text-sm text-muted-foreground">{referral.referred_email}</p>
                <div className="mt-2">
                  <Badge variant={referral.status === 'completed' ? 'success' : 'outline'} className="gap-1">
                    {referral.status === 'completed' ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="h-3 w-3" />
                        Pending
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">
                  Invited on: {formatDate(referral.created_at)}
                </div>
                {referral.converted_at && (
                  <div className="text-sm text-muted-foreground mb-1">
                    Completed on: {formatDate(referral.converted_at)}
                  </div>
                )}
                {referral.status === 'completed' && (
                  <div className="text-primary font-bold mt-2">
                    +{referral.points_earned || 150} points earned
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CustomerReferrals;
