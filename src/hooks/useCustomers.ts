
import { useState, useEffect } from 'react';
import { Customer, Membership, MembershipType } from '@/types/pos.types';
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
      membership: customer.membership || null
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
  
  const addMembership = (customerId: string, membershipType: MembershipType, creditHours: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return false;
    
    // Create expiry date (30 days from now)
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    const membership: Membership = {
      type: membershipType,
      startDate,
      expiryDate,
      creditHoursRemaining: creditHours,
      originalCreditHours: creditHours
    };
    
    const updatedCustomer = {
      ...customer,
      isMember: true,
      membership
    };
    
    updateCustomer(updatedCustomer);
    
    // If this is the selected customer, update that too
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(updatedCustomer);
    }
    
    return true;
  };
  
  const useMembershipCredit = (customerId: string, hoursUsed: number) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || !customer.membership) return false;
    
    // Check if customer has enough credit
    if (customer.membership.creditHoursRemaining < hoursUsed) return false;
    
    // Check if membership is expired
    if (new Date() > new Date(customer.membership.expiryDate)) return false;
    
    const updatedMembership = {
      ...customer.membership,
      creditHoursRemaining: customer.membership.creditHoursRemaining - hoursUsed
    };
    
    const updatedCustomer = {
      ...customer,
      membership: updatedMembership
    };
    
    updateCustomer(updatedCustomer);
    
    // If this is the selected customer, update that too
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(updatedCustomer);
    }
    
    return true;
  };
  
  const isMembershipExpired = (customer: Customer) => {
    if (!customer.membership) return true;
    return new Date() > new Date(customer.membership.expiryDate);
  };
  
  const getMembershipDetails = (membershipType: MembershipType) => {
    switch (membershipType) {
      case '8ball_2pax':
        return {
          name: "Introductory Weekly Pass - 8 ball (2 Pax)",
          price: 399,
          studentPrice: 299,
          regularPrice: 599,
          creditHours: 4,
          benefits: [
            "Can Play 4hrs in a week for free",
            "Can only utilise 1 hr max per day",
            "Can utilise this offer on any day but on sunday only 11AM to 5PM",
            "Priority bookings for members",
            "Prior Booking is Mandatory"
          ],
          perks: [
            "Flat 50% on Weekly Pass",
            "Buy 1 Get 2 Passes",
            "Special Member Cue* Subject to availability",
            "1 MetaShot Challenge for free",
            "Save 1000rs",
            "Flat 100rs off for students weekly pass"
          ]
        };
      case '8ball_4pax':
        return {
          name: "Introductory Weekly Pass - 8 ball (4 Pax)",
          price: 599,
          studentPrice: 499,
          regularPrice: 1199,
          creditHours: 4,
          benefits: [
            "Can Play 4hrs in a week for free",
            "Can only utilise 1 hr max per day",
            "Can utilise this offer on any day but on sunday only 11AM to 5PM",
            "Priority bookings for members",
            "Prior Booking is Mandatory"
          ],
          perks: [
            "Flat 50% on Weekly Pass",
            "Buy 1 Get 4 Passes",
            "Special Member Cue* Subject to availability",
            "2 MetaShot Challenge for free",
            "Save 1000rs",
            "Flat 100rs off for students weekly pass"
          ]
        };
      case 'ps5':
        return {
          name: "Introductory Weekly Pass - PS5 Gaming",
          price: 399,
          studentPrice: 299,
          regularPrice: 599,
          creditHours: 4,
          benefits: [
            "Can Play 4hrs in a week for free",
            "Can only utilise 1 hr max per day",
            "Can utilise this offer on any day but on sunday only 11AM to 5PM",
            "Priority bookings for members",
            "Prior Booking is Mandatory"
          ],
          perks: [
            "Flat 50% on Weekly Pass",
            "Buy 1 Get 2 Joysticks",
            "Access to PS Plus Games",
            "1 MetaShot Challenge for free",
            "Flat 100rs off for students pass"
          ]
        };
      case 'combo':
        return {
          name: "Introductory Weekly Pass - Combo",
          price: 899,
          studentPrice: 799,
          regularPrice: 1799,
          creditHours: 6,
          benefits: [
            "Can Play 6hrs in a week for free",
            "Can utlise 2hrs Max per day",
            "Can utilise this offer on any day but on sunday only 11AM to 5PM",
            "Priority bookings for members",
            "Prior Booking is Mandatory"
          ],
          perks: [
            "Flat 50% on Weekly Pass",
            "Buy 1 Get 6 Passes",
            "Special Member Cue (Subject to availability)",
            "Access to PS Plus Games",
            "3 MetaShot Challenge for free",
            "Flat 100rs off for students pass"
          ]
        };
      default:
        return null;
    }
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
    useMembershipCredit,
    isMembershipExpired,
    getMembershipDetails
  };
};
