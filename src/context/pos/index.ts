
export { POSProvider, usePOS } from './POSProvider';
export type { POSContextType, ResetOptions } from './POSTypes';

// Re-export types from types file for convenience
export type { 
  Product,
  Station,
  Customer,
  Session,
  CartItem,
  Bill
} from '@/types/pos.types';
