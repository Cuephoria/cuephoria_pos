
import { useState, useEffect } from 'react';
import { Customer, MembershipTier } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

export const useCustomers = (initialCustomers: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Load data from localStorage
  useEffect(() => {
    const storedCustomers = localStorage.getItem('cuephoriaCustomers');
    if (storedCustomers) setCustomers(JSON.parse(storedCustomers));
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaCustomers', JSON.stringify(customers));
  }, [customers]);
  
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = { 
      ...customer, 
      id: generateId(), 
      createdAt: new Date(),
      membershipTier: customer.membershipTier || 'none'
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };
  
  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    
    // If the updated customer is the selected one, update selectedCustomer as well
    if (selectedCustomer && selectedCustomer.id === customer.id) {
      setSelectedCustomer(customer);
    }
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    
    // If the deleted customer is the selected one, clear selectedCustomer
    if (selectedCustomer && selectedCustomer.id === id) {
      setSelectedCustomer(null);
    }
  };
  
  const selectCustomer = (id: string | null) => {
    if (!id) {
      setSelectedCustomer(null);
      return;
    }
    const customer = customers.find(c => c.id === id);
    setSelectedCustomer(customer || null);
  };
  
  const upgradeMembership = (customerId: string, tier: MembershipTier) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Set membership expiry to 7 days from now
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // Weekly pass = 7 days
    
    const updatedCustomer = {
      ...customer,
      isMember: true,
      membershipTier: tier,
      membershipStartDate: startDate,
      membershipEndDate: endDate
    };
    
    updateCustomer(updatedCustomer);
    
    return updatedCustomer;
  };
  
  return {
    customers,
    setCustomers,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectCustomer,
    upgradeMembership
  };
};
