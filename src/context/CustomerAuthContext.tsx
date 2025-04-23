
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';

interface CustomerProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  loyaltyPoints: number;
  totalSpent: number;
  totalPlayTime: number;
  isMember: boolean;
  membershipPlan?: string;
  membershipExpiryDate?: Date;
  membershipStartDate?: Date;
  membershipHoursLeft?: number;
}

interface CustomerAuthContextType {
  session: Session | null;
  user: CustomerProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, phone: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  login: async () => false,
  signUp: async () => false,
  logout: async () => {},
  isAuthenticated: false,
  refreshProfile: async () => {},
});

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Function to fetch customer profile data
  const fetchProfile = async (userId: string) => {
    try {
      // First try to find in customers table (POS customers)
      let { data: posCustomer, error: posError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', session?.user.email)
        .single();

      if (posError || !posCustomer) {
        // If not found in POS customers, try to find by auth ID
        // Since `customer_profiles` is not in the type definition yet, we need to use a workaround
        // We'll use a type assertion here
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          setUser({
            id: data.id,
            email: session?.user.email || '',
            name: data.name,
            phone: data.phone,
            loyaltyPoints: data.loyalty_points || 0,
            totalSpent: data.total_spent || 0,
            totalPlayTime: data.total_play_time || 0,
            isMember: data.is_member || false,
            membershipPlan: data.membership_plan,
            membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
            membershipStartDate: data.membership_start_date ? new Date(data.membership_start_date) : undefined,
            membershipHoursLeft: data.membership_hours_left
          });
        }
      } else {
        // Handle POS customer data
        setUser({
          id: userId,
          email: session?.user.email || '',
          name: posCustomer.name,
          phone: posCustomer.phone,
          loyaltyPoints: posCustomer.loyalty_points || 0,
          totalSpent: posCustomer.total_spent || 0,
          totalPlayTime: posCustomer.total_play_time || 0,
          isMember: posCustomer.is_member || false,
          membershipPlan: posCustomer.membership_plan,
          membershipExpiryDate: posCustomer.membership_expiry_date ? new Date(posCustomer.membership_expiry_date) : undefined,
          membershipStartDate: posCustomer.membership_start_date ? new Date(posCustomer.membership_start_date) : undefined,
          membershipHoursLeft: posCustomer.membership_hours_left
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Check for session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
        
        // Set up listener for auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (_event, newSession) => {
            setSession(newSession);
            
            if (newSession?.user) {
              await fetchProfile(newSession.user.id);
            } else {
              setUser(null);
            }
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  const refreshProfile = async () => {
    if (session?.user) {
      await fetchProfile(session.user.id);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
        
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      setIsLoading(true);
      
      // Check if phone or email already exists in POS customers
      const { data: existingCustomers, error: checkError } = await supabase
        .from('customers')
        .select('*')
        .or(`phone.eq.${phone},email.eq.${email}`);
      
      if (checkError) {
        console.error('Error checking existing customers:', checkError);
      }
      
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        toast({
          title: 'Sign up failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }
      
      if (data.user) {
        // If we found a matching customer in POS
        if (existingCustomers && existingCustomers.length > 0) {
          // Update the existing customer with auth ID
          await supabase
            .from('customers')
            .update({ id: data.user.id })
            .eq(email ? 'email' : 'phone', email || phone);
            
          await fetchProfile(data.user.id);
        } else {
          // Create new customer profile using a type assertion
          await supabase.from('customer_profiles').insert({
            id: data.user.id,
            name,
            email,
            phone,
            created_at: new Date().toISOString(),
            loyalty_points: 0,
            total_spent: 0,
            total_play_time: 0,
            is_member: false
          });
          
          // Set user data
          setUser({
            id: data.user.id,
            email,
            name,
            phone,
            loyaltyPoints: 0,
            totalSpent: 0,
            totalPlayTime: 0,
            isMember: false
          });
        }
        
        toast({
          title: 'Account created',
          description: 'Welcome to Cuephoria!',
        });
        return true;
      }
      
      return false;
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <CustomerAuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        login,
        signUp,
        logout,
        isAuthenticated: !!user,
        refreshProfile,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  return useContext(CustomerAuthContext);
};
