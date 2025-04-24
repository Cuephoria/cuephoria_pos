
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
      // Try to find in customers table (POS customers) by auth ID
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

      // If not found by ID, try to find by email
      if (customerError || !customer) {
        const { data: emailCustomer, error: emailError } = await supabase
          .from('customers')
          .select('*')
          .eq('email', session?.user.email)
          .single();
          
        if (!emailError && emailCustomer) {
          // If found by email but ID doesn't match, update the customer ID to link with auth
          if (emailCustomer.id !== userId) {
            await supabase
              .from('customers')
              .update({ id: userId })
              .eq('email', session?.user.email);
              
            emailCustomer.id = userId;
          }
          
          customer = emailCustomer;
        }
      }

      if (customer) {
        setUser({
          id: customer.id,
          email: session?.user.email || '',
          name: customer.name,
          phone: customer.phone,
          loyaltyPoints: customer.loyalty_points || 0,
          totalSpent: customer.total_spent || 0,
          totalPlayTime: customer.total_play_time || 0,
          isMember: customer.is_member || false,
          membershipPlan: customer.membership_plan,
          membershipExpiryDate: customer.membership_expiry_date ? new Date(customer.membership_expiry_date) : undefined,
          membershipStartDate: customer.membership_start_date ? new Date(customer.membership_start_date) : undefined,
          membershipHoursLeft: customer.membership_hours_left
        });
      } else {
        // No customer record found - this is a new user
        console.log("No customer profile found for this user");
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
          // Create new customer record
          const newCustomer = {
            id: data.user.id,
            name,
            email,
            phone,
            created_at: new Date().toISOString(),
            loyalty_points: 0,
            total_spent: 0,
            total_play_time: 0,
            is_member: false
          };
          
          await supabase.from('customers').insert([newCustomer]);
          
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
