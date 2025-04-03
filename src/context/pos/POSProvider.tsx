
import React, { createContext, useContext, useState } from 'react';
import { 
  Customer, 
  Product, 
  Bill, 
  Session, 
  Station, 
  CartItem
} from '@/types/pos.types';
import { initialProducts, initialStations, initialCustomers } from '@/data/sampleData';
import { useProducts } from '@/hooks/useProducts';
import { useCustomers } from '@/hooks/useCustomers';
import { useStations } from '@/hooks/useStations';
import { useCart } from '@/hooks/useCart';
import { useBills } from '@/hooks/useBills';
import { POSContextType, ResetOptions } from './POSTypes';
import { 
  createResetToSampleData, 
  createAddSampleIndianData 
} from './POSUtils';
import { 
  createUpdateCustomerMembershipWrapper, 
  createStartSessionWrapper, 
  createEndSessionWrapper, 
  createCompleteSaleWrapper 
} from './POSFunctions';

// Create context
const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('POSProvider initialized'); // Debug log
  
  // State for student discount
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  
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
  
  // Create wrapper functions that combine functionality from multiple hooks
  const updateCustomerMembershipWrapper = createUpdateCustomerMembershipWrapper(
    customers,
    updateCustomerMembership
  );
  
  const startSession = createStartSessionWrapper(
    checkMembershipValidity,
    startSessionBase
  );
  
  const endSession = createEndSessionWrapper(
    stations, // Fixed: Passing stations instead of customers
    endSessionBase,
    clearCart,
    selectCustomer,
    addToCart
  );
  
  const completeSale = createCompleteSaleWrapper(
    cart,
    selectedCustomer,
    discount,
    discountType,
    loyaltyPointsUsed,
    calculateTotal,
    products,
    isStudentDiscount,
    setCart,
    completeSaleBase,
    updateCustomerMembership,
    clearCart,
    setSelectedCustomer,
    setIsStudentDiscount
  );
  
  const exportBills = () => {
    exportBillsBase(customers);
  };
  
  const exportCustomers = () => {
    exportCustomersBase(customers);
  };
  
  // Create sample data functions
  const handleResetToSampleData = createResetToSampleData(
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
  
  const handleAddSampleIndianData = createAddSampleIndianData(
    products,
    customers,
    bills,
    setProducts,
    setCustomers,
    setBills
  );
  
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
        isStudentDiscount,
        setIsStudentDiscount,
        setStations,
        addProduct,
        updateProduct,
        deleteProduct,
        startSession,
        endSession,
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

// Hook to use the POS context
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
