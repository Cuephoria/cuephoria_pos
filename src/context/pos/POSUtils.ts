
import { 
  Customer, 
  Product, 
  Bill, 
  Session, 
  Station, 
  CartItem,
  ResetOptions
} from '@/types/pos.types';
import { addSampleIndianData as addSampleIndianDataService, resetToSampleData as resetToSampleDataService } from '@/services/dataOperations';

// Wrapper for sample data functions
export const createResetToSampleData = (
  initialProducts: Product[],
  initialCustomers: Customer[],
  initialStations: Station[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>,
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>,
  setStations: React.Dispatch<React.SetStateAction<Station[]>>,
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>,
  setDiscountAmount: React.Dispatch<React.SetStateAction<number>>,
  setLoyaltyPointsUsedAmount: React.Dispatch<React.SetStateAction<number>>,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>
) => {
  return (options?: ResetOptions) => {
    resetToSampleDataService(
      options,
      initialProducts,
      initialCustomers,
      initialStations,
      setProducts,
      setCustomers,
      setBills,
      setSessions,
      setStations,
      setCart,
      setDiscountAmount,
      setLoyaltyPointsUsedAmount,
      setSelectedCustomer
    );
  };
};

export const createAddSampleIndianData = (
  products: Product[],
  customers: Customer[],
  bills: Bill[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>
) => {
  return () => {
    addSampleIndianDataService(
      products,
      customers,
      bills,
      setProducts,
      setCustomers,
      setBills
    );
  };
};
