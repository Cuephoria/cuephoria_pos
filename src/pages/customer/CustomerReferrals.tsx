
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Copy, Share2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Referral } from '@/types/customer.types';
import { useToast } from '@/hooks/use-toast';

const CustomerReferrals = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReferrals = async () => {
      if (!customerUser) return;

      try {
        const { data, error } = await supabase.rpc(
          'get_customer_referrals', 
          { referrer_id: customerUser.customerId }
        );
        
        if (!error && data) {
          setReferrals(data as Referral[]);
        }
      } catch (error) {
        console.error('Error fetching referrals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReferrals();
  }, [customerUser]);

  const copyReferralCode = () => {
    if (!customerUser?.referralCode) return;
    
    navigator.clipboard.writeText(customerUser.referralCode);
    toast({
      title: "Code copied!",
      description: "Referral code copied to clipboard",
    });
  };

  const shareReferralCode = async () => {
    if (!customerUser?.referralCode || !navigator.share) return;
    
    try {
      await navigator.share({
        title: 'Join me on Cuephoria!',
        text: `Use my referral code ${customerUser.referralCode} to join Cuephoria and get special bonuses!`,
        url: window.location.origin + '/customer/register?referral=' + customerUser.referralCode,
      });
    } catch (error) {
      console.error('Error sharing:', error);
      copyReferralCode();
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Referral Code</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">
                Share your referral code with friends and both of you will earn bonus points! 
                You get 50 points for each friend who joins.
              </p>
              <div className="flex items-center gap-2">
                <Input 
                  value={customerUser?.referralCode || ''} 
                  readOnly 
                  className="font-mono text-lg" 
                />
                <Button variant="outline" size="icon" onClick={copyReferralCode} title="Copy code">
                  <Copy className="h-4 w-4" />
                </Button>
                {navigator.share && (
                  <Button variant="outline" size="icon" onClick={shareReferralCode} title="Share code">
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={shareReferralCode} className="w-full">
                Invite Friends
              </Button>
            </CardFooter>
          </Card>

          <h2 className="text-2xl font-semibold mb-4">Your Referrals</h2>
          {referrals.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">You haven't referred anyone yet</p>
                <p className="text-sm mt-2">Share your code to start earning bonus points!</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left">Name</th>
                        <th className="px-4 py-3 text-left">Email</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {referrals.map((referral) => (
                        <tr key={referral.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">{referral.referred_name}</td>
                          <td className="px-4 py-3">{referral.referred_email}</td>
                          <td className="px-4 py-3">
                            {new Date(referral.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              referral.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {referral.status === 'completed' ? 'Complete' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {referral.status === 'completed' 
                              ? `+${referral.points_earned || 50}` 
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">1. Share Your Code</h3>
                <p className="text-sm text-muted-foreground">
                  Share your personal referral code with friends who would enjoy Cuephoria.
                </p>
              </div>
              <div>
                <h3 className="font-medium">2. Friends Sign Up</h3>
                <p className="text-sm text-muted-foreground">
                  They enter your code during registration to connect their account to yours.
                </p>
              </div>
              <div>
                <h3 className="font-medium">3. Earn Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  You get 50 loyalty points for each friend who signs up using your code.
                </p>
              </div>
              <div>
                <h3 className="font-medium">4. Friends Get Bonus</h3>
                <p className="text-sm text-muted-foreground">
                  Your friends get 20 welcome bonus points for using a referral code.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerReferrals;
