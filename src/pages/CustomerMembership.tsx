
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Clock, Calendar, Check, ArrowRight, Shield } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { showSuccessToast } from '@/utils/toast-utils';
import CustomerLayout from '@/components/CustomerLayout';

const MEMBERSHIP_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 999,
    duration: '1 Month',
    benefits: [
      'Unlimited access during off-peak hours',
      'Discounted rates for peak hours',
      'Access to basic facilities',
      '10% off on food and beverages',
      'Join weekly tournaments (entry fee applies)',
    ],
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/20',
    buttonColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    popular: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 1999,
    duration: '1 Month',
    benefits: [
      'Unlimited access anytime',
      'Priority table booking',
      'Access to all facilities',
      '20% off on food and beverages',
      'Free entry to weekly tournaments',
      'One free coaching session per month',
      '2x loyalty points on all purchases',
    ],
    color: 'from-purple-500/20 to-pink-500/20 border-purple-500/20',
    buttonColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    popular: true,
  },
  {
    id: 'family',
    name: 'Family',
    price: 2999,
    duration: '1 Month',
    benefits: [
      'Access for up to 4 family members',
      'Unlimited access anytime',
      'Priority table booking',
      'Access to all facilities',
      '25% off on food and beverages',
      'Free entry to weekly tournaments for all members',
      'One free coaching session per member per month',
    ],
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/20',
    buttonColor: 'bg-gradient-to-r from-green-500 to-emerald-500',
    popular: false,
  }
];

