
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types/customer.types';

export const promotionsService = {
  // Get all active promotions
  async getPromotions(membershipRequired: boolean = false): Promise<Promotion[]> {
    const { data, error } = await supabase.rpc('get_active_promotions', {
      membership_required_filter: membershipRequired
    });
      
    if (error) {
      console.error('Error fetching promotions:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion[];
  },
  
  // Get promotion by code
  async getPromotionByCode(code: string): Promise<Promotion | null> {
    const { data, error } = await supabase.rpc('get_promotion_by_code', {
      code: code
    });
      
    if (error && error.message !== 'No rows returned') {
      console.error('Error fetching promotion by code:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion | null;
  },
  
  // Admin functions
  // Create a new promotion
  async createPromotion(promotion: Omit<Promotion, 'id'>): Promise<Promotion> {
    const { data, error } = await supabase.rpc('create_promotion', {
      title: promotion.title,
      description: promotion.description,
      image_url: promotion.image_url,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      terms_conditions: promotion.terms_conditions,
      is_active: promotion.is_active,
      membership_required: promotion.membership_required,
      minimum_purchase_amount: promotion.minimum_purchase_amount,
      promotion_code: promotion.promotion_code
    });
      
    if (error) {
      console.error('Error creating promotion:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion;
  },
  
  // Update a promotion
  async updatePromotion(id: string, promotion: Partial<Promotion>): Promise<void> {
    const { error } = await supabase.rpc('update_promotion', {
      promotion_id: id,
      title: promotion.title,
      description: promotion.description,
      image_url: promotion.image_url,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      discount_type: promotion.discount_type,
      discount_value: promotion.discount_value,
      terms_conditions: promotion.terms_conditions,
      is_active: promotion.is_active,
      membership_required: promotion.membership_required,
      minimum_purchase_amount: promotion.minimum_purchase_amount,
      promotion_code: promotion.promotion_code
    });
      
    if (error) {
      console.error('Error updating promotion:', error);
      throw new Error(error.message);
    }
  },
  
  // Delete a promotion
  async deletePromotion(id: string): Promise<void> {
    const { error } = await supabase.rpc('delete_promotion', {
      promotion_id: id
    });
      
    if (error) {
      console.error('Error deleting promotion:', error);
      throw new Error(error.message);
    }
  },
  
  // Get all promotions (admin)
  async getAllPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase.rpc('get_all_promotions');
      
    if (error) {
      console.error('Error fetching all promotions:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion[];
  }
};
