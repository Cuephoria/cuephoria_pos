
import { LucideIcon } from 'lucide-react';

// Product related types
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'gaming' | 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership';
  stock: number;
}

export type MembershipType = '8ball_2pax' | '8ball_4pax' | 'ps5' | 'combo';

export interface Membership {
  type: MembershipType;
  startDate: Date;
  expiryDate: Date;
  creditHoursRemaining: number;
  originalCreditHours: number;
}

// Customer related types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isMember: boolean;
  membership: Membership | null;
  loyaltyPoints: number;
  totalSpent: number;
  totalPlayTime: number; // in minutes
  createdAt: Date;
}

// Station related types
export type StationType = 'ps5' | '8ball' | 'pool' | 'snooker' | 'console';
export type StationStatus = 'available' | 'occupied' | 'maintenance';

export interface Station {
  id: string;
  name: string;
  type: StationType;
  hourlyRate: number;
  isOccupied: boolean;
  currentSession: any | null;
  status: StationStatus;
}

export interface Session {
  id: string;
  stationId: string;
  customerId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
}

// POS related types
export type CartItemType = 'product' | 'session' | 'membership';

export interface CartItem {
  id: string;
  type: CartItemType;
  name: string;
  price: number;
  quantity: number;
  total: number;
  membershipType?: MembershipType; // Only for membership products
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

// Reset Options type
export interface ResetOptions {
  all?: boolean;
  products?: boolean;
  customers?: boolean;
  bills?: boolean;
  sessions?: boolean;
  stations?: boolean;
  cart?: boolean;
}

// Context type definition
export interface POSContextType {
  // State
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
  
  // Station actions
  setStations: (stations: Station[]) => void;
  addStation: (station: Station) => void;
  updateStation: (station: Station) => void;
  removeStation: (id: string) => void;
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Station and session actions
  startSession: (stationId: string, customerId: string) => void;
  endSession: (stationId: string) => any;
  
  // Customer actions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  selectCustomer: (id: string | null) => void;
  
  // Membership actions
  addMembership: (customerId: string, membershipType: MembershipType, creditHours: number) => boolean;
  useMembershipCredit: (customerId: string, hoursUsed: number) => boolean;
  isMembershipExpired: (customer: Customer) => boolean;
  getMembershipDetails: (membershipType: MembershipType) => any;
  
  // Cart actions
  addToCart: (item: Omit<CartItem, 'total'>) => void;
  removeFromCart: (id: string) => void;
  updateCartItem: (id: string, quantity: number) => void;
  clearCart: () => void;
  setDiscount: (amount: number, type: 'percentage' | 'fixed') => void;
  setLoyaltyPointsUsed: (points: number) => void;
  calculateTotal: () => number;
  
  // Billing actions
  completeSale: (paymentMethod: 'cash' | 'upi') => Bill | undefined;
  exportBills: () => void;
  exportCustomers: () => void;
  
  // Data operations
  resetToSampleData: (options?: ResetOptions) => void;
  addSampleIndianData: () => void;
}
