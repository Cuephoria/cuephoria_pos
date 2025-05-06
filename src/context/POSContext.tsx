
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useStations } from '@/hooks/useStations';
import { useCustomers } from '@/hooks/useCustomers';
import { useSessions } from '@/hooks/useSessions';
import { useBills } from '@/hooks/useBills';
import { Product, Station, Session, Customer, CartItem, Bill } from '@/types/pos.types';

export { type Product, type Station, type Session, type Customer, type CartItem, type Bill };

interface POSContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  customers: Customer[];
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  selectedCustomer: Customer | null;
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  bills: Bill[];
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>;
  addProduct: (product: Omit<Product, "id">) => Promise<Product | undefined>;
  updateProduct: (product: Product) => Promise<Product | undefined>;
  deleteProduct: (id: string) => Promise<void>;
  addStation: (station: Omit<Station, "id" | "isOccupied" | "createdAt">) => Promise<Station | undefined>;
  updateStation: (station: Station) => Promise<Station | undefined>;
  deleteStation: (id: string) => Promise<void>;
  startSession: (stationId: string, customerId: string, sessionData: Pick<Session, "price" | "notes">) => Promise<Session | undefined>;
  pauseSession: (id: string) => Promise<Session | undefined>;
  resumeSession: (id: string) => Promise<Session | undefined>;
  endSession: (id: string) => Promise<Session | undefined>;
  updateSession: (session: Session) => Promise<Session | undefined>;
  deleteSession: (id: string) => Promise<void>;
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
  checkMembershipValidity: (customerId: string) => boolean;
  deductMembershipHours: (customerId: string, hours: number) => boolean;
  completeSale: (
    cart: CartItem[],
    selectedCustomer: Customer | null,
    discount: number,
    discountType: 'percentage' | 'fixed',
    loyaltyPointsUsed: number,
    calculateTotal: () => number,
    paymentMethod: 'cash' | 'upi',
    products: Product[]
  ) => Promise<Bill | undefined>;
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
    addStation,
    updateStation,
    deleteStation
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
  
  const {
    sessions,
    setSessions,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    updateSession,
    deleteSession
  } = useSessions(stations, setStations);
  
  const {
    bills,
    setBills,
    completeSale,
    deleteBill,
    exportBills,
    exportCustomers,
    fetchBills
  } = useBills(updateCustomer, updateProduct);
  
  const value = {
    products,
    setProducts,
    stations,
    setStations,
    sessions,
    setSessions,
    customers,
    setCustomers,
    selectedCustomer,
    setSelectedCustomer,
    bills,
    setBills,
    addProduct,
    updateProduct,
    deleteProduct,
    addStation,
    updateStation,
    deleteStation,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    updateSession,
    deleteSession,
    addCustomer,
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer,
    selectCustomer,
    checkMembershipValidity,
    deductMembershipHours,
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
