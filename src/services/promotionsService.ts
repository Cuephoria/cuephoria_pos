
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types/customer.types';

export const promotionsService = {
  // Get all active promotions
  async getPromotions(membershipRequired: boolean = false): Promise<Promotion[]> {
    const now = new Date().toISOString();
    
    let query = supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now);
      
    if (membershipRequired) {
      query = query.eq('membership_required', true);
    }
    
    const { data, error } = await query.order('end_date', { ascending: true });
      
    if (error) {
      console.error('Error fetching promotions:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion[];
  },
  
  // Get promotion by code
  async getPromotionByCode(code: string): Promise<Promotion | null> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('is_active', true)
      .eq('promotion_code', code)
      .lte('start_date', now)
      .gte('end_date', now)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching promotion by code:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion | null;
  },
  
  // Admin functions
  // Create a new promotion
  async createPromotion(promotion: Omit<Promotion, 'id'>): Promise<Promotion> {
    const { data, error } = await supabase
      .from('promotions')
      .insert(promotion)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating promotion:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion;
  },
  
  // Update a promotion
  async updatePromotion(id: string, promotion: Partial<Promotion>): Promise<void> {
    const { error } = await supabase
      .from('promotions')
      .update(promotion)
      .eq('id', id);
      
    if (error) {
      console.error('Error updating promotion:', error);
      throw new Error(error.message);
    }
  },
  
  // Delete a promotion
  async deletePromotion(id: string): Promise<void> {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Error deleting promotion:', error);
      throw new Error(error.message);
    }
  },
  
  // Get all promotions (admin)
  async getAllPromotions(): Promise<Promotion[]> {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching all promotions:', error);
      throw new Error(error.message);
    }
    
    return data as Promotion[];
  }
};
