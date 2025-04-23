
import React, { useState } from 'react';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Copy,
  Mail,
  Share2,
  Award,
  Gift,
  Check,
} from 'lucide-react';

const CustomerReferrals: React.FC = () => {
  const { user } = useCustomerAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Generate a referral code if the user doesn't have one
  const referralCode = user?.referralCode || `FRIEND-${user?.id.substring(0, 6)}`;
  
  // In a real app, this would be fetched from the backend
  const referralLink = `https://cuephoria.com/register?ref=${referralCode}`;
  
  const referralRewards = [
    { points: 50, description: "For each friend who signs up" },
    { points: 100, description: "When your friend makes their first booking" },
    { points: 150, description: "When your friend purchases a membership" },
  ];
  
  // Mock data for successful referrals
  const referrals = [
    { name: "Raj Kumar", date: new Date(2023, 5, 15), status: "signed up", points: 50 },
    { name: "Priya Singh", date: new Date(2023, 6, 10), status: "made booking", points: 100 },
    { name: "Amit Patel", date: new Date(2023, 7, 22), status: "purchased membership", points: 150 },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendEmail = () => {
    if (!emailAddress) {
      toast({
        variant: "destructive",
        title: "Email required",
        description: "Please enter your friend's email address",
      });
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      toast({
        variant: "destructive",
        title: "Invalid email",
        description: "Please enter a valid email address",
      });
      return;
    }
    
    setIsSending(true);
    
    // In a real app, this would call an API endpoint to send the email
    setTimeout(() => {
      setIsSending(false);
      setEmailAddress('');
      toast({
        title: 'Invitation sent!',
        description: `Referral invitation sent to ${emailAddress}`,
      });
    }, 1500);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Refer Friends</h1>
          <p className="text-muted-foreground">
            Invite friends to Cuephoria and earn rewards for both of you
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Share Your Referral Link</CardTitle>
              <CardDescription>
                Get {referralRewards[0].points} points for every friend who signs up using your link
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono bg-muted"
                />
                <Button 
                  onClick={handleCopyLink} 
                  variant={copied ? "default" : "secondary"}
                  className="whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  placeholder="Friend's email address"
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  disabled={isSending}
                />
                <Button 
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="whitespace-nowrap"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send Email
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start mt-4">
                <Button variant="outline" size="sm">
                  <svg
                    className="mr-2 h-4 w-4 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                  </svg>
                  Facebook
                </Button>
                
                <Button variant="outline" size="sm">
                  <svg
                    className="mr-2 h-4 w-4 text-sky-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
                  </svg>
                  Twitter
                </Button>
                
                <Button variant="outline" size="sm">
                  <svg
                    className="mr-2 h-4 w-4 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.151-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345z"></path>
                    <path d="M20.52 3.449a12.871 12.871 0 00-9.07-3.769 13 13 0 00-11.144 19.611l-.273 3.979a.75.75 0 00.675.75h.008a.75.75 0 00.542-.231.73.73 0 00.208-.527l.008-.042-.231-3.45a.75.75 0 00-.07-.337 11.5 11.5 0 0110.275-17.965 11.5 11.5 0 0111.5 11.5 11.5 11.5 0 01-9.435 11.291h-.027a11.5 11.5 0 01-2.055.181 11.38 11.38 0 01-4.763-1.035.75.75 0 10-.63 1.359 12.9 12.9 0 005.39 1.175 13 13 0 0013-13 12.905 12.905 0 00-3.906-9.252z" fill-rule="evenodd"></path>
                  </svg>
                  WhatsApp
                </Button>
                
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  More Options
                </Button>
              </div>
            </CardContent>
            <CardFooter className="border-t border-border pt-4 flex flex-col">
              <div className="text-sm text-muted-foreground">
                Your personal referral code: <span className="font-mono font-medium">{referralCode}</span>
              </div>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Referral Rewards</CardTitle>
              <CardDescription>
                How points are earned through referrals
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {referralRewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-primary/20 p-2 rounded-full flex-shrink-0">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium flex items-center">
                      <span>{reward.points}</span>
                      <span className="text-xs ml-1">pts</span>
                    </p>
                    <p className="text-sm text-muted-foreground">{reward.description}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Gift className="h-4 w-4 text-secondary" />
                  Your friend gets
                </h4>
                <ul className="space-y-2 pl-6 list-disc text-sm">
                  <li>20% off their first booking</li>
                  <li>50 bonus loyalty points on sign up</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Successful Referrals</CardTitle>
            <CardDescription>
              Friends who have used your referral code
            </CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral, index) => (
                  <div key={index} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/20 p-2 rounded-full">
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {referral.date.toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize">
                        {referral.status}
                      </Badge>
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        +{referral.points}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Users className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">No referrals yet</h3>
                <p className="text-sm text-muted-foreground">
                  Share your referral code with friends to start earning rewards
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerReferrals;
