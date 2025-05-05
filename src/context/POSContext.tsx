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
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const POSContext = createContext<POSContextType>({
  products: [],
  productsLoading: false,
  productsError: null,
  stations: [],
  customers: [],
  sessions: [],
  bills: [],
  cart: [],
  selectedCustomer: null,
  discount: 0,
  discountType: 'percentage',
  loyaltyPointsUsed: 0,
  isStudentDiscount: false,
  categories: ['food', 'drinks', 'tobacco', 'challenges', 'membership'], // Default categories
  setIsStudentDiscount: () => {},
  setStations: () => {},
  addProduct: () => ({}),
  updateProduct: () => ({}),
  deleteProduct: () => {},
  addCategory: () => {},
  updateCategory: () => {},
  deleteCategory: () => {},
  startSession: async () => {},
  endSession: async () => {},
  deleteStation: async () => false,
  updateStation: async () => false,  // Add default implementation
  addCustomer: () => ({}),
  updateCustomer: () => ({}),
  updateCustomerMembership: () => null,
  deleteCustomer: () => {},
  selectCustomer: () => {},
  checkMembershipValidity: () => false,
  deductMembershipHours: () => false,
  addToCart: () => {},
  removeFromCart: () => {},
  updateCartItem: () => {},
  clearCart: () => {},
  setDiscount: () => {},
  setLoyaltyPointsUsed: () => {},
  calculateTotal: () => 0,
  completeSale: () => undefined,
  deleteBill: async () => false,
  exportBills: () => {},
  exportCustomers: () => {},
  resetToSampleData: () => {},
  addSampleIndianData: () => {}
});

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // State for student discount
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);

  // State for categories
  const [categories, setCategories] = useState<string[]>([
    'food', 'drinks', 'tobacco', 'challenges', 'membership'
  ]);

  // Load categories from localStorage on initialization
  useEffect(() => {
    const storedCategories = localStorage.getItem('cuephoriaCategories');
    if (storedCategories) {
      try {
        setCategories(JSON.parse(storedCategories));
      } catch (error) {
        console.error('Error parsing stored categories:', error);
      }
    }
  }, []);
  
  // Initialize all hooks
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
  
  const { 
    customers, 
    setCustomers, 
    selectedCustomer, 
    setSelectedCustomer, 
    addCustomer, 
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer, 
    selectCustomer,
    checkMembershipValidity,
    deductMembershipHours
  } = useCustomers([]);
  
  const { 
    stations, 
    setStations, 
    sessions, 
    setSessions, 
    startSession: startSessionBase, 
    endSession: endSessionBase,
    deleteStation,
    updateStation
  } = useStations([], updateCustomer);
  
  const { 
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
  } = useCart();
  
  const { 
    bills, 
    setBills, 
    completeSale: completeSaleBase, 
    deleteBill: deleteBillBase,
    exportBills: exportBillsBase, 
    exportCustomers: exportCustomersBase 
  } = useBills(updateCustomer, updateProduct);

  // Save categories to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cuephoriaCategories', JSON.stringify(categories));
  }, [categories]);

  // Update product categories when categories change
  useEffect(() => {
    // This function will be called when we need to sync product categories with Supabase
    const syncProductCategories = async () => {
      try {
        // For each product, check if its category still exists
        for (const product of products) {
          if (!categories.includes(product.category) && product.category !== 'uncategorized') {
            // If category doesn't exist anymore, move to 'uncategorized'
            const updatedProduct = { 
              ...product, 
              category: 'uncategorized' 
            };
            
            // Update in local state
            updateProduct(updatedProduct);
          }
        }
      } catch (error) {
        console.error('Error syncing product categories:', error);
      }
    };

    // Add 'uncategorized' if it doesn't exist yet
    if (!categories.includes('uncategorized')) {
      setCategories(prev => [...prev, 'uncategorized']);
    }

    // Sync product categories when categories change
    if (products.length > 0) {
      syncProductCategories();
    }
  }, [categories, products]);

  // Category management functions
  const addCategory = (category: string) => {
    const trimmedCategory = category.trim().toLowerCase();
    if (!categories.includes(trimmedCategory) && trimmedCategory) {
      setCategories(prev => [...prev, trimmedCategory]);
      console.log(`Category added: ${trimmedCategory}`);
    }
  };

  const updateCategory = (oldCategory: string, newCategory: string) => {
    const trimmedNewCategory = newCategory.trim().toLowerCase();
    
    if (oldCategory === newCategory || !trimmedNewCategory) {
      return; // No change or empty category
    }
    
    // Update categories list
    setCategories(prev => 
      prev.map(cat => cat === oldCategory ? trimmedNewCategory : cat)
    );
    
    // Update products with this category
    setProducts(prev =>
      prev.map(product => 
        product.category === oldCategory 
          ? { ...product, category: trimmedNewCategory } 
          : product
      )
    );

    // Update products in Supabase
    const updateProductsInSupabase = async () => {
      try {
        const { data: productsToUpdate, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('category', oldCategory);

        if (fetchError) {
          console.error('Error fetching products for category update:', fetchError);
          return;
        }

        if (productsToUpdate && productsToUpdate.length > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ category: trimmedNewCategory })
            .eq('category', oldCategory);

          if (updateError) {
            console.error('Error updating product categories in database:', updateError);
          } else {
            console.log(`Updated ${productsToUpdate.length} products from category "${oldCategory}" to "${trimmedNewCategory}" in database`);
          }
        }
      } catch (error) {
        console.error('Error in updateProductsInSupabase:', error);
      }
    };

    updateProductsInSupabase();
    console.log(`Category updated: ${oldCategory} -> ${trimmedNewCategory}`);
  };

  const deleteCategory = (category: string) => {
    // Remove from categories list
    setCategories(prev => prev.filter(cat => cat !== category));
    
    // Update products with this category to 'uncategorized'
    setProducts(prev =>
      prev.map(product => 
        product.category === category 
          ? { ...product, category: 'uncategorized' } 
          : product
      )
    );

    // Update products in Supabase
    const updateProductsInSupabase = async () => {
      try {
        const { data: productsToUpdate, error: fetchError } = await supabase
          .from('products')
          .select('*')
          .eq('category', category);

        if (fetchError) {
          console.error('Error fetching products for category deletion:', fetchError);
          return;
        }

        if (productsToUpdate && productsToUpdate.length > 0) {
          const { error: updateError } = await supabase
            .from('products')
            .update({ category: 'uncategorized' })
            .eq('category', category);

          if (updateError) {
            console.error('Error updating product categories in database:', updateError);
          } else {
            console.log(`Updated ${productsToUpdate.length} products from deleted category "${category}" to "uncategorized" in database`);
          }
        }
      } catch (error) {
        console.error('Error in updateProductsInSupabase:', error);
      }
    };

    updateProductsInSupabase();
    
    // Add 'uncategorized' if it doesn't exist yet
    if (!categories.includes('uncategorized')) {
      setCategories(prev => [...prev, 'uncategorized']);
    }

    console.log(`Category deleted: ${category}`);
  };
  
  // Wrapper functions that combine functionality from multiple hooks
  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    await startSessionBase(stationId, customerId);
  };
  
  // Make endSession return a Promise<void> to match type definition
  const endSession = async (stationId: string): Promise<void> => {
    try {
      // Get the current station
      const station = stations.find(s => s.id === stationId);
      if (!station || !station.isOccupied || !station.currentSession) {
        console.log("No active session found for this station in wrapper");
        throw new Error("No active session found");
      }
      
      // Get the customer ID before ending the session
      const customerId = station.currentSession.customerId;
      
      // Call the base endSession function
      const result = await endSessionBase(stationId, customers);
      
      if (result) {
        const { sessionCartItem, customer } = result;
        
        // Clear cart before adding the new session
        clearCart();
        
        // Auto-select customer
        if (customer) {
          console.log("Auto-selecting customer:", customer.name);
          selectCustomer(customer.id);
        }
        
        // Add the session to cart
        if (sessionCartItem) {
          console.log("Adding session to cart:", sessionCartItem);
          addToCart(sessionCartItem);
        }
      }
    } catch (error) {
      console.error('Error in endSession:', error);
      throw error;
    }
  };
  
  // Fix for the Promise<Customer> error - wrap in a synchronous function that returns Customer | null
  const updateCustomerMembershipWrapper = (
    customerId: string, 
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ): Customer | null => {
    // Create a placeholder customer with the minimum required fields
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return null;
    
    // Start the async update process but don't wait for it
    updateCustomerMembership(customerId, membershipData)
      .then((updatedCustomer) => {
        if (updatedCustomer) {
          console.log("Customer membership updated:", updatedCustomer.id);
        }
      })
      .catch(error => {
        console.error("Error updating customer membership:", error);
      });
    
    // Return a modified version of the existing customer to satisfy the synchronous interface
    return {
      ...customer,
      membershipPlan: membershipData.membershipPlan || customer.membershipPlan,
      membershipDuration: membershipData.membershipDuration || customer.membershipDuration,
      membershipHoursLeft: membershipData.membershipHoursLeft !== undefined 
        ? membershipData.membershipHoursLeft 
        : customer.membershipHoursLeft,
      isMember: true
    };
  };
  
  // Modified to handle async operations but return synchronously
  const completeSale = (paymentMethod: 'cash' | 'upi'): Bill | undefined => {
    try {
      // Apply student price for membership items if student discount is enabled
      if (isStudentDiscount) {
        const updatedCart = cart.map(item => {
          const product = products.find(p => p.id === item.id) as Product;
          if (product && product.category === 'membership' && product.studentPrice) {
            return {
              ...item,
              price: product.studentPrice,
              total: product.studentPrice * item.quantity
            };
          }
          return item;
        });
        
        // Temporarily update cart with student prices
        setCart(updatedCart);
      }
      
      // Look for membership products in cart
      const membershipItems = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'membership';
      });
      
      // This is async but we're handling it internally and returning a synchronous Bill
      completeSaleBase(
        cart, 
        selectedCustomer, 
        discount, 
        discountType, 
        loyaltyPointsUsed, 
        calculateTotal, 
        paymentMethod,
        products
      ).then(bill => {
        // If we have a successful sale with membership items, update the customer
        if (bill && selectedCustomer && membershipItems.length > 0) {
          for (const item of membershipItems) {
            const product = products.find(p => p.id === item.id);
            
            if (product) {
              // Default values
              let membershipHours = product.membershipHours || 4; // Default hours from product or fallback to 4
              let membershipDuration: 'weekly' | 'monthly' = 'weekly';
              
              // Set duration based on product
              if (product.duration) {
                membershipDuration = product.duration;
              } else if (product.name.toLowerCase().includes('weekly')) {
                membershipDuration = 'weekly';
              } else if (product.name.toLowerCase().includes('monthly')) {
                membershipDuration = 'monthly';
              }
              
              // Update customer's membership
              updateCustomerMembership(selectedCustomer.id, {
                membershipPlan: product.name,
                membershipDuration: membershipDuration,
                membershipHoursLeft: membershipHours
              });
              
              break; // Only apply the first membership found
            }
          }
        }
        
        if (bill) {
          // Clear the cart after successful sale
          clearCart();
          // Reset selected customer
          setSelectedCustomer(null);
          // Reset student discount
          setIsStudentDiscount(false);
        }
      }).catch(error => {
        console.error("Error in completeSale async:", error);
      });
      
      // Return a synchronous bill for the UI
      if (selectedCustomer) {
        // Calculate loyalty points earned using the new rule
        // Members: 5 points per 100 INR spent
        // Non-members: 2 points per 100 INR spent
        const pointsRate = selectedCustomer.isMember ? 5 : 2;
        const total = calculateTotal();
        const loyaltyPointsEarned = Math.floor((total / 100) * pointsRate);
        
        const placeholderBill: Bill = {
          id: `temp-${new Date().getTime()}`,
          customerId: selectedCustomer.id,
          items: [...cart],
          subtotal: cart.reduce((sum, item) => sum + item.total, 0),
          discount,
          discountValue: discount > 0 ? 
            (discountType === 'percentage' ? 
              (cart.reduce((sum, item) => sum + item.total, 0) * discount / 100) : 
              discount) : 0,
          discountType,
          loyaltyPointsUsed,
          loyaltyPointsEarned,
          total,
          paymentMethod,
          createdAt: new Date()
        };
        return placeholderBill;
      }
      
      return undefined;
      
    } catch (error) {
      console.error("Error in completeSale:", error);
      return undefined;
    }
  };
  
  const exportBills = () => {
    exportBillsBase(customers);
  };
  
  const exportCustomers = () => {
    exportCustomersBase(customers);
  };
  
  // Simplified reset function - only resets local state
  const handleResetToSampleData = async (options?: ResetOptions) => {
    try {
      // Import the reset function from services
      const { resetToSampleData } = await import('@/services/dataOperations');
      
      // Call the async reset function
      await resetToSampleData(
        options,
        setProducts,
        setCustomers,
        setBills,
        setSessions,
        setStations,
        setCart,
        setDiscountAmount,
        setLoyaltyPointsUsedAmount,
        setSelectedCustomer,
        refreshFromDB
      );
      
      return true;
    } catch (error) {
      console.error('Error in handleResetToSampleData:', error);
      throw error;
    }
  };
  
  // Remove sample data functionality
  const handleAddSampleIndianData = () => {
    const { toast } = useToast();
    toast({
      title: "Info",
      description: "Sample data functionality has been removed. Please add products manually or through database import.",
    });
  };
  
  // Update the deleteBill function to handle bill deletion even if customer has been deleted
  const deleteBill = async (billId: string, customerId: string): Promise<boolean> => {
    return await deleteBillBase(billId, customerId);
  };
  
  console.log('POSProvider rendering with context value'); // Debug log
  
  return (
    <POSContext.Provider
      value={{
        products,
        productsLoading,
        productsError,
        stations,
        customers,
        sessions,
        bills,
        cart,
        selectedCustomer,
        discount,
        discountType,
        loyaltyPointsUsed,
        isStudentDiscount,
        categories,
        setIsStudentDiscount,
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
        updateCustomerMembership: updateCustomerMembershipWrapper,
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
        deleteBill,
        exportBills,
        exportCustomers,
        resetToSampleData: handleResetToSampleData,
        addSampleIndianData: handleAddSampleIndianData
      }}
    >
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
