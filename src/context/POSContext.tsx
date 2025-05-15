import React, { createContext, useContext, useEffect, useState } from 'react';
import { useBills } from '@/hooks/useBills';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerSessionsManager } from '@/hooks/useCustomerSessionsManager';
import { generateId } from '@/utils/pos.utils';
import { useCart } from '@/hooks/useCart';
import { isMembershipActive } from '@/utils/membership.utils';
import { 
  Product,
  Customer,
  Station,
  CartItem,
  Bill,
  Session,
  ResetOptions,
  SessionResult,
  POSContextType
} from '@/types/pos.types';

const POSContext = createContext<POSContextType>({} as POSContextType);

export const usePOS = () => {
  console.log("usePOS hook called");
  const context = useContext(POSContext);
  console.log("usePOS hook returning context");
  return context;
};

export { Product, Customer, Station, CartItem, Bill, Session, ResetOptions };

interface POSProviderProps {
  children: React.ReactNode;
}

export const POSProvider: React.FC<POSProviderProps> = ({ children }) => {
  console.log("POSProvider initialized");
  
  // Products, categories
  const { 
    products,
    productsLoading,
    productsError,
    addProduct,
    updateProduct,
    deleteProduct,
    categories,
    addCategory,
    updateCategory,
    deleteCategory
  } = useProducts();
  
  // Customers
  const {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    updateCustomerMembership,
    checkMembershipValidity,
    deductMembershipHours
  } = useCustomers();
  
  // User interface state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  
  // Customer session manager - combines station management with multi-customer carts
  const {
    // Station management
    stations,
    setStations,
    startSession,
    endSession,
    deleteStation,
    updateStation,
    
    // Multi-customer cart management
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
  } = useCustomerSessionsManager([], updateCustomer);
  
  // Bills
  const {
    bills,
    setBills,
    addBill,
    exportBills,
    deleteBill,
    updateBill
  } = useBills();
  
  // Legacy cart system - we'll keep this for backward compatibility
  // but use customer-specific carts instead
  const {
    cart,
    setCart,
    discount,
    discountType,
    loyaltyPointsUsed,
    isSplitPayment,
    cashAmount, 
    upiAmount,
    setIsSplitPayment,
    setCashAmount,
    setUpiAmount,
    updateSplitAmounts,
    addToCart: addToLegacyCart,
    removeFromCart: removeFromLegacyCart,
    updateCartItem: updateLegacyCartItem,
    clearCart: clearLegacyCart,
    setDiscount: setLegacyDiscount,
    setLoyaltyPointsUsed: setLegacyLoyaltyPointsUsed,
    calculateTotal: calculateLegacyTotal
  } = useCart();
  
  // When the selected customer changes, update the active customer ID
  useEffect(() => {
    if (selectedCustomer) {
      setActiveCustomerId(selectedCustomer.id);
      
      // Get the customer's cart
      const customerCart = getCurrentCart(selectedCustomer.id);
      
      // Sync the legacy cart with this customer's cart
      setCart(customerCart);
    } else {
      setActiveCustomerId(null);
      clearLegacyCart();
    }
  }, [selectedCustomer]);
  
  // Select customer
  const selectCustomer = (id: string | null) => {
    if (id) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setSelectedCustomer(customer);
      }
    } else {
      setSelectedCustomer(null);
    }
  };
  
  // Add item to cart (gets added to the selected customer's cart)
  const addToCart = (item: Omit<CartItem, 'total'>) => {
    if (!selectedCustomer) {
      console.error('No customer selected for adding to cart');
      return;
    }
    
    // For products that have stock, get the available stock
    let availableStock;
    if (item.type === 'product' && item.category !== 'membership') {
      const product = products.find(p => p.id === item.id);
      if (product) {
        availableStock = product.stock;
      }
    }
    
    // Add to the customer-specific cart
    addToCustomerCart(selectedCustomer.id, item, availableStock);
    
    // Update the legacy cart to reflect current customer's cart
    const updatedCustomerCart = getCurrentCart(selectedCustomer.id);
    setCart(updatedCustomerCart);
  };
  
  // Remove item from cart
  const removeFromCart = (id: string) => {
    if (!selectedCustomer) {
      console.error('No customer selected for removing from cart');
      return;
    }
    
    // Remove from customer-specific cart
    removeFromCustomerCart(selectedCustomer.id, id);
    
    // Update the legacy cart
    const updatedCustomerCart = getCurrentCart(selectedCustomer.id);
    setCart(updatedCustomerCart);
  };
  
  // Update cart item quantity
  const updateCartItem = (id: string, quantity: number) => {
    if (!selectedCustomer) {
      console.error('No customer selected for updating cart');
      return;
    }
    
    // Update in customer-specific cart
    updateCustomerCartItem(selectedCustomer.id, id, quantity);
    
    // Update the legacy cart
    const updatedCustomerCart = getCurrentCart(selectedCustomer.id);
    setCart(updatedCustomerCart);
  };
  
  // Clear cart
  const clearCart = () => {
    if (!selectedCustomer) {
      console.error('No customer selected for clearing cart');
      clearLegacyCart();
      return;
    }
    
    // Clear customer-specific cart
    clearCustomerCart(selectedCustomer.id);
    
    // Clear legacy cart
    clearLegacyCart();
  };
  
  // Set discount
  const setDiscount = (amount: number, type: 'percentage' | 'fixed') => {
    if (!selectedCustomer) {
      setLegacyDiscount(amount, type);
      return;
    }
    
    // Set in customer-specific cart
    setCustomerDiscount(selectedCustomer.id, amount, type);
    
    // Also set in legacy cart for compatibility
    setLegacyDiscount(amount, type);
  };
  
  // Set loyalty points used
  const setLoyaltyPointsUsed = (points: number) => {
    if (!selectedCustomer) {
      setLegacyLoyaltyPointsUsed(points);
      return;
    }
    
    // Set in customer-specific cart
    setCustomerLoyaltyPointsUsed(selectedCustomer.id, points);
    
    // Also set in legacy cart for compatibility
    setLegacyLoyaltyPointsUsed(points);
  };
  
  // Calculate total
  const calculateTotal = () => {
    if (!selectedCustomer) {
      return calculateLegacyTotal();
    }
    
    // Calculate from customer-specific cart
    return calculateCustomerCartTotal(selectedCustomer.id);
  };
  
  // Complete sale
  const completeSale = (paymentMethod: 'cash' | 'upi' | 'split'): Bill | undefined => {
    // Ensure we have a customer and items
    if (!selectedCustomer) {
      throw new Error('No customer selected');
    }
    
    // Get items from customer's cart
    const cartItems = getCurrentCart(selectedCustomer.id);
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Get customer's cart details
    const customerCart = customerCarts[selectedCustomer.id] || {
      customerId: selectedCustomer.id,
      cart: cartItems,
      discount: discount,
      discountType: discountType,
      loyaltyPointsUsed: loyaltyPointsUsed,
      isStudentDiscount: isStudentDiscount,
      isSplitPayment: isSplitPayment,
      cashAmount: cashAmount,
      upiAmount: upiAmount
    };
    
    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);
    
    // Calculate discount value
    let discountValue = 0;
    if (customerCart.discountType === 'percentage') {
      discountValue = subtotal * (customerCart.discount / 100);
    } else {
      discountValue = customerCart.discount;
    }
    
    // Calculate total after discounts and loyalty points
    const total = Math.max(0, subtotal - discountValue - customerCart.loyaltyPointsUsed);
    
    // Determine loyalty points earned (1 point per 100 rupees spent)
    const loyaltyPointsEarned = Math.floor(total / 100);
    
    // Create the bill
    const billId = generateId();
    const bill: Bill = {
      id: billId,
      customerId: selectedCustomer.id,
      items: cartItems,
      subtotal,
      discount: customerCart.discount,
      discountValue,
      discountType: customerCart.discountType,
      loyaltyPointsUsed: customerCart.loyaltyPointsUsed,
      loyaltyPointsEarned,
      total,
      paymentMethod,
      isSplitPayment: paymentMethod === 'split' ? customerCart.isSplitPayment : false,
      cashAmount: paymentMethod === 'split' ? customerCart.cashAmount : 0,
      upiAmount: paymentMethod === 'split' ? customerCart.upiAmount : 0,
      createdAt: new Date()
    };
    
    // Add it to the bills
    addBill(bill);
    
    // Update product stock and add earned loyalty points to customer
    const productUpdates = processProductsInBill(cartItems);
    
    // Update customer with earned loyalty points and spending
    const updatedCustomer: Customer = {
      ...selectedCustomer,
      loyaltyPoints: selectedCustomer.loyaltyPoints + loyaltyPointsEarned - customerCart.loyaltyPointsUsed,
      totalSpent: selectedCustomer.totalSpent + total
    };
    updateCustomer(updatedCustomer);
    
    // Clear the customer's cart
    clearCustomerCart(selectedCustomer.id);
    
    // Clear the legacy cart
    clearLegacyCart();
    
    return bill;
  };
  
  // Process the products in a bill (update inventory)
  const processProductsInBill = (items: CartItem[]) => {
    const productItems = items.filter(item => item.type === 'product');
    
    productItems.forEach(item => {
      // Find the product to update
      const product = products.find(p => p.id === item.id);
      if (!product) return;
      
      // Check for membership items
      if (item.category === 'membership' && selectedCustomer) {
        // Handle membership purchase separately
        const membershipHours = product.membershipHours || 0;
        const membershipDuration = product.duration;
        
        // Update the customer's membership
        updateCustomerMembership(selectedCustomer.id, {
          membershipPlan: product.name,
          membershipDuration,
          membershipHoursLeft: membershipHours
        });
      }
      
      // Update stock for non-membership products
      if (item.category !== 'membership') {
        // Update stock
        const newStock = Math.max(0, product.stock - item.quantity);
        updateProduct({ ...product, stock: newStock });
      }
    });
    
    return productItems;
  };
  
  // Reset to sample data
  const resetToSampleData = (options?: ResetOptions) => {
    console.log('Reset to sample data with options:', options);
  };
  
  // Add sample Indian data
  const addSampleIndianData = () => {
    console.log('Add sample Indian data');
  };
  
  const contextValue: POSContextType = {
    products,
    productsLoading,
    productsError,
    stations,
    setStations,
    customers,
    sessions: [], // This isn't used directly in the UI
    bills,
    setBills,
    setCustomers,
    cart,
    selectedCustomer,
    discount,
    discountType,
    loyaltyPointsUsed,
    isStudentDiscount,
    categories,
    isSplitPayment,
    cashAmount,
    upiAmount,
    setIsStudentDiscount,
    setIsSplitPayment,
    setCashAmount,
    setUpiAmount,
    updateSplitAmounts,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory,
    startSession,
    endSession,
    deleteStation,
    updateStation,
    addCustomer,
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer,
    selectCustomer,
    checkMembershipValidity,
    deductMembershipHours,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setDiscount,
    setLoyaltyPointsUsed,
    calculateTotal,
    completeSale,
    exportBills,
    exportCustomers: () => {}, // Not implemented yet
    resetToSampleData,
    addSampleIndianData,
    deleteBill,
    updateBill
  };
  
  console.log("POSProvider rendering with context value");
  
  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  console.log('usePOS hook called'); // Debug log
  const context = useContext(POSContext);
  if (context === undefined) {
    console.error('usePOS must be used within a POSProvider'); // Debug log
    throw new Error('usePOS must be used within a POSProvider');
  }
  console.log('usePOS hook returning context'); // Debug log
  return context;
};

// Re-export types from types file for convenience
export type { 
  Product,
  Station,
  Customer,
  Session,
  CartItem,
  Bill,
  ResetOptions,
  POSContextType
} from '@/types/pos.types';
