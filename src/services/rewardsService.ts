
import { supabase } from "@/integrations/supabase/client";
import { Promotion, Reward } from "@/types/customer.types";

export const fetchAvailableRewards = async (): Promise<Reward[]> => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .select('*')
      .eq('is_active', true)
      .order('points_required', { ascending: true });
    
    if (error) throw error;
    
    return data.map((reward) => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      pointsRequired: reward.points_required,
      isActive: reward.is_active
    }));
  } catch (error) {
    console.error('Error fetching rewards:', error);
    return [];
  }
};

export const fetchActivePromotions = async (): Promise<Promotion[]> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .or(`ends_at.gt.${now},ends_at.is.null`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((promo) => ({
      id: promo.id,
      title: promo.title,
      description: promo.description,
      discountPercentage: promo.discount_percentage,
      discountAmount: promo.discount_amount,
      code: promo.code,
      startsAt: new Date(promo.starts_at),
      endsAt: promo.ends_at ? new Date(promo.ends_at) : undefined,
      isActive: promo.is_active
    }));
  } catch (error) {
    console.error('Error fetching promotions:', error);
    return [];
  }
};

export const addReferralPoints = async (billId: string, customerId: string): Promise<boolean> => {
  try {
    // First check if this is the customer's first bill
    const { count, error: countError } = await supabase
      .from('bills')
      .select('id', { count: 'exact', head: true })
      .eq('customer_id', customerId);
      
    if (countError) throw countError;
    
    // If not the first bill, don't proceed
    if ((count || 0) > 1) return false;
    
    // Check if customer was referred
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .select('referred_by_code')
      .eq('id', customerId)
      .single();
      
    if (customerError || !customerData?.referred_by_code) return false;
    
    // Find the referrer using the code
    const { data: referrer, error: referrerError } = await supabase
      .from('customers')
      .select('id, loyalty_points')
      .eq('referral_code', customerData.referred_by_code)
      .single();
      
    if (referrerError || !referrer) return false;
    
    // Update the referral record
    const { error: updateReferralError } = await supabase
      .from('referrals')
      .update({ points_awarded: true })
      .match({ referee_id: customerId, referrer_id: referrer.id });
      
    if (updateReferralError) throw updateReferralError;
    
    // Award 100 points to the referrer
    const newPoints = (referrer.loyalty_points || 0) + 100;
    const { error: updatePointsError } = await supabase
      .from('customers')
      .update({ loyalty_points: newPoints })
      .eq('id', referrer.id);
      
    if (updatePointsError) throw updatePointsError;
    
    // Also give 50 points to the new customer
    const { data: newCustomer, error: newCustomerError } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', customerId)
      .single();
      
    if (newCustomerError) throw newCustomerError;
    
    const newCustomerPoints = (newCustomer.loyalty_points || 0) + 50;
    const { error: updateNewCustomerError } = await supabase
      .from('customers')
      .update({ loyalty_points: newCustomerPoints })
      .eq('id', customerId);
      
    if (updateNewCustomerError) throw updateNewCustomerError;
    
    return true;
  } catch (error) {
    console.error('Error processing referral points:', error);
    return false;
  }
};

export const createReward = async (reward: Omit<Reward, 'id'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('rewards')
      .insert({
        name: reward.name,
        description: reward.description,
        points_required: reward.pointsRequired,
        is_active: reward.isActive
      })
      .select('id')
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating reward:', error);
    return null;
  }
};

export const updateReward = async (id: string, reward: Partial<Reward>): Promise<boolean> => {
  try {
    const updateObj: any = {};
    if (reward.name !== undefined) updateObj.name = reward.name;
    if (reward.description !== undefined) updateObj.description = reward.description;
    if (reward.pointsRequired !== undefined) updateObj.points_required = reward.pointsRequired;
    if (reward.isActive !== undefined) updateObj.is_active = reward.isActive;
    
    const { error } = await supabase
      .from('rewards')
      .update(updateObj)
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating reward:', error);
    return false;
  }
};

export const createPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .insert({
        title: promotion.title,
        description: promotion.description,
        discount_percentage: promotion.discountPercentage,
        discount_amount: promotion.discountAmount,
        code: promotion.code,
        starts_at: promotion.startsAt.toISOString(),
        ends_at: promotion.endsAt?.toISOString(),
        is_active: promotion.isActive
      })
      .select('id')
      .single();
      
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating promotion:', error);
    return null;
  }
};

export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<boolean> => {
  try {
    const updateObj: any = {};
    if (promotion.title !== undefined) updateObj.title = promotion.title;
    if (promotion.description !== undefined) updateObj.description = promotion.description;
    if (promotion.discountPercentage !== undefined) updateObj.discount_percentage = promotion.discountPercentage;
    if (promotion.discountAmount !== undefined) updateObj.discount_amount = promotion.discountAmount;
    if (promotion.code !== undefined) updateObj.code = promotion.code;
    if (promotion.startsAt !== undefined) updateObj.starts_at = promotion.startsAt.toISOString();
    if (promotion.endsAt !== undefined) updateObj.ends_at = promotion.endsAt.toISOString();
    if (promotion.isActive !== undefined) updateObj.is_active = promotion.isActive;
    
    const { error } = await supabase
      .from('promotions')
      .update(updateObj)
      .eq('id', id);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating promotion:', error);
    return false;
  }
};
