
import { supabase } from '@/integrations/supabase/client';
import { Referral } from '@/types/customer.types';

export const referralsService = {
  // Get referrals made by a customer
  async getCustomerReferrals(customerId: string): Promise<Referral[]> {
    // Get referrals with referred customer details joined
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        id,
        referrer_id,
        referred_id,
        status,
        created_at,
        converted_at,
        points_earned,
        customers!referred_id (
          name,
          email
        )
      `)
      .eq('referrer_id', customerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching referrals:', error);
      throw new Error(error.message);
    }
    
    // Transform the data to match our Referral type
    const referrals = data.map((item: any) => ({
      id: item.id,
      referrer_id: item.referrer_id,
      referred_id: item.referred_id,
      referred_name: item.customers ? item.customers.name : 'Unknown',
      referred_email: item.customers ? item.customers.email : '',
      status: item.status,
      created_at: item.created_at,
      converted_at: item.converted_at,
      points_earned: item.points_earned
    }));
    
    return referrals as Referral[];
  },
  
  // Get referral stats
  async getReferralStats(customerId: string): Promise<{ 
    total: number; 
    pending: number; 
    completed: number;
    totalPointsEarned: number;
  }> {
    const { data, error } = await supabase
      .from('referrals')
      .select('status, points_earned')
      .eq('referrer_id', customerId);
      
    if (error) {
      console.error('Error fetching referral stats:', error);
      throw new Error(error.message);
    }
    
    const total = data.length;
    const pending = data.filter(r => r.status === 'pending').length;
    const completed = data.filter(r => r.status === 'completed').length;
    const totalPointsEarned = data.reduce((sum, r) => sum + (r.points_earned || 0), 0);
    
    return {
      total,
      pending,
      completed,
      totalPointsEarned
    };
  },
  
  // Complete referral (admin)
  async completeReferral(referralId: string, pointsEarned: number = 50): Promise<void> {
    // Get the referral
    const { data: referral, error: referralError } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('id', referralId)
      .single();
      
    if (referralError || !referral) {
      console.error('Error fetching referral:', referralError);
      throw new Error(referralError?.message || 'Referral not found');
    }
    
    // Update referral status
    const { error: updateError } = await supabase
      .from('referrals')
      .update({
        status: 'completed',
        converted_at: new Date().toISOString(),
        points_earned: pointsEarned
      })
      .eq('id', referralId);
      
    if (updateError) {
      console.error('Error updating referral:', updateError);
      throw new Error(updateError.message);
    }
    
    // Add points to referrer
    const { error: pointsError } = await supabase.rpc('add_loyalty_points', { 
      customer_id: referral.referrer_id, 
      points_to_add: pointsEarned
    });
    
    if (pointsError) {
      console.error('Error adding loyalty points:', pointsError);
      throw new Error(pointsError.message);
    }
    
    // Record loyalty transaction
    await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: referral.referrer_id,
        points: pointsEarned,
        source: 'referral',
        description: `Referral bonus points`
      });
  }
};
