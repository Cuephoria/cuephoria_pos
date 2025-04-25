
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star, Calendar, Clock, Shield, ChevronRight, AlertCircle, Info, Check } from 'lucide-react';
import CustomerLayout from '@/components/CustomerLayout';
import CustomerMembershipCard, { MembershipPlan } from '@/components/customer/CustomerMembershipCard';
import { showSuccessToast } from '@/utils/toast-utils';
import { motion } from 'framer-motion';

const CustomerMembership = () => {
  const { user, isLoading } = useCustomerAuth();
  const [membershipProgress, setMembershipProgress] = useState(0);
  const [hoursUsed, setHoursUsed] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Sample membership plans data - in a real app, this would come from your database
  const membershipPlans: MembershipPlan[] = [
    {
      id: 'silver-ps5-weekly',
      name: 'Silver PS5 Weekly',
      price: 699,
      originalPrice: 899,
      duration: 'weekly',
      type: 'ps5',
      tier: 'silver',
      hours: 10,
      benefits: [
        '10 hours of PS5 gameplay',
        'Access to standard game library',
        'Book up to 2 days in advance',
        'Single player sessions only'
      ]
    },
    {
      id: 'silver-8ball-weekly',
      name: 'Silver 8-Ball Weekly',
      price: 599,
      originalPrice: 799,
      duration: 'weekly',
      type: '8ball',
      tier: 'silver',
      hours: 8,
      benefits: [
        '8 hours of pool gameplay',
        'Access during non-peak hours',
        'Book up to 2 days in advance',
        'Shared table usage'
      ]
    },
    {
      id: 'gold-ps5-weekly',
      name: 'Gold PS5 Weekly',
      price: 999,
      originalPrice: 1199,
      duration: 'weekly',
      type: 'ps5',
      tier: 'gold',
      hours: 15,
      benefits: [
        '15 hours of PS5 gameplay',
        'Full game library access',
        'Book up to 4 days in advance',
        'Multiplayer sessions included',
        '10% discount on food & drinks'
      ]
    },
    {
      id: 'gold-8ball-weekly',
      name: 'Gold 8-Ball Weekly',
      price: 899,
      originalPrice: 1099,
      duration: 'weekly',
      type: '8ball',
      tier: 'gold',
      hours: 12,
      benefits: [
        '12 hours of pool gameplay',
        'Access during all hours',
        'Book up to 4 days in advance',
        'Dedicated table usage',
        '10% discount on food & drinks'
      ]
    },
    {
      id: 'gold-combo-weekly',
      name: 'Gold Combo Weekly',
      price: 1499,
      originalPrice: 1899,
      duration: 'weekly',
      type: 'combo',
      tier: 'gold',
      hours: 20,
      benefits: [
        '20 hours (mixed PS5 & pool)',
        'Full access to both facilities',
        'Book up to 4 days in advance',
        '15% discount on food & drinks',
        'Free entry to weekly tournaments'
      ]
    },
    {
      id: 'silver-ps5-monthly',
      name: 'Silver PS5 Monthly',
      price: 2499,
      originalPrice: 2999,
      duration: 'monthly',
      type: 'ps5',
      tier: 'silver',
      hours: 40,
      benefits: [
        '40 hours of PS5 gameplay',
        'Access to standard game library',
        'Book up to 3 days in advance',
        'Single & multiplayer sessions',
        '5% discount on food & drinks'
      ]
    },
    {
      id: 'silver-8ball-monthly',
      name: 'Silver 8-Ball Monthly',
      price: 1999,
      originalPrice: 2499,
      duration: 'monthly',
      type: '8ball',
      tier: 'silver',
      hours: 35,
      benefits: [
        '35 hours of pool gameplay',
        'Access during all hours',
        'Book up to 3 days in advance',
        'Shared table usage',
        '5% discount on food & drinks'
      ]
    },
    {
      id: 'gold-ps5-monthly',
      name: 'Gold PS5 Monthly',
      price: 3499,
      originalPrice: 3999,
      duration: 'monthly',
      type: 'ps5',
      tier: 'gold',
      hours: 60,
      benefits: [
        '60 hours of PS5 gameplay',
        'Full game library access',
        'Book up to 5 days in advance',
        'Priority booking',
        '15% discount on food & drinks',
        'Monthly gaming tournament entry'
      ]
    },
    {
      id: 'gold-8ball-monthly',
      name: 'Gold 8-Ball Monthly',
      price: 2999,
      originalPrice: 3499,
      duration: 'monthly',
      type: '8ball',
      tier: 'gold',
      hours: 50,
      benefits: [
        '50 hours of pool gameplay',
        'Access during all hours',
        'Book up to 5 days in advance',
        'Dedicated table usage',
        '15% discount on food & drinks',
        'Monthly pool tournament entry'
      ]
    },
    {
      id: 'platinum-combo-monthly',
      name: 'Platinum Combo Monthly',
      price: 4999,
      originalPrice: 5999,
      duration: 'monthly',
      type: 'combo',
      tier: 'platinum',
      hours: 100,
      benefits: [
        '100 hours (mixed PS5 & pool)',
        'Premium access to all facilities',
        'Book up to 7 days in advance',
        'Priority booking for both facilities',
        '25% discount on food & drinks',
        'Free entry to all tournaments',
        'Guest pass (bring a friend once per week)'
      ]
    }
  ];

  useEffect(() => {
    if (user?.isMember && user?.membershipStartDate && user?.membershipExpiryDate) {
      const startDate = new Date(user.membershipStartDate);
      const endDate = new Date(user.membershipExpiryDate);
      const today = new Date();
      
      const totalDuration = endDate.getTime() - startDate.getTime();
      const elapsed = today.getTime() - startDate.getTime();
      
      const progress = Math.min(Math.max(Math.round((elapsed / totalDuration) * 100), 0), 100);
      setMembershipProgress(progress);
      
      // Calculate hours used from total hours
      if (user.membershipHoursLeft !== undefined) {
        const plan = findCurrentPlan();
        if (plan) {
          setHoursUsed(plan.hours - (user.membershipHoursLeft || 0));
        }
      }
    }
  }, [user]);

  const findCurrentPlan = (): MembershipPlan | null => {
    if (!user?.membershipPlan) return null;

    // Find plan from user's membership details
    const planParts = user.membershipPlan.toLowerCase().split(' ');
    
    let tier = 'silver';
    if (planParts.includes('platinum')) tier = 'platinum';
    else if (planParts.includes('gold')) tier = 'gold';
    
    let type = '8ball';
    if (planParts.includes('ps5')) type = 'ps5';
    if (planParts.includes('combo')) type = 'combo';
    
    let duration = 'weekly';
    if (planParts.includes('monthly')) duration = 'monthly';
    
    return membershipPlans.find(plan => 
      plan.tier === tier && 
      plan.type === type && 
      plan.duration === duration
    ) || null;
  };

  const handlePlanSelection = (plan: MembershipPlan) => {
    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handlePurchase = () => {
    // In a real app, this would redirect to payment
    showSuccessToast('Membership Purchase', 'Please visit our facility to complete your membership purchase');
    setIsDialogOpen(false);
    navigate('/customer/dashboard');
  };
  
  // Helper function to format date to readable string
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
        </div>
      </CustomerLayout>
    );
  }

  const currentPlan = findCurrentPlan();

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-6">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl font-bold gradient-text mb-2">Membership</h1>
            <p className="text-muted-foreground">Access exclusive benefits with a Cuephoria membership</p>
          </motion.div>

          {user?.isMember ? (
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-r from-cuephoria-darkpurple to-cuephoria-darker border border-cuephoria-lightpurple/30 mb-6">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <Badge className="mb-2 bg-gradient-to-r from-amber-500 to-amber-600">Active Membership</Badge>
                      <CardTitle className="text-xl sm:text-2xl">
                        {user.membershipPlan}
                      </CardTitle>
                      <CardDescription>Valid until {formatDate(user.membershipExpiryDate)}</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                      onClick={() => navigate('/customer/settings')}
                    >
                      Manage Membership
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Membership Progress</span>
                        <span className="text-sm font-medium">{membershipProgress}% used</span>
                      </div>
                      <Progress value={membershipProgress} className="h-2 bg-cuephoria-darker" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started {formatDate(user.membershipStartDate)}</span>
                        <span>Expires {formatDate(user.membershipExpiryDate)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Hours Usage</span>
                        <span className="text-sm font-medium">{user.membershipHoursLeft} hrs remaining</span>
                      </div>
                      <Progress 
                        value={currentPlan ? (hoursUsed / currentPlan.hours) * 100 : 0} 
                        className="h-2 bg-cuephoria-darker" 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Used {hoursUsed} hours</span>
                        <span>Total {currentPlan?.hours || 0} hours</span>
                      </div>
                    </div>
                  </div>
                  
                  {currentPlan && (
                    <div className="bg-cuephoria-darker/70 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <h3 className="font-medium mb-3 text-cuephoria-lightpurple">Your Membership Benefits</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                        {currentPlan.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center">
                            <Star className="h-4 w-4 text-amber-400 mr-2 flex-shrink-0" />
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div variants={itemVariants}>
              <Card className="mb-6 bg-gradient-to-r from-cuephoria-darkpurple to-cuephoria-darker border border-cuephoria-lightpurple/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl flex items-center">
                    <Star className="mr-2 text-amber-400" />
                    No Active Membership
                  </CardTitle>
                  <CardDescription>
                    Choose from our membership plans to enjoy exclusive benefits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-cuephoria-darker/70 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <h3 className="font-medium mb-3">Why become a member?</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 mr-2" />
                        <span className="text-sm">Significant savings on play time</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 mr-2" />
                        <span className="text-sm">Priority booking</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 mr-2" />
                        <span className="text-sm">Discounts on food and drinks</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 mr-2" />
                        <span className="text-sm">Access to tournaments and events</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 mr-2" />
                        <span className="text-sm">Extra loyalty points</span>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-amber-400 mr-2" />
                        <span className="text-sm">Exclusive member-only perks</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
          
          <motion.div variants={itemVariants}>
            <h2 className="text-2xl font-bold mb-4">Available Membership Plans</h2>
            
            <Tabs defaultValue="weekly" className="space-y-4">
              <TabsList className="bg-cuephoria-darker border border-cuephoria-lightpurple/20">
                <TabsTrigger value="weekly" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
                  Weekly Plans
                </TabsTrigger>
                <TabsTrigger value="monthly" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
                  Monthly Plans
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {membershipPlans
                    .filter(plan => plan.duration === 'weekly')
                    .map(plan => (
                      <CustomerMembershipCard
                        key={plan.id}
                        plan={plan}
                        isPurchased={user?.membershipPlan === plan.name}
                        onClick={() => handlePlanSelection(plan)}
                        onDetailsClick={() => handlePlanSelection(plan)}
                      />
                    ))
                  }
                </div>
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {membershipPlans
                    .filter(plan => plan.duration === 'monthly')
                    .map(plan => (
                      <CustomerMembershipCard
                        key={plan.id}
                        plan={plan}
                        isPurchased={user?.membershipPlan === plan.name}
                        onClick={() => handlePlanSelection(plan)}
                        onDetailsClick={() => handlePlanSelection(plan)}
                      />
                    ))
                  }
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
          
          <motion.div variants={itemVariants} className="mt-8 space-y-6">
            <h2 className="text-2xl font-bold mb-4">Membership FAQ</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-cuephoria-darker/70 border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">How does membership work?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    Membership gives you a predetermined number of hours to use within the membership period (weekly or monthly).
                    You can book sessions as normal, and the usage time will be deducted from your membership hours.
                  </p>
                  <p>
                    Once you've used all your hours, you can either purchase additional hours at standard rates
                    or wait until your next membership cycle begins.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-cuephoria-darker/70 border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Can I cancel my membership?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p className="mb-2">
                    Weekly memberships cannot be cancelled once activated, but will automatically expire after the week.
                  </p>
                  <p>
                    Monthly memberships can be cancelled with 7 days notice. However, once cancelled, 
                    any unused hours won't be refunded. Visit our facility or contact our support team to cancel.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-cuephoria-darker/70 border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Do unused hours roll over?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    No, unused hours do not roll over to the next membership period. It's recommended to use all your 
                    allocated hours before your membership expires to get the maximum value.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-cuephoria-darker/70 border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-all">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Can I upgrade my membership?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    Yes, you can upgrade your membership at any time. The cost difference will be prorated based on the 
                    remaining time in your current membership. Visit our facility to process an upgrade.
                  </p>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-cuephoria-darkpurple border border-cuephoria-lightpurple/30">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedPlan?.name}</DialogTitle>
            <DialogDescription>
              Review membership details before purchasing
            </DialogDescription>
          </DialogHeader>
          
          {selectedPlan && (
            <div className="space-y-4">
              <div className="flex justify-between border-b border-cuephoria-lightpurple/10 pb-2">
                <span className="font-medium">Price:</span>
                <div className="flex items-center">
                  <span className="font-bold">₹{selectedPlan.price}</span>
                  {selectedPlan.originalPrice && (
                    <span className="text-muted-foreground line-through ml-2 text-sm">
                      ₹{selectedPlan.originalPrice}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                  <span>{selectedPlan.hours} hours of gameplay</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                  <span>{selectedPlan.duration === 'weekly' ? '7-day' : '30-day'} membership period</span>
                </div>
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                  <span>{selectedPlan.type === 'ps5' ? 'PS5 gaming' : selectedPlan.type === '8ball' ? 'Pool tables' : 'PS5 & Pool tables'}</span>
                </div>
                
                <div className="bg-cuephoria-darker/70 p-3 rounded-md border border-cuephoria-lightpurple/10 mt-4">
                  <h4 className="font-medium mb-2">Benefits</h4>
                  <ul className="space-y-1.5">
                    {selectedPlan.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-2 h-4 w-4 mt-0.5 text-green-500" />
                        <span className="text-sm">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-amber-950/30 p-3 rounded-md border border-amber-500/20 flex items-start">
                <Info className="mr-2 h-4 w-4 mt-0.5 text-amber-400" />
                <p className="text-sm text-amber-200">
                  To complete your membership purchase, please visit our facility with this offer. You can make the payment at our counter.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="flex-1 border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90"
              onClick={handlePurchase}
            >
              Continue to Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </CustomerLayout>
  );
};

export default CustomerMembership;
