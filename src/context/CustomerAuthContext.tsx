
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, handleSupabaseError, convertFromSupabaseCustomerUser, convertToSupabaseCustomerUser } from '@/integrations/supabase/client';
import { CustomerUser } from '@/types/customer.types';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { generateId } from '@/utils/pos.utils';

interface CustomerAuthContextType {
  session: Session | null;
  user: User | null;
  customerUser: CustomerUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, phone: string, referralCode?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  verifyResetPin: (email: string, pin: string) => Promise<boolean>;
  setNewPassword: (email: string, password: string, pin: string) => Promise<boolean>;
  updateProfile: (data: Partial<CustomerUser>) => Promise<boolean>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  session: null,
  user: null,
  customerUser: null,
  isLoading: true,
  error: null,
  signIn: async () => false,
  signUp: async () => false,
  signOut: async () => {},
  resetPassword: async () => false,
  verifyResetPin: async () => false,
  setNewPassword: async () => false,
  updateProfile: async () => false,
});

export const useCustomerAuth = () => useContext(CustomerAuthContext);

export const CustomerAuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [customerUser, setCustomerUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Helper function to fetch customer user data
  const fetchCustomerUser = async (authId: string) => {
    try {
      const { data, error } = await supabase
        .from('customer_users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.error('Error fetching customer user:', error);
        return null;
      }

      return convertFromSupabaseCustomerUser(data);
    } catch (err) {
      console.error('Error in fetchCustomerUser:', err);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              // Fetch customer user data after auth state changes
              // Using setTimeout to prevent potential recursion issues
              setTimeout(async () => {
                const customerData = await fetchCustomerUser(currentSession.user.id);
                setCustomerUser(customerData);
              }, 0);
            } else {
              setCustomerUser(null);
            }
          }
        );

        // THEN check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          const customerData = await fetchCustomerUser(initialSession.user.id);
          setCustomerUser(customerData);
        }

        return () => subscription.unsubscribe();
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      if (data.user) {
        const customerData = await fetchCustomerUser(data.user.id);
        setCustomerUser(customerData);
        
        toast({
          title: 'Signed in successfully',
          description: 'Welcome back!',
        });
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email, password, and customer info
  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    phone: string, 
    referralCode?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if a customer with this email already exists
      const { data: existingCustomers, error: customerError } = await supabase
        .from('customers')
        .select('id, email')
        .eq('email', email)
        .limit(1);
        
      if (customerError) {
        throw new Error(handleSupabaseError(customerError, 'customer lookup'));
      }

      // Sign up the user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
          },
        },
      });

      if (error) {
        setError(error.message);
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      if (data.user) {
        let customerId: string;
        let referrerId: string | null = null;
        
        // If customer exists, use that ID, otherwise create a new customer
        if (existingCustomers && existingCustomers.length > 0) {
          customerId = existingCustomers[0].id;
        } else {
          // Check referral code if provided
          if (referralCode) {
            const { data: referrerData } = await supabase
              .from('customer_users')
              .select('customer_id')
              .eq('referral_code', referralCode)
              .single();
              
            if (referrerData) {
              referrerId = referrerData.customer_id;
            }
          }
          
          // Create a new customer record
          const { data: newCustomer, error: createError } = await supabase
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
            
          if (createError) {
            throw new Error(handleSupabaseError(createError, 'customer creation'));
          }
          
          customerId = newCustomer.id;
        }

        // Create a customer user record linking auth user to customer
        const newCustomerUser = {
          authId: data.user.id,
          customerId,
          email,
          referralCode: generateReferralCode(),
          resetPin: null,
          resetPinExpiry: null,
          createdAt: new Date()
        };
        
        const { error: customerUserError } = await supabase
          .from('customer_users')
          .insert(convertToSupabaseCustomerUser(newCustomerUser));
          
        if (customerUserError) {
          throw new Error(handleSupabaseError(customerUserError, 'customer user creation'));
        }
        
        // If there was a valid referral, award points to referrer
        if (referrerId) {
          // Award points to the referrer
          await processReferralReward(referrerId, email);
        }

        toast({
          title: 'Account created successfully!',
          description: 'Welcome to Cuephoria!',
        });
        
        return true;
      }
      
      return false;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Process referral reward - award points to referrer
  const processReferralReward = async (referrerId: string, referredEmail: string) => {
    const REFERRAL_POINTS = 100; // Points awarded for successful referral
    
    try {
      // Get referrer customer data
      const { data: referrer, error: referrerError } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', referrerId)
        .single();
        
      if (referrerError || !referrer) {
        console.error('Error getting referrer:', referrerError);
        return;
      }
      
      // Update referrer's loyalty points
      const updatedPoints = referrer.loyalty_points + REFERRAL_POINTS;
      const { error: updateError } = await supabase
        .from('customers')
        .update({ loyalty_points: updatedPoints })
        .eq('id', referrerId);
        
      if (updateError) {
        console.error('Error updating referrer points:', updateError);
        return;
      }
      
      // Record loyalty transaction
      await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: referrerId,
          points: REFERRAL_POINTS,
          source: 'referral',
          description: `Referral reward for inviting ${referredEmail}`
        });
        
      // Record the completed referral
      await supabase
        .from('referrals')
        .insert({
          referrer_id: referrerId,
          referred_email: referredEmail,
          status: 'completed',
          points_awarded: REFERRAL_POINTS,
          completed_at: new Date().toISOString()
        });
    } catch (err) {
      console.error('Error processing referral reward:', err);
    }
  };

  // Helper function to generate a unique referral code
  const generateReferralCode = (): string => {
    // Generate a code using the first part of a UUID
    const uuid = generateId().split('-')[0];
    // Format it as a readable code with a prefix
    return `CUE-${uuid.substring(0, 6).toUpperCase()}`;
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setCustomerUser(null);
      navigate('/customer/login');
      
      toast({
        title: 'Signed out',
        description: 'You have been signed out successfully.',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign out';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  // Reset password (send reset pin)
  const resetPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a 6-digit PIN
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      // Set expiry to 1 hour from now
      const pinExpiry = new Date();
      pinExpiry.setHours(pinExpiry.getHours() + 1);
      
      // Find the customer user by email
      const { data: userData, error: userError } = await supabase
        .from('customer_users')
        .select('id')
        .eq('email', email)
        .single();
        
      if (userError) {
        toast({
          title: 'Account not found',
          description: 'No account found with that email address.',
          variant: 'destructive',
        });
        return false;
      }

      // Update the customer user with the reset PIN
      const { error: updateError } = await supabase
        .from('customer_users')
        .update({
          reset_pin: pin,
          reset_pin_expiry: pinExpiry.toISOString()
        })
        .eq('id', userData.id);
        
      if (updateError) {
        throw new Error(handleSupabaseError(updateError, 'update reset PIN'));
      }
      
      // In a real application, send an email with the PIN
      // For now, just show the PIN in a toast for demonstration
      toast({
        title: 'Reset PIN sent',
        description: `Your PIN is: ${pin} (This would normally be sent via email)`,
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify reset PIN
  const verifyResetPin = async (email: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Find the customer user by email
      const { data, error } = await supabase
        .from('customer_users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (error) {
        toast({
          title: 'Account not found',
          description: 'No account found with that email address.',
          variant: 'destructive',
        });
        return false;
      }
      
      const customerUser = convertFromSupabaseCustomerUser(data);
      
      // Check if PIN is correct and not expired
      if (customerUser.resetPin !== pin) {
        toast({
          title: 'Invalid PIN',
          description: 'The PIN you entered is incorrect.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!customerUser.resetPinExpiry || new Date() > customerUser.resetPinExpiry) {
        toast({
          title: 'PIN expired',
          description: 'The reset PIN has expired. Please request a new one.',
          variant: 'destructive',
        });
        return false;
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Set new password after PIN verification
  const setNewPassword = async (email: string, password: string, pin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Verify PIN first
      const isValid = await verifyResetPin(email, pin);
      if (!isValid) {
        return false;
      }
      
      // Find user by email to get auth ID
      const { data, error } = await supabase
        .from('customer_users')
        .select('auth_id')
        .eq('email', email)
        .single();
        
      if (error) {
        throw new Error(handleSupabaseError(error, 'find user'));
      }
      
      // Update password in auth.users
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        data.auth_id,
        { password: password }
      );
      
      if (updateError) {
        throw new Error(updateError.message);
      }
      
      // Clear reset PIN data
      const { error: clearPinError } = await supabase
        .from('customer_users')
        .update({
          reset_pin: null,
          reset_pin_expiry: null
        })
        .eq('email', email);
        
      if (clearPinError) {
        console.error('Error clearing reset PIN:', clearPinError);
      }
      
      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Update customer profile
  const updateProfile = async (data: Partial<CustomerUser>): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    if (!customerUser?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('customer_users')
        .update(convertToSupabaseCustomerUser({
          ...customerUser,
          ...data
        }))
        .eq('id', customerUser.id);
        
      if (error) {
        throw new Error(handleSupabaseError(error, 'update profile'));
      }
      
      // Update local state
      setCustomerUser(prev => prev ? { ...prev, ...data } : null);
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully.',
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue = {
    session,
    user,
    customerUser,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    verifyResetPin,
    setNewPassword,
    updateProfile
  };

  return (
    <CustomerAuthContext.Provider value={contextValue}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthContext;
