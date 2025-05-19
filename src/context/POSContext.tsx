import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { 
  Product, 
  Customer, 
  CartItem, 
  Bill, 
  Session, 
  Station,
  SessionResult,
  POSContextType 
} from "@/types/pos.types";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useBills } from "@/hooks/useBills";
import { useStations } from "@/hooks/stations";

// Export the types so they can be imported from this file
export type { Product, Customer, CartItem, Bill, Session, Station, SessionResult };

interface POSProviderProps {
  children: ReactNode;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<POSProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [discount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [loyaltyPointsUsed, setLoyaltyPointsUsedState] = useState<number>(0);
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isSplitPayment, setIsSplitPayment] = useState<boolean>(false);
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [upiAmount, setUpiAmount] = useState<number>(0);

  const {
    addProduct: addProductUtils,
    deleteProduct: deleteProductUtils,
    updateProduct: updateProductUtils,
  } = useProducts();

  const {
    addCustomer: addCustomerUtils,
    deleteCustomer: deleteCustomerUtils,
    updateCustomer: updateCustomerUtils,
  } = useCustomers();

  const {
    bills,
    setBills,
    completeSale: completeSaleUtils,
    deleteBill: deleteBillUtils,
    updateBill: updateBillUtils,
    exportBills: exportBillsUtils,
    exportCustomers: exportCustomersUtils,
  } = useBills(updateCustomerUtils, updateProductUtils);

  // Fix: Initialize stations with useStations hook, passing initial state and updateCustomer
  const {
    stations,
    setStations,
    startSession: startSessionUtils,
    endSession: endSessionUtils,
    deleteStation: deleteStationUtils,
    updateStation: updateStationUtils
  } = useStations([], updateCustomerUtils);

  useEffect(() => {
    const storedCart = localStorage.getItem("cuephoriaCart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cuephoriaCart", JSON.stringify(cart));
  }, [cart]);

  const addProduct = (product: Omit<Product, "id">) => {
    addProductUtils(product);
  };

  const updateProduct = (product: Product) => {
    updateProductUtils(product);
  };

  const deleteProduct = (id: string) => {
    deleteProductUtils(id);
  };

  // Category management functions
  const addCategory = (category: string) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (oldCategory: string, newCategory: string) => {
    setCategories(prev => prev.map(cat => cat === oldCategory ? newCategory : cat));
  };

  const deleteCategory = (category: string) => {
    setCategories(prev => prev.filter(cat => cat !== category));
  };

  const addCustomer = (customer: Omit<Customer, "id" | "createdAt">) => {
    addCustomerUtils(customer);
  };

  const updateCustomer = (customer: Customer) => {
    updateCustomerUtils(customer);
  };

  const deleteCustomer = (id: string) => {
    deleteCustomerUtils(id);
  };

