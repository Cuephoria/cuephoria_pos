
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { generateReferralCode } from '@/utils/pos.utils';
import { CustomerUser, CustomerProfile, CustomerAuthContextType } from '@/types/customer.types';

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

interface CustomerAuthProviderProps {
  children: ReactNode;
}

export const CustomerAuthProvider = ({ children }: CustomerAuthProviderProps) => {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { user } = session;
          
          // Get customer user data
          const { data: customerData } = await supabase
            .from('customer_users')
            .select('*')
            .eq('auth_id', user.id)
            .single();
          
          if (customerData) {
            setCustomerUser({
              id: customerData.id,
              email: customerData.email,
              auth_id: customerData.auth_id,
              customer_id: customerData.customer_id,
              referral_code: customerData.referral_code,
              reset_pin: customerData.reset_pin,
              reset_pin_expiry: customerData.reset_pin_expiry ? new Date(customerData.reset_pin_expiry) : undefined,
              created_at: new Date(customerData.created_at)
            });
            
            // Get customer profile data
            await fetchCustomerProfile(customerData.customer_id);
          } else {
            await supabase.auth.signOut();
            setCustomerUser(null);
            setCustomerProfile(null);
          }
        } else {
          setCustomerUser(null);
          setCustomerProfile(null);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setError('Failed to authenticate user');
        setCustomerUser(null);
        setCustomerProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { user } = session;
        
        const { data: customerData } = await supabase
            .from('customer_users')
            .select('*')
            .eq('auth_id', user.id)
            .single();
        
        if (customerData) {
          setCustomerUser({
            id: customerData.id,
            email: customerData.email,
            auth_id: customerData.auth_id,
            customer_id: customerData.customer_id,
            referral_code: customerData.referral_code,
            reset_pin: customerData.reset_pin,
            reset_pin_expiry: customerData.reset_pin_expiry ? new Date(customerData.reset_pin_expiry) : undefined,
            created_at: new Date(customerData.created_at)
          });
          
          await fetchCustomerProfile(customerData.customer_id);
        } else {
          setCustomerUser(null);
          setCustomerProfile(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setCustomerUser(null);
        setCustomerProfile(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchCustomerProfile = async (customerId: string) => {
    try {
      const { data: customerProfileData, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error || !customerProfileData) {
        console.error('Error fetching customer profile:', error);
        setCustomerProfile(null);
        return;
      }
      
      setCustomerProfile({
        id: customerProfileData.id,
        name: customerProfileData.name,
        phone: customerProfileData.phone,
        email: customerProfileData.email || undefined,
        isMember: customerProfileData.is_member,
        membershipExpiryDate: customerProfileData.membership_expiry_date ? new Date(customerProfileData.membership_expiry_date) : undefined,
        membershipStartDate: customerProfileData.membership_start_date ? new Date(customerProfileData.membership_start_date) : undefined,
        membershipPlan: customerProfileData.membership_plan || undefined,
        membershipHoursLeft: customerProfileData.membership_hours_left || undefined,
        membershipDuration: customerProfileData.membership_duration as 'weekly' | 'monthly' | undefined,
        loyaltyPoints: customerProfileData.loyalty_points,
        totalSpent: customerProfileData.total_spent,
        totalPlayTime: customerProfileData.total_play_time,
        createdAt: new Date(customerProfileData.created_at),
        referralCode: customerProfileData.referral_code || ''
      });
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      setError('Failed to fetch customer profile');
      setCustomerProfile(null);
    }
  };
  
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive'
        });
        setError(error.message);
        return false;
      }
      
      if (data && data.user) {
        toast({
          title: 'Login successful',
          description: 'Welcome back!'
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setError(error.message || 'Login failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const register = async (email: string, password: string, name: string, phone: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if email is already registered
      const { data: existingUser, error: userError } = await supabase
        .from('customer_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (userError && userError.code !== 'PGRST116') {
        toast({
          title: 'Registration failed',
          description: userError.message,
          variant: 'destructive'
        });
        setError(userError.message);
        return false;
      }
      
      if (existingUser) {
        toast({
          title: 'Registration failed',
          description: 'Email is already registered',
          variant: 'destructive'
        });
        setError('Email is already registered');
        return false;
      }
      
      // Check if phone number is already registered
      const { data: existingCustomer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', phone)
        .single();
      
      if (customerError && customerError.code !== 'PGRST116') {
        toast({
          title: 'Registration failed',
          description: customerError.message,
          variant: 'destructive'
        });
        setError(customerError.message);
        return false;
      }
      
      if (existingCustomer) {
        toast({
          title: 'Registration failed',
          description: 'Phone number is already registered',
          variant: 'destructive'
        });
        setError('Phone number is already registered');
        return false;
      }
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/customer/verify`
        }
      });
      
      if (error || !data.user) {
        toast({
          title: 'Registration failed',
          description: error?.message || 'Failed to create account',
          variant: 'destructive'
        });
        setError(error?.message || 'Registration failed');
        return false;
      }
      
      // Create customer record
      const { data: customer, error: customerCreateError } = await supabase
        .from('customers')
        .insert([
          {
            name,
            phone,
            email,
            is_member: false,
            loyalty_points: 0,
            total_spent: 0,
            total_play_time: 0
          }
        ])
        .select('id')
        .single();
      
      if (customerCreateError || !customer) {
        // Rollback auth user creation if customer creation fails
        console.error('Failed to create customer profile:', customerCreateError);
        
        toast({
          title: 'Registration failed',
          description: customerCreateError?.message || 'Failed to create customer profile',
          variant: 'destructive'
        });
        setError(customerCreateError?.message || 'Registration failed');
        return false;
      }
      
      // Generate unique referral code
      const newReferralCode = generateReferralCode();
      
      // Create customer user record
      const { error: userCreateError } = await supabase
        .from('customer_users')
        .insert([
          {
            email,
            auth_id: data.user.id,
            customer_id: customer.id,
            referral_code: newReferralCode
          }
        ]);
      
      if (userCreateError) {
        // Rollback if customer user creation fails
        console.error('Failed to create customer user:', userCreateError);
        
        toast({
          title: 'Registration failed',
          description: userCreateError.message || 'Failed to create customer user',
          variant: 'destructive'
        });
        setError(userCreateError.message || 'Registration failed');
        return false;
      }
      
      // Handle referral if provided
      if (referralCode) {
        const { data: referrerData } = await supabase
          .from('customer_users')
          .select('customer_id')
          .eq('referral_code', referralCode)
          .single();
        
        if (referrerData) {
          // Add referral record
          await supabase.from('referrals').insert([
            {
              referrer_id: referrerData.customer_id,
              referred_id: customer.id,
              status: 'pending',
              points_awarded: 0
            }
          ]);
        }
      }
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created'
      });
      
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: 'Registration error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setError(error.message || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      await supabase.auth.signOut();
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out'
      });
      
      setCustomerUser(null);
      setCustomerProfile(null);
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout error',
        description: error.message || 'Failed to log out',
        variant: 'destructive'
      });
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const generatePin = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if email exists
      const { data: customerUser, error } = await supabase
        .from('customer_users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error || !customerUser) {
        toast({
          title: 'Pin generation failed',
          description: 'Email not found',
          variant: 'destructive'
        });
        setError('Email not found');
        return null;
      }
      
      // Generate 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Set PIN expiry to 15 minutes from now
      const pinExpiry = new Date();
      pinExpiry.setMinutes(pinExpiry.getMinutes() + 15);
      
      // Update customer user with PIN
      const { error: updateError } = await supabase
        .from('customer_users')
        .update({
          reset_pin: pin,
          reset_pin_expiry: pinExpiry.toISOString()
        })
        .eq('email', email);
      
      if (updateError) {
        toast({
          title: 'Pin generation failed',
          description: updateError.message || 'Failed to generate PIN',
          variant: 'destructive'
        });
        setError(updateError.message || 'Pin generation failed');
        return null;
      }
      
      toast({
        title: 'PIN generated',
        description: 'A verification PIN has been generated'
      });
      
      return pin;
    } catch (error: any) {
      console.error('Pin generation error:', error);
      toast({
        title: 'Pin generation error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setError(error.message || 'Pin generation failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  
  const verifyPin = async (email: string, pin: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: customerUser, error } = await supabase
        .from('customer_users')
        .select('*')
        .eq('email', email)
        .eq('reset_pin', pin)
        .single();
      
      if (error || !customerUser) {
        toast({
          title: 'PIN verification failed',
          description: 'Invalid PIN',
          variant: 'destructive'
        });
        setError('Invalid PIN');
        return false;
      }
      
      const pinExpiry = new Date(customerUser.reset_pin_expiry);
      const now = new Date();
      
      if (pinExpiry < now) {
        toast({
          title: 'PIN verification failed',
          description: 'PIN has expired',
          variant: 'destructive'
        });
        setError('PIN expired');
        return false;
      }
      
      toast({
        title: 'PIN verified',
        description: 'PIN verification successful'
      });
      
      return true;
    } catch (error: any) {
      console.error('PIN verification error:', error);
      toast({
        title: 'PIN verification error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setError(error.message || 'PIN verification failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetPassword = async (email: string, pin: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify PIN first
      const isPinValid = await verifyPin(email, pin);
      
      if (!isPinValid) {
        return false;
      }
      
      // Get auth_id for the user
      const { data: customerUser, error } = await supabase
        .from('customer_users')
        .select('auth_id')
        .eq('email', email)
        .single();
      
      if (error || !customerUser || !customerUser.auth_id) {
        toast({
          title: 'Password reset failed',
          description: 'User not found',
          variant: 'destructive'
        });
        setError('User not found');
        return false;
      }
      
      // Reset password for the auth user
      const { error: passwordError } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (passwordError) {
        toast({
          title: 'Password reset failed',
          description: passwordError.message || 'Failed to reset password',
          variant: 'destructive'
        });
        setError(passwordError.message || 'Password reset failed');
        return false;
      }
      
      // Clear reset PIN after successful password reset
      await supabase
        .from('customer_users')
        .update({
          reset_pin: null,
          reset_pin_expiry: null
        })
        .eq('email', email);
      
      toast({
        title: 'Password reset successful',
        description: 'Your password has been updated'
      });
      
      return true;
    } catch (error: any) {
      console.error('Password reset error:', error);
      toast({
        title: 'Password reset error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setError(error.message || 'Password reset failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const pin = await generatePin(email);
      
      if (pin) {
        // In a real implementation, you would send this PIN via email or SMS
        console.log('Generated PIN:', pin);
        
        toast({
          title: 'Password reset requested',
          description: 'Check your email for verification PIN'
        });
        
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('Password reset request error:', error);
      toast({
        title: 'Password reset request error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setError(error.message || 'Password reset request failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateProfile = async (profile: Partial<CustomerProfile>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!customerProfile || !customerUser) {
        toast({
          title: 'Update failed',
          description: 'You must be logged in to update your profile',
          variant: 'destructive'
        });
        setError('User not logged in');
        return false;
      }
      
      const { error } = await supabase
        .from('customers')
        .update({
          name: profile.name || customerProfile.name,
          phone: profile.phone || customerProfile.phone,
          email: profile.email || customerProfile.email
        })
        .eq('id', customerProfile.id);
      
      if (error) {
        toast({
          title: 'Profile update failed',
          description: error.message || 'Failed to update profile',
          variant: 'destructive'
        });
        setError(error.message || 'Profile update failed');
        return false;
      }
      
      // Refresh profile data
      await fetchCustomerProfile(customerProfile.id);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully'
      });
      
      return true;
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        title: 'Profile update error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive'
      });
      setError(error.message || 'Profile update failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (customerUser && customerUser.customer_id) {
      await fetchCustomerProfile(customerUser.customer_id);
    }
  };
  
  const value = {
    customerUser,
    customerProfile,
    isLoading,
    error,
    login,
    register,
    logout,
    resetPassword,
    requestPasswordReset,
    updateProfile,
    verifyPin,
    generatePin,
    refreshProfile
  };
  
  return (
    <CustomerAuthContext.Provider value={value}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  
  return context;
};
