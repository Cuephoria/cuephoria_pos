
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';
import { showErrorToast, showSuccessToast } from '@/utils/toast-utils';
import { CustomerProfile, RedeemedReward } from '@/types/customer.types';

interface CustomerAuthContextType {
  session: Session | null;
  user: CustomerProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name: string, phone: string, resetPin: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  redeemPoints: (rewardId: string, pointsCost: number) => Promise<string | null>;
  getReferralCode: () => Promise<string>;
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
  redeemPoints: async () => null,
  getReferralCode: async () => '',
});

export const CustomerAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const generateRandomCode = (length = 8) => {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  };

  const fetchProfile = async (userId: string) => {
    try {
      let { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', userId)
        .single();

      if (customerError || !customer) {
        const { data: emailCustomer, error: emailError } = await supabase
          .from('customers')
          .select('*')
          .eq('email', session?.user.email)
          .single();
          
        if (!emailError && emailCustomer) {
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
        // Use type assertion for customer properties that aren't in the type definition
        const customerData = customer as any;
        
        const redeemedRewards = customerData.redeemed_rewards 
          ? customerData.redeemed_rewards.map((reward: any) => ({
              id: reward.id,
              name: reward.name,
              points: reward.points,
              redemptionCode: reward.redemption_code,
              redeemedAt: new Date(reward.redeemed_at)
            }))
          : [];
        
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
          membershipHoursLeft: customer.membership_hours_left,
          resetPin: customerData.reset_pin,
          referralCode: customerData.referral_code,
          referredByCode: customerData.referred_by_code,
          redeemedRewards: redeemedRewards
        });
      } else {
        console.log("No customer profile found for this user");
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
        
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
        showErrorToast('Login failed', error.message);
        return false;
      }
      
      if (data.session?.user) {
        await fetchProfile(data.session.user.id);
        
        showSuccessToast('Login successful', 'Welcome back!');
        return true;
      }
      
      return false;
    } catch (error) {
      showErrorToast('Login failed', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, phone: string, resetPin: string, referralCode?: string) => {
    try {
      setIsLoading(true);
      
      const { data: existingCustomers, error: checkError } = await supabase
        .from('customers')
        .select('*')
        .or(`phone.eq.${phone},email.eq.${email}`);
      
      if (checkError) {
        console.error('Error checking existing customers:', checkError);
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        showErrorToast('Sign up failed', error.message);
        return false;
      }
      
      if (data.user) {
        // Generate a unique referral code for this new user
        const newReferralCode = generateRandomCode();
        
        // Check if referral code exists and is valid
        let referrerData = null;
        if (referralCode) {
          const { data: referrerCheck } = await supabase
            .from('customers')
            .select('id')
            .eq('referral_code', referralCode)
            .single();
            
          if (referrerCheck) {
            referrerData = referrerCheck;
          }
        }
        
        if (existingCustomers && existingCustomers.length > 0) {
          // Type the updateData explicitly
          const updateData: Record<string, any> = { 
            id: data.user.id,
            reset_pin: resetPin,
            referral_code: newReferralCode
          };
          
          if (referrerData) {
            updateData.referred_by_code = referralCode;
          }
          
          await supabase
            .from('customers')
            .update(updateData)
            .eq(email ? 'email' : 'phone', email || phone);
            
          await fetchProfile(data.user.id);
        } else {
          // Type the newCustomer explicitly
          const newCustomer: Record<string, any> = {
            id: data.user.id,
            name,
            email,
            phone,
            created_at: new Date().toISOString(),
            loyalty_points: 0,
            total_spent: 0,
            total_play_time: 0,
            is_member: false,
            reset_pin: resetPin,
            referral_code: newReferralCode,
          };
          
          if (referrerData) {
            newCustomer.referred_by_code = referralCode;
          }
          
          await supabase
            .from('customers')
            .insert([newCustomer]);
          
          setUser({
            id: data.user.id,
            email,
            name,
            phone,
            loyaltyPoints: 0,
            totalSpent: 0,
            totalPlayTime: 0,
            isMember: false,
            resetPin,
            referralCode: newReferralCode,
            referredByCode: referrerData ? referralCode : undefined
          });
        }
        
        // If referral code was provided and valid, store the referral record using RPC
        if (referrerData) {
          try {
            // Using RPC to handle custom tables not in the TypeScript definitions
            await supabase.rpc('create_referral', {
              p_referrer_id: referrerData.id,
              p_referee_id: data.user.id,
              p_code: referralCode
            });
          } catch (referralError) {
            console.error('Error creating referral record:', referralError);
          }
        }
        
        showSuccessToast('Account created', 'Welcome to Cuephoria!');
        return true;
      }
      
      return false;
    } catch (error: any) {
      showErrorToast('Sign up failed', error.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const getReferralCode = async () => {
    if (!user?.id) return '';
    
    // If user already has a referral code, return it
    if (user.referralCode) return user.referralCode;
    
    // Otherwise generate a new one
    const referralCode = generateRandomCode();
    
    try {
      // Create an object with the referral code
      const updateData: Record<string, any> = {
        referral_code: referralCode
      };
      
      await supabase
        .from('customers')
        .update(updateData)
        .eq('id', user.id);
        
      setUser(prev => prev ? { ...prev, referralCode } : null);
      return referralCode;
    } catch (error) {
      console.error('Error generating referral code:', error);
      return '';
    }
  };

  const redeemPoints = async (rewardId: string, pointsCost: number): Promise<string | null> => {
    if (!user || !user.id) return null;
    
    if (user.loyaltyPoints < pointsCost) {
      showErrorToast('Insufficient points', 'You do not have enough loyalty points for this reward.');
      return null;
    }
    
    try {
      // Get reward details using RPC
      const { data: rewardData, error: rewardError } = await supabase.rpc('get_reward_by_id', {
        p_reward_id: rewardId
      });
      
      if (rewardError || !rewardData || rewardData.length === 0) {
        showErrorToast('Error', 'Could not find reward details');
        return null;
      }
      
      // Generate a random redemption code
      const redemptionCode = generateRandomCode(6);
      
      // Create redemption record
      const redemption = {
        id: rewardId,
        name: rewardData[0].name,
        points: pointsCost,
        redemption_code: redemptionCode,
        redeemed_at: new Date().toISOString()
      };
      
      // Update customer's points and add redemption record
      const updatedPoints = user.loyaltyPoints - pointsCost;
      const updatedRedemptions = [...(user.redeemedRewards || []), {
        id: rewardId,
        name: rewardData[0].name,
        points: pointsCost,
        redemptionCode,
        redeemedAt: new Date()
      }];
      
      // Create the update object
      const updateData: Record<string, any> = {
        loyalty_points: updatedPoints,
        redeemed_rewards: updatedRedemptions.map(r => ({
          id: r.id,
          name: r.name,
          points: r.points,
          redemption_code: r.redemptionCode,
          redeemed_at: r.redeemedAt.toISOString()
        }))
      };
      
      const { error: updateError } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', user.id);
      
      if (updateError) {
        showErrorToast('Error', 'Failed to redeem points');
        return null;
      }
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          loyaltyPoints: updatedPoints,
          redeemedRewards: updatedRedemptions
        };
      });
      
      showSuccessToast('Points Redeemed!', `You've successfully redeemed ${pointsCost} points`);
      return redemptionCode;
    } catch (error) {
      console.error('Error redeeming points:', error);
      showErrorToast('Error', 'Something went wrong while redeeming points');
      return null;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      showSuccessToast('Logged out', 'You have been logged out successfully.');
    } catch (error: any) {
      showErrorToast('Logout failed', error.message);
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
        redeemPoints,
        getReferralCode,
      }}
    >
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  return useContext(CustomerAuthContext);
};
