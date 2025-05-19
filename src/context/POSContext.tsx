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
} from "@/types/pos.types";
import { useProducts } from "@/hooks/useProducts";
import { useCustomers } from "@/hooks/useCustomers";
import { useBills } from "@/hooks/useBills";

interface POSContextType {
  products: Product[];
  customers: Customer[];
  bills: Bill[];
  cart: CartItem[];
  selectedCustomer: Customer | null;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  selectCustomer: (customerId: string | null) => void;
  completeSale: (
    cart: CartItem[],
    selectedCustomer: Customer | null,
    discount: number,
    discountType: "percentage" | "fixed",
    loyaltyPointsUsed: number,
    calculateTotal: () => number,
    paymentMethod: "cash" | "upi" | "split",
    products: Product[],
    isSplitPayment: boolean,
    cashAmount: number,
    upiAmount: number
  ) => Promise<Bill | undefined>;
  deleteBill: (billId: string, customerId: string) => Promise<boolean>;
  updateBill: (
    originalBill: Bill,
    updatedItems: CartItem[],
    customer: Customer,
    discount: number,
    discountType: "percentage" | "fixed",
    loyaltyPointsUsed: number,
    isSplitPayment: boolean,
    cashAmount: number,
    upiAmount: number
  ) => Promise<Bill | null>;
  exportBills: (customers: Customer[]) => void;
  exportCustomers: (customers: Customer[]) => void;
  sessions: Session[];
  addSession: (session: Session) => void;
  deleteSession: (id: string) => void;
  updateSession: (session: Session) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

interface POSProviderProps {
  children: ReactNode;
}

export const POSProvider: React.FC<POSProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [sessions, setSessions] = useState<Session[]>([]);

  const {
    addProduct: addProductUtils,
    deleteProduct: deleteProductUtils,
    updateProduct: updateProductUtils,
  } = useProducts(setProducts);

  const {
    addCustomer: addCustomerUtils,
    deleteCustomer: deleteCustomerUtils,
    updateCustomer: updateCustomerUtils,
  } = useCustomers(setCustomers);

  const {
    bills,
    setBills,
    completeSale: completeSaleUtils,
    deleteBill: deleteBillUtils,
    updateBill: updateBillUtils,
    exportBills: exportBillsUtils,
    exportCustomers: exportCustomersUtils,
  } = useBills(updateCustomer, updateProduct);

  useEffect(() => {
    const storedCart = localStorage.getItem("cuephoriaCart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cuephoriaCart", JSON.stringify(cart));
  }, [cart]);

  const addProduct = (product: Product) => {
    addProductUtils(product);
  };

  const updateProduct = (product: Product) => {
    updateProductUtils(product);
  };

  const deleteProduct = (id: string) => {
    deleteProductUtils(id);
  };

  const addCustomer = (customer: Customer) => {
    addCustomerUtils(customer);
  };

  const updateCustomer = (customer: Customer) => {
    updateCustomerUtils(customer);
  };

  const deleteCustomer = (id: string) => {
    deleteCustomerUtils(id);
  };

  const addToCart = (item: CartItem) => {
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
        return [...currentCart, item];
      }
    });
  };

  const removeFromCart = (id: string) => {
    setCart((currentCart) => currentCart.filter((item) => item.id !== id));
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
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

  const completeSale = async (
    cart: CartItem[],
    selectedCustomer: Customer | null,
    discount: number,
    discountType: "percentage" | "fixed",
    loyaltyPointsUsed: number,
    calculateTotal: () => number,
    paymentMethod: "cash" | "upi" | "split",
    products: Product[],
    isSplitPayment: boolean,
    cashAmount: number,
    upiAmount: number
  ) => {
    return completeSaleUtils(
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
    isSplitPayment: boolean,
    cashAmount: number,
    upiAmount: number
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

  const exportBills = (customers: Customer[]) => {
    exportBillsUtils(customers);
  };

  const exportCustomers = (customers: Customer[]) => {
    exportCustomersUtils(customers);
  };

  const addSession = (session: Session) => {
    setSessions((prevSessions) => [session, ...prevSessions]);
  };

  const deleteSession = (id: string) => {
    setSessions((prevSessions) => prevSessions.filter((session) => session.id !== id));
  };

  const updateSession = (session: Session) => {
    setSessions((prevSessions) =>
      prevSessions.map((s) => (s.id === session.id ? session : s))
    );
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
        updateCartItemQuantity,
        clearCart,
        selectCustomer,
        completeSale,
        deleteBill,
        updateBill,
        exportBills,
        exportCustomers,
        sessions,
        addSession,
        deleteSession,
        updateSession,
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
