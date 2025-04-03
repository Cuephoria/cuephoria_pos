
import { 
  Product,
  Station,
  Customer,
  Session,
  CartItem,
  Bill
} from '@/types/pos.types';

// Context type definitions
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
  isStudentDiscount: boolean;
  
  // Setters
  setIsStudentDiscount: (value: boolean) => void;
  setStations: (stations: Station[]) => void;
  
  // Product functions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  
  // Station functions
  startSession: (stationId: string, customerId: string) => Promise<void>;
  endSession: (stationId: string) => Promise<void>;
  
  // Customer functions
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  updateCustomer: (customer: Customer) => void;
  updateCustomerMembership: (customerId: string, membershipData: {
    membershipPlan?: string;
    membershipDuration?: 'weekly' | 'monthly';
    membershipHoursLeft?: number;
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
}

export interface ResetOptions {
  products: boolean;
  customers: boolean;
  sales: boolean;
  sessions: boolean;
}
