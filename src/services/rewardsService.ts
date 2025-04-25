
import { supabase } from "@/integrations/supabase/client";
import { Promotion, Reward } from "@/types/customer.types";

// Define a proper interface for RPC parameters that accepts any string key with any value
interface RpcParams {
  [key: string]: any;
}

export const fetchAvailableRewards = async (): Promise<Reward[]> => {
  try {
    // Using rpc with a properly typed empty params object
    const { data, error } = await supabase.rpc('get_available_rewards', {} as RpcParams);
    
    if (error) throw error;
    
    // Safely handle potentially null data
    if (!data) return [];
    
    // Explicitly type the response and use type assertion
    return (data as any[]).map((reward) => ({
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
    
    // Using rpc with properly typed params
    const params: RpcParams = { current_time: now };
    const { data, error } = await supabase.rpc('get_active_promotions', params);
    
    if (error) throw error;
    
    // Safely handle potentially null data
    if (!data) return [];
    
    // Explicitly type the response and use type assertion
    return (data as any[]).map((promo) => ({
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
    // Using RPC with properly typed params
    const params: RpcParams = {
      p_bill_id: billId,
      p_customer_id: customerId
    };
    
    const { data, error } = await supabase.rpc('process_referral_points', params);
    
    if (error) throw error;
    
    return data || false;
  } catch (error) {
    console.error('Error processing referral points:', error);
    return false;
  }
};

export const createReward = async (reward: Omit<Reward, 'id'>): Promise<string | null> => {
  try {
    // Using RPC with properly typed params
    const params: RpcParams = {
      p_name: reward.name,
      p_description: reward.description,
      p_points_required: reward.pointsRequired,
      p_is_active: reward.isActive
    };
    
    const { data, error } = await supabase.rpc('create_reward', params);
    
    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error creating reward:', error);
    return null;
  }
};

export const updateReward = async (id: string, reward: Partial<Reward>): Promise<boolean> => {
  try {
    const params: RpcParams = { p_id: id };
    if (reward.name !== undefined) params.p_name = reward.name;
    if (reward.description !== undefined) params.p_description = reward.description;
    if (reward.pointsRequired !== undefined) params.p_points_required = reward.pointsRequired;
    if (reward.isActive !== undefined) params.p_is_active = reward.isActive;
    
    // Using RPC with properly typed params
    const { error } = await supabase.rpc('update_reward', params);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating reward:', error);
    return false;
  }
};

export const createPromotion = async (promotion: Omit<Promotion, 'id'>): Promise<string | null> => {
  try {
    // Using RPC with properly typed params
    const params: RpcParams = {
      p_title: promotion.title,
      p_description: promotion.description,
      p_discount_percentage: promotion.discountPercentage,
      p_discount_amount: promotion.discountAmount,
      p_code: promotion.code,
      p_starts_at: promotion.startsAt.toISOString(),
      p_ends_at: promotion.endsAt?.toISOString(),
      p_is_active: promotion.isActive
    };
      
    const { data, error } = await supabase.rpc('create_promotion', params);
      
    if (error) throw error;
    return data as string;
  } catch (error) {
    console.error('Error creating promotion:', error);
    return null;
  }
};

export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<boolean> => {
  try {
    const params: RpcParams = { p_id: id };
    if (promotion.title !== undefined) params.p_title = promotion.title;
    if (promotion.description !== undefined) params.p_description = promotion.description;
    if (promotion.discountPercentage !== undefined) params.p_discount_percentage = promotion.discountPercentage;
    if (promotion.discountAmount !== undefined) params.p_discount_amount = promotion.discountAmount;
    if (promotion.code !== undefined) params.p_code = promotion.code;
    if (promotion.startsAt !== undefined) params.p_starts_at = promotion.startsAt.toISOString();
    if (promotion.endsAt !== undefined) params.p_ends_at = promotion.endsAt.toISOString();
    if (promotion.isActive !== undefined) params.p_is_active = promotion.isActive;
    
    // Using RPC with properly typed params
    const { error } = await supabase.rpc('update_promotion', params);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating promotion:', error);
    return false;
  }
};
