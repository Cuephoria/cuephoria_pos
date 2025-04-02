
import { useState } from 'react';
import { CartItem } from '@/types/pos.types';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [loyaltyPointsUsed, setLoyaltyPointsUsedAmount] = useState<number>(0);
  
  const addToCart = (item: Omit<CartItem, 'total'>) => {
    const existingItem = cart.find(i => i.id === item.id && i.type === item.type);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id && i.type === item.type
          ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.price }
          : i
      ));
    } else {
      setCart([...cart, { ...item, total: item.quantity * item.price }]);
    }
  };
  
  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };
  
  const updateCartItem = (id: string, quantity: number) => {
    setCart(cart.map(i => 
      i.id === id
        ? { ...i, quantity, total: quantity * i.price }
        : i
    ));
  };
  
  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setLoyaltyPointsUsedAmount(0);
  };
  
  const setDiscount = (amount: number, type: 'percentage' | 'fixed') => {
    setDiscountAmount(amount);
    setDiscountType(type);
  };
  
  const setLoyaltyPointsUsed = (points: number) => {
    setLoyaltyPointsUsedAmount(points);
  };
  
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = subtotal * (discount / 100);
    } else {
      discountValue = discount;
    }
    
    const loyaltyDiscount = loyaltyPointsUsed;
    
    return Math.max(0, subtotal - discountValue - loyaltyDiscount);
  };
  
  return {
    cart,
    setCart,
    discount,
    setDiscountAmount,
    discountType,
    setDiscountType,
    loyaltyPointsUsed,
    setLoyaltyPointsUsedAmount,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setDiscount,
    setLoyaltyPointsUsed,
    calculateTotal
  };
}
