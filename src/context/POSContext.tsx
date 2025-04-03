
// This file is kept for backward compatibility
// It re-exports the POSProvider and usePOS hook from the refactored pos directory
export { POSProvider, usePOS } from './pos';

// Re-export types from types file for convenience
export type { 
  Product,
  Station,
  Customer,
  Session,
  CartItem,
  Bill,
  ResetOptions,
  POSContextType
} from '@/types/pos.types';
