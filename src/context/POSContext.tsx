
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useStations } from '@/hooks/useStations';
import { useCustomers } from '@/hooks/useCustomers';
import { useBills } from '@/hooks/useBills';
import { Product, Station, Session, Customer, CartItem, Bill } from '@/types/pos.types';
import { useCart } from '@/hooks/useCart';
import { useSessionActions } from '@/hooks/stations/session-actions';
import { SessionResult } from '@/types/pos.types';

export { type Product, type Station, type Session, type Customer, type CartItem, type Bill };

interface POSContextType {
  // Products state
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  
  // Stations state
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  
  // Sessions state
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  
  // Customers state
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  
  // Bills state
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  
  // Categories
  categories: string[];
  addCategory: (category: string) => void;
  updateCategory: (oldCategory: string, newCategory: string) => void;
  deleteCategory: (category: string) => void;
  
  // Cart related
  cart: CartItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  loyaltyPointsUsed: number;
  isStudentDiscount: boolean;
  setIsStudentDiscount: (value: boolean) => void;
  addToCart: (item: Omit<CartItem, 'total'>, availableStock?: number) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number, type: 'percentage' | 'fixed') => void;
  setLoyaltyPointsUsed: (points: number) => void;
  calculateTotal: () => number;
  
  // Product functions
  addProduct: (product: Omit<Product, "id">) => Promise<Product | undefined>;
  updateProduct: (product: Product) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<void>;
  
  // Station functions
  addStation: (station: Omit<Station, "id" | "isOccupied" | "createdAt">) => Promise<Station | undefined>;
  updateStation: (station: Station) => Promise<Station | undefined>;
  deleteStation: (id: string) => Promise<void>;
  
  // Session functions
  startSession: (stationId: string, customerId: string) => Promise<void>;
  pauseSession: (id: string) => Promise<void>;
  resumeSession: (id: string) => Promise<void>;
  endSession: (stationId: string) => Promise<void>;
  updateSession: (session: Session) => Promise<Session | undefined>;
  deleteSession: (id: string) => Promise<void>;
  
  // Customer functions
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => Promise<Customer | null>;
  updateCustomer: (customer: Customer) => Promise<Customer | null>;
  updateCustomerMembership: (
    customerId: string, 
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ) => Promise<Customer | null>;
  deleteCustomer: (id: string) => Promise<void>;
  selectCustomer: (id: string | null) => void;
  
  // Membership functions
  checkMembershipValidity: (customerId: string) => boolean;
  deductMembershipHours: (customerId: string, hours: number) => boolean;
  
  // Sale functions
  completeSale: (paymentMethod: 'cash' | 'upi') => Bill | undefined;
  
  // Bill functions
  deleteBill: (billId: string, customerId: string) => Promise<boolean>;
  exportBills: (customers: Customer[]) => void;
  exportCustomers: (customers: Customer[]) => void;
  fetchBills: () => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { 
    products, 
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct
  } = useProducts();
  
  const {
    stations,
    setStations,
  } = useStations();
  
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
  
  // Use cart hook for cart-related functionality
  const {
    cart,
    setCart,
    discount,
    discountType,
    loyaltyPointsUsed,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setDiscount,
    setLoyaltyPointsUsed,
    calculateTotal
  } = useCart();
  
  // Initialize categories state and related functions
  const [categories, setCategories] = useState<string[]>([
    'food', 'drinks', 'tobacco', 'challenges', 'membership', 'uncategorized'
  ]);
  const [isStudentDiscount, setIsStudentDiscount] = useState(false);
  
  const addCategory = (category: string) => {
    if (!categories.includes(category.toLowerCase())) {
      setCategories(prev => [...prev, category.toLowerCase()]);
    }
  };
  
  const updateCategory = (oldCategory: string, newCategory: string) => {
    // Update category name
    setCategories(prev => 
      prev.map(cat => cat === oldCategory ? newCategory : cat)
    );
    
    // Update products with this category
    setProducts(prev =>
      prev.map(product => 
        product.category === oldCategory 
          ? { ...product, category: newCategory } 
          : product
      )
    );
  };
  
  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(cat => cat !== category));
    
    // Move products to "uncategorized" category
    setProducts(prev =>
      prev.map(product => 
        product.category === category 
          ? { ...product, category: 'uncategorized' } 
          : product
      )
    );
  };
  
  // Create dummy session functions that will be overridden by useSessionActions
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Use the session actions hook
  const sessionActions = useSessionActions({
    stations,
    setStations,
    sessions,
    setSessions,
    updateCustomer
  });
  
  const {
    bills,
    setBills,
    completeSale,
    deleteBill,
    exportBills,
    exportCustomers,
    fetchBills
  } = useBills(updateCustomer, updateProduct);
  
  // Create the context value object with all required properties
  const value: POSContextType = {
    // Products
    products,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Stations
    stations,
    setStations,
    addStation: sessionActions.addStation || (async () => undefined),
    updateStation: sessionActions.updateStation || (async () => undefined),
    deleteStation: sessionActions.deleteStation || (async () => {}),
    
    // Sessions
    sessions,
    setSessions,
    startSession: sessionActions.startSession,
    pauseSession: async () => {}, // Placeholder
    resumeSession: async () => {}, // Placeholder
    endSession: sessionActions.endSession,
    updateSession: async () => undefined, // Placeholder
    deleteSession: async () => {}, // Placeholder
    
    // Customers
    customers,
    setCustomers,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer,
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer,
    selectCustomer,
    
    // Membership
    checkMembershipValidity,
    deductMembershipHours,
    
    // Categories
    categories,
    addCategory,
    updateCategory,
    deleteCategory,
    
    // Cart
    cart,
    discount,
    discountType,
    loyaltyPointsUsed,
    isStudentDiscount,
    setIsStudentDiscount,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setDiscount,
    setLoyaltyPointsUsed,
    calculateTotal,
    
    // Bills
    bills,
    setBills,
    completeSale,
    deleteBill,
    exportBills,
    exportCustomers,
    fetchBills
  };
  
  return (
    <POSContext.Provider value={value}>
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};
