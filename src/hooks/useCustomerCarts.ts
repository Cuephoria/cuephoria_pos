
import { useState, useEffect } from 'react';
import { CartItem } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';

interface CustomerCart {
  customerId: string;
  cart: CartItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  loyaltyPointsUsed: number;
  isStudentDiscount: boolean;
  isSplitPayment: boolean;
  cashAmount: number;
  upiAmount: number;
}

export const useCustomerCarts = () => {
  const [customerCarts, setCustomerCarts] = useState<Record<string, CustomerCart>>({});
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load carts from localStorage on initial load
  useEffect(() => {
    try {
      const savedCarts = localStorage.getItem('cuephoriaCustomerCarts');
      if (savedCarts) {
        setCustomerCarts(JSON.parse(savedCarts));
      }
    } catch (error) {
      console.error('Error loading customer carts from localStorage:', error);
    }
  }, []);
  
  // Save carts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cuephoriaCustomerCarts', JSON.stringify(customerCarts));
    } catch (error) {
      console.error('Error saving customer carts to localStorage:', error);
    }
  }, [customerCarts]);
  
  // Get cart for a specific customer
  const getCustomerCart = (customerId: string): CustomerCart => {
    if (!customerCarts[customerId]) {
      // Initialize a new cart if none exists
      return {
        customerId,
        cart: [],
        discount: 0,
        discountType: 'percentage',
        loyaltyPointsUsed: 0,
        isStudentDiscount: false,
        isSplitPayment: false,
        cashAmount: 0,
        upiAmount: 0
      };
    }
    return customerCarts[customerId];
  };
  
  // Update a customer's cart
  const updateCustomerCart = (customerId: string, updates: Partial<CustomerCart>) => {
    const currentCart = getCustomerCart(customerId);
    setCustomerCarts((prevCarts) => ({
      ...prevCarts,
      [customerId]: {
        ...currentCart,
        ...updates
      }
    }));
  };
  
  // Clear a customer's cart
  const clearCustomerCart = (customerId: string) => {
    updateCustomerCart(customerId, {
      cart: [],
      discount: 0,
      discountType: 'percentage',
      loyaltyPointsUsed: 0,
      isStudentDiscount: false,
      isSplitPayment: false,
      cashAmount: 0,
      upiAmount: 0
    });
  };
  
  // Add an item to a customer's cart
  const addToCustomerCart = (customerId: string, item: Omit<CartItem, 'total'>, availableStock?: number) => {
    try {
      const currentCart = getCustomerCart(customerId);
      const existingItem = currentCart.cart.find(i => i.id === item.id && i.type === item.type);
      
      // For non-membership products, check available stock
      if (item.type === 'product' && item.category !== 'membership' && typeof availableStock === 'number') {
        const currentCartQuantity = existingItem ? existingItem.quantity : 0;
        const totalRequestedQuantity = currentCartQuantity + item.quantity;
        
        // Check if we have enough stock
        if (totalRequestedQuantity > availableStock) {
          // If not enough stock, adjust quantity or show error
          if (availableStock <= currentCartQuantity) {
            toast({
              title: "Insufficient Stock",
              description: `Only ${availableStock} units of ${item.name} available (${currentCartQuantity} already in cart)`,
              variant: "destructive"
            });
            return;
          }
          
          // Adjust quantity to match available stock
          const adjustedQuantity = availableStock - currentCartQuantity;
          toast({
            title: "Stock Limited",
            description: `Only added ${adjustedQuantity} units of ${item.name} (stock limit reached)`,
            variant: "destructive"
          });
          
          // Update item quantity to what's available
          item = { ...item, quantity: adjustedQuantity };
        }
      }
      
      let updatedCart: CartItem[];
      
      if (existingItem) {
        updatedCart = currentCart.cart.map(i => 
          i.id === item.id && i.type === item.type
            ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.price }
            : i
        );
        toast({
          title: "Item Updated",
          description: `Increased quantity of ${item.name}`,
        });
      } else {
        const newItem = { ...item, total: item.quantity * item.price };
        updatedCart = [...currentCart.cart, newItem];
        toast({
          title: "Item Added",
          description: `Added ${item.name} to cart`,
        });
      }
      
      updateCustomerCart(customerId, { cart: updatedCart });
    } catch (error) {
      console.error("Error adding to customer cart:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };
  
  // Remove an item from a customer's cart
  const removeFromCustomerCart = (customerId: string, id: string) => {
    try {
      const currentCart = getCustomerCart(customerId);
      const itemToRemove = currentCart.cart.find(i => i.id === id);
      
      updateCustomerCart(customerId, {
        cart: currentCart.cart.filter(i => i.id !== id)
      });
      
      if (itemToRemove) {
        toast({
          title: "Item Removed",
          description: `Removed ${itemToRemove.name} from cart`,
        });
      }
    } catch (error) {
      console.error("Error removing from customer cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };
  
  // Update an item in a customer's cart
  const updateCustomerCartItem = (customerId: string, id: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        removeFromCustomerCart(customerId, id);
        return;
      }
      
      const currentCart = getCustomerCart(customerId);
      
      updateCustomerCart(customerId, {
        cart: currentCart.cart.map(i => 
          i.id === id
            ? { ...i, quantity, total: quantity * i.price }
            : i
        )
      });
      
      toast({
        title: "Item Updated",
        description: "Updated quantity in cart",
      });
    } catch (error) {
      console.error("Error updating customer cart item:", error);
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive"
      });
    }
  };
  
  // Set discount for a customer's cart
  const setCustomerDiscount = (customerId: string, amount: number, type: 'percentage' | 'fixed') => {
    updateCustomerCart(customerId, {
      discount: amount,
      discountType: type
    });
    toast({
      title: "Discount Applied",
      description: `${type === 'percentage' ? amount + '%' : '₹' + amount} discount applied`,
    });
  };
  
  // Set loyalty points used for a customer's cart
  const setCustomerLoyaltyPointsUsed = (customerId: string, points: number) => {
    updateCustomerCart(customerId, {
      loyaltyPointsUsed: points
    });
    if (points > 0) {
      toast({
        title: "Loyalty Points Applied",
        description: `${points} loyalty points used`,
      });
    }
  };
  
  // Set split payment for a customer's cart
  const setCustomerSplitPayment = (customerId: string, split: boolean, total: number) => {
    if (split) {
      // Initialize split amounts when enabling split payment
      const halfTotal = Math.floor(total / 2);
      updateCustomerCart(customerId, {
        isSplitPayment: split,
        cashAmount: halfTotal,
        upiAmount: total - halfTotal
      });
    } else {
      updateCustomerCart(customerId, {
        isSplitPayment: false,
        cashAmount: 0,
        upiAmount: 0
      });
    }
  };
  
  // Update split amounts for a customer's cart
  const updateCustomerSplitAmounts = (customerId: string, cash: number, upi: number, total: number) => {
    if (Math.abs((cash + upi) - total) > 0.01) { // Allow small rounding errors
      toast({
        title: "Invalid Split",
        description: `Split amounts (₹${(cash + upi).toFixed(2)}) don't match total (₹${total.toFixed(2)})`,
        variant: "destructive"
      });
      return false;
    }
    
    updateCustomerCart(customerId, {
      cashAmount: cash,
      upiAmount: upi
    });
    return true;
  };
  
  // Set student discount for a customer's cart
  const setCustomerStudentDiscount = (customerId: string, isStudentDiscount: boolean) => {
    updateCustomerCart(customerId, {
      isStudentDiscount
    });
  };
  
  // Calculate total for a customer's cart
  const calculateCustomerCartTotal = (customerId: string): number => {
    const currentCart = getCustomerCart(customerId);
    const subtotal = currentCart.cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (currentCart.discountType === 'percentage') {
      discountValue = subtotal * (currentCart.discount / 100);
    } else {
      discountValue = currentCart.discount;
    }
    
    const loyaltyDiscount = currentCart.loyaltyPointsUsed;
    
    return Math.max(0, subtotal - discountValue - loyaltyDiscount);
  };
  
  return {
    customerCarts,
    activeCustomerId,
    setActiveCustomerId,
    getCustomerCart,
    updateCustomerCart,
    clearCustomerCart,
    addToCustomerCart,
    removeFromCustomerCart,
    updateCustomerCartItem,
    setCustomerDiscount,
    setCustomerLoyaltyPointsUsed,
    setCustomerStudentDiscount,
    setCustomerSplitPayment,
    updateCustomerSplitAmounts,
    calculateCustomerCartTotal
  };
};
