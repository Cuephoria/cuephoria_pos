
import { supabase } from '@/integrations/supabase/client';
import { Promotion, PromotionValidationResponse } from '@/types/customer.types';

export const getPromotions = async () => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('active', true)
      .gte('end_date', now)
      .lte('start_date', now)
      .order('end_date', { ascending: true });
      
    if (error) {
      console.error('Error fetching promotions:', error);
      return [];
    }
    
    return data.map(promo => ({
      id: promo.id,
      name: promo.name,
      description: promo.description,
      discountType: promo.discount_type,
      discountValue: promo.discount_value,
      code: promo.code,
      startDate: new Date(promo.start_date),
      endDate: new Date(promo.end_date),
      active: promo.active,
      createdAt: new Date(promo.created_at)
    }));
  } catch (error) {
    console.error('Error in getPromotions:', error);
    return [];
  }
};

export const getPromotionById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching promotion:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      discountType: data.discount_type,
      discountValue: data.discount_value,
      code: data.code,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      active: data.active,
      createdAt: new Date(data.created_at)
    };
  } catch (error) {
    console.error('Error in getPromotionById:', error);
    return null;
  }
};

export const validatePromotionCode = async (code: string): Promise<PromotionValidationResponse> => {
  try {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('promotions')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .gte('end_date', now)
      .lte('start_date', now)
      .single();
      
    if (error) {
      return {
        valid: false,
        message: 'Invalid promotion code'
      };
    }
    
    if (data) {
      return {
        valid: true,
        discount_type: data.discount_type,
        discount_value: data.discount_value,
        message: 'Promotion code applied successfully'
      };
    }
    
    return {
      valid: false,
      message: 'Promotion code not found or expired'
    };
  } catch (error) {
    console.error('Error validating promotion code:', error);
    return {
      valid: false,
      message: 'Error validating promotion code'
    };
  }
};
