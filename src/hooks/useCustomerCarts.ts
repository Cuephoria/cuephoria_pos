
import { useState, useEffect } from 'react';
import { CartItem, Customer } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';

// Define the structure of a customer's cart
export interface CustomerCart {
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

// Define the state structure for storing multiple customer carts
export interface CustomerCartsState {
  [customerId: string]: CustomerCart;
}

export const useCustomerCarts = () => {
  const [customerCarts, setCustomerCarts] = useState<CustomerCartsState>({});
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Load customer carts from localStorage on initial render
  useEffect(() => {
    try {
      const savedCarts = localStorage.getItem('customerCarts');
      if (savedCarts) {
        setCustomerCarts(JSON.parse(savedCarts));
        console.log('Loaded customer carts from localStorage:', savedCarts);
      }
    } catch (error) {
      console.error('Error loading customer carts from localStorage:', error);
    }
  }, []);
  
  // Save customer carts to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('customerCarts', JSON.stringify(customerCarts));
    } catch (error) {
      console.error('Error saving customer carts to localStorage:', error);
    }
  }, [customerCarts]);
  
  // Initialize a customer's cart if it doesn't exist
  const initializeCustomerCart = (customerId: string) => {
    if (!customerCarts[customerId]) {
      setCustomerCarts(prev => ({
        ...prev,
        [customerId]: {
          customerId,
          cart: [],
          discount: 0,
          discountType: 'percentage',
          loyaltyPointsUsed: 0,
          isStudentDiscount: false,
          isSplitPayment: false,
          cashAmount: 0,
          upiAmount: 0
        }
      }));
    }
    return customerCarts[customerId] || {
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
  };
  
  // Get a customer's current cart
  const getCurrentCart = (customerId: string): CartItem[] => {
    if (!customerCarts[customerId]) {
      initializeCustomerCart(customerId);
      return [];
    }
    return customerCarts[customerId].cart;
  };
  
  // Add an item to a customer's cart
  const addToCustomerCart = (customerId: string, item: Omit<CartItem, 'total'>, availableStock?: number) => {
    try {
      // Initialize cart if needed
      if (!customerCarts[customerId]) {
        initializeCustomerCart(customerId);
      }
      
      // Check stock limits for products
      if (item.type === 'product' && item.category !== 'membership' && typeof availableStock === 'number') {
        const existingCart = customerCarts[customerId]?.cart || [];
        const existingItem = existingCart.find(i => i.id === item.id && i.type === item.type);
        const currentCartQuantity = existingItem ? existingItem.quantity : 0;
        const totalRequestedQuantity = currentCartQuantity + item.quantity;
        
        // Check if enough stock is available
        if (totalRequestedQuantity > availableStock) {
          // Not enough stock - adjust or show error
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
      
      setCustomerCarts(prevCarts => {
        const customerCart = prevCarts[customerId] || {
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
        
        const existingItemIndex = customerCart.cart.findIndex(i => i.id === item.id && i.type === item.type);
        
        let updatedCart;
        if (existingItemIndex >= 0) {
          // Update existing item
          const existingItem = customerCart.cart[existingItemIndex];
          const newQuantity = existingItem.quantity + item.quantity;
          const newTotal = newQuantity * item.price;
          
          updatedCart = [...customerCart.cart];
          updatedCart[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            total: newTotal
          };
          
          toast({
            title: "Item Updated",
            description: `Increased quantity of ${item.name}`,
          });
        } else {
          // Add new item
          const newItem = {
            ...item,
            total: item.quantity * item.price
          };
          
          updatedCart = [...customerCart.cart, newItem];
          
          toast({
            title: "Item Added",
            description: `Added ${item.name} to cart`,
          });
        }
        
        return {
          ...prevCarts,
          [customerId]: {
            ...customerCart,
            cart: updatedCart
          }
        };
      });
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
  const removeFromCustomerCart = (customerId: string, itemId: string) => {
    try {
      if (!customerCarts[customerId]) {
        console.log(`No cart found for customer ${customerId}`);
        return;
      }
      
      const itemToRemove = customerCarts[customerId].cart.find(i => i.id === itemId);
      if (!itemToRemove) {
        console.log(`Item ${itemId} not found in cart for customer ${customerId}`);
        return;
      }
      
      setCustomerCarts(prevCarts => {
        const customerCart = prevCarts[customerId];
        return {
          ...prevCarts,
          [customerId]: {
            ...customerCart,
            cart: customerCart.cart.filter(i => i.id !== itemId)
          }
        };
      });
      
      toast({
        title: "Item Removed",
        description: `Removed ${itemToRemove.name} from cart`,
      });
    } catch (error) {
      console.error("Error removing from customer cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive"
      });
    }
  };
  
  // Update an item's quantity in a customer's cart
  const updateCustomerCartItem = (customerId: string, itemId: string, quantity: number) => {
    try {
      if (!customerCarts[customerId]) {
        console.log(`No cart found for customer ${customerId}`);
        return;
      }
      
      if (quantity <= 0) {
        removeFromCustomerCart(customerId, itemId);
        return;
      }
      
      setCustomerCarts(prevCarts => {
        const customerCart = prevCarts[customerId];
        return {
          ...prevCarts,
          [customerId]: {
            ...customerCart,
            cart: customerCart.cart.map(item => 
              item.id === itemId
                ? { ...item, quantity, total: quantity * item.price }
                : item
            )
          }
        };
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
  
  // Clear a customer's cart
  const clearCustomerCart = (customerId: string) => {
    if (!customerCarts[customerId]) {
      console.log(`No cart found for customer ${customerId}`);
      return;
    }
    
    setCustomerCarts(prevCarts => {
      const customerCart = prevCarts[customerId];
      return {
        ...prevCarts,
        [customerId]: {
          ...customerCart,
          cart: [],
          discount: 0,
          loyaltyPointsUsed: 0,
          isSplitPayment: false,
          cashAmount: 0,
          upiAmount: 0
        }
      };
    });
    
    toast({
      title: "Cart Cleared",
      description: "All items removed from cart",
    });
  };
  
  // Set discount for a customer's cart
  const setCustomerDiscount = (customerId: string, amount: number, type: 'percentage' | 'fixed') => {
    if (!customerCarts[customerId]) {
      initializeCustomerCart(customerId);
    }
    
    setCustomerCarts(prevCarts => {
      const customerCart = prevCarts[customerId] || {
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
      
      return {
        ...prevCarts,
        [customerId]: {
          ...customerCart,
          discount: amount,
          discountType: type
        }
      };
    });
    
    toast({
      title: "Discount Applied",
      description: `${type === 'percentage' ? amount + '%' : '₹' + amount} discount applied`,
    });
  };
  
  // Set loyalty points used for a customer's cart
  const setCustomerLoyaltyPointsUsed = (customerId: string, points: number) => {
    if (!customerCarts[customerId]) {
      initializeCustomerCart(customerId);
    }
    
    setCustomerCarts(prevCarts => {
      const customerCart = prevCarts[customerId] || {
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
      
      return {
        ...prevCarts,
        [customerId]: {
          ...customerCart,
          loyaltyPointsUsed: points
        }
      };
    });
    
    if (points > 0) {
      toast({
        title: "Loyalty Points Applied",
        description: `${points} loyalty points used`,
      });
    }
  };
  
  // Set student discount flag for a customer's cart
  const setCustomerStudentDiscount = (customerId: string, isStudentDiscount: boolean) => {
    if (!customerCarts[customerId]) {
      initializeCustomerCart(customerId);
    }
    
    setCustomerCarts(prevCarts => {
      const customerCart = prevCarts[customerId] || {
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
      
      return {
        ...prevCarts,
        [customerId]: {
          ...customerCart,
          isStudentDiscount
        }
      };
    });
  };
  
  // Set split payment flag and amounts for a customer's cart
  const setCustomerSplitPayment = (customerId: string, isSplitPayment: boolean) => {
    if (!customerCarts[customerId]) {
      initializeCustomerCart(customerId);
    }
    
    setCustomerCarts(prevCarts => {
      const customerCart = prevCarts[customerId] || {
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
      
      // If enabling split payment, initialize split amounts
      let cashAmount = customerCart.cashAmount;
      let upiAmount = customerCart.upiAmount;
      
      if (isSplitPayment) {
        // Calculate total
        const subtotal = customerCart.cart.reduce((sum, item) => sum + item.total, 0);
        let discountValue = 0;
        if (customerCart.discountType === 'percentage') {
          discountValue = subtotal * (customerCart.discount / 100);
        } else {
          discountValue = customerCart.discount;
        }
        const total = Math.max(0, subtotal - discountValue - customerCart.loyaltyPointsUsed);
        
        // Default to half cash, half UPI
        cashAmount = Math.floor(total / 2);
        upiAmount = total - cashAmount;
      }
      
      return {
        ...prevCarts,
        [customerId]: {
          ...customerCart,
          isSplitPayment,
          cashAmount,
          upiAmount
        }
      };
    });
  };
  
  // Update split payment amounts for a customer's cart
  const updateCustomerSplitAmounts = (customerId: string, cash: number, upi: number, total: number) => {
    if (!customerCarts[customerId]) {
      initializeCustomerCart(customerId);
    }
    
    // Validate that the amounts match the total
    if (Math.abs((cash + upi) - total) > 0.01) { // Allow small rounding errors
      toast({
        title: "Invalid Split",
        description: `Split amounts (₹${(cash + upi).toFixed(2)}) don't match total (₹${total.toFixed(2)})`,
        variant: "destructive"
      });
      return false;
    }
    
    setCustomerCarts(prevCarts => {
      const customerCart = prevCarts[customerId] || {
        customerId,
        cart: [],
        discount: 0,
        discountType: 'percentage',
        loyaltyPointsUsed: 0,
        isStudentDiscount: false,
        isSplitPayment: true,
        cashAmount: 0,
        upiAmount: 0
      };
      
      return {
        ...prevCarts,
        [customerId]: {
          ...customerCart,
          cashAmount: cash,
          upiAmount: upi,
          isSplitPayment: true
        }
      };
    });
    
    return true;
  };
  
  // Calculate total for a customer's cart
  const calculateCustomerCartTotal = (customerId: string): number => {
    if (!customerCarts[customerId]) {
      return 0;
    }
    
    const customerCart = customerCarts[customerId];
    const subtotal = customerCart.cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (customerCart.discountType === 'percentage') {
      discountValue = subtotal * (customerCart.discount / 100);
    } else {
      discountValue = customerCart.discount;
    }
    
    return Math.max(0, subtotal - discountValue - customerCart.loyaltyPointsUsed);
  };
  
  return {
    customerCarts,
    activeCustomerId,
    setActiveCustomerId,
    getCurrentCart,
    addToCustomerCart,
    removeFromCustomerCart,
    updateCustomerCartItem,
    clearCustomerCart,
    calculateCustomerCartTotal,
    setCustomerDiscount,
    setCustomerLoyaltyPointsUsed,
    setCustomerStudentDiscount,
    setCustomerSplitPayment,
    updateCustomerSplitAmounts,
  };
};
