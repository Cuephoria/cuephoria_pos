import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Star, Clock, CalendarDays, CircleCheck, AlertTriangle } from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';

const Membership = () => {
  const { user } = useCustomerAuth();
  const [membershipDetails, setMembershipDetails] = useState<any>(null);

  useEffect(() => {
    if (user?.isMember) {
      // Calculate details based on the membership plan
      const expiryDate = user.membershipExpiryDate ? new Date(user.membershipExpiryDate) : 
        (user.membershipDuration === 'weekly' || !user.membershipDuration) ? addWeeks(new Date(), 1) : addMonths(new Date(), 1);
      
      const startDate = user.membershipStartDate ? new Date(user.membershipStartDate) : new Date();
      
      const totalHours = (user.membershipDuration === 'weekly' || !user.membershipDuration) ? 10 : 20;
      const hoursRemaining = user.membershipHoursLeft || 0;
      const hoursUsed = totalHours - hoursRemaining;
      
      setMembershipDetails({
        plan: user.membershipPlan,
        expiryDate,
        startDate,
        totalHours,
        hoursRemaining,
        hoursUsed,
        percentageUsed: (hoursUsed / totalHours) * 100
      });
    }
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="container p-4 sm:p-6 space-y-6 max-w-4xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Membership</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your membership details</p>
      </motion.div>

      {user?.isMember && membershipDetails ? (
        <motion.div className="space-y-6" variants={itemVariants}>
          {/* Current Membership Overview */}
          <Card className="bg-gradient-to-r from-amber-950/40 to-amber-900/40 border-amber-800/60">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-400" />
                  Current Membership
                </CardTitle>
                <div className="bg-amber-400/20 px-3 py-1 rounded-full text-xs font-medium text-amber-200">
                  {membershipDetails.plan}
                </div>
              </div>
              <CardDescription className="text-white/70">
                Valid until {format(membershipDetails.expiryDate, 'dd MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-white/70">Hours Remaining</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{membershipDetails.hoursRemaining}</p>
                  <p className="text-xs text-white/50">of {membershipDetails.totalHours} total hours</p>
                </div>
                
                <div className="bg-black/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-4 w-4 text-amber-400" />
                    <span className="text-xs text-white/70">Start Date</span>
                  </div>
                  <p className="text-md font-medium text-white">{format(membershipDetails.startDate, 'dd MMM yyyy')}</p>
                  <p className="text-xs text-white/50">
                    {membershipDetails.plan?.toLowerCase().includes('weekly') ? 'Weekly plan' : 'Monthly plan'}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/70">Usage</span>
                  <span className="text-xs font-medium text-white">
                    {membershipDetails.hoursUsed} hours used
                  </span>
                </div>
                <Progress value={membershipDetails.percentageUsed} className="h-2" />
              </div>
            </CardContent>
          </Card>
          
          {/* Membership Benefits */}
          <Card className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
            <CardHeader>
              <CardTitle>Your Membership Benefits</CardTitle>
              <CardDescription>
                Enjoy these exclusive perks with your {membershipDetails.plan} plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-cuephoria-lightpurple/20 p-1.5 rounded-full mt-0.5">
                    <CircleCheck className="h-4 w-4 text-cuephoria-lightpurple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {membershipDetails.totalHours} hours of gameplay each {membershipDetails.plan?.toLowerCase().includes('weekly') ? 'week' : 'month'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Use your allocated hours on any of our gaming stations
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-cuephoria-lightpurple/20 p-1.5 rounded-full mt-0.5">
                    <CircleCheck className="h-4 w-4 text-cuephoria-lightpurple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Priority station booking
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Members get priority access to all stations during peak hours
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-cuephoria-lightpurple/20 p-1.5 rounded-full mt-0.5">
                    <CircleCheck className="h-4 w-4 text-cuephoria-lightpurple" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {membershipDetails.plan?.toLowerCase().includes('weekly') ? '10%' : '15%'} discount on food and beverages
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Enjoy discounted refreshments while you play
                    </p>
                  </div>
                </div>
                
                {!membershipDetails.plan?.toLowerCase().includes('weekly') && (
                  <div className="flex items-start gap-3">
                    <div className="bg-cuephoria-lightpurple/20 p-1.5 rounded-full mt-0.5">
                      <CircleCheck className="h-4 w-4 text-cuephoria-lightpurple" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        Access to exclusive member tournaments
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Participate in members-only competitions with special prizes
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-yellow-900/20 border border-yellow-600/20 rounded-lg p-4 mt-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">Important note</p>
                    <p className="text-xs text-muted-foreground">
                      Your membership hours expire at the end of each {membershipDetails.plan?.toLowerCase().includes('weekly') ? 'week' : 'month'} and do not roll over. Make the most of your time!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
            <CardHeader>
              <CardTitle>Join Our Membership Program</CardTitle>
              <CardDescription>
                Enjoy exclusive benefits and dedicated gameplay hours
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="bg-cuephoria-lightpurple/10 border border-cuephoria-lightpurple/30 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-cuephoria-lightpurple">Weekly Membership</h3>
                    <div className="bg-cuephoria-lightpurple/20 px-3 py-1 rounded-full text-xs font-medium text-cuephoria-lightpurple">
                      ₹500 / week
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm">10 hours of gameplay per week</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm">10% discount on food and beverages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm">Priority booking during weekdays</span>
                    </li>
                  </ul>
                  
                  <Button variant="secondary" className="w-full">Buy In-Store</Button>
                </div>
                
                <div className="bg-gradient-to-r from-cuephoria-lightpurple/20 to-accent/20 border border-cuephoria-lightpurple/30 rounded-lg p-4">
                  <div className="absolute top-0 right-4 transform -translate-y-1/2 bg-accent px-3 py-1 rounded-full text-xs font-bold text-white">
                    BEST VALUE
                  </div>
                  
                  <div className="flex justify-between items-start mb-2 mt-2">
                    <h3 className="text-lg font-bold text-accent">Monthly Membership</h3>
                    <div className="bg-accent/20 px-3 py-1 rounded-full text-xs font-medium text-accent">
                      ₹1500 / month
                    </div>
                  </div>
                  
                  <ul className="space-y-2 mb-4">
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm">20 hours of gameplay per month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm">15% discount on food and beverages</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm">Priority booking anytime</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-sm">Access to exclusive member tournaments</span>
                    </li>
                  </ul>
                  
                  <Button className="w-full bg-accent hover:bg-accent/90">Buy In-Store</Button>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                <p>Visit our location to purchase a membership package and start enjoying the benefits immediately!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
      
      {/* Footer with credit */}
      <motion.div variants={itemVariants} className="text-center pt-4 border-t border-cuephoria-lightpurple/10 mt-8">
        <p className="text-xs text-muted-foreground/60">Designed and developed by RK</p>
      </motion.div>
    </motion.div>
  );
};

export default Membership;