const CustomerMembership = () => {
  const { user, isLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(user?.isMember ? "current" : "plans");
  
  // Calculate membership status percentage
  const calculateMembershipProgress = () => {
    if (!user?.membershipExpiryDate || !user?.isMember) return 0;
    
    const startDate = user.membershipStartDate ? new Date(user.membershipStartDate) : new Date();
    const endDate = new Date(user.membershipExpiryDate);
    const today = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    
    // Calculate the remaining percentage
    const remainingPercentage = 100 - Math.min(Math.max(Math.round((elapsedDuration / totalDuration) * 100), 0), 100);
    
    return remainingPercentage;
  };
  
  // Format date to readable string
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  const handleUpgradeClick = (planId: string) => {
    showSuccessToast("Redirecting", "Taking you to the checkout page");
    // In a real implementation, this would redirect to a payment page
    window.location.href = 'https://cuephoria.in/membership';
  };
  
  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-cuephoria-lightpurple to-accent bg-clip-text text-transparent">
              Membership
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your membership and access exclusive benefits
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
              onClick={() => navigate('/customer/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue={user?.isMember ? "current" : "plans"} 
          className="space-y-6"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 p-1">
            {user?.isMember && (
              <TabsTrigger 
                value="current" 
                className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
              >
                Current Plan
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="plans" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Membership Plans
            </TabsTrigger>
            <TabsTrigger 
              value="benefits" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Benefits
            </TabsTrigger>
          </TabsList>
          
          {user?.isMember && (
            <TabsContent value="current" className="space-y-6">
              <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Star size={18} className="text-cuephoria-lightpurple" />
                        Your Membership
                      </CardTitle>
                      <CardDescription>
                        Details about your current membership plan
                      </CardDescription>
                    </div>
                    <Badge className="bg-green-600">Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-blue/20 p-6 rounded-lg border border-cuephoria-lightpurple/20">
                    <h3 className="font-medium text-xl text-cuephoria-lightpurple">{user.membershipPlan || 'Premium Membership'}</h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium text-green-400">Active</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Started:</span>
                        <span className="font-medium">{formatDate(user.membershipStartDate)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expires:</span>
                        <span className="font-medium">{formatDate(user.membershipExpiryDate)}</span>
                      </div>
                      {user.membershipHoursLeft !== undefined && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Hours Left:</span>
                          <span className="font-medium">{user.membershipHoursLeft} hours</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Auto-renew:</span>
                        <span className="font-medium text-amber-400">On</span>
                      </div>
                    </div>
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Membership Progress</span>
                        <span>{calculateMembershipProgress()}% remaining</span>
                      </div>
                      <Progress value={calculateMembershipProgress()} className="h-2 bg-cuephoria-darker" />
                      <p className="text-xs text-muted-foreground text-right mt-1">
                        {Math.ceil((new Date(user.membershipExpiryDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days remaining
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <h4 className="font-medium flex items-center gap-2">
                      <Shield size={16} className="text-cuephoria-lightpurple" />
                      Your Membership Benefits
                    </h4>
                    <ul className="mt-3 space-y-2">
                      <li className="flex items-center text-sm">
                        <Check size={14} className="text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">Unlimited access during all hours</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check size={14} className="text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">Priority table reservations</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check size={14} className="text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">20% discount on food and beverages</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check size={14} className="text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">Free entry to weekly tournaments</span>
                      </li>
                      <li className="flex items-center text-sm">
                        <Check size={14} className="text-green-400 mr-2 flex-shrink-0" />
                        <span className="text-muted-foreground">2x loyalty points on all purchases</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4 border-t border-cuephoria-lightpurple/10 p-6">
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                  >
                    Manage Auto-renew
                  </Button>
                  <Button 
                    className="w-full sm:w-auto bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                    onClick={() => navigate('/customer/dashboard')}
                  >
                    View Membership History
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Calendar size={18} className="text-cuephoria-lightpurple" />
                    Recent Sessions
                  </CardTitle>
                  <CardDescription>
                    Your recent gameplay sessions using your membership
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">Pool Table Session</h3>
                          <p className="text-sm text-muted-foreground">2 hours of gameplay</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">Member Discount</Badge>
                          <p className="text-xs text-muted-foreground">May 15, 2025</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">Weekend Tournament</h3>
                          <p className="text-sm text-muted-foreground">Free entry with membership</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-green-500 text-green-500 mb-1">Free Entry</Badge>
                          <p className="text-xs text-muted-foreground">May 12, 2025</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-medium">Coaching Session</h3>
                          <p className="text-sm text-muted-foreground">1-hour professional coaching</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-amber-500 text-amber-500 mb-1">Monthly Benefit</Badge>
                          <p className="text-xs text-muted-foreground">May 5, 2025</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t border-cuephoria-lightpurple/10 p-4">
                  <Button 
                    variant="outline" 
                    className="ml-auto border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                  >
                    View All Sessions
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          )}
          
          <TabsContent value="plans" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Star size={18} className="text-cuephoria-lightpurple" />
                  Membership Plans
                </CardTitle>
                <CardDescription>
                  Choose a membership plan that suits your needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {MEMBERSHIP_PLANS.map((plan) => (
                    <div 
                      key={plan.id} 
                      className={`bg-gradient-to-r ${plan.color} rounded-lg overflow-hidden relative ${plan.popular ? 'md:transform md:-translate-y-2 md:scale-105' : ''}`}
                    >
                      {plan.popular && (
                        <div className="absolute top-0 right-0">
                          <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 transform rotate-0 origin-top-right">
                            MOST POPULAR
                          </div>
                        </div>
                      )}
                      
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                        <div className="mt-2 flex items-baseline">
                          <span className="text-2xl font-bold text-white">₹{plan.price}</span>
                          <span className="text-white/70 ml-2">/ {plan.duration}</span>
                        </div>
                        
                        <ul className="mt-6 space-y-3">
                          {plan.benefits.map((benefit, idx) => (
                            <li key={idx} className="flex items-start">
                              <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                              <span className="text-sm text-white/80">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <Button 
                          className={`mt-6 w-full ${plan.buttonColor}`}
                          onClick={() => handleUpgradeClick(plan.id)}
                        >
                          {user?.isMember ? 'Upgrade' : 'Select Plan'}
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock size={18} className="text-cuephoria-lightpurple" />
                  Hourly Plans
                </CardTitle>
                <CardDescription>
                  Flexible options for occasional players
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/20 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white">10 Hours</h3>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-bold text-white">₹800</span>
                        <span className="text-white/70 ml-2">/ package</span>
                      </div>
                      
                      <ul className="mt-6 space-y-3">
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Valid for 30 days</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Use anytime during operating hours</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Earn loyalty points</span>
                        </li>
                      </ul>
                      
                      <Button 
                        className="mt-6 w-full bg-gradient-to-r from-amber-500 to-yellow-500"
                        onClick={() => handleUpgradeClick('hourly-10')}
                      >
                        Select Package
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/20 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white">20 Hours</h3>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-bold text-white">₹1500</span>
                        <span className="text-white/70 ml-2">/ package</span>
                      </div>
                      
                      <ul className="mt-6 space-y-3">
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Valid for 60 days</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Use anytime during operating hours</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">10% off on food and beverages</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Earn loyalty points</span>
                        </li>
                      </ul>
                      
                      <Button 
                        className="mt-6 w-full bg-gradient-to-r from-orange-500 to-red-500"
                        onClick={() => handleUpgradeClick('hourly-20')}
                      >
                        Select Package
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-500/20 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-white">50 Hours</h3>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-2xl font-bold text-white">₹3000</span>
                        <span className="text-white/70 ml-2">/ package</span>
                      </div>
                      
                      <ul className="mt-6 space-y-3">
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Valid for 90 days</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">Use anytime during operating hours</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">15% off on food and beverages</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">50% off on tournament entry</span>
                        </li>
                        <li className="flex items-start">
                          <Check size={16} className="text-white/90 mr-2 mt-0.5" />
                          <span className="text-sm text-white/80">1.5x loyalty points</span>
                        </li>
                      </ul>
                      
                      <Button 
                        className="mt-6 w-full bg-gradient-to-r from-green-500 to-teal-500"
                        onClick={() => handleUpgradeClick('hourly-50')}
                      >
                        Select Package
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-cuephoria-lightpurple/10 p-6">
                <p className="text-sm text-muted-foreground max-w-md text-center">
                  All membership and hourly plans can be purchased at our location or online. For custom plans or group bookings, please contact us directly.
                </p>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="benefits" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Star size={18} className="text-cuephoria-lightpurple" />
                  Membership Benefits
                </CardTitle>
                <CardDescription>
                  Exclusive perks and features available to members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Clock size={18} className="text-cuephoria-lightpurple" />
                      Extended Hours
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Members get access to exclusive early morning and late night hours, letting you play when it suits your schedule best.
                    </p>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Calendar size={18} className="text-cuephoria-lightpurple" />
                      Priority Booking
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Reserve your favorite table up to 7 days in advance, ensuring you never miss out during busy periods.
                    </p>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Star size={18} className="text-cuephoria-lightpurple" />
                      Loyalty Points Boost
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Members earn double loyalty points on all purchases, helping you unlock rewards faster than regular customers.
                    </p>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <h3 className="font-medium flex items-center gap-2 mb-3">
                      <Shield size={18} className="text-cuephoria-lightpurple" />
                      Tournament Benefits
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Free or discounted entry to all our tournaments, plus exclusive member-only competitions with special prizes.
                    </p>
                  </div>
                </div>
                
                <Separator className="my-6 bg-cuephoria-lightpurple/20" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Benefit Comparison</h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-cuephoria-lightpurple/10">
                          <th className="text-left py-3">Benefit</th>
                          <th className="text-center py-3">Non-Member</th>
                          <th className="text-center py-3">Basic</th>
                          <th className="text-center py-3">Premium</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-cuephoria-lightpurple/10">
                          <td className="py-3">Access Hours</td>
                          <td className="text-center">Regular Hours</td>
                          <td className="text-center">Off-Peak Hours</td>
                          <td className="text-center text-green-400">24/7 Access</td>
                        </tr>
                        <tr className="border-b border-cuephoria-lightpurple/10">
                          <td className="py-3">Loyalty Points</td>
                          <td className="text-center">1x</td>
                          <td className="text-center">1.5x</td>
                          <td className="text-center text-green-400">2x</td>
                        </tr>
                        <tr className="border-b border-cuephoria-lightpurple/10">
                          <td className="py-3">Food & Beverage Discount</td>
                          <td className="text-center">None</td>
                          <td className="text-center">10%</td>
                          <td className="text-center text-green-400">20%</td>
                        </tr>
                        <tr className="border-b border-cuephoria-lightpurple/10">
                          <td className="py-3">Advance Booking</td>
                          <td className="text-center">1 day</td>
                          <td className="text-center">3 days</td>
                          <td className="text-center text-green-400">7 days</td>
                        </tr>
                        <tr className="border-b border-cuephoria-lightpurple/10">
                          <td className="py-3">Tournament Entry</td>
                          <td className="text-center">Regular Price</td>
                          <td className="text-center">Discounted</td>
                          <td className="text-center text-green-400">Free</td>
                        </tr>
                        <tr>
                          <td className="py-3">Coaching Sessions</td>
                          <td className="text-center">Regular Price</td>
                          <td className="text-center">Discounted</td>
                          <td className="text-center text-green-400">1 Free/Month</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-cuephoria-lightpurple/10 p-6">
                <Button 
                  className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                  onClick={() => setActiveTab('plans')}
                >
                  View Membership Plans
                </Button>
              </CardFooter>
            </Card>
            
            <div className="bg-gradient-to-r from-amber-600/20 to-yellow-500/20 rounded-lg border border-amber-500/20 p-6">
              <h3 className="text-xl font-bold text-white">Limited Time Offer</h3>
              <p className="mt-2 text-white/80">
                Sign up for any membership before June 30 and get an extra month free! Plus, get 500 loyalty points as a welcome bonus.
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-amber-500 to-yellow-500 hover:opacity-90"
                onClick={() => handleUpgradeClick('premium')}
              >
                Claim Offer
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
          <p className="mt-1 text-xs">Designed and developed by RK</p>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerMembership;
