import { useState, useEffect } from 'react';
import { Customer } from '@/types/pos.types';
import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomers = (initialCustomers: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Load data from Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // First check if we already have customers in localStorage (for backward compatibility)
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
          
          // Migrate localStorage data to Supabase
          for (const customer of customersWithDates) {
            await supabase.from('customers').upsert({
                id: customer.id,
                name: customer.name,
                phone: customer.phone,
                email: customer.email,
                is_member: customer.isMember,
                membership_expiry_date: customer.membershipExpiryDate?.toISOString(),
                membership_start_date: customer.membershipStartDate?.toISOString(),
                membership_plan: customer.membershipPlan,
                membership_hours_left: customer.membershipHoursLeft,
                membership_duration: customer.membershipDuration,
                loyalty_points: customer.loyaltyPoints,
                total_spent: customer.totalSpent,
                total_play_time: customer.totalPlayTime,
                created_at: customer.createdAt.toISOString()
              }, 
              { onConflict: 'id' }
            );
          }
          
          // Clear localStorage after migration
          localStorage.removeItem('cuephoriaCustomers');
          setLoading(false);
          return;
        }
        
        // Fetch customers from Supabase
        const { data, error } = await supabase
          .from('customers')
          .select('*');
          
        if (error) {
          throw new Error(handleSupabaseError(error, 'fetching customers'));
        }
        
        // Transform data to match our Customer type
        if (data && data.length > 0) {
          const transformedCustomers = data.map(item => ({
            id: item.id,
            name: item.name,
            phone: item.phone,
            email: item.email || undefined,
            isMember: item.is_member,
            membershipExpiryDate: item.membership_expiry_date ? new Date(item.membership_expiry_date) : undefined,
            membershipStartDate: item.membership_start_date ? new Date(item.membership_start_date) : undefined,
            membershipPlan: item.membership_plan || undefined,
            membershipHoursLeft: item.membership_hours_left || undefined,
            membershipDuration: item.membership_duration as 'weekly' | 'monthly' | undefined,
            loyaltyPoints: item.loyalty_points,
            totalSpent: item.total_spent,
            totalPlayTime: item.total_play_time,
            createdAt: new Date(item.created_at)
          }));
          
          setCustomers(transformedCustomers);
        } else {
          setCustomers(initialCustomers);
        }
      } catch (error) {
        console.error('Error in fetchCustomers:', error);
        setError(error instanceof Error ? error : new Error('Unknown error fetching customers'));
        toast("Database Error", {
          description: error instanceof Error ? error.message : 'Failed to load customers from database',
          duration: 6000,
        });
        // Fallback to initialCustomers
        setCustomers(initialCustomers);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomers();
  }, [initialCustomers]);
  
  // Check for expired memberships
  useEffect(() => {
    const now = new Date();
    let customersUpdated = false;
    
    const checkExpirations = async () => {
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
        
        // Update expired memberships in Supabase
        for (const customer of updatedCustomers) {
          if (!customer.isMember) {
            try {
              const { error } = await supabase
                .from('customers')
                .update({ is_member: false })
                .eq('id', customer.id);
                
              if (error) {
                throw new Error(handleSupabaseError(error, 'updating membership status'));
              }
            } catch (error) {
              console.error('Error updating expired membership:', error);
              toast("Database Error", {
                description: error instanceof Error ? error.message : 'Failed to update expired membership',
                duration: 4000,
              });
            }
          }
        }
      }
    };
    
    checkExpirations();
  }, [customers]);
  
  // Check if customer with same phone or email already exists
  const isDuplicateCustomer = (phone: string, email?: string): { isDuplicate: boolean, existingCustomer?: Customer } => {
    // Check for duplicate phone number (required field)
    const existingByPhone = customers.find(c => c.phone === phone);
    if (existingByPhone) {
      return { isDuplicate: true, existingCustomer: existingByPhone };
    }
    
    // Check for duplicate email (optional field)
    if (email) {
      const existingByEmail = customers.find(c => c.email === email);
      if (existingByEmail) {
        return { isDuplicate: true, existingCustomer: existingByEmail };
      }
    }
    
    return { isDuplicate: false };
  };
  
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    try {
      // Check for duplicate customer
      const { isDuplicate, existingCustomer } = isDuplicateCustomer(customer.phone, customer.email);
      
      if (isDuplicate && existingCustomer) {
        toast("Duplicate Customer", {
          description: `A customer with this ${existingCustomer.phone === customer.phone ? 'phone number' : 'email'} already exists.`,
          duration: 4000,
        });
        return existingCustomer; // Return existing customer instead of null
      }
      
      // Create a new customer in Supabase
      const { data, error } = await supabase
        .from('customers')
        .insert({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          is_member: customer.isMember,
          membership_expiry_date: customer.membershipExpiryDate?.toISOString(),
          membership_start_date: customer.membershipStartDate?.toISOString(),
          membership_plan: customer.membershipPlan,
          membership_hours_left: customer.membershipHoursLeft,
          membership_duration: customer.membershipDuration,
          loyalty_points: customer.loyaltyPoints || 0,
          total_spent: customer.totalSpent || 0,
          total_play_time: customer.totalPlayTime || 0
        })
        .select()
        .single();
        
      if (error) {
        throw new Error(handleSupabaseError(error, 'adding customer'));
      }
      
      if (data) {
        // Transform response to our Customer type
        const newCustomer: Customer = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          isMember: data.is_member,
          membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
          membershipStartDate: data.membership_start_date ? new Date(data.membership_start_date) : undefined,
          membershipPlan: data.membership_plan || undefined,
          membershipHoursLeft: data.membership_hours_left || undefined,
          membershipDuration: data.membership_duration as 'weekly' | 'monthly' | undefined,
          loyaltyPoints: data.loyalty_points,
          totalSpent: data.total_spent,
          totalPlayTime: data.total_play_time,
          createdAt: new Date(data.created_at)
        };
        
        // Update local state
        setCustomers(prev => [...prev, newCustomer]);
        
        toast("Customer Added", {
          description: 'Customer added successfully',
          duration: 3000,
        });
        
        return newCustomer;
      }
      return null;
    } catch (error) {
      console.error('Error in addCustomer:', error);
      toast("Database Error", {
        description: error instanceof Error ? error.message : 'Failed to add customer',
        duration: 4000,
      });
      return null;
    }
  };

  const updateCustomerMembership = async (customerId: string, membershipData: {
    membershipPlan?: string;
    membershipDuration?: 'weekly' | 'monthly';
    membershipHoursLeft?: number;
  }) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;
    
    // Calculate membership dates
    const now = new Date();
    const membershipStartDate = now;
    let membershipExpiryDate = new Date(now);
    
    // Calculate expiry date based on duration
    if (membershipData.membershipDuration === 'weekly') {
      membershipExpiryDate.setDate(membershipExpiryDate.getDate() + 7);
    } else if (membershipData.membershipDuration === 'monthly') {
      membershipExpiryDate.setMonth(membershipExpiryDate.getMonth() + 1);
    }
    
    // Prepare updated customer data
    const updatedCustomer = {
      ...customer,
      isMember: true,
      membershipPlan: membershipData.membershipPlan || customer.membershipPlan,
      membershipDuration: membershipData.membershipDuration || customer.membershipDuration,
      membershipHoursLeft: membershipData.membershipHoursLeft !== undefined 
        ? membershipData.membershipHoursLeft 
        : customer.membershipHoursLeft,
      membershipStartDate,
      membershipExpiryDate
    };
    
    // Update in database
    const result = await updateCustomer(updatedCustomer);
    
    // Notify user about the membership update
    toast("Membership Updated", {
      description: `${customer.name}'s membership has been updated successfully.`
    });
    
    return result;
  };
  
  const updateCustomer = async (customer: Customer) => {
    try {
      // Check for duplicate phone/email only if they've changed
      const existingCustomer = customers.find(c => c.id === customer.id);
      
      if (existingCustomer) {
        if (existingCustomer.phone !== customer.phone) {
          // Phone number has changed, check if the new one is already used
          const duplicatePhone = customers.find(c => c.id !== customer.id && c.phone === customer.phone);
          if (duplicatePhone) {
            toast("Duplicate Phone Number", {
              description: 'This phone number is already used by another customer',
              duration: 4000,
            });
            return null;
          }
        }
        
        if (existingCustomer.email !== customer.email && customer.email) {
          // Email has changed, check if the new one is already used
          const duplicateEmail = customers.find(c => c.id !== customer.id && c.email === customer.email);
          if (duplicateEmail) {
            toast("Duplicate Email", {
              description: 'This email is already used by another customer',
              duration: 4000,
            });
            return null;
          }
        }
      }
      
      // Update customer in Supabase
      const { error } = await supabase
        .from('customers')
        .update({
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          is_member: customer.isMember,
          membership_expiry_date: customer.membershipExpiryDate?.toISOString(),
          membership_start_date: customer.membershipStartDate?.toISOString(),
          membership_plan: customer.membershipPlan,
          membership_hours_left: customer.membershipHoursLeft,
          membership_duration: customer.membershipDuration,
          loyalty_points: customer.loyaltyPoints,
          total_spent: customer.totalSpent,
          total_play_time: customer.totalPlayTime
        })
        .eq('id', customer.id);
        
      if (error) {
        throw new Error(handleSupabaseError(error, 'updating customer'));
      }
      
      // Update local state
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
      
      // If we're updating the currently selected customer, update that too
      if (selectedCustomer && selectedCustomer.id === customer.id) {
        setSelectedCustomer(customer);
      }
      
      toast("Customer Updated", {
        description: 'Customer updated successfully',
        duration: 3000,
      });
      
      return customer;
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      toast("Database Error", {
        description: error instanceof Error ? error.message : 'Failed to update customer',
        duration: 4000,
      });
      return null;
    }
  };
  
  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw new Error(handleSupabaseError(error, 'deleting customer'));
      }
      
      setCustomers(customers.filter(c => c.id !== id));
      
      // If we're deleting the currently selected customer, clear the selection
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(null);
      }
      
      toast("Customer Deleted", {
        description: 'Customer has been removed successfully',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      toast("Database Error", {
        description: error instanceof Error ? error.message : 'Failed to delete customer',
        duration: 4000,
      });
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
          toast("Membership Expired", {
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
          toast("No Hours Remaining", {
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
        toast("Membership Expired", {
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
      toast("No Hours Remaining", {
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
      toast("Insufficient Hours", {
        description: `Customer only has ${customer.membershipHoursLeft} hours remaining`
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
    deductMembershipHours,
    loading,
    error
  };
};
