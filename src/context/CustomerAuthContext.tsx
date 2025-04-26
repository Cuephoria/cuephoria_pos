
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateReferralCode } from '@/utils/pos.utils';
import { CustomerUser, CustomerProfile, CustomerAuthContextType } from '@/types/customer.types';

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

  // Check for user session on mount (mock implementation)
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        
        // This is a mock implementation. In a real app, this would check Supabase session
        const storedUser = localStorage.getItem('customerUser');
        
        if (storedUser) {
          const user = JSON.parse(storedUser) as CustomerUser;
          setCustomerUser(user);
          
          // Get customer profile
          await fetchCustomerProfile(user.customer_id);
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
  }, []);
  
  // Mock function to fetch customer profile
  const fetchCustomerProfile = async (customerId: string) => {
    try {
      // In a real app, this would fetch from Supabase
      // This is a mock implementation for development
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
    } catch (error) {
      console.error('Error fetching customer profile:', error);
      setError('Failed to fetch customer profile');
      setCustomerProfile(null);
    }
  };
  
  // Mock login implementation
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a mock implementation. In a real app, this would use Supabase auth
      // Mock successful login
      if (email && password) {
        const mockUser: CustomerUser = {
          id: "mock-id-" + Math.random().toString(36).substring(2, 9),
          email: email,
          auth_id: "auth-" + Math.random().toString(36).substring(2, 9),
          customer_id: "cust-" + Math.random().toString(36).substring(2, 9),
          referral_code: generateReferralCode(),
          created_at: new Date()
        };
        
        // Store in localStorage for mock persistence
        localStorage.setItem('customerUser', JSON.stringify(mockUser));
        
        setCustomerUser(mockUser);
        await fetchCustomerProfile(mockUser.customer_id);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back!'
        });
        
        return true;
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password',
          variant: 'destructive'
        });
        return false;
      }
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
  
  // Mock registration implementation
  const register = async (email: string, password: string, name: string, phone: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // This is a mock implementation. In a real app, this would use Supabase auth
      if (email && password && name && phone) {
        const newReferralCode = generateReferralCode();
        
        const mockUser: CustomerUser = {
          id: "mock-id-" + Math.random().toString(36).substring(2, 9),
          email: email,
          auth_id: "auth-" + Math.random().toString(36).substring(2, 9),
          customer_id: "cust-" + Math.random().toString(36).substring(2, 9),
          referral_code: newReferralCode,
          created_at: new Date()
        };
        
        toast({
          title: 'Registration successful',
          description: 'Your account has been created'
        });
        
        return true;
      } else {
        toast({
          title: 'Registration failed',
          description: 'Please fill all required fields',
          variant: 'destructive'
        });
        return false;
      }
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
  
  // Mock logout implementation
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real app, this would call Supabase auth.signOut()
      localStorage.removeItem('customerUser');
      
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
        description: error.message || 'Failed to log out',
        variant: 'destructive'
      });
      setError(error.message || 'Logout failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock pin generation for password reset
  const generatePin = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate a random 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
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
  
  // Mock pin verification
  const verifyPin = async (email: string, pin: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock verification - in a real app, this would check against the stored PIN
      // Always return true for demo purposes
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
  
  // Mock password reset
  const resetPassword = async (email: string, pin: string, newPassword: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Mock successful password reset
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
  
  // Mock password reset request
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
  
  // Mock profile update
  const updateProfile = async (profile: Partial<CustomerProfile>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!customerProfile) {
        toast({
          title: 'Update failed',
          description: 'You must be logged in to update your profile',
          variant: 'destructive'
        });
        setError('User not logged in');
        return false;
      }
      
      // Update the profile in state
      setCustomerProfile({
        ...customerProfile,
        name: profile.name || customerProfile.name,
        phone: profile.phone || customerProfile.phone,
        email: profile.email || customerProfile.email
      });
      
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

  // Mock profile refresh
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
