
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
      createdAt: new Date() 
    };
    setCustomers([...customers, newCustomer]);
    return newCustomer;
  };
  
  const updateCustomer = (customer: Customer) => {
    setCustomers(customers.map(c => c.id === customer.id ? customer : c));
  };
  
  const deleteCustomer = (id: string) => {
    setCustomers(customers.filter(c => c.id !== id));
  };
  
  const selectCustomer = (id: string | null) => {
    if (!id) {
      setSelectedCustomer(null);
      return;
    }
    const customer = customers.find(c => c.id === id);
    setSelectedCustomer(customer || null);
  };
  
  const addMembership = (
    customerId: string, 
    tier: MembershipTier, 
    expiryDate?: Date
  ) => {
    // Find the customer
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;
    
    // Set default credit hours based on membership tier
    let creditHoursRemaining = 0;
    
    // Set credit hours based on tier from the image
    switch (tier) {
      case 'introWeekly2Pax':
      case 'introWeekly4Pax':
      case 'introWeeklyPS5':
        creditHoursRemaining = 4;
        break;
      case 'introWeeklyCombo':
        creditHoursRemaining = 6;
        break;
      default:
        creditHoursRemaining = 0;
    }
    
    // Create a default expiry date if not provided (7 days from now)
    const defaultExpiryDate = new Date();
    defaultExpiryDate.setDate(defaultExpiryDate.getDate() + 7);
    
    // Update the customer
    const updatedCustomer = {
      ...customer,
      isMember: true,
      membershipDetails: {
        tier,
        expiryDate: expiryDate || defaultExpiryDate,
        creditHoursRemaining
      }
    };
    
    updateCustomer(updatedCustomer);
    return updatedCustomer;
  };
  
  const updateMembershipHours = (customerId: string, hoursUsed: number) => {
    // Find the customer
    const customer = customers.find(c => c.id === customerId);
    if (!customer || !customer.membershipDetails) return;
    
    // Calculate remaining hours
    const remainingHours = Math.max(0, customer.membershipDetails.creditHoursRemaining - hoursUsed);
    
    // Update the customer
    const updatedCustomer = {
      ...customer,
      membershipDetails: {
        ...customer.membershipDetails,
        creditHoursRemaining: remainingHours
      }
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
    addMembership,
    updateMembershipHours
  };
};
