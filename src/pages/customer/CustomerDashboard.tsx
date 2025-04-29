
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Clock, Award, CreditCard, Target, Gift, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface CustomerData {
  name: string;
  membershipStatus: boolean;
  membershipExpiryDate?: Date;
  loyaltyPoints: number;
  totalPlayTime: number;
}

const CustomerDashboard: React.FC = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [copyLoading, setCopyLoading] = useState(false);

  useEffect(() => {
    if (!customerUser?.customerId) return;
    
    const fetchCustomerData = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select(`
            name,
            is_member,
            membership_expiry_date,
            loyalty_points,
            total_play_time
          `)
          .eq('id', customerUser.customerId)
          .single();
          
        if (error) {
          console.error('Error fetching customer data:', error);
          return;
        }
        
        setCustomerData({
          name: data.name,
          membershipStatus: data.is_member,
          membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
          loyaltyPoints: data.loyalty_points || 0,
          totalPlayTime: data.total_play_time || 0
        });
      } catch (err) {
        console.error('Error in fetchCustomerData:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerData();
  }, [customerUser?.customerId]);
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}${mins > 0 ? ` ${mins} min` : ''}`;
    }
    
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
  };

  const handleCopyReferralCode = async () => {
    if (!customerUser?.referralCode) return;
    
    try {
      setCopyLoading(true);
      await navigator.clipboard.writeText(customerUser.referralCode);
      setIsCopied(true);
      toast({
        title: "Referral Code Copied!",
        description: "Your referral code has been copied to clipboard",
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      toast({
        title: "Could not copy code",
        description: "Please try again or copy manually",
        variant: "destructive"
      });
    } finally {
      setCopyLoading(false);
    }
  };
  
  const handleBookNow = () => {
    window.open("https://cuephoria.in", "_blank");
  };
  
  const handleGetMembership = () => {
    window.open("https://cuephoria.in/membership", "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
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
          Welcome back, {customerData?.name.split(' ')[0] || 'Member'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Your personal Cuephoria dashboard
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/5 overflow-hidden relative h-full hover:shadow-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cuephoria-lightpurple/10 to-transparent rounded-bl-[50%] opacity-60"></div>
            <CardContent className="p-4 flex flex-col h-full">
              <div className="bg-cuephoria-lightpurple/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <Award className="h-5 w-5 text-cuephoria-lightpurple" />
              </div>
              <div className="mt-auto">
                <p className="text-sm text-muted-foreground">Loyalty Points</p>
                <p className="text-2xl font-bold">{customerData?.loyaltyPoints}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-blue/30 shadow-lg shadow-cuephoria-blue/5 overflow-hidden relative h-full hover:shadow-cuephoria-blue/20 hover:border-cuephoria-blue/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cuephoria-blue/10 to-transparent rounded-bl-[50%] opacity-60"></div>
            <CardContent className="p-4 flex flex-col h-full">
              <div className="bg-cuephoria-blue/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <Clock className="h-5 w-5 text-cuephoria-blue" />
              </div>
              <div className="mt-auto">
                <p className="text-sm text-muted-foreground">Total Play Time</p>
                <p className="text-2xl font-bold">{formatTime(customerData?.totalPlayTime || 0)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-orange/30 shadow-lg shadow-cuephoria-orange/5 overflow-hidden relative h-full hover:shadow-cuephoria-orange/20 hover:border-cuephoria-orange/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cuephoria-orange/10 to-transparent rounded-bl-[50%] opacity-60"></div>
            <CardContent className="p-4 flex flex-col h-full">
              <div className="bg-cuephoria-orange/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <CreditCard className="h-5 w-5 text-cuephoria-orange" />
              </div>
              <div className="mt-auto">
                <p className="text-sm text-muted-foreground">Membership</p>
                <p className="text-lg font-bold">
                  {customerData?.membershipStatus ? 'Active' : 'Inactive'}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-green/30 shadow-lg shadow-cuephoria-green/5 overflow-hidden relative h-full hover:shadow-cuephoria-green/20 hover:border-cuephoria-green/50 transition-all duration-300">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-cuephoria-green/10 to-transparent rounded-bl-[50%] opacity-60"></div>
            <CardContent className="p-4 flex flex-col h-full">
              <div className="bg-cuephoria-green/10 p-2 rounded-full w-10 h-10 flex items-center justify-center mb-4">
                <Target className="h-5 w-5 text-cuephoria-green" />
              </div>
              <div className="mt-auto">
                <p className="text-sm text-muted-foreground">Goal Progress</p>
                <p className="text-lg font-bold">Coming Soon</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Membership Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cuephoria-lightpurple/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cuephoria-lightpurple" />
                <CardTitle className="text-lg">Membership Status</CardTitle>
              </div>
              <CardDescription>Manage your membership plan</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-40">
              {customerData?.membershipStatus ? (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 flex items-center justify-center">
                      <Award className="h-10 w-10 text-cuephoria-lightpurple" />
                    </div>
                  </div>
                  <p className="text-center text-cuephoria-lightpurple font-medium">Active Membership</p>
                  {customerData.membershipExpiryDate && (
                    <p className="text-center text-sm text-muted-foreground mt-1">
                      Expires on {new Date(customerData.membershipExpiryDate).toLocaleDateString('en-IN', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-center text-muted-foreground mb-4">No active membership plan</p>
                  <Button 
                    className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 transition-all duration-300"
                    onClick={handleGetMembership}
                  >
                    Get Membership
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Rewards Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-orange/30 shadow-lg shadow-cuephoria-orange/10 overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cuephoria-orange/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-cuephoria-orange" />
                <CardTitle className="text-lg">Rewards & Promotions</CardTitle>
              </div>
              <CardDescription>Exclusive offers and benefits</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-40">
              <div className="bg-gradient-to-r from-cuephoria-orange/20 to-cuephoria-orange/5 p-4 rounded-lg mb-4 flex-1 flex flex-col justify-center">
                <p className="text-center font-medium mb-2">Use your loyalty points to earn rewards!</p>
                <p className="text-center text-sm text-muted-foreground">Redeem exclusive Cuephoria merchandise, free play sessions, and more.</p>
              </div>
              <Link to="/customer/rewards">
                <Button className="w-full bg-gradient-to-r from-cuephoria-orange to-cuephoria-lightpurple hover:shadow-lg hover:shadow-cuephoria-orange/20 transition-all duration-300">
                  View Rewards
                </Button>
              </Link>
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
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-blue/30 shadow-lg shadow-cuephoria-blue/10 overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-cuephoria-blue/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cuephoria-blue" />
                <CardTitle className="text-lg">Refer & Earn</CardTitle>
              </div>
              <CardDescription>Invite friends and earn points</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col h-40">
              <div className="bg-gradient-to-r from-cuephoria-blue/20 to-cuephoria-blue/5 p-4 rounded-lg mb-4 flex-1 flex flex-col justify-center">
                <p className="text-center font-medium mb-2">Share your referral code</p>
                <p className="text-center text-lg font-mono font-bold text-cuephoria-blue">{customerUser?.referralCode}</p>
              </div>
              <Button 
                className={`w-full ${isCopied 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gradient-to-r from-cuephoria-blue to-cuephoria-lightpurple hover:shadow-lg hover:shadow-cuephoria-blue/20'
                } transition-all duration-300`}
                onClick={handleCopyReferralCode}
                disabled={copyLoading}
              >
                {copyLoading ? 'Copying...' : isCopied ? 'Copied!' : 'Copy Referral Code'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Book Now Banner */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="mt-8"
      >
        <Card className="border-cuephoria-orange/30 bg-gradient-to-r from-cuephoria-darker to-cuephoria-dark/90 overflow-hidden shadow-lg shadow-orange-500/5">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                  <Calendar className="text-cuephoria-orange h-6 w-6" />
                  <span>Get 10% Off When You Book Online</span>
                </h3>
                <p className="text-muted-foreground">
                  Reserve your gaming session in advance through our website and enjoy a 10% discount on your bill.
                </p>
              </div>
              <Button 
                className="shrink-0 bg-gradient-to-r from-cuephoria-orange to-cuephoria-orange/80 hover:from-cuephoria-orange/90 hover:to-cuephoria-orange/70 text-white px-8 py-6 h-auto text-lg shadow-lg shadow-cuephoria-orange/20"
                onClick={handleBookNow}
              >
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerDashboard;
