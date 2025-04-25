
import { supabase } from "@/integrations/supabase/client";
import { Promotion, Reward } from "@/types/customer.types";

export const fetchAvailableRewards = async (): Promise<Reward[]> => {
  try {
    // Using rpc to handle the table not being in the TypeScript definition
    const { data, error } = await supabase.rpc('get_available_rewards');
    
    if (error) throw error;
    
    // Map the data to our Reward interface
    return data.map((reward: any) => ({
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
    
    // Using rpc to handle the table not being in the TypeScript definition
    const { data, error } = await supabase.rpc('get_active_promotions', {
      current_time: now
    });
    
    if (error) throw error;
    
    // Map the data to our Promotion interface
    return data.map((promo: any) => ({
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
    // Using RPC to handle referrals
    const { data, error } = await supabase.rpc('process_referral_points', {
      p_bill_id: billId,
      p_customer_id: customerId
    });
    
    if (error) throw error;
    
    return data || false;
  } catch (error) {
    console.error('Error processing referral points:', error);
    return false;
  }
};

export const createReward = async (reward: Omit<Reward, 'id'>): Promise<string | null> => {
  try {
    // Using RPC to handle the rewards table
    const { data, error } = await supabase.rpc('create_reward', {
      p_name: reward.name,
      p_description: reward.description,
      p_points_required: reward.pointsRequired,
      p_is_active: reward.isActive
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating reward:', error);
    return null;
  }
};

export const updateReward = async (id: string, reward: Partial<Reward>): Promise<boolean> => {
  try {
    const updateObj: Record<string, any> = {};
    if (reward.name !== undefined) updateObj.p_name = reward.name;
    if (reward.description !== undefined) updateObj.p_description = reward.description;
    if (reward.pointsRequired !== undefined) updateObj.p_points_required = reward.pointsRequired;
    if (reward.isActive !== undefined) updateObj.p_is_active = reward.isActive;
    
    updateObj.p_id = id;
    
    // Using RPC to handle the rewards table
    const { error } = await supabase.rpc('update_reward', updateObj);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating reward:', error);
    return false;
  }
};

export const createPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<string | null> => {
  try {
    // Using RPC to handle the promotions table
    const { data, error } = await supabase.rpc('create_promotion', {
      p_title: promotion.title,
      p_description: promotion.description,
      p_discount_percentage: promotion.discountPercentage,
      p_discount_amount: promotion.discountAmount,
      p_code: promotion.code,
      p_starts_at: promotion.startsAt.toISOString(),
      p_ends_at: promotion.endsAt?.toISOString(),
      p_is_active: promotion.isActive
    });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating promotion:', error);
    return null;
  }
};

export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<boolean> => {
  try {
    const updateObj: Record<string, any> = { p_id: id };
    if (promotion.title !== undefined) updateObj.p_title = promotion.title;
    if (promotion.description !== undefined) updateObj.p_description = promotion.description;
    if (promotion.discountPercentage !== undefined) updateObj.p_discount_percentage = promotion.discountPercentage;
    if (promotion.discountAmount !== undefined) updateObj.p_discount_amount = promotion.discountAmount;
    if (promotion.code !== undefined) updateObj.p_code = promotion.code;
    if (promotion.startsAt !== undefined) updateObj.p_starts_at = promotion.startsAt.toISOString();
    if (promotion.endsAt !== undefined) updateObj.p_ends_at = promotion.endsAt.toISOString();
    if (promotion.isActive !== undefined) updateObj.p_is_active = promotion.isActive;
    
    // Using RPC to handle the promotions table
    const { error } = await supabase.rpc('update_promotion', updateObj);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating promotion:', error);
    return false;
  }
};
