import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'gaming' | 'food' | 'drinks' | 'tobacco' | 'challenges';
  stock: number;
  image?: string;
}

export interface Station {
  id: string;
  name: string;
  type: 'ps5' | '8ball';
  hourlyRate: number;
  isOccupied: boolean;
  currentSession: Session | null;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isMember: boolean;
  loyaltyPoints: number;
  totalSpent: number;
  totalPlayTime: number; // in minutes
  createdAt: Date;
}

export interface Session {
  id: string;
  stationId: string;
  customerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
}

export interface CartItem {
  id: string;
  type: 'product' | 'session';
  name: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Bill {
  id: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  paymentMethod: 'cash' | 'upi';
  createdAt: Date;
}

interface POSContextType {
  products: Product[];
  stations: Station[];
  customers: Customer[];
  sessions: Session[];
  bills: Bill[];
  cart: CartItem[];
  selectedCustomer: Customer | null;
  discount: number;
  discountType: 'percentage' | 'fixed';
  loyaltyPointsUsed: number;
  
  // Product functions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Station functions
  startSession: (stationId: string, customerId: string) => void;
  endSession: (stationId: string) => void;
  
  // Customer functions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  selectCustomer: (id: string | null) => void;
  
  // Cart functions
  addToCart: (item: Omit<CartItem, 'total'>) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  
  // Billing functions
  setDiscount: (amount: number, type: 'percentage' | 'fixed') => void;
  setLoyaltyPointsUsed: (points: number) => void;
  calculateTotal: () => number;
  completeSale: (paymentMethod: 'cash' | 'upi') => Bill | undefined;
  
