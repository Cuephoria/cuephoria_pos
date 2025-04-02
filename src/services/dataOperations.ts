
import { Product, Station, Customer, Bill, ResetOptions } from '@/types/pos.types';

// Reset the data to sample data
export const resetToSampleData = (
  options: ResetOptions = { products: true, customers: true, sales: true, sessions: true },
  initialProducts: Product[],
  initialCustomers: Customer[],
  initialStations: Station[],
  setProducts: (products: Product[]) => void,
  setCustomers: (customers: Customer[]) => void,
  setBills: (bills: Bill[]) => void,
  setSessions: (sessions: any[]) => void,
  setStations: (stations: Station[]) => void,
  setCart: (cart: any[]) => void,
  setDiscountAmount: (amount: number) => void,
  setLoyaltyPointsUsedAmount: (amount: number) => void,
  setSelectedCustomer: (customer: Customer | null) => void
) => {
  if (options.products) {
    setProducts(initialProducts);
  }
  
  if (options.customers) {
    // Add membershipTier to customers if it doesn't exist
    const updatedCustomers = initialCustomers.map(customer => ({
      ...customer,
      membershipTier: customer.membershipTier || (customer.isMember ? 'basic' : 'none')
    }));
    setCustomers(updatedCustomers);
  }
  
  if (options.sales) {
    setBills([]);
  }
  
  if (options.sessions) {
    setSessions([]);
    setStations(initialStations.map(station => ({ ...station, isOccupied: false, currentSession: null })));
  }
  
  // Reset current transaction
  setCart([]);
  setDiscountAmount(0);
  setLoyaltyPointsUsedAmount(0);
  setSelectedCustomer(null);
};

// Add sample Indian data to the data store
export const addSampleIndianData = (
  products: Product[],
  customers: Customer[],
  bills: Bill[],
  setProducts: (products: Product[]) => void,
  setCustomers: (customers: Customer[]) => void,
  setBills: (bills: Bill[]) => void
) => {
  // Example implementation
  console.log('Adding sample Indian data');
  
  // Add membership fields to customers if needed
  const updatedCustomers = customers.map((customer: Customer) => {
    if (!('membershipTier' in customer)) {
      return {
        ...customer,
        membershipTier: customer.isMember ? 'basic' : 'none',
        isStudent: false
      };
    }
    return customer;
  });
  
  setCustomers(updatedCustomers);
};
