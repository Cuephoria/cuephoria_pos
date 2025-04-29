
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Award, CalendarClock, CalendarDays, Clock, Hourglass } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Progress } from "@/components/ui/progress";
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface MembershipDetails {
  membershipStatus: boolean;
  membershipPlan?: string;
  membershipStartDate?: Date;
  membershipExpiryDate?: Date;
  membershipHoursLeft?: number;
  membershipDuration?: string;
  loyaltyPoints?: number;
}

const CustomerMembership: React.FC = () => {
  const [membershipDetails, setMembershipDetails] = useState<MembershipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [progressValue, setProgressValue] = useState(0);

  useEffect(() => {
    if (!customerUser?.customerId) return;
    
    const fetchMembershipDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            is_member,
            membership_plan,
            membership_start_date,
            membership_expiry_date,
            membership_hours_left,
            membership_duration,
            loyalty_points
          `)
          .eq('id', customerUser.customerId)
          .single();
        
        if (error) {
          console.error('Error fetching membership details:', error);
          toast({
            title: 'Error',
            description: 'Could not fetch membership details',
            variant: 'destructive'
          });
          return;
        }
        
        const details = {
          membershipStatus: data.is_member,
          membershipPlan: data.membership_plan,
          membershipStartDate: data.membership_start_date ? new Date(data.membership_start_date) : undefined,
          membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
          membershipHoursLeft: data.membership_hours_left,
          membershipDuration: data.membership_duration,
          loyaltyPoints: data.loyalty_points
        };
        
        setMembershipDetails(details);
        
        // Calculate progress
        if (details.membershipStartDate && details.membershipExpiryDate) {
          const progress = calculateProgressPercentage(details.membershipStartDate, details.membershipExpiryDate);
          setProgressValue(progress);
        }
      } catch (err) {
        console.error('Error in fetchMembershipDetails:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMembershipDetails();
  }, [customerUser?.customerId, toast]);

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const calculateProgressPercentage = (startDate: Date, endDate: Date) => {
    const startTime = new Date(startDate).getTime();
    const endTime = new Date(endDate).getTime();
    const currentTime = new Date().getTime();
    const totalTime = endTime - startTime;
    const elapsedTime = currentTime - startTime;
    
    if (elapsedTime <= 0) return 0;
    if (elapsedTime >= totalTime) return 100;
    
    return Math.min(Math.round((elapsedTime / totalTime) * 100), 100);
  };

  const handleCopyReferralCode = async () => {
    if (!customerUser?.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(customerUser.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      toast({
        title: "Could not copy code",
        description: "Please try again or copy manually",
        variant: "destructive"
      });
    }
  };

  const handleGetMembership = () => {
    window.open("https://cuephoria.in/membership", "_blank");
  };

  const handleRenewMembership = () => {
    window.open("https://cuephoria.in/membership", "_blank");
    toast({
      title: "Redirecting to membership page",
      description: "You'll be able to select and purchase your preferred plan",
    });
  };

  const handleUpgradeMembership = () => {
    window.open("https://cuephoria.in/membership?upgrade=true", "_blank");
    toast({
      title: "Redirecting to upgrade options",
      description: "Explore premium membership tiers",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-[#5D6BFF] via-[#8A7CFE] to-[#C77DFF] bg-clip-text text-transparent">
          My Membership
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage your membership details and loyalty points
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membership Status Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cuephoria-lightpurple/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-cuephoria-lightpurple animate-pulse-soft" />
                <CardTitle className="text-lg">Membership Status</CardTitle>
              </div>
              <CardDescription>Your current membership details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${membershipDetails?.membershipStatus ? 'bg-cuephoria-green/20 text-cuephoria-green' : 'bg-cuephoria-orange/20 text-cuephoria-orange'}`}>
                    {membershipDetails?.membershipStatus ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Membership Plan</span>
                  <span className="text-sm font-medium">{membershipDetails?.membershipPlan || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-medium capitalize">{membershipDetails?.membershipDuration || 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm font-medium">{membershipDetails?.membershipStartDate ? formatDate(membershipDetails.membershipStartDate) : 'N/A'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Expiry Date</span>
                  <span className="text-sm font-medium">{membershipDetails?.membershipExpiryDate ? formatDate(membershipDetails.membershipExpiryDate) : 'N/A'}</span>
                </div>
                
                {membershipDetails?.membershipStatus && membershipDetails?.membershipStartDate && membershipDetails?.membershipExpiryDate && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Membership Period</span>
                      <span className="text-sm font-medium">{progressValue}% complete</span>
                    </div>
                    <Progress 
                      value={progressValue} 
                      className="h-2 bg-cuephoria-darker"
                    />
                  </div>
                )}
                
                <div className="mt-8">
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cuephoria-lightpurple" /> 
                    Hours Remaining
                  </h3>
                  {membershipDetails?.membershipHoursLeft !== undefined ? (
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-cuephoria-darker h-4 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cuephoria-blue/80 to-cuephoria-lightpurple/80 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min((membershipDetails.membershipHoursLeft / 20) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{membershipDetails.membershipHoursLeft}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">No hours plan active</span>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col gap-2 mt-2">
                  {membershipDetails?.membershipStatus ? (
                    <>
                      <Button
                        variant="outline"
                        className="border-cuephoria-lightpurple/30 hover:border-cuephoria-lightpurple/50 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10 w-full"
                        onClick={handleRenewMembership}
                      >
                        Renew Membership
                      </Button>
                      <Button
                        variant="outline"
                        className="border-cuephoria-blue/30 hover:border-cuephoria-blue/50 text-cuephoria-blue hover:bg-cuephoria-blue/10 w-full"
                        onClick={handleUpgradeMembership}
                      >
                        Upgrade Plan
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-blue w-full"
                      onClick={handleGetMembership}
                    >
                      Get Membership
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Loyalty Points Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cuephoria-orange/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-cuephoria-orange animate-pulse-soft" />
                <CardTitle className="text-lg">Loyalty Points</CardTitle>
              </div>
              <CardDescription>Your earned rewards points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                <motion.div 
                  className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-cuephoria-orange/20 to-cuephoria-lightpurple/20 mb-4 relative overflow-hidden"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                  <div className="absolute inset-0 bg-[conic-gradient(from_0deg,rgba(0,0,0,0),rgba(155,135,245,0.3),rgba(0,0,0,0))] animate-spin-slow"></div>
                  <div className="relative text-4xl font-bold bg-gradient-to-r from-cuephoria-orange to-cuephoria-lightpurple bg-clip-text text-transparent">
                    {membershipDetails?.loyaltyPoints || 0}
                  </div>
                </motion.div>
                <motion.h3 
                  className="text-xl font-semibold bg-gradient-to-r from-cuephoria-orange to-cuephoria-lightpurple bg-clip-text text-transparent"
                  animate={{ 
                    textShadow: [
                      "0 0 5px rgba(249, 115, 22, 0)",
                      "0 0 15px rgba(249, 115, 22, 0.3)",
                      "0 0 5px rgba(249, 115, 22, 0)"
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  Points
                </motion.h3>
                <p className="text-sm text-muted-foreground mt-2">Use your points to redeem exciting rewards!</p>
                
                <Button 
                  className="mt-6 bg-gradient-to-r from-cuephoria-orange/80 to-cuephoria-lightpurple/80 hover:from-cuephoria-orange hover:to-cuephoria-lightpurple text-white shadow-lg shadow-cuephoria-lightpurple/10 hover:shadow-cuephoria-lightpurple/20 transition-all duration-300"
                  onClick={() => window.location.href = "/customer/rewards"}
                >
                  View Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Referral Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-cuephoria-blue/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-cuephoria-blue animate-pulse-soft" />
                <CardTitle className="text-lg">Refer & Earn</CardTitle>
              </div>
              <CardDescription>Share your referral code and earn rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                {customerUser?.referralCode ? (
                  <>
                    <div className="mb-4 bg-gradient-to-r from-cuephoria-blue/20 to-cuephoria-lightpurple/20 p-4 rounded-lg border border-cuephoria-blue/30 relative overflow-hidden">
                      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                      <p className="text-sm text-muted-foreground mb-2">Your Referral Code</p>
                      <p className="text-2xl font-mono font-bold tracking-wider bg-gradient-to-r from-cuephoria-blue to-cuephoria-lightpurple bg-clip-text text-transparent">{customerUser.referralCode}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">Share this code with your friends and earn 100 loyalty points for each successful referral!</p>
                    <Button
                      onClick={handleCopyReferralCode}
                      className="bg-gradient-to-r from-cuephoria-blue/80 to-cuephoria-lightpurple/80 hover:from-cuephoria-blue hover:to-cuephoria-lightpurple text-white shadow-lg shadow-cuephoria-lightpurple/10 hover:shadow-cuephoria-lightpurple/20 transition-all duration-300"
                    >
                      Copy Code
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">Referral code not available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Upcoming Features Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6"
      >
        <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-60"></div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-accent animate-pulse-soft" />
              <CardTitle className="text-lg">Upcoming Membership Benefits</CardTitle>
            </div>
            <CardDescription>New features and benefits coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div 
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-gradient-to-r from-cuephoria-darker to-cuephoria-darker/70 p-4 rounded-lg border border-accent/20 flex items-start gap-3"
              >
                <div className="bg-accent/10 p-2 rounded-full">
                  <CalendarDays className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Extended Playing Hours</h4>
                  <p className="text-xs text-muted-foreground mt-1">Members will get extended playing hours during weekends.</p>
                </div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-gradient-to-r from-cuephoria-darker to-cuephoria-darker/70 p-4 rounded-lg border border-cuephoria-blue/20 flex items-start gap-3"
              >
                <div className="bg-cuephoria-blue/10 p-2 rounded-full">
                  <Award className="h-5 w-5 text-cuephoria-blue" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Premium Tournament Access</h4>
                  <p className="text-xs text-muted-foreground mt-1">Exclusive access to premium tournaments with special prizes.</p>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerMembership;
