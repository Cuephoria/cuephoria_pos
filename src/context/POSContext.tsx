import React, { createContext, useContext } from 'react';
import { 
  POSContextType, 
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill
} from '@/types/pos.types';
import { initialProducts, initialStations, initialCustomers } from '@/data/sampleData';
import { resetToSampleData, addSampleIndianData } from '@/services/dataOperations';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // Initialize all hooks
  const { 
    products, 
    setProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct 
  } = useProducts(initialProducts);
  
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
  } = useCustomers(initialCustomers);
  
  const { 
    stations, 
    setStations, 
    sessions, 
    setSessions, 
    startSession: startSessionBase, 
    endSession: endSessionBase 
  } = useStations(initialStations, updateCustomer);
  
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
    exportBills: exportBillsBase, 
    exportCustomers: exportCustomersBase 
  } = useBills(updateCustomer, updateProduct);
  
  // Wrapper functions that combine functionality from multiple hooks
  const startSession = (stationId: string, customerId: string) => {
    // Check membership validity before allowing session
    if (!checkMembershipValidity(customerId)) {
      return;
    }
    
    return startSessionBase(stationId, customerId);
  };
  
  const endSession = (stationId: string) => {
    const result = endSessionBase(stationId, customers);
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
      console.log("Adding session to cart:", sessionCartItem);
      addToCart(sessionCartItem);
      
      return result.updatedSession;
    }
  };
  
  const completeSale = (paymentMethod: 'cash' | 'upi') => {
    try {
      // Look for membership products in cart
      const membershipItems = cart.filter(item => {
        const product = products.find(p => p.id === item.id);
        return product && product.category === 'membership';
      });
      
      const bill = completeSaleBase(
        cart, 
        selectedCustomer, 
        discount, 
        discountType, 
        loyaltyPointsUsed, 
        calculateTotal, 
        paymentMethod,
        products
      );
      
      // If we have a successful sale with membership items, update the customer
      if (bill && selectedCustomer && membershipItems.length > 0) {
        for (const item of membershipItems) {
          const product = products.find(p => p.id === item.id);
          
          if (product) {
            // Default values
            let membershipHours = 20; // Default hours
            let membershipDuration: 'weekly' | 'monthly' = 'weekly';
            
            // Set duration based on product
            if (product.duration) {
              membershipDuration = product.duration;
            } else if (product.name.toLowerCase().includes('weekly')) {
              membershipDuration = 'weekly';
            } else if (product.name.toLowerCase().includes('monthly')) {
              membershipDuration = 'monthly';
            }
            
            // Adjust hours based on plan type
            if (product.name.includes('8-Ball')) {
              membershipHours = membershipDuration === 'weekly' ? 20 : 80;
            } else if (product.name.includes('PS5')) {
              membershipHours = membershipDuration === 'weekly' ? 15 : 60;
            } else if (product.name.includes('Combo')) {
              membershipHours = membershipDuration === 'weekly' ? 30 : 120;
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
      }
      
      return bill;
    } catch (error) {
      // Re-throw the error to be handled by the component
      throw error;
    }
  };
  
  const exportBills = () => {
    exportBillsBase(customers);
  };
  
  const exportCustomers = () => {
    exportCustomersBase(customers);
  };
  
  // Wrapper for sample data functions
  const handleResetToSampleData = (options?: ResetOptions) => {
    resetToSampleData(
      options,
      initialProducts,
      initialCustomers,
      initialStations,
      setProducts,
      setCustomers,
      setBills,
      setSessions,
      setStations,
      setCart,
      setDiscountAmount,
      setLoyaltyPointsUsedAmount,
      setSelectedCustomer
    );
  };
  
  const handleAddSampleIndianData = () => {
    addSampleIndianData(
      products,
      customers,
      bills,
      setProducts,
      setCustomers,
      setBills
    );
  };
  
  console.log('POSProvider rendering with context value'); // Debug log
  
  return (
    <POSContext.Provider
      value={{
        products,
        stations,
        customers,
        sessions,
        bills,
        cart,
        selectedCustomer,
        discount,
        discountType,
        loyaltyPointsUsed,
        setStations,
        addProduct,
        updateProduct,
        deleteProduct,
        startSession,
        endSession,
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
