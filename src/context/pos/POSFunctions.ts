import { 
  Product, Station, Customer, Session, CartItem, Bill, 
  ResetOptions, SessionResult 
} from "@/types/pos.types";
import { generateId } from "@/utils/pos.utils";
import { 
  checkMembershipValidityInternal, 
  deductMembershipHoursInternal,
  updateCustomerMembershipInternal
} from "@/utils/membership.utils";
import { exportToCSV } from "@/services/dataOperations";

// Create a type for the functions object
export type POSFunctionsType = ReturnType<typeof createPOSFunctions>;

export const createPOSFunctions = (
  // State setters
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setStations: React.Dispatch<React.SetStateAction<Station[]>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>,
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>,
  setDiscount: React.Dispatch<React.SetStateAction<number>>,
  setDiscountType: React.Dispatch<React.SetStateAction<'percentage' | 'fixed'>>,
  setLoyaltyPointsUsed: React.Dispatch<React.SetStateAction<number>>,
  setIsStudentDiscount: React.Dispatch<React.SetStateAction<boolean>>,
  
  // State values
  products: Product[],
  stations: Station[],
  customers: Customer[],
  sessions: Session[],
  bills: Bill[],
  cart: CartItem[],
  selectedCustomer: Customer | null,
  discount: number,
  discountType: 'percentage' | 'fixed',
  loyaltyPointsUsed: number,
  isStudentDiscount: boolean,
  
  // Dependencies
  startSessionFn?: (stationId: string, customerId: string) => Promise<Session | undefined>,
  endSessionFn?: (stationId: string, customers: Customer[]) => Promise<{
    sessionCartItem?: CartItem;
    customer?: Customer;
  } | undefined>
) => {
  // Create a wrapper for startSession
  const createStartSessionWrapper = () => {
    // If a startSessionFn was provided, use it
    if (startSessionFn) {
      return async (stationId: string, customerId: string): Promise<void> => {
        try {
          await startSessionFn(stationId, customerId);
        } catch (error) {
          console.error("Error in startSession wrapper:", error);
          throw error;
        }
      };
    }
    
    // Otherwise, create a default implementation
    return async (stationId: string, customerId: string): Promise<void> => {
      try {
        // Implementation details...
        console.log("Default startSession called");
      } catch (error) {
        console.error("Error in default startSession:", error);
        throw error;
      }
    };
  };
  
  // Create a wrapper for endSession
  const createEndSessionWrapper = () => {
    // If an endSessionFn was provided, use it
    if (endSessionFn) {
      return async (stationId: string): Promise<void> => {
        try {
          const result = await endSessionFn(stationId, customers);
          if (result?.sessionCartItem) {
            addToCart({
              id: result.sessionCartItem.id,
              type: result.sessionCartItem.type,
              name: result.sessionCartItem.name,
              price: result.sessionCartItem.price,
              quantity: result.sessionCartItem.quantity
            });
          }
        } catch (error) {
          console.error("Error in endSession wrapper:", error);
          throw error;
        }
      };
    }
    
    // Otherwise, create a default implementation
    return async (stationId: string): Promise<void> => {
      try {
        // Implementation details...
        console.log("Default endSession called");
      } catch (error) {
        console.error("Error in default endSession:", error);
        throw error;
      }
    };
  };
  
  // Product functions
  const addProduct = (product: Omit<Product, "id">) => {
    const newProduct: Product = {
      id: generateId(),
      ...product,
    };
    setProducts((prevProducts) => [...prevProducts, newProduct]);
  };
  
  const updateProduct = (product: Product) => {
    setProducts((prevProducts) =>
      prevProducts.map((p) => (p.id === product.id ? product : p))
    );
  };
  
  const deleteProduct = (id: string) => {
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== id));
  };
  
  // Customer functions
  const addCustomer = (customer: Omit<Customer, "id" | "createdAt">) => {
    const newCustomer: Customer = {
      id: generateId(),
      ...customer,
      createdAt: new Date(),
      totalSpent: 0,
      totalPlayTime: 0,
      loyaltyPoints: 0
    };
    setCustomers((prevCustomers) => [...prevCustomers, newCustomer]);
  };
  
  const updateCustomer = (customer: Customer) => {
    setCustomers((prevCustomers) =>
      prevCustomers.map((c) => (c.id === customer.id ? customer : c))
    );
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers((prevCustomers) => prevCustomers.filter((c) => c.id !== id));
    setSelectedCustomer(null);
  };
  
  const selectCustomer = (id: string | null) => {
    if (id === null) {
      setSelectedCustomer(null);
    } else {
      const customer = customers.find((c) => c.id === id);
      setSelectedCustomer(customer || null);
    }
  };
  
  // Membership functions
  const checkMembershipValidity = (customerId: string): boolean => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return false;
    return checkMembershipValidityInternal(customer);
  };
  
  const deductMembershipHours = (customerId: string, hours: number): boolean => {
    const updatedCustomers = customers.map(customer => {
      if (customer.id === customerId) {
        return deductMembershipHoursInternal(customer, hours);
      }
      return customer;
    });
    setCustomers(updatedCustomers);
    return true;
  };
  
  const updateCustomerMembership = (
    customerId: string,
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ): Customer | null => {
    const updatedCustomer = updateCustomerMembershipInternal(customers, customerId, membershipData);
    if (updatedCustomer) {
      setCustomers(prevCustomers =>
        prevCustomers.map(c => (c.id === customerId ? updatedCustomer : c))
      );
      return updatedCustomer;
    }
    return null;
  };
  
  // Cart functions
  const addToCart = (item: Omit<CartItem, "total">) => {
    const existingCartItem = cart.find((i) => i.id === item.id);
    
    if (existingCartItem) {
      updateCartItem(item.id, existingCartItem.quantity + item.quantity);
    } else {
      const newItem: CartItem = {
        ...item,
        total: item.price * item.quantity,
      };
      setCart((prevCart) => [...prevCart, newItem]);
    }
  };
  
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };
  
  const updateCartItem = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id ? { ...item, quantity, total: item.price * quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setDiscountType('percentage');
    setLoyaltyPointsUsed(0);
  };
  
  // Billing functions
  const setDiscountValue = (amount: number, type: 'percentage' | 'fixed') => {
    setDiscount(amount);
    setDiscountType(type);
  };
  
  const setLoyaltyPointsUsedValue = (points: number) => {
    setLoyaltyPointsUsed(points);
  };
  
  const calculateTotal = () => {
    let subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = (subtotal * discount) / 100;
    } else {
      discountValue = discount;
    }
    
    const total = subtotal - discountValue;
    return total;
  };
  
  const completeSale = (paymentMethod: 'cash' | 'upi') => {
    if (cart.length === 0) return undefined;
    
    const subtotal = cart.reduce((acc, item) => acc + item.total, 0);
    let discountValue = 0;
    
    if (discountType === 'percentage') {
      discountValue = (subtotal * discount) / 100;
    } else {
      discountValue = discount;
    }
    
    const total = subtotal - discountValue;
    
    const newBill: Bill = {
      id: generateId(),
      customerId: selectedCustomer ? selectedCustomer.id : 'guest',
      items: cart,
      subtotal,
      discount,
      discountValue,
      discountType,
      loyaltyPointsUsed,
      loyaltyPointsEarned: Math.floor(total * 0.05),
      total,
      paymentMethod,
      createdAt: new Date(),
    };
    
    setBills((prevBills) => [...prevBills, newBill]);
    
    if (selectedCustomer) {
      const updatedCustomer: Customer = {
        ...selectedCustomer,
        loyaltyPoints: selectedCustomer.loyaltyPoints + newBill.loyaltyPointsEarned - loyaltyPointsUsed,
        totalSpent: selectedCustomer.totalSpent + total,
      };
      updateCustomer(updatedCustomer);
    }
    
    clearCart();
    setSelectedCustomer(null);
    setLoyaltyPointsUsed(0);
    
    return newBill;
  };
  
  // Data export functions
  const exportBills = () => {
    exportToCSV(bills, 'bills');
  };
  
  const exportCustomers = () => {
    exportToCSV(customers, 'customers');
  };
  
  // Sample data / reset functions
  const resetToSampleData = (options?: ResetOptions) => {
    const sampleData = generateSampleData();
    
    if (!options || options.products) {
      setProducts(sampleData.products);
    }
    if (!options || options.stations) {
      setStations(sampleData.stations);
    }
    if (!options || options.customers) {
      setCustomers(sampleData.customers);
    }
    if (!options || options.sales) {
      setBills(sampleData.bills);
    }
    if (!options || options.sessions) {
      setSessions([]);
    }
    clearCart();
    setSelectedCustomer(null);
  };
  
  const addSampleIndianData = () => {
    // Implementation for adding sample Indian data
  };
  
  // Create the session action wrappers
  const startSession = createStartSessionWrapper();
  const endSession = createEndSessionWrapper();
  
  return {
    // Product functions
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Station functions
    startSession,
    endSession,
    
    // Customer functions
    addCustomer,
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer,
    selectCustomer,
    
    // Membership functions
    checkMembershipValidity,
    deductMembershipHours,
    
    // Cart functions
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    
    // Billing functions
    setDiscount: setDiscountValue,
    setLoyaltyPointsUsed: setLoyaltyPointsUsedValue,
    calculateTotal,
    completeSale,
    
    // Data export
    exportBills,
    exportCustomers,
    
    // Sample data / reset
    resetToSampleData,
    addSampleIndianData,
    
    // UI state setters
    setIsStudentDiscount
  };
};
