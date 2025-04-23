
import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isMember: boolean;
  membershipPlan?: string;
  membershipDuration?: 'weekly' | 'monthly';
  membershipHoursLeft?: number;
  membershipStartDate?: Date;
  membershipExpiryDate?: Date;
  loyaltyPoints: number;
  totalSpent: number;
  totalPlayTime: number;
  referralCode?: string;
  createdAt: Date;
  badges?: string[];
  authUserId?: string;
};

type CustomerAuthContextType = {
  user: CustomerUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<CustomerUser | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const CustomerAuthContext = createContext<CustomerAuthContextType>({
  user: null,
  isLoading: true,
  login: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
});

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Convert Supabase customer object to our CustomerUser type
  const transformCustomerData = (data: any): CustomerUser => ({
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone,
    isMember: data.is_member,
    membershipPlan: data.membership_plan || undefined,
    membershipDuration: data.membership_duration as 'weekly' | 'monthly' | undefined,
    membershipHoursLeft: data.membership_hours_left || undefined,
    membershipStartDate: data.membership_start_date ? new Date(data.membership_start_date) : undefined,
    membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
    loyaltyPoints: data.loyalty_points,
    totalSpent: data.total_spent,
    totalPlayTime: data.total_play_time,
    referralCode: data.referral_code,
    createdAt: new Date(data.created_at),
    badges: data.badges,
    authUserId: data.auth_user_id,
  });

  const fetchUserData = async (authUserId: string) => {
    try {
      // Get customer by auth user ID
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('No customer found');

      return transformCustomerData(data);
    } catch (error) {
      console.error('Error fetching customer data:', error);
      return null;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Using a simpler approach to avoid deep type instantiation issues
        const response = await supabase.auth.getSession();
        const currentUser = response.data.session?.user;

        if (currentUser) {
          const userData = await fetchUserData(currentUser.id);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchUserData(session.user.id);
        setUser(userData);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      // Simplifying session access to avoid deep type issues
      const response = await supabase.auth.getSession();
      const currentUser = response.data.session?.user;
      
      if (!currentUser) {
        throw new Error('Login failed - no session created');
      }

      // Fetch customer data associated with this auth user
      const userData = await fetchUserData(currentUser.id);
      
      if (!userData) {
        // Log out if no customer record found
        await supabase.auth.signOut();
        throw new Error('No customer account found for this login');
      }
      
      setUser(userData);
      return userData;
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
      });
      return null;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast({
        title: "Logged out",
        description: "You've been successfully logged out",
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: error.message || "An unexpected error occurred",
      });
    }
  };

  const refreshUser = async () => {
    if (!user?.authUserId) return;
    
    try {
      const userData = await fetchUserData(user.authUserId);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
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
