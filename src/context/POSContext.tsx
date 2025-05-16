import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  POSContextType,
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill,
  Product,
  Station,
  Session
} from '@/types/pos.types';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useCustomerSessionsManager } from '@/hooks/useCustomerSessionsManager';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';
import { generateId } from '@/utils/pos.utils';

const POSContext = createContext<POSContextType>({} as POSContextType);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // State for student discount
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  
  // State for categories
  const [categories, setCategories] = useState<string[]>([
    'food', 'drinks', 'tobacco', 'challenges', 'membership'
  ]);
  
  // Initialize product-related hooks
  const { 
    products, 
    loading: productsLoading,
    error: productsError,
    setProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    refreshFromDB
  } = useProducts();
  
  // Initialize customer-related hooks
  const { 
    customers, 
    setCustomers, 
    selectedCustomer, 
    setSelectedCustomer, 
    addCustomer, 
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer, 
    checkMembershipValidity,
    deductMembershipHours
  } = useCustomers([]);
  
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
  
  // Initialize bills-related hooks
  const { 
    bills, 
    setBills, 
    completeSale: completeSaleBase, 
    deleteBill: deleteBillBase,
    updateBill: updateBillBase,
    exportBills: exportBillsBase, 
    exportCustomers: exportCustomersBase 
  } = useBills(updateCustomer, updateProduct);

  const { toast } = useToast();

  // Legacy cart system - we'll keep this for backward compatibility
  const {
    cart,
    setCart,
    discount,
    discountType,
    loyaltyPointsUsed,
    isSplitPayment,
    cashAmount,
    upiAmount,
    setIsSplitPayment: setLegacySplitPayment,
    setCashAmount: setLegacyCashAmount,
    setUpiAmount: setLegacyUpiAmount,
    updateSplitAmounts: updateLegacySplitAmounts,
    addToCart: addToLegacyCart,
    removeFromCart: removeFromLegacyCart,
    updateCartItem: updateLegacyCartItem,
    clearCart: clearLegacyCart,
    setDiscount: setLegacyDiscount,
    setLoyaltyPointsUsed: setLegacyLoyaltyPointsUsed,
    calculateTotal: calculateLegacyTotal
  } = useCart();

  // When selectedCustomer changes, update the active customer ID and sync carts
  useEffect(() => {
    if (selectedCustomer) {
      setActiveCustomerId(selectedCustomer.id);
      
      // Load this customer's cart into the legacy cart system
      const customerCart = getCurrentCart(selectedCustomer.id);
      setCart(customerCart);
    } else {
      setActiveCustomerId(null);
      clearLegacyCart();
    }
  }, [selectedCustomer]);

  // Fetch categories from Supabase on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Get categories from Supabase
        const { data, error } = await supabase
          .from('categories')
          .select('name');
        
        if (error) {
          console.error('Error fetching categories:', error);
          return;
        }

        if (data && data.length > 0) {
          // Use categories from DB
          const dbCategories = data.map(item => item.name.toLowerCase());
          
          // Ensure "uncategorized" exists
          if (!dbCategories.includes('uncategorized')) {
            try {
              await supabase
                .from('categories')
                .insert({ name: 'uncategorized' });
                
              dbCategories.push('uncategorized');
            } catch (err) {
              console.error('Error creating uncategorized category:', err);
            }
          }
          
          setCategories(dbCategories);
          localStorage.setItem('cuephoriaCategories', JSON.stringify(dbCategories));
          console.log('Categories loaded from database:', dbCategories);
        } else {
          // If no categories in DB, create default ones
          const defaultCategories = ['food', 'drinks', 'tobacco', 'challenges', 'membership', 'uncategorized'];
          
          // Insert all default categories
          for (const category of defaultCategories) {
            try {
              await supabase
                .from('categories')
                .insert({ name: category.toLowerCase() });
            } catch (err) {
              console.error(`Error creating category ${category}:`, err);
            }
          }
          
          setCategories(defaultCategories);
          localStorage.setItem('cuephoriaCategories', JSON.stringify(defaultCategories));
          console.log('Default categories created:', defaultCategories);
        }
      } catch (error) {
        console.error('Error in fetchCategories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Category management functions
  const addCategory = async (category: string) => {
    try {
      const trimmedCategory = category.trim().toLowerCase();
      
      if (!trimmedCategory) {
        return; // Empty category
      }
      
      // Check if category already exists (case insensitive)
      if (categories.some(cat => cat.toLowerCase() === trimmedCategory)) {
        toast({
          title: 'Error',
          description: `Category "${trimmedCategory}" already exists`,
          variant: 'destructive',
        });
        return;
      }
      
      // First, add to Supabase
      const { error } = await supabase
        .from('categories')
        .insert({ name: trimmedCategory });
        
      if (error) {
        console.error('Error adding category to Supabase:', error);
        toast({
          title: 'Error',
          description: `Failed to add category "${trimmedCategory}" to database: ${handleSupabaseError(error, 'insert')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Update local state if database operation was successful
      setCategories(prev => {
        const updated = [...prev, trimmedCategory];
        localStorage.setItem('cuephoriaCategories', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: 'Success',
        description: `Category "${trimmedCategory}" has been added`,
      });
    } catch (error) {
      console.error('Error in addCategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to add category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const updateCategory = async (oldCategory: string, newCategory: string) => {
    try {
      // Don't allow changing the uncategorized category
      if (oldCategory.toLowerCase() === 'uncategorized') {
        toast({
          title: 'Error',
          description: `The "uncategorized" category cannot be renamed`,
          variant: 'destructive',
        });
        return;
      }
      
      const trimmedNewCategory = newCategory.trim().toLowerCase();
      
      if (oldCategory === newCategory || !trimmedNewCategory) {
        return; // No change or empty category
      }
      
      // Check if new name already exists (case insensitive)
      if (categories.some(cat => cat.toLowerCase() === trimmedNewCategory && cat.toLowerCase() !== oldCategory.toLowerCase())) {
        toast({
          title: 'Error',
          description: `Category "${trimmedNewCategory}" already exists`,
          variant: 'destructive',
        });
        return;
      }
      
      // First update in Supabase
      const { error } = await supabase
        .from('categories')
        .update({ name: trimmedNewCategory })
        .eq('name', oldCategory.toLowerCase());
        
      if (error) {
        console.error('Error updating category in Supabase:', error);
        toast({
          title: 'Error',
          description: `Failed to update category from "${oldCategory}" to "${trimmedNewCategory}": ${handleSupabaseError(error, 'update')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Update products with this category
      setProducts(prev =>
        prev.map(product => 
          product.category.toLowerCase() === oldCategory.toLowerCase() 
            ? { ...product, category: trimmedNewCategory } 
            : product
        )
      );
      
      // Also update products in database
      const { error: updateProductsError } = await supabase
        .from('products')
        .update({ category: trimmedNewCategory })
        .eq('category', oldCategory);
        
      if (updateProductsError) {
        console.error('Error updating products category in Supabase:', updateProductsError);
      }
      
      // Update category list
      setCategories(prev => {
        const updated = prev.map(cat => 
          cat.toLowerCase() === oldCategory.toLowerCase() ? trimmedNewCategory : cat
        );
        localStorage.setItem('cuephoriaCategories', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: 'Success',
        description: `Category updated from "${oldCategory}" to "${trimmedNewCategory}"`,
      });
    } catch (error) {
      console.error('Error in updateCategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to update category. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const deleteCategory = async (category: string) => {
    try {
      const lowerCategory = category.toLowerCase();
      
      // Don't allow deleting the uncategorized category
      if (lowerCategory === 'uncategorized') {
        toast({
          title: 'Error',
          description: `The "uncategorized" category cannot be deleted`,
          variant: 'destructive',
        });
        return;
      }
      
      // Check if products use this category
      const productsWithCategory = products.filter(
        p => p.category.toLowerCase() === lowerCategory
      );
      
      // Delete from Supabase
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', lowerCategory);
        
      if (error) {
        console.error('Error deleting category from Supabase:', error);
        toast({
          title: 'Error',
          description: `Failed to delete category "${category}" from database: ${handleSupabaseError(error, 'delete')}`,
          variant: 'destructive',
        });
        return;
      }
      
      // Update products with this category to 'uncategorized'
      if (productsWithCategory.length > 0) {
        // Update products
        setProducts(prev =>
          prev.map(product => 
            product.category.toLowerCase() === lowerCategory
              ? { ...product, category: 'uncategorized' } 
              : product
          )
        );
        
        // Update products in database
        const { error: updateProductsError } = await supabase
          .from('products')
          .update({ category: 'uncategorized' })
          .eq('category', lowerCategory);
          
        if (updateProductsError) {
          console.error('Error updating products category in Supabase:', updateProductsError);
        }
      }
      
      // Remove from local categories list
      setCategories(prev => {
        const updated = prev.filter(cat => cat.toLowerCase() !== lowerCategory);
        localStorage.setItem('cuephoriaCategories', JSON.stringify(updated));
        return updated;
      });
      
      toast({
        title: 'Success',
        description: `Category "${category}" has been deleted`,
      });
    } catch (error) {
      console.error('Error in deleteCategory:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete category. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Select customer
  const selectCustomer = (id: string | null) => {
    if (id) {
      const customer = customers.find(c => c.id === id);
      if (customer) {
        setSelectedCustomer(customer);
        setActiveCustomerId(id);
        
        // Load this customer's cart into the legacy cart system
        const customerCart = getCurrentCart(id);
        setCart(customerCart);
        
        // Also load any customer-specific settings
        const customerCartData = customerCarts[id];
        if (customerCartData) {
          setLegacyDiscount(customerCartData.discount, customerCartData.discountType);
          setLegacyLoyaltyPointsUsed(customerCartData.loyaltyPointsUsed);
          setIsStudentDiscount(customerCartData.isStudentDiscount);
          setLegacySplitPayment(customerCartData.isSplitPayment);
          setLegacyCashAmount(customerCartData.cashAmount);
          setLegacyUpiAmount(customerCartData.upiAmount);
        }
      }
    } else {
      setSelectedCustomer(null);
      setActiveCustomerId(null);
      clearLegacyCart();
    }
  };
  
  // Add item to cart
  const addToCart = (item: Omit<CartItem, 'total'>) => {
    if (!selectedCustomer) {
      toast({
        title: "Error",
        description: "No customer selected. Please select a customer first.",
        variant: "destructive"
      });
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
  
  // Update split payment settings
  const setIsSplitPayment = (split: boolean) => {
    if (!selectedCustomer) {
      setLegacySplitPayment(split);
      return;
    }
    
    // Set in customer-specific cart
    setCustomerSplitPayment(selectedCustomer.id, split);
    
    // Also set in legacy cart for compatibility
    setLegacySplitPayment(split);
  };
  
  // Update split amounts
  const updateSplitAmounts = (cash: number, upi: number) => {
    if (!selectedCustomer) {
      return updateLegacySplitAmounts(cash, upi);
    }
    
    const total = calculateTotal();
    const result = updateCustomerSplitAmounts(selectedCustomer.id, cash, upi, total);
    
    if (result) {
      // Also update in legacy cart
      updateLegacySplitAmounts(cash, upi);
    }
    
    return result;
  };
  
  // Set cash amount
  const setCashAmount = (amount: number) => {
    if (!selectedCustomer) {
      setLegacyCashAmount(amount);
      return;
    }
    
    // For now we'll just use the legacy functions
    // This will be synced back to the customer cart during the split payment logic
    setLegacyCashAmount(amount);
  };
  
  // Set UPI amount
  const setUpiAmount = (amount: number) => {
    if (!selectedCustomer) {
      setLegacyUpiAmount(amount);
      return;
    }
    
    // For now we'll just use the legacy functions
    // This will be synced back to the customer cart during the split payment logic
    setLegacyUpiAmount(amount);
  };
  
  // Calculate total
  const calculateTotal = () => {
    if (!selectedCustomer) {
      return calculateLegacyTotal();
    }
    
    // Calculate from customer-specific cart
    return calculateCustomerCartTotal(selectedCustomer.id);
  };
  
  // Process products when completing a sale
  const processProductsInBill = async (items: CartItem[]) => {
    const productItems = items.filter(item => item.type === 'product');
    
    for (const item of productItems) {
      // Find the product to update
      const product = products.find(p => p.id === item.id);
      if (!product) continue;
      
      // Check for membership items
      if (item.category === 'membership' && selectedCustomer) {
        // Handle membership purchase separately
        const membershipHours = product.membershipHours || 0;
        const membershipDuration = product.duration;
        
        // Update the customer's membership - now properly awaited
        if (updateCustomerMembership) {
          await updateCustomerMembership(selectedCustomer.id, {
            membershipPlan: product.name,
            membershipDuration,
            membershipHoursLeft: membershipHours
          });
        }
      }
      
      // Update stock for non-membership products
      if (item.category !== 'membership') {
        // Update stock
        const newStock = Math.max(0, product.stock - item.quantity);
        updateProduct({ ...product, stock: newStock });
      }
    }
    
    return productItems;
  };
  
  // Complete sale
  const completeSale = async (paymentMethod: 'cash' | 'upi' | 'split'): Promise<Bill | undefined> => {
    try {
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
      
      // Calculate loyalty points earned (members: 5 points per 100 INR, non-members: 2 points per 100 INR)
      const pointsRate = selectedCustomer.isMember ? 5 : 2;
      const loyaltyPointsEarned = Math.floor((total / 100) * pointsRate);
      
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
        cashAmount: paymentMethod === 'split' ? customerCart.cashAmount : (paymentMethod === 'cash' ? total : 0),
        upiAmount: paymentMethod === 'split' ? customerCart.upiAmount : (paymentMethod === 'upi' ? total : 0),
        createdAt: new Date()
      };
      
      // Process products (update inventory, membership, etc.)
      await processProductsInBill(cartItems);
      
      // Update customer loyalty points
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        loyaltyPoints: selectedCustomer.loyaltyPoints + loyaltyPointsEarned - customerCart.loyaltyPointsUsed,
        totalSpent: selectedCustomer.totalSpent + total
      };
      updateCustomer(updatedCustomer);
      
      // Save bill to database
      completeSaleBase(
        cartItems,
        selectedCustomer,
        customerCart.discount,
        customerCart.discountType,
        customerCart.loyaltyPointsUsed,
        () => total,
        paymentMethod,
        products,
        customerCart.isSplitPayment,
        customerCart.cashAmount,
        customerCart.upiAmount
      );
      
      // Clear the customer's cart
      clearCustomerCart(selectedCustomer.id);
      
      // Clear the legacy cart
      clearLegacyCart();
      
      // Reset customer selections
      setSelectedCustomer(null);
      setActiveCustomerId(null);
      
      return bill;
    } catch (error) {
      console.error("Error in completeSale:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      return undefined;
    }
  };
  
  // Export bills
  const exportBills = () => {
    exportBillsBase(customers);
  };
  
  // Export customers
  const exportCustomers = () => {
    exportCustomersBase(customers);
  };
  
  // Update bill
  const updateBill = async (
    originalBill: Bill, 
    updatedItems: CartItem[], 
    customer: Customer, 
    discount: number, 
    discountType: 'percentage' | 'fixed', 
    loyaltyPointsUsed: number,
    isSplitPayment: boolean = false,
    cashAmount: number = 0,
    upiAmount: number = 0
  ): Promise<Bill | null> => {
    return updateBillBase(
      originalBill,
      updatedItems,
      customer,
      discount,
      discountType,
      loyaltyPointsUsed,
      isSplitPayment,
      cashAmount,
      upiAmount
    );
  };
  
  // Delete bill
  const deleteBill = async (billId: string, customerId: string): Promise<boolean> => {
    return await deleteBillBase(billId, customerId);
  };
  
  // Reset to sample data
  const resetToSampleData = (options?: ResetOptions) => {
    console.log('Reset to sample data functionality not implemented');
  };
  
  // Add sample Indian data
  const addSampleIndianData = () => {
    console.log('Sample data functionality has been removed. Please add products manually or through database import.');
  };
  
  console.log("POSProvider rendering with context value"); // Debug log
  
  // Create the context value object
  const contextValue: POSContextType = {
    products,
    productsLoading,
    productsError,
    stations,
    customers,
    sessions: [], // Not used directly in the UI
    bills,
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
    setBills,
    setCustomers,
    setStations,
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
    updateCustomerMembership, // This now correctly has the Promise<Customer | null> type
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
    updateBill,
    deleteBill,
    exportBills,
    exportCustomers,
    resetToSampleData,
    addSampleIndianData,
    setIsSplitPayment,
    setCashAmount,
    setUpiAmount,
    updateSplitAmounts
  };
  
  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};

// Export the usePOS hook
export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};

// Export types
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
