
import React, { createContext, useContext, useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { POSContextType, Product, Station, Customer, Session, Bill, CartItem, ResetOptions } from "@/types/pos.types";
import { createPOSFunctions } from "./POSFunctions";
import { generateSampleData } from "@/data/sampleData";
import { useStations } from "@/hooks/stations";

// Create the context with a default value
const POSContext = createContext<POSContextType | undefined>(undefined);

// Provider component
export const POSProvider = ({ children }: { children: React.ReactNode }) => {
  // Products state
  const [products, setProducts] = useLocalStorage<Product[]>("cuephoriaProducts", []);

  // Stations state
  const [stationsLocal, setStationsLocal] = useState<Station[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  
  // Customer state
  const [customers, setCustomers] = useLocalStorage<Customer[]>("cuephoriaCustomers", []);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Sales state
  const [bills, setBills] = useLocalStorage<Bill[]>("cuephoriaBills", []);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Discount state
  const [discount, setDiscount] = useState(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState(0);
  const [isStudentDiscount, setIsStudentDiscount] = useState(false);
  
  // Add any services or custom hooks here
  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => 
      prev.map(c => c.id === customer.id ? customer : c)
    );
  };
  
  // Initialize stations with the useStations hook
  const { 
    stations, 
    setStations,
    startSession: startSessionHook,
    endSession: endSessionHook
  } = useStations();
  
  // Create POS functions with all the necessary dependencies
  const posFunctions = createPOSFunctions(
    // State setters
    setProducts,
    setStations,
    setCustomers,
    setSessions,
    setBills,
    setCart,
    setSelectedCustomer,
    setDiscount,
    setDiscountType,
    setLoyaltyPointsUsed,
    setIsStudentDiscount,
    
    // State values
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
    
    // Hook functions
    startSessionHook,
    endSessionHook
  );
  
  // Initialize with sample data if empty
  useEffect(() => {
    const initSampleData = () => {
      // Only initialize if all data arrays are empty
      if (
        products.length === 0 &&
        stations.length === 0 &&
        customers.length === 0 &&
        bills.length === 0
      ) {
        const sampleData = generateSampleData();
        
        // Set initial data
        setProducts(sampleData.products);
        setStationsLocal(sampleData.stations);
        setCustomers(sampleData.customers);
        setBills(sampleData.bills);
      } else if (stations.length === 0) {
        // If only stations are empty (common when using localStorage)
        const sampleData = generateSampleData();
        setStationsLocal(sampleData.stations);
      }
    };
    
    initSampleData();
  }, []);
  
  // Update local stations when stations from the hook change
  useEffect(() => {
    if (stations.length > 0) {
      setStationsLocal(stations);
    }
  }, [stations]);
  
  // Combine all the state and functions
  const contextValue: POSContextType = {
    // States
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
    
    // Station state setter
    setStations,
    
    // Include all the functions
    ...posFunctions
  };
  
  return (
    <POSContext.Provider value={contextValue}>
      {children}
    </POSContext.Provider>
  );
};

// Custom hook to use the POS context
export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};
