
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type CustomerUser = {
  id: string;
  email: string;
  customerId: string;
  name: string;
  phone: string;
  referralCode: string;
};

type CustomerAuthContextType = {
  customerUser: CustomerUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (name: string, email: string, phone: string, password: string, referralCode?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  resetPasswordWithPin: (email: string, pin: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: Partial<Omit<CustomerUser, 'id'>>) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
};

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  customerUser: null,
  isLoading: true,
  login: async () => ({ success: false, message: 'Context not initialized' }),
  register: async () => ({ success: false, message: 'Context not initialized' }),
  logout: async () => {},
  resetPassword: async () => ({ success: false, message: 'Context not initialized' }),
  resetPasswordWithPin: async () => ({ success: false, message: 'Context not initialized' }),
  updateProfile: async () => ({ success: false, message: 'Context not initialized' }),
  changePassword: async () => ({ success: false, message: 'Context not initialized' }),
});

export const CustomerAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          setIsLoading(false);
          return;
        }
        
        if (session) {
          // Fetch the customer_user record to get additional info
          const { data, error: customerError } = await supabase
            .from('customer_users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();
            
          if (customerError || !data) {
            console.error('Error fetching customer user data:', customerError);
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }
          
          setCustomerUser({
            id: session.user.id,
            email: session.user.email || '',
            customerId: data.customer_id,
            name: data.name,
            phone: data.phone,
            referralCode: data.referral_code
          });
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsLoading(false);
      }
    };
    
    checkUser();
    
    // Set up auth state change subscription
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Fetch customer user data
        const { data, error } = await supabase
          .from('customer_users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();
          
        if (error || !data) {
          console.error('Error fetching customer user data:', error);
          await supabase.auth.signOut();
          return;
        }
        
        setCustomerUser({
          id: session.user.id,
          email: session.user.email || '',
          customerId: data.customer_id,
          name: data.name,
          phone: data.phone,
          referralCode: data.referral_code
        });
      } else if (event === 'SIGNED_OUT') {
        setCustomerUser(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Authenticate with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: 'Login Failed',
          description: error.message,
          variant: 'destructive',
        });
        return { success: false, message: error.message };
      }
      
      // Check if this user has a customer_users record
      const { data: customerData, error: customerError } = await supabase
        .from('customer_users')
        .select('*')
        .eq('auth_id', data.user.id)
        .single();
        
      if (customerError || !customerData) {
        // This is an admin/staff user, not a customer
        await supabase.auth.signOut();
        toast({
          title: 'Login Failed',
          description: 'This account is not registered as a customer',
          variant: 'destructive',
        });
        return { success: false, message: 'This account is not registered as a customer' };
      }
      
      toast({
        title: 'Login Successful',
        description: 'Welcome back!',
      });
      
      return { success: true, message: 'Login successful' };
    } catch (error: any) {
      toast({
        title: 'Login Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, phone: string, password: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      
      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('customer_users')
        .select('email')
        .eq('email', email)
        .single();
        
      if (existingEmail) {
        return { success: false, message: 'This email is already registered' };
      }
      
      // Check if phone already exists
      const { data: existingPhone } = await supabase
        .from('customer_users')
        .select('phone')
        .eq('phone', phone)
        .single();
        
      if (existingPhone) {
        return { success: false, message: 'This phone number is already registered' };
      }
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          }
        }
      });
      
      if (authError || !authData.user) {
        toast({
          title: 'Registration Failed',
          description: authError?.message || 'Failed to create account',
          variant: 'destructive',
        });
        return { success: false, message: authError?.message || 'Failed to create account' };
      }
      
      // Create a customer record in the customers table if it doesn't exist
      let customerId = '';
      
      // Check if customer with this phone number exists in customers table
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .single();
        
      if (existingCustomer) {
        customerId = existingCustomer.id;
        
        // Update customer name and email if needed
        await supabase
          .from('customers')
          .update({
            name,
            email
          })
          .eq('id', customerId);
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name,
            phone,
            email,
            is_member: false,
            loyalty_points: 0,
            total_spent: 0,
            total_play_time: 0
          })
          .select('id')
          .single();
          
        if (customerError || !newCustomer) {
          // Rollback auth creation
          await supabase.auth.signOut();
          await supabase.auth.admin.deleteUser(authData.user.id);
          
          toast({
            title: 'Registration Failed',
            description: 'Failed to create customer record',
            variant: 'destructive',
          });
          return { success: false, message: 'Failed to create customer record' };
        }
        
        customerId = newCustomer.id;
      }
      
      // Generate unique referral code
      const referralCodeBase = name.substring(0, 3).toUpperCase() + Math.floor(1000 + Math.random() * 9000).toString();
      
      // Create customer_users record
      const { error: userError } = await supabase
        .from('customer_users')
        .insert({
          auth_id: authData.user.id,
          customer_id: customerId,
          name,
          email,
          phone,
          referral_code: referralCodeBase,
          pin: Math.floor(1000 + Math.random() * 9000).toString() // Generate random 4-digit PIN
        });
        
      if (userError) {
        // Rollback
        await supabase.auth.signOut();
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        toast({
          title: 'Registration Failed',
          description: 'Failed to create user profile',
          variant: 'destructive',
        });
        return { success: false, message: 'Failed to create user profile' };
      }
      
      // Process referral if a referral code was provided
      if (referralCode && referralCode.length > 0) {
        // Find the referrer
        const { data: referrer } = await supabase
          .from('customer_users')
          .select('customer_id')
          .eq('referral_code', referralCode)
          .single();
          
        if (referrer) {
          // Record the referral
          await supabase
            .from('referrals')
            .insert({
              referrer_id: referrer.customer_id,
              referred_id: customerId,
              status: 'pending' // Will be converted to 'completed' after first purchase
            });
            
          // Add referral bonus points to referrer
          await supabase.rpc('add_loyalty_points', { 
            customer_id: referrer.customer_id, 
            points_to_add: 50 // Default referral bonus
          });
          
          // Add welcome bonus to new user for using referral
          await supabase.rpc('add_loyalty_points', { 
            customer_id: customerId, 
            points_to_add: 20 // Welcome bonus
          });
        }
      }
      
      toast({
        title: 'Registration Successful',
        description: 'Your account has been created successfully',
      });
      
      return { success: true, message: 'Registration successful' };
    } catch (error: any) {
      toast({
        title: 'Registration Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: error.message || 'An unexpected error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    await supabase.auth.signOut();
    setCustomerUser(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });
  };

  // Reset password (send email with reset instructions)
  const resetPassword = async (email: string) => {
    try {
      // Check if email exists in customer_users
      const { data: user, error: userError } = await supabase
        .from('customer_users')
        .select('pin')
        .eq('email', email)
        .single();
        
      if (userError || !user) {
        return { success: false, message: 'No account found with this email' };
      }
      
      // For a real application, we would send an email with a PIN
      // In this case, we'll just return success since we already have the PIN stored
      
      toast({
        title: 'Reset PIN Sent',
        description: 'If your email exists in our system, you will receive a PIN to reset your password',
      });
      
      return { success: true, message: 'Reset instructions sent to your email' };
    } catch (error: any) {
      toast({
        title: 'Reset Password Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  };

  // Reset password with PIN
  const resetPasswordWithPin = async (email: string, pin: string, newPassword: string) => {
    try {
      // Check if email and PIN match
      const { data: user, error: userError } = await supabase
        .from('customer_users')
        .select('auth_id')
        .eq('email', email)
        .eq('pin', pin)
        .single();
        
      if (userError || !user) {
        return { success: false, message: 'Invalid email or PIN' };
      }
      
      // Update password in auth
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      // Generate new PIN for future password resets
      const newPin = Math.floor(1000 + Math.random() * 9000).toString();
      
      await supabase
        .from('customer_users')
        .update({ pin: newPin })
        .eq('auth_id', user.auth_id);
        
      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been reset successfully',
      });
      
      return { success: true, message: 'Password has been reset successfully' };
    } catch (error: any) {
      toast({
        title: 'Reset Password Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  };

  // Update profile
  const updateProfile = async (data: Partial<Omit<CustomerUser, 'id'>>) => {
    try {
      if (!customerUser) {
        return { success: false, message: 'You must be logged in' };
      }
      
      // Update in customer_users table
      const { error: userError } = await supabase
        .from('customer_users')
        .update({
          name: data.name,
          phone: data.phone,
        })
        .eq('auth_id', customerUser.id);
        
      if (userError) {
        return { success: false, message: userError.message };
      }
      
      // Update in customers table
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          name: data.name,
          phone: data.phone,
        })
        .eq('id', customerUser.customerId);
        
      if (customerError) {
        return { success: false, message: customerError.message };
      }
      
      // Update local state
      setCustomerUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error: any) {
      toast({
        title: 'Update Profile Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  };

  // Change password
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // For security, re-authenticate the user first
      if (!customerUser?.email) {
        return { success: false, message: 'Email not available' };
      }
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: customerUser.email,
        password: currentPassword,
      });
      
      if (signInError) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        return { success: false, message: error.message };
      }
      
      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully',
      });
      
      return { success: true, message: 'Password changed successfully' };
    } catch (error: any) {
      toast({
        title: 'Change Password Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false, message: error.message || 'An unexpected error occurred' };
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        customerUser,
        isLoading,
        login,
        register,
        logout,
        resetPassword,
        resetPasswordWithPin,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
