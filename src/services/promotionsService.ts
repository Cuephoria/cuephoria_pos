
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types/customer.types';

export const promotionsService = {
  // Get all active promotions
  async getActivePromotions(membershipRequired: boolean = false): Promise<Promotion[]> {
    const { data, error } = await supabase
      .rpc('get_active_promotions', {
        membership_required_filter: membershipRequired
      });
      
    if (error) {
      console.error('Error fetching promotions:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as Promotion[];
  },
  
  // Get promotion by ID
  async getPromotionById(promotionId: string): Promise<Promotion | null> {
    const { data, error } = await supabase
      .rpc('get_promotion_by_id', {
        promotion_id: promotionId
      });
      
    if (error) {
      console.error('Error fetching promotion:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion;
  },
  
  // Get promotions by customer type (for members or non-members)
  async getPromotionsByMembership(isMember: boolean): Promise<Promotion[]> {
    const { data, error } = await supabase
      .rpc('get_promotions_by_membership', {
        is_member: isMember
      });
      
    if (error) {
      console.error('Error fetching promotions by membership:', error);
      throw new Error(error.message);
    }
    
    return (data || []) as Promotion[];
  },
  
  // Apply promotion to a purchase
  async applyPromotion(
    promotionCode: string, 
    subtotal: number, 
    customerId: string
  ): Promise<{
    valid: boolean;
    discountType?: 'percentage' | 'fixed';
    discountValue?: number;
    message?: string;
  }> {
    const { data, error } = await supabase
      .rpc('apply_promotion_code', {
        promo_code: promotionCode,
        purchase_amount: subtotal,
        customer_id: customerId
      });
      
    if (error) {
      console.error('Error applying promotion:', error);
      throw new Error(error.message);
    }
    
    if (!data || !data.valid) {
      return { 
        valid: false, 
        message: data?.message || 'Invalid promotion code' 
      };
    }
    
    return {
      valid: true,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      message: data.message
    };
  }
};
