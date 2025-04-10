
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
  membershipSecondsLeft?: number; // Using seconds instead of hours for more precise tracking
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

export interface POSContextType {
  products: Product[];
  productsLoading?: boolean;
  productsError?: string | null;
  stations: Station[];
  customers: Customer[];
  sessions: Session[];
  bills: Bill[];
  cart: CartItem[];
  selectedCustomer: Customer | null;
  discount: number;
  discountType: 'percentage' | 'fixed';
  loyaltyPointsUsed: number;
  isStudentDiscount: boolean;
  setIsStudentDiscount: (value: boolean) => void;
  
  // Station state setter
  setStations: (stations: Station[]) => void;
  
  // Product functions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Station functions
  startSession: (stationId: string, customerId: string) => Promise<void>;
  endSession: (stationId: string) => Promise<void>;
  deleteStation: (stationId: string) => Promise<boolean>;
  updateStation: (stationId: string, name: string, hourlyRate: number) => Promise<boolean>; // Add this property
  
  // Customer functions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  updateCustomerMembership: (customerId: string, membershipData: {
    membershipPlan?: string;
    membershipDuration?: 'weekly' | 'monthly';
    membershipSecondsLeft?: number; // Changed from membershipHoursLeft to membershipSecondsLeft
  }) => Customer | null;
  deleteCustomer: (id: string) => void;
  selectCustomer: (id: string | null) => void;
  
  // Membership functions
  checkMembershipValidity: (customerId: string) => boolean;
  deductMembershipHours: (customerId: string, hours: number) => boolean;
  
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
  
  // Reset and sample data functions
  resetToSampleData: (options?: ResetOptions) => void;
  addSampleIndianData: () => void;
  
  // Delete bill function
  deleteBill: (billId: string, customerId: string) => Promise<boolean>;
}
