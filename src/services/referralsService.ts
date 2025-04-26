
import { supabase } from '@/integrations/supabase/client';
import { Referral } from '@/types/customer.types';

export const getReferrals = async (customerId: string) => {
  try {
    // Get referrals where user is the referrer
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        referred:customers!referred_id (id, name, email)
      `)
      .eq('referrer_id', customerId);
      
    if (error) {
      console.error('Error fetching referrals:', error);
      return [];
    }
    
    return data.map(referral => ({
      id: referral.id,
      referrerId: referral.referrer_id,
      referredId: referral.referred_id,
      referredName: referral.referred.name,
      referredEmail: referral.referred.email,
      status: referral.status,
      pointsAwarded: referral.points_awarded,
      createdAt: new Date(referral.created_at)
    }));
  } catch (error) {
    console.error('Error in getReferrals:', error);
    return [];
  }
};

export const getReferralByCode = async (referralCode: string) => {
  try {
    // First get user associated with referral code
    const { data: userData, error: userError } = await supabase
      .from('customer_users')
      .select('*')
      .eq('referral_code', referralCode)
      .single();
      
    if (userError || !userData) {
      return null;
    }
    
    // Then get customer info
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', userData.customer_id)
      .single();
      
    if (customerError || !customerData) {
      return null;
    }
    
    return {
      customerId: userData.customer_id,
      name: customerData.name,
      email: customerData.email,
      referralCode: userData.referral_code
    };
  } catch (error) {
    console.error('Error in getReferralByCode:', error);
    return null;
  }
};

export const completeReferral = async (referralId: string, points: number = 100) => {
  try {
    // Update referral status
    const { error: referralError } = await supabase
      .from('referrals')
      .update({
        status: 'completed',
        points_awarded: points
      })
      .eq('id', referralId);
      
    if (referralError) {
      console.error('Error completing referral:', referralError);
      return false;
    }
    
    // Get referral details to award points to referrer
    const { data: referral, error: getError } = await supabase
      .from('referrals')
      .select('referrer_id')
      .eq('id', referralId)
      .single();
      
    if (getError || !referral) {
      console.error('Error getting referral details:', getError);
      return false;
    }
    
    // Get current points for referrer
    const { data: referrer, error: referrerError } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', referral.referrer_id)
      .single();
      
    if (referrerError || !referrer) {
      console.error('Error getting referrer details:', referrerError);
      return false;
    }
    
    // Update referrer's points
    const { error: pointsError } = await supabase
      .from('customers')
      .update({
        loyalty_points: referrer.loyalty_points + points
      })
      .eq('id', referral.referrer_id);
      
    if (pointsError) {
      console.error('Error updating referrer points:', pointsError);
      return false;
    }
    
    // Create loyalty transaction record
    const { error: transactionError } = await supabase
      .from('loyalty_transactions')
      .insert([{
        customer_id: referral.referrer_id,
        points: points,
        source: 'referral',
        description: 'Referral bonus'
      }]);
      
    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // In a real system, we'd need to handle rollback here
    }
    
    return true;
  } catch (error) {
    console.error('Error in completeReferral:', error);
    return false;
  }
};
