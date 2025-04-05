import React, { createContext, useContext, useState } from 'react';
import { 
  POSContextType, 
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill,
  Product,
  Station,
  Session,
  SessionResult
} from '@/types/pos.types';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';
import { useToast } from '@/hooks/use-toast';

// Create the context with proper Promise return types
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
  setIsStudentDiscount: () => {},
  setStations: () => {},
  addProduct: async () => Promise.resolve({} as Product),
  updateProduct: async () => Promise.resolve({} as Product),
  deleteProduct: async () => Promise.resolve(),
  startSession: async () => {},
  endSession: async () => {},
  deleteStation: async () => Promise.resolve(false),
  deleteSession: async () => Promise.resolve(false),
  addCustomer: async () => Promise.resolve({} as Customer),
  updateCustomer: async () => Promise.resolve({} as Customer),
  updateCustomerMembership: () => null,
  deleteCustomer: async () => Promise.resolve(),
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
  deleteBill: async () => Promise.resolve(false),
  exportBills: () => {},
  exportCustomers: () => {},
  resetToSampleData: async () => Promise.resolve(false),
  addSampleIndianData: () => {}
});

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // State for student discount
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  
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
    deleteSession
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
    updateCartItem: baseUpdateCartItem,  // Renamed to avoid conflict 
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
          loyaltyPointsEarned: Math.floor(calculateTotal() / 10),
          total: calculateTotal(),
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
  
  // Fix: Wrap with async to return Promise
  const handleResetToSampleData = async (options?: ResetOptions): Promise<boolean> => {
    try {
      // Import the reset function from services
      const { resetToSampleData } = await import('@/services/dataOperations');
      
      // Call the async reset function
      return await resetToSampleData(
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
    } catch (error) {
      console.error('Error in handleResetToSampleData:', error);
      return false; // Return false on error
    }
  };
  
  // This function is no longer needed but kept for API compatibility
  const handleAddSampleIndianData = () => {
    const { toast } = useToast();
    toast({
      description: "Sample data has been removed from the application."
    });
  };
  
  const deleteBill = async (billId: string, customerId: string): Promise<boolean> => {
    return await deleteBillBase(billId, customerId);
  };

  // Fix updateCartItem to handle Partial<CartItem> type
  const updateCartItem = (itemId: string, updates: Partial<CartItem>) => {
    // Handle quantity update or any other properties
    if (updates.quantity !== undefined) {
      baseUpdateCartItem(itemId, updates.quantity);
    } else {
      // For other properties, find the item and update it
      const itemIndex = cart.findIndex(item => item.id === itemId);
      if (itemIndex !== -1) {
        const updatedCart = [...cart];
        updatedCart[itemIndex] = { ...updatedCart[itemIndex], ...updates };
        setCart(updatedCart);
      }
    }
  };
  
  console.log('POSProvider rendering with context value'); // Debug log
  
  // Type-safe wrapper for Promise functions
  const addProductAsync = async (product: Partial<Product>): Promise<Product> => {
    return Promise.resolve(addProduct(product as Omit<Product, 'id'>));
  };

  const updateProductAsync = async (productId: string, updatedData: Partial<Product>): Promise<Product> => {
    // Find the product first
    const product = products.find(p => p.id === productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found`);
    }
    // Merge the product with updates
    const updatedProduct = { ...product, ...updatedData };
    return Promise.resolve(updateProduct(updatedProduct));
  };

  const deleteProductAsync = async (productId: string): Promise<void> => {
    deleteProduct(productId);
    return Promise.resolve();
  };

  const deleteCustomerAsync = async (customerId: string): Promise<void> => {
    deleteCustomer(customerId);
    return Promise.resolve();
  };
  
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
        setIsStudentDiscount,
        setStations,
        addProduct: addProductAsync,
        updateProduct: updateProductAsync,
        deleteProduct: deleteProductAsync,
        startSession,
        endSession,
        deleteStation,
        deleteSession,
        addCustomer,
        updateCustomer,
        updateCustomerMembership: updateCustomerMembershipWrapper,
        deleteCustomer: deleteCustomerAsync,
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
