
import { supabase } from '@/integrations/supabase/client';
import { Referral } from '@/types/customer.types';

interface InviteFriendParams {
  referrerId: string;
  referrerName: string;
  referralCode: string;
  friendName: string;
  friendEmail: string;
}

export const referralsService = {
  // Get referrals for a customer
  async getReferrals(customerId: string): Promise<Referral[]> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_id', customerId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching referrals:', error);
      throw new Error(error.message);
    }
    
    return data as Referral[];
  },
  
  // Invite a friend via email
  async inviteFriend({ referrerId, referrerName, referralCode, friendName, friendEmail }: InviteFriendParams): Promise<void> {
    try {
      // In a real application, you would send an email here
      // For demo purposes, we'll just log the invitation
      console.log(`Invitation from ${referrerName} (${referrerId}) to ${friendName} (${friendEmail}) with code ${referralCode}`);
      
      // Return success
      return Promise.resolve();
    } catch (error: any) {
      console.error('Error inviting friend:', error);
      throw new Error(error.message || 'Failed to send invitation');
    }
  },
  
  // Complete a referral (usually called when referred user makes first purchase)
  async completeReferral(referralId: string, pointsEarned: number = 150): Promise<void> {
    const { error } = await supabase
      .from('referrals')
      .update({
        status: 'completed',
        converted_at: new Date().toISOString(),
        points_earned: pointsEarned
      })
      .eq('id', referralId);
      
    if (error) {
      console.error('Error completing referral:', error);
      throw new Error(error.message);
    }
  },
  
  // Check if an email has been referred
  async checkReferralByEmail(email: string): Promise<Referral | null> {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_email', email)
      .single();
      
    if (error && error.code !== 'PGRST116') { // Not found error
      console.error('Error checking referral:', error);
      throw new Error(error.message);
    }
    
    return data as Referral | null;
  }
};
