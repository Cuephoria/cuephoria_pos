
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, Clock, Calendar, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  createdAt: Date;
  totalSpent: number;
  totalPlayTime: number;
}

const CustomerProfile: React.FC = () => {
  const { customerUser, isLoading } = useCustomerAuth();
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  useEffect(() => {
    if (!customerUser?.customerId) return;
    
    const fetchCustomerDetails = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerUser.customerId)
          .single();
          
        if (error) {
          console.error('Error fetching customer details:', error);
          return;
        }
        
        setCustomerDetails({
          name: data.name,
          phone: data.phone,
          email: data.email || '',
          createdAt: new Date(data.created_at),
          totalSpent: data.total_spent || 0,
          totalPlayTime: data.total_play_time || 0
        });
      } catch (err) {
        console.error('Error in fetchCustomerDetails:', err);
      } finally {
        setIsLoadingDetails(false);
      }
    };
    
    fetchCustomerDetails();
  }, [customerUser?.customerId]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'}${mins > 0 ? ` ${mins} min` : ''}`;
    }
    
    return `${mins} ${mins === 1 ? 'minute' : 'minutes'}`;
  };
  
  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || isLoadingDetails) {
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
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage your personal information
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Personal Information Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2"
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cuephoria-lightpurple/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-cuephoria-lightpurple" />
                <CardTitle>Personal Information</CardTitle>
              </div>
              <CardDescription>Your account details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {customerDetails && (
                <>
                  <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                    <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 rounded-full flex items-center justify-center">
                      <User className="h-10 w-10 text-cuephoria-lightpurple" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{customerDetails.name}</h3>
                      <p className="text-sm text-muted-foreground">Member since {formatDate(customerDetails.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Email Address</label>
                        <div className="flex items-center gap-2 bg-cuephoria-darker/60 p-2 rounded-md border border-cuephoria-lightpurple/20">
                          <Mail className="h-4 w-4 text-cuephoria-lightpurple" />
                          <p className="font-medium">{customerDetails.email || customerUser?.email}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Phone Number</label>
                        <div className="flex items-center gap-2 bg-cuephoria-darker/60 p-2 rounded-md border border-cuephoria-lightpurple/20">
                          <Phone className="h-4 w-4 text-cuephoria-lightpurple" />
                          <p className="font-medium">{customerDetails.phone}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Member Since</label>
                        <div className="flex items-center gap-2 bg-cuephoria-darker/60 p-2 rounded-md border border-cuephoria-lightpurple/20">
                          <Calendar className="h-4 w-4 text-cuephoria-lightpurple" />
                          <p className="font-medium">{formatDate(customerDetails.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Referral Code</label>
                        <div className="flex items-center gap-2 bg-cuephoria-darker/60 p-2 rounded-md border border-cuephoria-lightpurple/20">
                          <Award className="h-4 w-4 text-cuephoria-lightpurple" />
                          <p className="font-medium font-mono">{customerUser?.referralCode || 'Not available'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative h-full">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cuephoria-blue/10 via-transparent to-transparent opacity-60"></div>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-cuephoria-blue" />
                <CardTitle>Activity Stats</CardTitle>
              </div>
              <CardDescription>Your gaming activity and spending</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {customerDetails && (
                <>
                  <div className="bg-gradient-to-br from-cuephoria-blue/10 to-cuephoria-darker/60 p-4 rounded-lg border border-cuephoria-blue/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-cuephoria-blue" />
                      <h3 className="font-medium text-cuephoria-blue">Total Play Time</h3>
                    </div>
                    <p className="text-2xl font-bold">{formatTime(customerDetails.totalPlayTime)}</p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-cuephoria-lightpurple/10 to-cuephoria-darker/60 p-4 rounded-lg border border-cuephoria-lightpurple/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Award className="h-4 w-4 text-cuephoria-lightpurple" />
                      <h3 className="font-medium text-cuephoria-lightpurple">Total Spent</h3>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(customerDetails.totalSpent)}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Recent Activities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-6"
      >
        <Card className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 border-cuephoria-lightpurple/30 shadow-lg shadow-cuephoria-lightpurple/10 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-accent/5 via-transparent to-transparent opacity-60"></div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" />
              <CardTitle>Recent Activities</CardTitle>
            </div>
            <CardDescription>View your recent game sessions and transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center p-4">
              <p className="text-muted-foreground">Your activity history will appear here once you start playing games or making transactions.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CustomerProfile;
