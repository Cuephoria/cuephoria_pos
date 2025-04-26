
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateReferralCode } from '@/utils/pos.utils';
import { CustomerUser, CustomerProfile, CustomerAuthContextType } from '@/types/customer.types';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer } from '@/types/pos.types';

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

  // Check for user session on mount (mock implementation)
  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        
        // This is a mock implementation using localStorage instead of Supabase
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
  
  // Fetch customer profile from the POS customers
  const fetchCustomerProfile = async (customerId: string) => {
    try {
      // Find the customer in the POS customers array
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
      setCustomerProfile(null);
    }
  };
  
  // Login implementation
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Find user with matching email and password
      const foundUser = await findUserByEmailAndPassword(email, password);
      
      if (foundUser) {
        // Store in localStorage for persistence
        localStorage.setItem('customerUser', JSON.stringify(foundUser));
        
        setCustomerUser(foundUser);
        await fetchCustomerProfile(foundUser.customer_id);
        
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
  
  // Helper function to find user by email and password
  const findUserByEmailAndPassword = async (email: string, password: string): Promise<CustomerUser | null> => {
    // Mock implementation - in a real app, this would validate against stored credentials
    const usersJson = localStorage.getItem('customerUsers');
    if (usersJson) {
      const users: CustomerUser[] = JSON.parse(usersJson);
      const user = users.find(u => u.email === email);
      
      if (user) {
        // In a real app, you would compare hashed passwords
        const storedPassword = localStorage.getItem(`password_${user.id}`);
        if (storedPassword === password) {
          return user;
        }
      }
    }
    
    // For demo purposes, accept a demo account
    if (email === 'demo@example.com' && password === 'password') {
      return {
        id: "mock-id-demo123",
        email: email,
        auth_id: "auth-demo123",
        customer_id: "cust-demo123",
        referral_code: "DEMO123",
        reset_pin: "123456",
        reset_pin_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        created_at: new Date()
      };
    }
    
    return null;
  };
  
  // Registration implementation
  const register = async (email: string, password: string, name: string, phone: string, pin: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if email already exists
      const existingUser = await findUserByEmail(email);
      if (existingUser) {
        toast({
          title: 'Registration failed',
          description: 'Email already in use',
          variant: 'destructive'
        });
        return false;
      }
      
      // Create a customer in the POS system
      const customerId = `cust-${Math.random().toString(36).substring(2, 9)}`;
      
      const newCustomer: Omit<Customer, 'id' | 'createdAt'> = {
        name: name,
        phone: phone,
        email: email,
        isMember: false,
        loyaltyPoints: referralCode ? 50 : 0, // Bonus points if using referral code
        totalSpent: 0,
        totalPlayTime: 0
      };
      
      // Add the customer to the POS system
      const createdCustomer = await addCustomer(newCustomer);
      
      if (!createdCustomer) {
        throw new Error("Failed to create customer record");
      }
      
      const newReferralCode = generateReferralCode();
      
      const newUser: CustomerUser = {
        id: `user-${Math.random().toString(36).substring(2, 9)}`,
        email: email,
        auth_id: `auth-${Math.random().toString(36).substring(2, 9)}`,
        customer_id: createdCustomer.id,
        referral_code: newReferralCode,
        reset_pin: pin,
        reset_pin_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        created_at: new Date()
      };
      
      // Save user to localStorage
      const usersJson = localStorage.getItem('customerUsers');
      const users: CustomerUser[] = usersJson ? JSON.parse(usersJson) : [];
      users.push(newUser);
      localStorage.setItem('customerUsers', JSON.stringify(users));
      
      // Store password (in a real app, this would be hashed)
      localStorage.setItem(`password_${newUser.id}`, password);
      
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
  
  // Helper function to find user by email
  const findUserByEmail = async (email: string): Promise<CustomerUser | null> => {
    const usersJson = localStorage.getItem('customerUsers');
    if (usersJson) {
      const users: CustomerUser[] = JSON.parse(usersJson);
      const user = users.find(u => u.email === email);
      if (user) return user;
    }
    return null;
  };
  
  // Logout implementation
  const logout = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
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
  
  // Verify PIN for password reset
  const verifyPin = async (email: string, pin: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const user = await findUserByEmail(email);
      
      if (!user) {
        toast({
          title: 'PIN verification failed',
          description: 'User not found',
          variant: 'destructive'
        });
        return false;
      }
      
      if (user.reset_pin !== pin) {
        toast({
          title: 'PIN verification failed',
          description: 'Invalid PIN',
          variant: 'destructive'
        });
        return false;
      }
      
      // Check if PIN has expired
      const now = new Date();
      if (user.reset_pin_expiry && new Date(user.reset_pin_expiry) < now) {
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
      
      const user = await findUserByEmail(email);
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive'
        });
        return null;
      }
      
      // Generate a random 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user with new PIN
      const usersJson = localStorage.getItem('customerUsers');
      if (usersJson) {
        const users: CustomerUser[] = JSON.parse(usersJson);
        const updatedUsers = users.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              reset_pin: pin,
              reset_pin_expiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
            };
          }
          return u;
        });
        
        localStorage.setItem('customerUsers', JSON.stringify(updatedUsers));
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
      
      const user = await findUserByEmail(email);
      
      if (!user) {
        toast({
          title: 'Error',
          description: 'User not found',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update password
      localStorage.setItem(`password_${user.id}`, newPassword);
      
      // Reset PIN after successful password change
      const usersJson = localStorage.getItem('customerUsers');
      if (usersJson) {
        const users: CustomerUser[] = JSON.parse(usersJson);
        const updatedUsers = users.map(u => {
          if (u.id === user.id) {
            return {
              ...u,
              reset_pin_expiry: new Date() // Expire the PIN
            };
          }
          return u;
        });
        
        localStorage.setItem('customerUsers', JSON.stringify(updatedUsers));
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
        const usersJson = localStorage.getItem('customerUsers');
        if (usersJson) {
          const users: CustomerUser[] = JSON.parse(usersJson);
          const updatedUsers = users.map(u => {
            if (u.id === customerUser.id) {
              return {
                ...u,
                email: profile.email
              };
            }
            return u;
          });
          
          localStorage.setItem('customerUsers', JSON.stringify(updatedUsers));
          
          // Update the current user
          setCustomerUser({
            ...customerUser,
            email: profile.email
          });
          
          // Update the stored user
          localStorage.setItem('customerUser', JSON.stringify({
            ...customerUser,
            email: profile.email
          }));
        }
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
