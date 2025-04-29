
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
  signUp: (email: string, password: string, name: string, phone: string, pin: string, referralCode?: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  verifyPinAndResetPassword: (email: string, pin: string, newPassword?: string) => Promise<boolean>;
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
  verifyPinAndResetPassword: async () => false,
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

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            if (currentSession?.user) {
              setTimeout(async () => {
                const customerData = await fetchCustomerUser(currentSession.user.id);
                setCustomerUser(customerData);
              }, 0);
            } else {
              setCustomerUser(null);
            }
          }
        );

        // Then check for existing session
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
        if (!customerData) {
          toast({
            title: 'Customer account not found',
            description: 'Your account was not found in the customer database',
            variant: 'destructive',
          });
          await supabase.auth.signOut();
          return false;
        }
        
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

  const signUp = async (
    email: string, 
    password: string, 
    name: string, 
    phone: string,
    pin: string,
    referralCode?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    if (pin.length !== 4 || !/^\d+$/.test(pin)) {
      toast({
        title: 'Invalid PIN',
        description: 'PIN must be exactly 4 digits',
        variant: 'destructive',
      });
      setIsLoading(false);
      return false;
    }
    
    try {
      const { data: existingCustomers, error: customerError } = await supabase
        .from('customers')
        .select('id, email')
        .eq('email', email)
        .limit(1);
        
      if (customerError) {
        throw new Error(handleSupabaseError(customerError, 'customer lookup'));
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            phone,
            pin, // Store PIN in user metadata
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
        
        if (existingCustomers && existingCustomers.length > 0) {
          customerId = existingCustomers[0].id;
        } else {
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

        const newCustomerUser = {
          authId: data.user.id,
          customerId,
          email,
          referralCode: generateReferralCode(),
          resetPin: pin, 
          pin: pin, // Add pin field directly
          resetPinExpiry: null,
          createdAt: new Date()
        };
        
        const { error: customerUserError } = await supabase
          .from('customer_users')
          .insert(convertToSupabaseCustomerUser({
            ...newCustomerUser,
            id: undefined // Let Supabase generate the ID
          }));
          
        if (customerUserError) {
          throw new Error(handleSupabaseError(customerUserError, 'customer user creation'));
        }
        
        if (referrerId) {
          await processReferralReward(referrerId, email);
        }

        toast({
          title: 'Account created successfully!',
          description: 'Welcome to Cuephoria!',
        });
        
        // Fetch the newly created customer user to update state
        const customerData = await fetchCustomerUser(data.user.id);
        setCustomerUser(customerData);
        
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

  const processReferralReward = async (referrerId: string, referredEmail: string) => {
    const REFERRAL_POINTS = 100;
    
    try {
      const { data: referrer, error: referrerError } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', referrerId)
        .single();
        
      if (referrerError || !referrer) {
        console.error('Error getting referrer:', referrerError);
        return;
      }
      
      const updatedPoints = referrer.loyalty_points + REFERRAL_POINTS;
      const { error: updateError } = await supabase
        .from('customers')
        .update({ loyalty_points: updatedPoints })
        .eq('id', referrerId);
        
      if (updateError) {
        console.error('Error updating referrer points:', updateError);
        return;
      }
      
      await supabase
        .from('loyalty_transactions')
        .insert({
          customer_id: referrerId,
          points: REFERRAL_POINTS,
          source: 'referral',
          description: `Referral reward for inviting ${referredEmail}`
        });
        
      // Store referral data in Supabase
      if (referrerId) {
        await supabase
          .from('referrals')
          .insert({
            referrer_id: referrerId,
            referred_email: referredEmail,
            status: 'completed',
            points_awarded: REFERRAL_POINTS,
            created_at: new Date().toISOString(),
            completed_at: new Date().toISOString()
          });
      }
        
    } catch (err) {
      console.error('Error processing referral reward:', err);
    }
  };

  const generateReferralCode = (): string => {
    const uuid = generateId().split('-')[0];
    return `CUE-${uuid.substring(0, 6).toUpperCase()}`;
  };

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

  const verifyPinAndResetPassword = async (email: string, pin: string, newPassword?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // First check if user exists and verify PIN
      const { data: customerUserData, error: customerUserError } = await supabase
        .from('customer_users')
        .select('*')
        .eq('email', email)
        .single();
        
      if (customerUserError || !customerUserData) {
        toast({
          title: 'Account not found',
          description: 'No account found with that email address.',
          variant: 'destructive',
        });
        return false;
      }
      
      // Verify pin (check both pin and reset_pin fields for compatibility)
      if (customerUserData.pin !== pin && customerUserData.reset_pin !== pin) {
        toast({
          title: 'Invalid PIN',
          description: 'The security PIN you entered is incorrect.',
          variant: 'destructive',
        });
        return false;
      }
      
      // If only verifying PIN, return success
      if (!newPassword) {
        return true;
      }
      
      // If setting new password, update it
      const { data, error } = await supabase.auth.admin.updateUserById(
        customerUserData.auth_id,
        { password: newPassword }
      );
      
      if (error) {
        throw new Error(error.message);
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
    verifyPinAndResetPassword,
    updateProfile
  };

  return (
    <CustomerAuthContext.Provider value={contextValue}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export default CustomerAuthContext;
