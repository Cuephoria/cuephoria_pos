
import { supabase } from '@/integrations/supabase/client';
import { CustomerSession, LoyaltyTransaction } from '@/types/customer.types';
import { Customer } from '@/types/pos.types';

export const customerService = {
  // Get customer by ID
  async getCustomerProfile(customerId: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
      
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
      .from('sessions')
      .select(`
        id,
        start_time,
        end_time,
        duration,
        stations (
          name, 
          type,
          hourly_rate
        )
      `)
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching customer sessions:', error);
      throw new Error(error.message);
    }
    
    // Transform the data to match our CustomerSession type
    const sessions = data.map((item: any) => ({
      id: item.id,
      station_name: item.stations?.name || 'Unknown',
      station_type: item.stations?.type || 'Unknown',
      start_time: item.start_time,
      end_time: item.end_time,
      duration: item.duration || 0,
      cost: item.stations?.hourly_rate 
        ? ((item.duration || 0) / 60) * item.stations.hourly_rate 
        : 0
    }));
    
    return sessions as CustomerSession[];
  },
  
  // Get loyalty transactions
  async getLoyaltyTransactions(customerId: string): Promise<LoyaltyTransaction[]> {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching loyalty transactions:', error);
      throw new Error(error.message);
    }
    
    return data as LoyaltyTransaction[];
  }
};
