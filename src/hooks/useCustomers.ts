
import { useState, useEffect } from 'react';
import { Customer } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';

export const useCustomers = (initialCustomers: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Load data from localStorage
  useEffect(() => {
    const storedCustomers = localStorage.getItem('cuephoriaCustomers');
    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers);
      
      // Convert date strings to actual Date objects
      const customersWithDates = parsedCustomers.map((customer: any) => ({
        ...customer,
        createdAt: new Date(customer.createdAt),
        membershipExpiryDate: customer.membershipExpiryDate ? new Date(customer.membershipExpiryDate) : undefined
      }));
      
      setCustomers(customersWithDates);
    }
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaCustomers', JSON.stringify(customers));
  }, [customers]);
  
  // Check for expired memberships
  useEffect(() => {
    const now = new Date();
    let customersUpdated = false;
    
    const updatedCustomers = customers.map(customer => {
      if (customer.isMember && customer.membershipExpiryDate) {
        const expiryDate = new Date(customer.membershipExpiryDate);
        
        if (expiryDate < now) {
          customersUpdated = true;
          // Membership has expired, update the customer
          console.log(`Membership expired for ${customer.name}`);
          return {
            ...customer,
            isMember: false
          };
        }
      }
      return customer;
    });
    
    if (customersUpdated) {
      setCustomers(updatedCustomers);
    }
  }, [customers]);
  
  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer = { 
      ...customer, 
      id: generateId(), 
      createdAt: new Date() 
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };
  
  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
    
    // If we're updating the currently selected customer, update that too
    if (selectedCustomer && selectedCustomer.id === customer.id) {
      setSelectedCustomer(customer);
    }
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
    
    // If we're deleting the currently selected customer, clear the selection
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
  
  return {
    customers,
    setCustomers,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    selectCustomer
  };
};