  // Data export
  exportBills: () => void;
  exportCustomers: () => void;
}

// Helper functions
const generateId = () => Math.random().toString(36).substring(2, 9);

const POSContext = createContext<POSContextType | undefined>(undefined);

// Sample data
const initialProducts: Product[] = [
  { 
    id: 'p1', 
    name: 'PS5 Session', 
    price: 300, // ₹300 per hour
    category: 'gaming', 
    stock: 9999 
  },
  { 
    id: 'p2', 
    name: '8-Ball Session', 
    price: 200, // ₹200 per hour
    category: 'gaming', 
    stock: 9999 
  },
  { 
    id: 'p3', 
    name: 'Lay\'s Classic', 
    price: 20, 
    category: 'food', 
    stock: 50 
  },
  { 
    id: 'p4', 
    name: 'Red Bull', 
    price: 110, 
    category: 'drinks', 
    stock: 40 
  },
  { 
    id: 'p5', 
    name: 'Cigarettes (Pack)', 
    price: 350, 
    category: 'tobacco', 
    stock: 30 
  },
  { 
    id: 'p6', 
    name: 'MetaShot Challenge 1', 
    price: 49, 
    category: 'challenges', 
    stock: 9999 
  }
];

const initialStations: Station[] = [
  { id: 's1', name: 'PS5 Console 1', type: 'ps5', hourlyRate: 300, isOccupied: false, currentSession: null },
  { id: 's2', name: 'PS5 Console 2', type: 'ps5', hourlyRate: 300, isOccupied: false, currentSession: null },
  { id: 's3', name: '8-Ball Table 1', type: '8ball', hourlyRate: 200, isOccupied: false, currentSession: null },
  { id: 's4', name: '8-Ball Table 2', type: '8ball', hourlyRate: 200, isOccupied: false, currentSession: null },
  { id: 's5', name: '8-Ball Table 3', type: '8ball', hourlyRate: 200, isOccupied: false, currentSession: null },
];

const initialCustomers: Customer[] = [
  { 
    id: 'c1', 
    name: 'Raj Sharma', 
    phone: '9876543210', 
    email: 'raj.sharma@example.com', 
    isMember: true, 
    loyaltyPoints: 150, 
    totalSpent: 3500,
    totalPlayTime: 420, // 7 hours
    createdAt: new Date(2023, 2, 15)
  },
  { 
    id: 'c2', 
    name: 'Priya Patel', 
    phone: '8765432109', 
    isMember: false, 
    loyaltyPoints: 0, 
    totalSpent: 800,
    totalPlayTime: 120, // 2 hours
    createdAt: new Date(2023, 3, 20) 
  },
  { 
    id: 'c3', 
    name: 'Vikram Singh', 
    phone: '7654321098', 
    email: 'vikram@example.com', 
    isMember: true, 
    loyaltyPoints: 75, 
    totalSpent: 1200,
    totalPlayTime: 180, // 3 hours
    createdAt: new Date(2023, 4, 5) 
  }
];

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [stations, setStations] = useState<Station[]>(initialStations);
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [discount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [loyaltyPointsUsed, setLoyaltyPointsUsedAmount] = useState<number>(0);
  
  // Load data from localStorage
  useEffect(() => {
    const storedProducts = localStorage.getItem('cuephoriaProducts');
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    
    const storedStations = localStorage.getItem('cuephoriaStations');
    if (storedStations) setStations(JSON.parse(storedStations));
    
    const storedCustomers = localStorage.getItem('cuephoriaCustomers');
    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
    
    const storedSessions = localStorage.getItem('cuephoriaSessions');
    if (storedSessions) setSessions(JSON.parse(storedSessions));
    
    const storedBills = localStorage.getItem('cuephoriaBills');
    if (storedBills) setBills(JSON.parse(storedBills));
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaProducts', JSON.stringify(products));
  }, [products]);
  
  useEffect(() => {
    localStorage.setItem('cuephoriaStations', JSON.stringify(stations));
  }, [stations]);
  
  useEffect(() => {
    localStorage.setItem('cuephoriaCustomers', JSON.stringify(customers));
  }, [customers]);
  
  useEffect(() => {
    localStorage.setItem('cuephoriaSessions', JSON.stringify(sessions));
  }, [sessions]);
  
  useEffect(() => {
    localStorage.setItem('cuephoriaBills', JSON.stringify(bills));
  }, [bills]);
  
  // Product functions
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: generateId() };
    setProducts([...products, newProduct]);
  };
  
  const updateProduct = (product: Product) => {
    setProducts(products.map(p => p.id === product.id ? product : p));
  };
  
  const deleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };
  
  // Station functions
  const startSession = (stationId: string, customerId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (!station || station.isOccupied) return;
    
    const newSession = {
      id: generateId(),
      stationId,
      customerId,
      startTime: new Date(),
    };
    
    setSessions([...sessions, newSession]);
    
    setStations(stations.map(s => 
      s.id === stationId 
        ? { ...s, isOccupied: true, currentSession: newSession } 
        : s
    ));
  };
  
  const endSession = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    if (!station || !station.isOccupied || !station.currentSession) return;
    
    const endTime = new Date();
    const startTime = new Date(station.currentSession.startTime);
    const durationMs = endTime.getTime() - startTime.getTime();
    const durationMinutes = Math.ceil(durationMs / (1000 * 60));
    
    // Update the session
    const updatedSession = {
      ...station.currentSession,
      endTime,
      duration: durationMinutes
    };
    
    setSessions(sessions.map(s => 
      s.id === updatedSession.id ? updatedSession : s
    ));
    
    // Update the station
    setStations(stations.map(s => 
      s.id === stationId 
        ? { ...s, isOccupied: false, currentSession: null } 
        : s
    ));
    
    // Update customer's total play time
    const customer = customers.find(c => c.id === updatedSession.customerId);
    if (customer) {
      updateCustomer({
        ...customer,
        totalPlayTime: customer.totalPlayTime + durationMinutes
      });
    }
    
    // Create a cart item for the session
    const stationRate = station.hourlyRate;
    const hoursPlayed = durationMinutes / 60;
    const sessionCost = Math.ceil(hoursPlayed * stationRate);
    
    addToCart({
      id: updatedSession.id,
      type: 'session',
      name: `${station.name} (${durationMinutes} mins)`,
      price: sessionCost,
      quantity: 1
    });
  };
  
  // Customer functions
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = { 
      ...customer, 
      id: generateId(), 
      createdAt: new Date() 
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };
  
  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };
  
  const selectCustomer = (id: string | null) => {
    if (!id) {
      setSelectedCustomer(null);
      return;
    }
    const customer = customers.find(c => c.id === id);
    setSelectedCustomer(customer || null);
  };
  
  // Cart functions
  const addToCart = (item: Omit<CartItem, 'total'>) => {
    const existingItem = cart.find(i => i.id === item.id && i.type === item.type);
    
    if (existingItem) {
      setCart(cart.map(i => 
        i.id === item.id && i.type === item.type
          ? { ...i, quantity: i.quantity + item.quantity, total: (i.quantity + item.quantity) * i.price }
          : i
      ));
    } else {
      setCart([...cart, { ...item, total: item.quantity * item.price }]);
    }
  };
  
  const removeFromCart = (id: string) => {
    setCart(cart.filter(i => i.id !== id));
  };
  
  const updateCartItem = (id: string, quantity: number) => {
    setCart(cart.map(i => 
      i.id === id
        ? { ...i, quantity, total: quantity * i.price }
        : i
    ));
  };
  
  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setLoyaltyPointsUsedAmount(0);
    setSelectedCustomer(null);
  };
  
  // Billing functions
  const setDiscount = (amount: number, type: 'percentage' | 'fixed') => {
    setDiscountAmount(amount);
    setDiscountType(type);
  };
  
  const setLoyaltyPointsUsed = (points: number) => {
    setLoyaltyPointsUsedAmount(points);
  };
  
  const calculateTotal = () => {
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = subtotal * (discount / 100);
    } else {
      discountValue = discount;
    }
    
    const loyaltyDiscount = loyaltyPointsUsed;
    
    return Math.max(0, subtotal - discountValue - loyaltyDiscount);
  };
  
  const completeSale = (paymentMethod: 'cash' | 'upi') => {
    if (!selectedCustomer || cart.length === 0) return undefined;
    
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = subtotal * (discount / 100);
    } else {
      discountValue = discount;
    }
    
    const total = calculateTotal();
    
    // Calculate loyalty points earned (1 point for every ₹10 spent)
    const loyaltyPointsEarned = Math.floor(total / 10);
    
    // Create the bill
    const newBill = {
      id: generateId(),
      customerId: selectedCustomer.id,
      items: [...cart],
      subtotal,
      discount,
      discountType,
      discountValue,
      loyaltyPointsUsed,
      loyaltyPointsEarned,
      total,
      paymentMethod,
      createdAt: new Date()
    };
    
    setBills([...bills, newBill]);
    
    // Update customer data
    updateCustomer({
      ...selectedCustomer,
      loyaltyPoints: selectedCustomer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsUsed,
      totalSpent: selectedCustomer.totalSpent + total
    });
    
    // Update product stock
    cart.forEach(item => {
      if (item.type === 'product') {
        const product = products.find(p => p.id === item.id);
        if (product) {
          updateProduct({
            ...product,
            stock: product.stock - item.quantity
          });
        }
      }
    });
    
    // Clear the cart
    clearCart();
    
    return newBill;
  };
  
  // Data export functions
  const exportBills = () => {
    // We'll implement the CSV export using the browser download feature
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header row
    csvContent += "Bill ID,Customer,Date,Items,Subtotal,Discount,Loyalty Points Used,Total,Payment Method\n";
    
    // Data rows
    bills.forEach(bill => {
      const customer = customers.find(c => c.id === bill.customerId);
      const items = bill.items.map(item => `${item.name} x${item.quantity}`).join(", ");
      const row = [
        bill.id,
        customer ? customer.name : "Unknown",
        new Date(bill.createdAt).toLocaleDateString(),
        `"${items}"`,
        bill.subtotal,
        bill.discount,
        bill.loyaltyPointsUsed,
        bill.total,
        bill.paymentMethod
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cuephoria_bills.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const exportCustomers = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Header row
    csvContent += "Customer ID,Name,Phone,Email,Member Status,Loyalty Points,Total Spent,Total Play Time (mins),Join Date\n";
    
    // Data rows
    customers.forEach(customer => {
      const row = [
        customer.id,
        customer.name,
        customer.phone,
        customer.email || "",
        customer.isMember ? "Member" : "Non-Member",
        customer.loyaltyPoints,
        customer.totalSpent,
        customer.totalPlayTime,
        new Date(customer.createdAt).toLocaleDateString()
      ];
      csvContent += row.join(",") + "\n";
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "cuephoria_customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
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
        addProduct,
        updateProduct,
        deleteProduct,
        startSession,
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
        exportCustomers
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (context === undefined) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
