
import { supabase } from '@/integrations/supabase/client';
import { CustomerSession, LoyaltyTransaction } from '@/types/customer.types';
import { Customer } from '@/types/pos.types';

export const customerService = {
  // Get customer by ID
  async getCustomerProfile(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .rpc('get_customer_by_id', { customer_id: customerId });
      
    if (error) {
      console.error('Error fetching customer:', error);
      throw new Error(error.message);
    }
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      isMember: data.is_member,
      membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
      membershipStartDate: data.membership_start_date ? new Date(data.membership_start_date) : undefined,
      membershipPlan: data.membership_plan || undefined,
      membershipHoursLeft: data.membership_hours_left || undefined,
      membershipDuration: data.membership_duration as 'weekly' | 'monthly' | undefined,
      loyaltyPoints: data.loyalty_points,
      totalSpent: data.total_spent,
      totalPlayTime: data.total_play_time,
      createdAt: new Date(data.created_at)
    };
  },
  
  // Get customer sessions
  async getCustomerSessions(customerId: string, limit: number = 10): Promise<CustomerSession[]> {
    const { data, error } = await supabase
      .rpc('get_customer_sessions', {
        customer_id: customerId,
        results_limit: limit
      });
      
    if (error) {
      console.error('Error fetching customer sessions:', error);
      throw new Error(error.message);
    }
    
    return data as CustomerSession[];
  },
  
  // Get loyalty transactions
  async getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    const { data, error } = await supabase
      .rpc('get_loyalty_transactions', {
        customer_id: customerId
      });
      
    if (error) {
      console.error('Error fetching loyalty transactions:', error);
      throw new Error(error.message);
    }
    
    return data as LoyaltyTransaction[];
  }
};
