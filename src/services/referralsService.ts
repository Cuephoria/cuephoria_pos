
import { supabase } from '@/integrations/supabase/client';
import { Referral } from '@/types/customer.types';

export const referralsService = {
  // Get referrals made by a customer
  async getCustomerReferrals(customerId: string): Promise<Referral[]> {
    const { data, error } = await supabase
      .rpc('get_customer_referrals', {
        referrer_id: customerId
      });
      
    if (error) {
      console.error('Error fetching referrals:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as Referral[];
  },
  
  // Find referrer by referral code
  async findReferrerByCode(referralCode: string): Promise<{
    customerId: string;
    name: string;
    email: string;
  } | null> {
    const { data, error } = await supabase
      .rpc('find_referrer_by_code', {
        code: referralCode
      });
      
    if (error) {
      console.error('Error finding referrer:', error);
      throw new Error(error.message);
    }
    
    if (!data) return null;
    
    return {
      customerId: data.customer_id,
      name: data.name,
      email: data.email
    };
  },
  
  // Create a new referral
  async createReferral(
    referrerId: string,
    referredId: string,
    referredName: string,
    referredEmail: string
  ): Promise<boolean> {
    const { error } = await supabase
      .rpc('create_referral', {
        referrer_id: referrerId,
        referred_id: referredId,
        referred_name: referredName,
        referred_email: referredEmail
      });
      
    if (error) {
      console.error('Error creating referral:', error);
      throw new Error(error.message);
    }
    
    return true;
  }
};
