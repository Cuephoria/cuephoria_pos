
import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Check, Copy, Share2, Users, Clock } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getReferrals } from '@/services/referralsService';

interface ReferralDisplay {
  id: string;
  referredName: string;
  referredEmail: string;
  status: 'pending' | 'completed';
  pointsAwarded: number;
  createdAt: Date;
}

const CustomerReferrals = () => {
  const { customerUser, customerProfile } = useCustomerAuth();
  const [referrals, setReferrals] = useState<ReferralDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadReferrals = async () => {
      if (customerUser) {
        try {
          setIsLoading(true);
          const referrals = await getReferrals(customerUser.customer_id);
          setReferrals(referrals);
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
  }, [customerUser, toast]);

  const copyReferralLink = () => {
    if (!customerProfile) return;
    
    const referralLink = `${window.location.origin}/customer/register?ref=${customerProfile.referralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: 'Copied',
      description: 'Referral link copied to clipboard',
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const shareReferral = () => {
    if (!customerProfile) return;
    
    const referralLink = `${window.location.origin}/customer/register?ref=${customerProfile.referralCode}`;
    const shareText = `Join me at Cuephoria 8-Ball Club! Use my referral code ${customerProfile.referralCode} to sign up.`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Cuephoria 8-Ball Club Referral',
        text: shareText,
        url: referralLink,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      copyReferralLink();
    }
  };

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Referrals</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Invite friends and earn loyalty points</p>
      </div>

      <Card className="mb-8 bg-cuephoria-darker border-cuephoria-orange/20">
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center mb-4">
            <p className="text-muted-foreground mb-2">Share this code with friends to earn 100 loyalty points for each person who signs up</p>
            <div className="inline-block bg-black/20 px-6 py-3 rounded-lg font-mono text-2xl tracking-wider font-bold text-cuephoria-orange">
              {customerProfile?.referralCode || 'Loading...'}
            </div>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-md mb-4">
            <h3 className="font-bold mb-2">How it works</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Share your unique referral code with friends</li>
              <li>They enter your code when registering a new account</li>
              <li>Once they make their first purchase or play a session, you'll earn 100 loyalty points</li>
              <li>There's no limit to how many friends you can refer!</li>
            </ol>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={copyReferralLink} 
            className="w-full sm:w-auto flex items-center gap-2 bg-cuephoria-orange hover:bg-cuephoria-orange/90"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy Referral Link'}
          </Button>
          <Button 
            onClick={shareReferral}
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-2 border-cuephoria-orange/30 text-cuephoria-orange hover:bg-cuephoria-orange/10"
          >
            <Share2 size={18} />
            Share with Friends
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex justify-between items-center border-b border-border pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{referral.referredName}</p>
                    <p className="text-sm text-muted-foreground">{referral.referredEmail}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock size={12} />
                      <span>{referral.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      referral.status === 'completed' 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                      {referral.status === 'completed' ? 'Completed' : 'Pending'}
                    </div>
                    {referral.pointsAwarded > 0 && (
                      <span className="text-sm text-green-500 mt-1">
                        +{referral.pointsAwarded} points
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users size={48} className="mx-auto text-muted-foreground mb-3" />
              <p className="mb-2">You haven't referred anyone yet.</p>
              <p className="text-sm text-muted-foreground">Share your referral code to start earning points!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerReferrals;
