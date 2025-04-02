
// Types for the POS system
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

export type MembershipTier = 'none' | 'introWeekly2Pax' | 'introWeekly4Pax' | 'introWeeklyPS5' | 'introWeeklyCombo';

export interface MembershipDetails {
  tier: MembershipTier;
  expiryDate?: Date;
  creditHoursRemaining: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isMember: boolean;
  membershipDetails?: MembershipDetails;
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

export interface POSContextType {
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
  
  // Station state setter
  setStations: (stations: Station[]) => void;
  
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
  
  // Reset and sample data functions
  resetToSampleData: (options?: ResetOptions) => void;
  addSampleIndianData: () => void;
}
