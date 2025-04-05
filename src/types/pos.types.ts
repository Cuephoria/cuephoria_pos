// Types for the POS system
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership';
  stock: number;
  image?: string;
  originalPrice?: number;
  offerPrice?: number;
  studentPrice?: number;
  duration?: 'weekly' | 'monthly';
  membershipHours?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isMember: boolean;
  membershipExpiryDate?: Date;
  membershipStartDate?: Date;
  membershipPlan?: string;
  membershipHoursLeft?: number;
  membershipDuration?: 'weekly' | 'monthly';
  loyaltyPoints: number;
  totalSpent: number;
  totalPlayTime: number;
  createdAt: Date;
}

export interface Station {
  id: string;
  name: string;
  type: 'ps5' | '8ball';
  hourlyRate: number;
  isOccupied: boolean;
  currentSession: Session | null;
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
  category?: 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership';
}

export interface Bill {
  id: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountValue: number;
  discountType: 'percentage' | 'fixed';
  loyaltyPointsUsed: number;
  loyaltyPointsEarned: number;
  total: number;
  paymentMethod: 'cash' | 'upi';
  createdAt: Date;
}

export interface ResetOptions {
  products: boolean;
  customers: boolean;
  sales: boolean;
  sessions: boolean;
}

export interface SessionResult {
  updatedSession?: Session;
  sessionCartItem?: CartItem;
  customer?: Customer;
}

export type POSContextType = {
  // Products
  products: Product[];
  productsLoading: boolean;
  productsError: Error | null;
  addProduct: (product: Partial<Product>) => Promise<Product>;
  updateProduct: (productId: string, updatedData: Partial<Product>) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
  
  // Stations and Sessions
  stations: Station[];
  setStations: React.Dispatch<React.SetStateAction<Station[]>>;
  sessions: Session[];
  startSession: (stationId: string, customerId: string) => Promise<void>;
  endSession: (stationId: string) => Promise<void>;
  deleteStation: (stationId: string) => Promise<boolean>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  
  // Customers
  customers: Customer[];
  selectedCustomer: Customer | null;
  addCustomer: (customer: Partial<Customer>) => Promise<Customer>;
  updateCustomer: (customer: Partial<Customer>) => Promise<Customer>;
  updateCustomerMembership: (
    customerId: string, 
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ) => Customer | null;
  deleteCustomer: (customerId: string) => Promise<void>;
  selectCustomer: (customerId: string | null) => void;
  checkMembershipValidity: (customerId: string) => boolean;
  deductMembershipHours: (customerId: string, hours: number) => boolean;
  
  // Cart
  cart: CartItem[];
  discount: number;
  discountType: 'percentage' | 'fixed';
  loyaltyPointsUsed: number;
  isStudentDiscount: boolean;
  setIsStudentDiscount: (value: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItem: (itemId: string, updates: Partial<CartItem>) => void;
  clearCart: () => void;
  setDiscount: (value: number, type: 'percentage' | 'fixed') => void;
  setLoyaltyPointsUsed: (points: number) => void;
  calculateTotal: () => number;
  
  // Bills
  bills: Bill[];
  completeSale: (paymentMethod: 'cash' | 'upi') => Bill | undefined;
  deleteBill: (billId: string, customerId: string) => Promise<boolean>;
  exportBills: () => void;
  exportCustomers: () => void;
  
  // Data management
  resetToSampleData: (options?: ResetOptions) => Promise<boolean>;
  addSampleIndianData: () => void;
};
