
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
}

const CustomerMembership: React.FC = () => {
  const [membershipDetails, setMembershipDetails] = useState<MembershipDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();

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
            membership_duration
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
        
        setMembershipDetails({
          membershipStatus: data.is_member,
          membershipPlan: data.membership_plan,
          membershipStartDate: data.membership_start_date ? new Date(data.membership_start_date) : undefined,
          membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
          membershipHoursLeft: data.membership_hours_left,
          membershipDuration: data.membership_duration
        });
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

  const calculateProgressPercentage = () => {
    if (!membershipDetails || !membershipDetails.membershipStartDate || !membershipDetails.membershipExpiryDate) {
      return 0;
    }
    
    const startTime = membershipDetails.membershipStartDate.getTime();
    const endTime = membershipDetails.membershipExpiryDate.getTime();
    const currentTime = new Date().getTime();
    const totalTime = endTime - startTime;
    const elapsedTime = currentTime - startTime;
    
    if (elapsedTime <= 0) return 0;
    if (elapsedTime >= totalTime) return 100;
    
    return Math.min(Math.round((elapsedTime / totalTime) * 100), 100);
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
          View and manage your membership details
        </p>
      </motion.div>
      
      {membershipDetails?.membershipStatus ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 h-full flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-cuephoria-lightpurple/10">
                    <Award className="h-6 w-6 text-cuephoria-lightpurple" />
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-blue bg-clip-text text-transparent">
                    Active Membership
                  </CardTitle>
                </div>
                <CardDescription className="text-base text-muted-foreground">
                  You have an active {membershipDetails.membershipPlan} membership
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span className="text-sm">Start Date</span>
                    </div>
                    <p className="text-lg font-medium">{formatDate(membershipDetails.membershipStartDate)}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <CalendarClock className="h-4 w-4" />
                      <span className="text-sm">Expiry Date</span>
                    </div>
                    <p className="text-lg font-medium">{formatDate(membershipDetails.membershipExpiryDate)}</p>
                  </div>
                </div>
                
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Membership Period</span>
                    <span className="text-sm font-medium">{calculateProgressPercentage()}% complete</span>
                  </div>
                  <Progress value={calculateProgressPercentage()} className="h-2 bg-cuephoria-darker" indicatorClassName="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-blue" />
                </div>
                
                <div className="mt-8">
                  <div className="p-4 rounded-lg bg-gradient-to-r from-cuephoria-darker/80 to-cuephoria-dark/80 border border-cuephoria-lightpurple/10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-cuephoria-green" />
                        <span className="font-medium">Hours Remaining</span>
                      </div>
                      <span className="text-xl font-bold text-cuephoria-green">
                        {membershipDetails.membershipHoursLeft || 0}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You have {membershipDetails.membershipHoursLeft || 0} hours left in your membership package
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <Button className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent">
                    Upgrade Membership
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-full bg-cuephoria-orange/10">
                    <Hourglass className="h-6 w-6 text-cuephoria-orange" />
                  </div>
                  <CardTitle className="text-xl bg-gradient-to-r from-cuephoria-orange to-amber-500 bg-clip-text text-transparent">
                    Membership Benefits
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mt-2">
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 rounded-full bg-cuephoria-orange/10 p-1">
                      <Award className="h-4 w-4 text-cuephoria-orange" />
                    </div>
                    <div>
                      <p className="font-medium">Priority booking</p>
                      <p className="text-sm text-muted-foreground">Get priority access to tables and stations</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 rounded-full bg-cuephoria-orange/10 p-1">
                      <Award className="h-4 w-4 text-cuephoria-orange" />
                    </div>
                    <div>
                      <p className="font-medium">Exclusive events</p>
                      <p className="text-sm text-muted-foreground">Access to member-only tournaments and events</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 rounded-full bg-cuephoria-orange/10 p-1">
                      <Award className="h-4 w-4 text-cuephoria-orange" />
                    </div>
                    <div>
                      <p className="font-medium">Bonus loyalty points</p>
                      <p className="text-sm text-muted-foreground">Earn 2x loyalty points on purchases</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <div className="flex-shrink-0 rounded-full bg-cuephoria-orange/10 p-1">
                      <Award className="h-4 w-4 text-cuephoria-orange" />
                    </div>
                    <div>
                      <p className="font-medium">Discounted F&B</p>
                      <p className="text-sm text-muted-foreground">10% off on food and beverages</p>
                    </div>
                  </li>
                </ul>
                
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-cuephoria-darker/80 to-cuephoria-dark/80 border border-cuephoria-lightpurple/10">
                  <p className="font-medium mb-1">Current Plan: {membershipDetails.membershipPlan}</p>
                  <p className="text-sm text-muted-foreground">
                    Duration: {membershipDetails.membershipDuration || 'Not specified'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                No Active Membership
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                You currently don't have an active membership. Purchase a membership package to enjoy exclusive benefits!
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {/* Membership packages */}
                <Card className="border-cuephoria-lightpurple/20 bg-cuephoria-darker/60 overflow-hidden">
                  <div className="p-1 bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-blue"></div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">Basic</h3>
                    <div className="my-3">
                      <span className="text-2xl font-bold">₹1,999</span>
                      <span className="text-muted-foreground"> / month</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-lightpurple" />
                        <span>15 hours of play time</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-lightpurple" />
                        <span>Basic member benefits</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-lightpurple" />
                        <span>5% discount on F&B</span>
                      </li>
                    </ul>
                    <Button className="w-full">Select</Button>
                  </div>
                </Card>
                
                <Card className="border-cuephoria-lightpurple/20 bg-cuephoria-darker/60 overflow-hidden">
                  <div className="p-1 bg-gradient-to-r from-cuephoria-green to-cuephoria-blue"></div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">Premium</h3>
                    <div className="my-3">
                      <span className="text-2xl font-bold">₹3,499</span>
                      <span className="text-muted-foreground"> / month</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-green" />
                        <span>30 hours of play time</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-green" />
                        <span>All basic benefits</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-green" />
                        <span>10% discount on F&B</span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">Select</Button>
                  </div>
                </Card>
                
                <Card className="border-cuephoria-lightpurple/20 bg-cuephoria-darker/60 overflow-hidden">
                  <div className="p-1 bg-gradient-to-r from-cuephoria-orange to-amber-500"></div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg">Elite</h3>
                    <div className="my-3">
                      <span className="text-2xl font-bold">₹6,999</span>
                      <span className="text-muted-foreground"> / month</span>
                    </div>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-orange" />
                        <span>60 hours of play time</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-orange" />
                        <span>All premium benefits</span>
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Award size={14} className="text-cuephoria-orange" />
                        <span>15% discount on F&B</span>
                      </li>
                    </ul>
                    <Button className="w-full" variant="outline">Select</Button>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default CustomerMembership;
