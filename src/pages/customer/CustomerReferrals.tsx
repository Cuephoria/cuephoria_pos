
import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Referral } from '@/types/customer.types';
import { useToast } from '@/hooks/use-toast';

const CustomerReferrals = () => {
  const { customerUser } = useCustomerAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [friendName, setFriendName] = useState('');
  const [friendEmail, setFriendEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!customerUser) return;
      
      try {
        // Use RPC to get referrals
        const { data, error } = await supabase.rpc(
          'get_customer_referrals',
          { referrer_id: customerUser.customerId }
        );
        
        if (error) {
          console.error('Error fetching referrals:', error);
        } else {
          setReferrals(data as Referral[]);
        }
      } catch (error) {
        console.error('Error in referral fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferrals();
  }, [customerUser]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerUser) return;
    
    setInviting(true);
    try {
      // Use RPC to invite friend
      const { error } = await supabase.rpc(
        'invite_friend',
        {
          referrer_id: customerUser.customerId,
          referrer_name: customerUser.name,
          referral_code: customerUser.referralCode,
          friend_name: friendName,
          friend_email: friendEmail
        }
      );
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to send invitation: ' + error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Invitation Sent',
          description: 'Your friend has been invited!',
        });
        setFriendName('');
        setFriendEmail('');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Referrals</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Referrals</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this code with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md text-center">
              <span className="text-2xl font-bold tracking-wider">{customerUser?.referralCode}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              When your friends sign up with your code, you'll earn 50 loyalty points!
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Invite a Friend</CardTitle>
            <CardDescription>Send a personal invitation directly to your friend</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="friendName">Friend's Name</Label>
                <Input 
                  id="friendName" 
                  value={friendName} 
                  onChange={e => setFriendName(e.target.value)} 
                  required 
                  disabled={inviting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="friendEmail">Friend's Email</Label>
                <Input 
                  id="friendEmail" 
                  type="email" 
                  value={friendEmail} 
                  onChange={e => setFriendEmail(e.target.value)} 
                  required 
                  disabled={inviting}
                />
              </div>
              <Button type="submit" disabled={inviting}>
                {inviting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">Your Referrals</h2>
      
      {referrals.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <p className="text-muted-foreground">You haven't referred anyone yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {referrals.map((referral) => (
                <tr key={referral.id} className="border-b">
                  <td className="px-4 py-3">{referral.referred_name}</td>
                  <td className="px-4 py-3">{referral.referred_email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      referral.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {referral.status === 'completed' ? 'Completed' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{new Date(referral.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    {referral.points_earned || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerReferrals;
