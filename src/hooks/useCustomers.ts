
import { useState, useEffect } from 'react';
import { Customer } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';
import { useToast } from '@/hooks/use-toast';

export const useCustomers = (initialCustomers: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  
  // Load data from localStorage
  useEffect(() => {
    const storedCustomers = localStorage.getItem('cuephoriaCustomers');
    if (storedCustomers) {
      const parsedCustomers = JSON.parse(storedCustomers);
      
      // Convert date strings to actual Date objects
      const customersWithDates = parsedCustomers.map((customer: any) => ({
        ...customer,
        createdAt: new Date(customer.createdAt),
        membershipStartDate: customer.membershipStartDate ? new Date(customer.membershipStartDate) : undefined,
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

  const updateCustomerMembership = (customerId: string, membershipData: {
    membershipPlan?: string;
    membershipDuration?: 'weekly' | 'monthly';
    membershipHoursLeft?: number;
  }) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;
    
    const now = new Date();
    const membershipStartDate = now;
    let membershipExpiryDate = new Date(now);
    
    // Calculate expiry date based on duration
    if (membershipData.membershipDuration === 'weekly') {
      membershipExpiryDate.setDate(membershipExpiryDate.getDate() + 7);
    } else if (membershipData.membershipDuration === 'monthly') {
      membershipExpiryDate.setMonth(membershipExpiryDate.getMonth() + 1);
    }
    
    const updatedCustomer = {
      ...customer,
      isMember: true,
      membershipPlan: membershipData.membershipPlan,
      membershipDuration: membershipData.membershipDuration,
      membershipHoursLeft: membershipData.membershipHoursLeft,
      membershipStartDate,
      membershipExpiryDate
    };
    
    updateCustomer(updatedCustomer);
    return updatedCustomer;
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
    
    if (customer) {
      // Check if membership is expired before selecting
      if (customer.isMember && customer.membershipExpiryDate) {
        const expiryDate = new Date(customer.membershipExpiryDate);
        
        if (expiryDate < new Date()) {
          toast({
            title: "Membership Expired",
            description: `${customer.name}'s membership has expired on ${expiryDate.toLocaleDateString()}`,
            variant: "destructive"
          });
          
          // Update the customer to mark membership as inactive
          const updatedCustomer = {
            ...customer,
            isMember: false
          };
          
          updateCustomer(updatedCustomer);
          setSelectedCustomer(updatedCustomer);
          return;
        }
        
        if (customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft <= 0) {
          toast({
            title: "Membership Hours Depleted",
            description: `${customer.name} has no remaining hours on their membership plan`,
            variant: "destructive"
          });
        }
      }
      
      setSelectedCustomer(customer);
    } else {
      setSelectedCustomer(null);
    }
  };
  
  const checkMembershipValidity = (customerId: string): boolean => {
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer) return false;
    if (!customer.isMember) return false;
    
    // Check expiry date
    if (customer.membershipExpiryDate) {
      const expiryDate = new Date(customer.membershipExpiryDate);
      if (expiryDate < new Date()) {
        toast({
          title: "Membership Expired",
          description: `${customer.name}'s membership has expired on ${expiryDate.toLocaleDateString()}`,
          variant: "destructive"
        });
        
        // Update the customer status
        updateCustomer({
          ...customer,
          isMember: false
        });
        
        return false;
      }
    }
    
    // Check hours remaining
    if (customer.membershipHoursLeft !== undefined && customer.membershipHoursLeft <= 0) {
      toast({
        title: "No Hours Remaining",
        description: `${customer.name} has used all allocated hours in their membership plan`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const deductMembershipHours = (customerId: string, hours: number): boolean => {
    const customer = customers.find(c => c.id === customerId);
    
    if (!customer || !customer.isMember || customer.membershipHoursLeft === undefined) {
      return false;
    }
    
    if (customer.membershipHoursLeft < hours) {
      toast({
        title: "Insufficient Hours",
        description: `Customer only has ${customer.membershipHoursLeft} hours remaining`,
        variant: "destructive"
      });
      return false;
    }
    
    // Deduct hours
    const updatedCustomer = {
      ...customer,
      membershipHoursLeft: customer.membershipHoursLeft - hours
    };
    
    updateCustomer(updatedCustomer);
    return true;
  };
  
  return {
    customers,
    setCustomers,
    selectedCustomer,
    setSelectedCustomer,
    addCustomer,
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer,
    selectCustomer,
    checkMembershipValidity,
    deductMembershipHours
  };
};