  const addToCart = (item: Omit<CartItem, "total">) => {
    const total = item.price * item.quantity;
    const fullItem = { ...item, total };
    
    setCart((currentCart) => {
      const existingItemIndex = currentCart.findIndex(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItemIndex !== -1) {
        const newCart = [...currentCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + item.quantity,
          total: (newCart[existingItemIndex].quantity + item.quantity) * item.price,
        };
        return newCart;
      } else {
        return [...currentCart, fullItem];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const updateCartItem = (id: string, quantity: number) => {
    setCart((currentCart) => {
      return currentCart.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: quantity, total: item.price * quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const selectCustomer = (customerId: string | null) => {
    if (customerId) {
      const customer = customers.find((c) => c.id === customerId) || null;
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
  };

  const setDiscount = (amount: number, type: 'percentage' | 'fixed') => {
    setDiscountAmount(amount);
    setDiscountType(type);
  };

  const setLoyaltyPointsUsed = (points: number) => {
    setLoyaltyPointsUsedState(points);
  };

  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    let discountValue = 0;
    
    if (discountType === 'percentage') {
      discountValue = subtotal * (discount / 100);
    } else {
      discountValue = discount;
    }
    
    return Math.max(0, subtotal - discountValue - loyaltyPointsUsed);
  };

  const updateSplitAmounts = (cash: number, upi: number): boolean => {
    const total = calculateTotal();
    if (Math.abs(cash + upi - total) <= 0.01) {
      setCashAmount(cash);
      setUpiAmount(upi);
      return true;
    }
    return false;
  };

  // Fix the completeSale function to handle promises correctly
  const completeSale = (paymentMethod: "cash" | "upi" | "split"): Bill | undefined => {
    // Call the utility function
    const billPromise = completeSaleUtils(
      cart,
      selectedCustomer,
      discount,
      discountType,
      loyaltyPointsUsed,
      calculateTotal,
      paymentMethod,
      products,
      isSplitPayment,
      cashAmount,
      upiAmount
    );
    
    // Since we need to return a Bill or undefined immediately (not a Promise),
    // we'll handle this by adding a side-effect and return undefined
    billPromise.then(bill => {
      // Any side-effects when the bill is created can go here
      console.log("Bill created:", bill);
    }).catch(error => {
      console.error("Error creating bill:", error);
    });
    
    // The type definition expects a Bill | undefined, not a Promise
    // In a real-world app, this should be refactored to use async/await properly
    return undefined;
  };

  const deleteBill = async (billId: string, customerId: string) => {
    return deleteBillUtils(billId, customerId);
  };

  const updateBill = async (
    originalBill: Bill,
    updatedItems: CartItem[],
    customer: Customer,
    discount: number,
    discountType: "percentage" | "fixed",
    loyaltyPointsUsed: number,
    isSplitPayment: boolean = false,
    cashAmount: number = 0,
    upiAmount: number = 0
  ) => {
    console.log('POSContext updateBill called with payment info:', {
      paymentMethod: isSplitPayment ? 'split' : (cashAmount > 0 ? 'cash' : 'upi'),
      isSplitPayment,
      cashAmount,
      upiAmount
    });
    
    return updateBillUtils(
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

  const exportBills = () => {
    exportBillsUtils(customers);
  };

  const exportCustomers = () => {
    exportCustomersUtils(customers);
  };

  const startSession = async (stationId: string, customerId: string): Promise<void> => {
    await startSessionUtils(stationId, customerId);
  };

  const endSession = async (stationId: string): Promise<void> => {
    await endSessionUtils(stationId);
  };

  const deleteStation = async (stationId: string): Promise<boolean> => {
    return deleteStationUtils(stationId);
  };

  const updateStation = async (stationId: string, name: string, hourlyRate: number): Promise<boolean> => {
    return updateStationUtils(stationId, name, hourlyRate);
  };

  // Mock functions for membership handling
  const checkMembershipValidity = (customerId: string): boolean => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || !customer.isMember) return false;
    if (!customer.membershipExpiryDate) return false;
    return new Date(customer.membershipExpiryDate) > new Date();
  };

  const deductMembershipHours = (customerId: string, hours: number): boolean => {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return false;
    
    const customer = customers[customerIndex];
    if (!customer.isMember || customer.membershipHoursLeft === undefined) return false;
    
    if (customer.membershipHoursLeft >= hours) {
      const updatedCustomer = {
        ...customer,
        membershipHoursLeft: customer.membershipHoursLeft - hours
      };
      updateCustomer(updatedCustomer);
      return true;
    }
    return false;
  };

  // For membership updating
  const updateCustomerMembership = (customerId: string, membershipData: {
    membershipPlan?: string;
    membershipDuration?: 'weekly' | 'monthly';
    membershipHoursLeft?: number;
  }): Customer | null => {
    const customerIndex = customers.findIndex(c => c.id === customerId);
    if (customerIndex === -1) return null;
    
    const customer = customers[customerIndex];
    const updatedCustomer = {
      ...customer,
      ...membershipData
    };
    
    updateCustomer(updatedCustomer);
    return updatedCustomer;
  };

  // Reset to sample data functions (placeholders)
  const resetToSampleData = () => {
    // Implementation would be added here
  };

  const addSampleIndianData = () => {
    // Implementation would be added here
  };

  return (
    <POSContext.Provider
      value={{
        products,
        customers,
        bills,
        cart,
        selectedCustomer,
        addProduct,
        updateProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
        selectCustomer,
        completeSale,
        deleteBill,
        updateBill,
        exportBills,
        exportCustomers,
        sessions,
        // Add all new properties to the context
        stations,
        setStations,
        startSession,
        endSession,
        deleteStation,
        updateStation,
        discount,
        discountType,
        loyaltyPointsUsed,
        setDiscount,
        setLoyaltyPointsUsed,
        calculateTotal,
        isStudentDiscount,
        setIsStudentDiscount,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        isSplitPayment,
        cashAmount,
        upiAmount,
        setIsSplitPayment,
        setCashAmount,
        setUpiAmount,
        updateSplitAmounts,
        setBills,
        setCustomers,
        checkMembershipValidity,
        deductMembershipHours,
        updateCustomerMembership,
        resetToSampleData,
        addSampleIndianData
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
};
