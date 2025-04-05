
import React, { createContext, useContext, useState } from 'react';
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
import { useCustomerOperations } from './operations/useCustomerOperations';
import { useProductOperations } from './operations/useProductOperations';
import { useStationOperations } from './operations/useStationOperations';
import { useBillOperations } from './operations/useBillOperations';
import { usePOSUtilities } from './operations/usePOSUtilities';

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
  
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  
  const { 
    products, 
    loading: productsLoading,
    error: productsError,
    setProducts, 
    refreshFromDB
  } = useProducts();
  
  const { 
    customers, 
    setCustomers, 
    selectedCustomer, 
    setSelectedCustomer
  } = useCustomers([]);
  
  const { 
    stations, 
    setStations, 
    sessions, 
    setSessions
  } = useStations([], () => {});
  
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
    setBills
  } = useBills(() => {}, () => {});

  // Operations hooks
  const productOperations = useProductOperations(products, setProducts);
  const customerOperations = useCustomerOperations(customers, selectedCustomer, setSelectedCustomer);
  const stationOperations = useStationOperations(stations, sessions, customers);
  const billOperations = useBillOperations(bills, setBills, customers, products, cart, selectedCustomer, clearCart, setSelectedCustomer, isStudentDiscount, setIsStudentDiscount);
  const posUtilities = usePOSUtilities();
  
  console.log('POSProvider rendering with context value'); // Debug log
  
  // Fix for error: Type 'string' is not assignable to type 'Error'
  const productsErrorObject = typeof productsError === 'string' 
    ? new Error(productsError) 
    : productsError;
  
  if (!customers || !Array.isArray(customers)) {
    throw new Error('Customers must be an array');
  }
  
  return (
    <POSContext.Provider
      value={{
        products,
        productsLoading,
        productsError: productsErrorObject,
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
        addProduct: productOperations.addProduct,
        updateProduct: productOperations.updateProduct,
        deleteProduct: productOperations.deleteProduct,
        startSession: stationOperations.startSession,
        endSession: stationOperations.endSession,
        deleteStation: stationOperations.deleteStation,
        deleteSession: stationOperations.deleteSession,
        addCustomer: customerOperations.addCustomer,
        updateCustomer: customerOperations.updateCustomer,
        updateCustomerMembership: customerOperations.updateCustomerMembership,
        deleteCustomer: customerOperations.deleteCustomer,
        selectCustomer: customerOperations.selectCustomer,
        checkMembershipValidity: customerOperations.checkMembershipValidity,
        deductMembershipHours: customerOperations.deductMembershipHours,
        addToCart,
        removeFromCart,
        // Fix for updateCartItem signature mismatch
        updateCartItem: (itemId: string, updates: Partial<CartItem>) => {
          if (typeof updates === 'object' && 'quantity' in updates) {
            updateCartItem(itemId, updates.quantity as number);
          }
        },
        clearCart,
        setDiscount,
        setLoyaltyPointsUsed,
        calculateTotal,
        completeSale: billOperations.completeSale,
        deleteBill: billOperations.deleteBill,
        exportBills: billOperations.exportBills,
        exportCustomers: billOperations.exportCustomers,
        resetToSampleData: posUtilities.handleResetToSampleData,
        addSampleIndianData: posUtilities.handleAddSampleIndianData
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
