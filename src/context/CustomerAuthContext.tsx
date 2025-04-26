import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateReferralCode } from '@/utils/pos.utils';
import { CustomerUser, CustomerProfile, CustomerAuthContextType } from '@/types/customer.types';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types/pos.types';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Create the context
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
  const { addCustomer, customers } = useCustomers([]);

  // Initialize auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await fetchCustomerUser(session.user);
      } else {
        setCustomerUser(null);
        setCustomerProfile(null);
      }
    });

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchCustomerUser(session.user);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchCustomerUser = async (authUser: User) => {
    try {
      const { data: customerUserData, error: customerUserError } = await supabase
        .from('customer_users')
        .select('*')
        .eq('auth_id', authUser.id)
        .single();

      if (customerUserError) throw customerUserError;

      if (customerUserData) {
        setCustomerUser(customerUserData as CustomerUser);
        await fetchCustomerProfile(customerUserData.customer_id);
      }
    } catch (error) {
      console.error('Error fetching customer user:', error);
      setError('Failed to fetch user data');
    }
  };

  const fetchCustomerProfile = async (customerId: string) => {
    try {
      const customer = customers.find(c => c.id === customerId);
      
      if (customer) {
        const profile: CustomerProfile = {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || undefined,
          isMember: customer.isMember,
          membershipExpiryDate: customer.membershipExpiryDate,
          membershipStartDate: customer.membershipStartDate,
          membershipPlan: customer.membershipPlan,
          membershipHoursLeft: customer.membershipHoursLeft,
          membershipDuration: customer.membershipDuration,
          loyaltyPoints: customer.loyaltyPoints,
          totalSpent: customer.totalSpent,
          totalPlayTime: customer.totalPlayTime,
          createdAt: customer.createdAt,
          referralCode: generateReferralCode()
        };
        
        setCustomerProfile(profile);
      } else {
        // If no customer is found in the POS system, use a mock profile
        const mockProfile: CustomerProfile = {
          id: customerId,
          name: "Demo User",
          phone: "555-555-5555",
          email: "demo@example.com",
          isMember: false,
          loyaltyPoints: 100,
          totalSpent: 250.50,
          totalPlayTime: 360,
          createdAt: new Date(),
          referralCode: "DEMO123"
        };
        
        setCustomerProfile(mockProfile);
      }
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      setError('Failed to fetch customer profile');
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
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive'
      });
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string, 
    password: string, 
    name: string, 
    phone: string, 
    pin: string, 
    referralCode?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Failed to create user');

      // 2. Create customer record
      const newCustomer: Omit<Customer, 'id' | 'createdAt'> = {
        name,
        phone,
        email,
        isMember: false,
        loyaltyPoints: referralCode ? 50 : 0,
        totalSpent: 0,
        totalPlayTime: 0
      };
      
      const createdCustomer = await addCustomer(newCustomer);
      if (!createdCustomer) throw new Error('Failed to create customer record');

      // 3. Create customer user record
      const { error: customerUserError } = await supabase
        .from('customer_users')
        .insert({
          auth_id: authData.user.id,
          customer_id: createdCustomer.id,
          email,
          referral_code: generateReferralCode(),
          reset_pin: pin,
          reset_pin_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        });

      if (customerUserError) throw customerUserError;

      toast({
        title: 'Registration successful',
        description: 'Your account has been created'
      });
      
      return true;
    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: 'Registration error',
        description: error.message,
        variant: 'destructive'
      });
      setError(error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCustomerUser(null);
      setCustomerProfile(null);
      
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out'
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout error',
        description: error.message,
        variant: 'destructive'
      });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify PIN for password reset
  const verifyPin = async (email: string, pin: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('customer_users')
        .select('*')
        .eq('email', email)
        .eq('reset_pin', pin)
        .single();
      
      if (error) {
        toast({
          title: 'PIN verification failed',
          description: 'Invalid email or PIN',
          variant: 'destructive'
        });
        return false;
      }
      
      if (!data) {
        toast({
          title: 'PIN verification failed',
          description: 'User not found',
          variant: 'destructive'
        });
        return false;
      }
      
      // Check if PIN has expired
      const now = new Date();
      if (data.reset_pin_expiry && new Date(data.reset_pin_expiry) < now) {
        toast({
          title: 'PIN verification failed',
          description: 'PIN has expired. Please request a new one',
          variant: 'destructive'
        });
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
  
  // Generate a new PIN for password reset
  const generatePin = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate a random 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user with new PIN
      const { data, error } = await supabase
        .from('customer_users')
        .update({
          reset_pin: pin,
          reset_pin_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
        })
        .eq('email', email);
      
      if (error) {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive'
        });
        return null;
      }
      
      console.log(`PIN for ${email}: ${pin}`); // For demonstration purposes
      
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
  
  // Password reset
  const resetPassword = async (email: string, pin: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verify PIN first
      const isPinValid = await verifyPin(email, pin);
      
      if (!isPinValid) {
        return false;
      }
      
      // Update password
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        toast({
          title: 'Error',
          description: 'Failed to reset password',
          variant: 'destructive'
        });
        return false;
      }
      
      // Reset PIN after successful password change
      const { error: pinError } = await supabase
        .from('customer_users')
        .update({
          reset_pin: null,
          reset_pin_expiry: null
        })
        .eq('email', email);
      
      if (pinError) {
        console.error('Failed to reset PIN:', pinError);
      }
      
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
  
  // Request PIN for password reset
  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const pin = await generatePin(email);
      
      if (pin) {
        console.log(`Generated PIN for ${email}: ${pin}`); // For demonstration
        
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
  
  // Profile update
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
      
      // Update the profile in state
      const updatedProfile = {
        ...customerProfile,
        name: profile.name || customerProfile.name,
        phone: profile.phone || customerProfile.phone,
        email: profile.email || customerProfile.email
      };
      
      setCustomerProfile(updatedProfile);
      
      // Update the user's email if it was changed
      if (profile.email && profile.email !== customerUser.email) {
        const { data, error } = await supabase.auth.updateUser({
          email: profile.email
        });
        
        if (error) {
          toast({
            title: 'Update failed',
            description: 'Failed to update email',
            variant: 'destructive'
          });
          return false;
        }
      }
      
      // Update customer record
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          name: profile.name || customerProfile.name,
          phone: profile.phone || customerProfile.phone,
          email: profile.email || customerProfile.email
        })
        .eq('id', customerUser.customer_id);
      
      if (customerError) {
        toast({
          title: 'Update failed',
          description: 'Failed to update customer record',
          variant: 'destructive'
        });
        return false;
      }
      
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

  // Profile refresh
  const refreshProfile = async () => {
    if (customerUser && customerUser.customer_id) {
      await fetchCustomerProfile(customerUser.customer_id);
    }
  };
  
  // Provide all the auth functions
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
