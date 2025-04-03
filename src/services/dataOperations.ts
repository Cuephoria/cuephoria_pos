
import { Bill, Customer, Product, ResetOptions, CartItem } from '@/types/pos.types';

// Reset function with options
export const resetToSampleData = (
  options: ResetOptions | undefined,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>,
  setSessions: React.Dispatch<React.SetStateAction<any[]>>,
  setStations: React.Dispatch<React.SetStateAction<any[]>>,
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setDiscountAmount: React.Dispatch<React.SetStateAction<number>>,
  setLoyaltyPointsUsedAmount: React.Dispatch<React.SetStateAction<number>>,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>,
  refreshFromDB?: () => Promise<Product[]>
) => {
  const defaultOptions = {
    products: true,
    customers: true,
    sales: true,
    sessions: true
  };
  
  const resetOpts = options || defaultOptions;
  
  // Clear local storage data
  if (resetOpts.customers) {
    setCustomers([]);
    localStorage.removeItem('cuephoriaCustomers');
  }
  
  if (resetOpts.sales) {
    setBills([]);
    localStorage.removeItem('cuephoriaBills');
  }
  
  if (resetOpts.sessions) {
    setSessions([]);
    
    // Reset station occupation status
    setStations(prevStations => prevStations.map(station => ({
      ...station,
      isOccupied: false,
      currentSession: null
    })));
    
    localStorage.removeItem('cuephoriaSessions');
    localStorage.removeItem('cuephoriaStations');
  }
  
  if (resetOpts.products && refreshFromDB) {
    // Refresh products from database
    refreshFromDB();
  }
  
  // Clear cart regardless of options
  setCart([]);
  setDiscountAmount(0);
  setLoyaltyPointsUsedAmount(0);
  setSelectedCustomer(null);
};
