
import { Promotion, PromotionValidationResponse } from '@/types/customer.types';

// Mock promotions
export const getActivePromotions = async (customerId: string): Promise<Promotion[]> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const now = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  return [
    {
      id: "promo-1",
      name: "Weekend Special",
      description: "Get 10% off all gameplay sessions during weekends",
      discount_type: "percentage",
      discount_value: 10,
      code: "WEEKEND10",
      start_date: now,
      end_date: nextMonth,
      active: true,
      created_at: new Date()
    },
    {
      id: "promo-2",
      name: "Food & Beverage Combo",
      description: "Get $5 off when you buy any food and beverage combo",
      discount_type: "fixed",
      discount_value: 5,
      code: "COMBO5",
      start_date: now,
      end_date: nextMonth,
      active: true,
      created_at: new Date()
    }
  ];
};

// Mock promotion redemption
export const redeemPromotion = async (customerId: string, promoCode: string): Promise<boolean> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock successful redemption
  return true;
};

// Mock promotion validation
export const validatePromoCode = async (promoCode: string, customerId: string): Promise<PromotionValidationResponse> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check mock promotion codes
  if (promoCode === "WEEKEND10") {
    return {
      valid: true,
      discount_type: "percentage",
      discount_value: 10,
      message: "Promo code applied: 10% off"
    };
  } else if (promoCode === "COMBO5") {
    return {
      valid: true,
      discount_type: "fixed",
      discount_value: 5,
      message: "Promo code applied: $5 off"
    };
  } else {
    return {
      valid: false,
      message: "Invalid promotion code"
    };
  }
};
