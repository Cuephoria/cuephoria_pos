
import React, { createContext, useContext } from 'react';
import { 
  POSContextType, 
  ResetOptions, 
  Customer, 
  CartItem, 
  Bill,
  MembershipType,
  Station,
  CartItemType
} from '@/types/pos.types';
import { sampleProducts, sampleStations, sampleCustomers, sampleBills } from '@/data/sampleData';
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
  } = useProducts(sampleProducts);
  
  const { 
    customers, 
    setCustomers, 
    selectedCustomer, 
    setSelectedCustomer, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    selectCustomer,
    addMembership,
    useMembershipCredit,
    isMembershipExpired,
    getMembershipDetails
  } = useCustomers(sampleCustomers);
  
  const { 
    stations, 
    setStations, 
    addStation, 
    updateStation, 
    removeStation, 
    startSession: startSessionBase, 
    endSession: endSessionBase 
  } = useStations(sampleStations);
  
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
  } = useBills(updateCustomer, updateProduct, addMembership);
  
  // Wrapper functions that combine functionality from multiple hooks
  const endSession = (stationId: string) => {
    const result = endSessionBase(stationId);
    if (result && result.sessionCartItem) {
      const { sessionCartItem, customer } = result;
      
      // Clear cart before adding the new session
      clearCart();
      
      // Auto-select customer
      if (customer) {
        console.log("Auto-selecting customer:", customer.name);
        selectCustomer(customer.id);
      }
      
      // Add the session to cart - Fix: Make sure sessionCartItem.type is explicitly typed
      console.log("Adding session to cart:", sessionCartItem);
      const typedCartItem = {
        ...sessionCartItem,
        type: 'session' as CartItemType // Explicitly type as a CartItemType
      };
      addToCart(typedCartItem);
      
      return result;
    }
    return null;
  };
  
  const completeSale = (paymentMethod: 'cash' | 'upi') => {
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
    
    if (bill) {
      // Clear the cart after successful sale
      clearCart();
      // Reset selected customer
      setSelectedCustomer(null);
    }
    
    return bill;
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
      sampleProducts,
      sampleCustomers,
      sampleStations,
      setProducts,
      setCustomers,
      setBills,
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
        bills,
        cart,
        selectedCustomer,
        discount,
        discountType,
        loyaltyPointsUsed,
        setStations,
        addStation,
        updateStation,
        removeStation,
        addProduct,
        updateProduct,
        deleteProduct,
        startSession: startSessionBase,
        endSession,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        selectCustomer,
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
        addSampleIndianData: handleAddSampleIndianData,
        // Membership functions
        addMembership,
        useMembershipCredit,
        isMembershipExpired,
        getMembershipDetails,
        sessions: [], // Added this to match the POSContextType
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
  MembershipType,
  Membership,
  ResetOptions,
  POSContextType,
  CartItemType
} from '@/types/pos.types';
