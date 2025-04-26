
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerReferrals, createReferral, getReferredFriends } from '@/services/referralsService';
import { Users, Mail, Award, Clock, CheckCircle, AlertCircle, Share2 } from 'lucide-react';
import { Referral } from '@/types/customer.types';

interface ReferredFriend {
  customer_id: string;
  name: string;
  email?: string;
  status: "pending" | "completed";
  joinDate: Date;
  pointsAwarded: number;
}

const CustomerReferrals = () => {
  const { customerUser, customerProfile } = useCustomerAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referredFriends, setReferredFriends] = useState<ReferredFriend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [friendEmail, setFriendEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const loadReferrals = async () => {
      if (customerUser) {
        try {
          setIsLoading(true);
          const [referralsData, friendsData] = await Promise.all([
            getCustomerReferrals(customerUser.customer_id),
            getReferredFriends(customerUser.customer_id)
          ]);
          
          setReferrals(referralsData);
          setReferredFriends(friendsData);
          
          if (customerProfile) {
            setReferralCode(customerProfile.referralCode);
          }
        } catch (error) {
          console.error('Error loading referrals:', error);
          toast({
            title: 'Error',
            description: 'Failed to load referral data',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadReferrals();
  }, [customerUser, customerProfile, toast]);

  const handleReferFriend = async () => {
    if (!friendEmail) {
      toast({
        title: 'Error',
        description: 'Please enter your friend\'s email address',
        variant: 'destructive',
      });
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(friendEmail)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      if (customerUser) {
        const success = await createReferral(customerUser.customer_id, friendEmail);
        
        if (success) {
          toast({
            title: 'Referral Sent',
            description: 'Your friend has been invited!',
          });
          setFriendEmail('');
          
          // Refresh the referrals data
          const [referralsData, friendsData] = await Promise.all([
            getCustomerReferrals(customerUser.customer_id),
            getReferredFriends(customerUser.customer_id)
          ]);
          
          setReferrals(referralsData);
          setReferredFriends(friendsData);
        }
      }
    } catch (error) {
      console.error('Error sending referral:', error);
      toast({
        title: 'Referral Failed',
        description: 'Failed to send referral invitation',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    toast({
      title: 'Copied!',
      description: 'Referral code copied to clipboard',
    });
  };

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Refer Friends</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Invite friends and earn rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this code with friends to earn 100 points when they join</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="flex-1 font-mono text-center p-3 bg-muted rounded-md tracking-wider text-lg">
                {referralCode}
              </div>
              <Button onClick={copyReferralCode} size="icon" variant="outline">
                <Share2 size={18} />
              </Button>
            </div>
            
            <div className="mt-4 bg-primary/10 p-3 rounded-md">
              <p className="text-sm flex items-center gap-2">
                <Award size={16} className="text-primary flex-shrink-0" />
                <span>Earn 100 points when your friend signs up with your code!</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Refer a Friend</CardTitle>
            <CardDescription>Send an invitation to your friends by email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <label htmlFor="friendEmail" className="text-sm font-medium">
                Friend's Email Address
              </label>
              <Input
                id="friendEmail"
                type="email"
                placeholder="Enter your friend's email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={handleReferFriend} 
              disabled={isSending || !friendEmail}
            >
              {isSending ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Mail className="mr-2" size={18} />
                  Send Invitation
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Referred Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : referredFriends.length > 0 ? (
            <div className="space-y-4">
              {referredFriends.map((friend) => (
                <div key={friend.customer_id} className="p-4 border border-border rounded-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-muted rounded-full w-10 h-10 flex items-center justify-center">
                        <Users size={18} />
                      </div>
                      <div>
                        <p className="font-medium">{friend.name}</p>
                        <p className="text-sm text-muted-foreground">{friend.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium sm:text-right">
                      {friend.status === 'completed' ? (
                        <div className="text-green-500 flex items-center gap-1">
                          <CheckCircle size={14} />
                          <span>Completed</span>
                        </div>
                      ) : (
                        <div className="text-amber-500 flex items-center gap-1">
                          <AlertCircle size={14} />
                          <span>Pending</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>Invited: {friend.joinDate.toLocaleDateString()}</span>
                    </div>
                    {friend.status === 'completed' && (
                      <div className="flex items-center gap-1 text-green-500">
                        <Award size={12} />
                        <span>+{friend.pointsAwarded} points earned</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">You haven't referred any friends yet.</p>
              <p className="text-sm">Share your referral code to start earning rewards!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReferrals;
