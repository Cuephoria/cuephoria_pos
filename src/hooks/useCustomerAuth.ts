
import { useContext } from 'react';
import { CustomerAuthContext } from '@/context/CustomerAuthContext';

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
};
