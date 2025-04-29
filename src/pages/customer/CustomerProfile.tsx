
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Award, Edit, Check, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  createdAt: Date;
  loyaltyPoints: number;
  isEditing?: boolean;
}

const CustomerProfile: React.FC = () => {
  const { customerUser, isLoading: authLoading } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails | null>(null);
  const [editedDetails, setEditedDetails] = useState<{name: string, phone: string}>({ name: '', phone: '' });
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      if (!customerUser?.customerId) return;
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('id, name, email, phone, created_at, loyalty_points')
          .eq('id', customerUser.customerId)
          .single();
          
        if (error) {
          console.error('Error fetching customer details:', error);
          return;
        }
        
        const customerData: CustomerDetails = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          createdAt: new Date(data.created_at),
          loyaltyPoints: data.loyalty_points || 0
        };
        
        setCustomerDetails(customerData);
        setEditedDetails({
          name: data.name,
          phone: data.phone
        });
      } catch (err) {
        console.error('Error in fetchCustomerDetails:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomerDetails();
  }, [customerUser]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (customerDetails) {
      setEditedDetails({
        name: customerDetails.name,
        phone: customerDetails.phone
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!customerDetails) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('customers')
        .update({
          name: editedDetails.name,
          phone: editedDetails.phone
        })
        .eq('id', customerDetails.id);
        
      if (error) {
        throw new Error(error.message);
      }
      
      setCustomerDetails({
        ...customerDetails,
        name: editedDetails.name,
        phone: editedDetails.phone
      });
      
      setIsEditing(false);
      
      toast({
        title: "Profile updated",
        description: "Your profile details have been updated successfully.",
      });
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Update failed",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="mb-6" variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          View and manage your profile information
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="md:col-span-2" variants={itemVariants}>
          <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>Your account details</CardDescription>
              </div>
              {!isEditing && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10 hover:text-white"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                // Edit mode
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-700 bg-gray-800 text-gray-400">
                        <User className="h-4 w-4" />
                      </span>
                      <Input
                        id="name"
                        value={editedDetails.name}
                        onChange={(e) => setEditedDetails({...editedDetails, name: e.target.value})}
                        className="rounded-l-none focus:ring-cuephoria-lightpurple focus:border-cuephoria-lightpurple"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-700 bg-gray-800 text-gray-400">
                        <Mail className="h-4 w-4" />
                      </span>
                      <Input
                        id="email"
                        value={customerDetails?.email || ''}
                        disabled
                        className="rounded-l-none bg-gray-800/50 text-gray-400"
                      />
                    </div>
                    <p className="text-xs text-gray-500">Email cannot be changed</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-700 bg-gray-800 text-gray-400">
                        <Phone className="h-4 w-4" />
                      </span>
                      <Input
                        id="phone"
                        value={editedDetails.phone}
                        onChange={(e) => setEditedDetails({...editedDetails, phone: e.target.value})}
                        className="rounded-l-none focus:ring-cuephoria-lightpurple focus:border-cuephoria-lightpurple"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <Button 
                      onClick={handleSave}
                      className="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90 text-white"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <><LoadingSpinner size="sm" /> Saving...</>
                      ) : (
                        <><Check className="h-4 w-4 mr-1" /> Save Changes</>
                      )}
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleCancel}
                      disabled={isSaving}
                    >
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                  </div>
                </>
              ) : (
                // View mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Full Name</p>
                      <p className="flex items-center gap-2 text-white font-medium">
                        <User className="h-4 w-4 text-cuephoria-lightpurple" />
                        {customerDetails?.name || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Email Address</p>
                      <p className="flex items-center gap-2 text-white font-medium">
                        <Mail className="h-4 w-4 text-cuephoria-blue" />
                        {customerDetails?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Phone Number</p>
                      <p className="flex items-center gap-2 text-white font-medium">
                        <Phone className="h-4 w-4 text-cuephoria-orange" />
                        {customerDetails?.phone || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">Member Since</p>
                      <p className="flex items-center gap-2 text-white font-medium">
                        <Calendar className="h-4 w-4 text-cuephoria-green" />
                        {customerDetails?.createdAt ? formatDate(customerDetails.createdAt) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-orange/20 shadow-inner shadow-cuephoria-orange/5 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-cuephoria-orange" />
                Loyalty Status
              </CardTitle>
              <CardDescription>Your points and rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center p-4">
                <div className="inline-block rounded-full bg-gradient-to-br from-cuephoria-orange/20 to-cuephoria-lightpurple/20 p-6 mb-4">
                  <div className="bg-gradient-to-r from-cuephoria-orange to-cuephoria-lightpurple rounded-full p-4">
                    <Award className="h-10 w-10 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cuephoria-orange to-cuephoria-lightpurple bg-clip-text text-transparent">
                  {customerDetails?.loyaltyPoints || 0} Points
                </h3>
                
                <p className="text-gray-400 text-sm mt-1">
                  {customerDetails?.loyaltyPoints && customerDetails.loyaltyPoints >= 500
                    ? 'Gold Member'
                    : customerDetails?.loyaltyPoints && customerDetails.loyaltyPoints >= 200
                    ? 'Silver Member'
                    : 'Bronze Member'
                  }
                </p>
                
                <div className="mt-6 flex flex-col gap-3">
                  <Button 
                    variant="outline"
                    className="border-cuephoria-orange/30 hover:border-cuephoria-orange/50 text-cuephoria-orange hover:bg-cuephoria-orange/10"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    View Rewards History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Rewards History Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-cuephoria-orange" /> Points History
            </DialogTitle>
            <DialogDescription>
              Track how you earned and spent your loyalty points
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/50 border border-cuephoria-lightpurple/30 rounded-lg p-4 text-center">
              <p className="text-gray-400 text-sm">Total Points</p>
              <p className="text-2xl font-bold text-white">{customerDetails?.loyaltyPoints || 0}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-400">Recent Activity</p>
              <div className="space-y-2">
                <div className="p-3 border border-gray-800 rounded-md flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">Gaming Session</p>
                    <p className="text-xs text-gray-500">Apr 15, 2025</p>
                  </div>
                  <p className="text-green-400">+50 points</p>
                </div>
                <div className="p-3 border border-gray-800 rounded-md flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">Food & Beverage Purchase</p>
                    <p className="text-xs text-gray-500">Apr 10, 2025</p>
                  </div>
                  <p className="text-green-400">+25 points</p>
                </div>
                <div className="p-3 border border-gray-800 rounded-md flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">Reward Redemption</p>
                    <p className="text-xs text-gray-500">Apr 05, 2025</p>
                  </div>
                  <p className="text-red-400">-100 points</p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90"
              onClick={() => setIsDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CustomerProfile;
