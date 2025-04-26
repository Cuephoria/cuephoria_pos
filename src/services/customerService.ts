
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types/pos.types';
import { CustomerProfile, CustomerSession } from '@/types/customer.types';

export const getCustomerProfile = async (customerId: string): Promise<CustomerProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .single();
      
    if (error || !data) {
      console.error('Error fetching customer profile:', error);
      return null;
    }
    
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
      createdAt: new Date(data.created_at),
      referralCode: data.referral_code || ''
    };
  } catch (error) {
    console.error('Error in getCustomerProfile:', error);
    return null;
  }
};

export const getCustomerSessions = async (customerId: string): Promise<CustomerSession[]> => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        start_time,
        end_time,
        duration,
        stations (id, name, type, hourly_rate)
      `)
      .eq('customer_id', customerId)
      .order('start_time', { ascending: false });
      
    if (error) {
      console.error('Error fetching customer sessions:', error);
      return [];
    }
    
    return data.map(session => ({
      id: session.id,
      stationId: session.stations.id,
      stationName: session.stations.name,
      stationType: session.stations.type,
      startTime: new Date(session.start_time),
      endTime: session.end_time ? new Date(session.end_time) : undefined,
      duration: session.duration,
      hourlyRate: session.stations.hourly_rate,
      totalCost: session.duration ? (session.stations.hourly_rate * (session.duration / 60)) : 0
    }));
  } catch (error) {
    console.error('Error in getCustomerSessions:', error);
    return [];
  }
};

export const getLoyaltyTransactions = async (customerId: string) => {
  try {
    const { data, error } = await supabase
      .from('loyalty_transactions')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching loyalty transactions:', error);
      return [];
    }
    
    return data.map(transaction => ({
      id: transaction.id,
      points: transaction.points,
      source: transaction.source,
      description: transaction.description,
      createdAt: new Date(transaction.created_at)
    }));
  } catch (error) {
    console.error('Error in getLoyaltyTransactions:', error);
    return [];
  }
};
