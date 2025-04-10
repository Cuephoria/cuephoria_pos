import { useState, useEffect } from 'react';
import { Customer } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { hoursToSeconds, formatDurationFromSeconds } from '@/utils/membership.utils';

export const useCustomers = (initialCustomers: Customer[]) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const storedCustomers = localStorage.getItem('cuephoriaCustomers');
        if (storedCustomers) {
          const parsedCustomers = JSON.parse(storedCustomers);
          
          const customersWithDates = parsedCustomers.map((customer: any) => {
            let membershipSecondsLeft = undefined;
            if (customer.membershipHoursLeft !== undefined) {
              membershipSecondsLeft = hoursToSeconds(customer.membershipHoursLeft);
            } else if (customer.membershipSecondsLeft !== undefined) {
              membershipSecondsLeft = customer.membershipSecondsLeft;
            }
            
            return {
              ...customer,
              membershipSecondsLeft,
              createdAt: new Date(customer.createdAt),
              membershipStartDate: customer.membershipStartDate ? new Date(customer.membershipStartDate) : undefined,
              membershipExpiryDate: customer.membershipExpiryDate ? new Date(customer.membershipExpiryDate) : undefined
            };
          });
          
          setCustomers(customersWithDates);
          
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
                membership_seconds_left: customer.membershipSecondsLeft,
                membership_duration: customer.membershipDuration,
                loyalty_points: customer.loyaltyPoints,
                total_spent: customer.totalSpent,
                total_play_time: customer.totalPlayTime,
                created_at: customer.createdAt.toISOString()
              }, 
              { onConflict: 'id' }
            );
          }
          
          localStorage.removeItem('cuephoriaCustomers');
          return;
        }
        
        const { data, error } = await supabase
          .from('customers')
          .select('*');
          
        if (error) {
          console.error('Error fetching customers:', error);
          toast({
            title: 'Database Error',
            description: 'Failed to fetch customers from database',
            variant: 'destructive'
          });
          return;
        }
        
        if (data && data.length > 0) {
          const transformedCustomers = data.map(item => {
            const dbItem = item as any;
            let secondsLeft = undefined;
            
            if (dbItem.membership_seconds_left !== null && dbItem.membership_seconds_left !== undefined) {
              secondsLeft = dbItem.membership_seconds_left;
            } else if (dbItem.membership_hours_left !== null && dbItem.membership_hours_left !== undefined) {
              secondsLeft = hoursToSeconds(dbItem.membership_hours_left);
            }
            
            return {
              id: dbItem.id,
              name: dbItem.name,
              phone: dbItem.phone,
              email: dbItem.email || undefined,
              isMember: dbItem.is_member,
              membershipExpiryDate: dbItem.membership_expiry_date ? new Date(dbItem.membership_expiry_date) : undefined,
              membershipStartDate: dbItem.membership_start_date ? new Date(dbItem.membership_start_date) : undefined,
              membershipPlan: dbItem.membership_plan || undefined,
              membershipSecondsLeft: secondsLeft,
              membershipDuration: dbItem.membership_duration as 'weekly' | 'monthly' | undefined,
              loyaltyPoints: dbItem.loyalty_points,
              totalSpent: dbItem.total_spent,
              totalPlayTime: dbItem.total_play_time,
              createdAt: new Date(dbItem.created_at)
            };
          });
          
          setCustomers(transformedCustomers);
        } else {
          setCustomers([]);
        }
      } catch (error) {
        console.error('Error in fetchCustomers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load customers',
          variant: 'destructive'
        });
        setCustomers([]);
      }
    };
    
    fetchCustomers();
  }, []);
  
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
        
        for (const customer of updatedCustomers) {
          if (!customer.isMember) {
            await supabase
              .from('customers')
              .update({ is_member: false })
              .eq('id', customer.id);
          }
        }
      }
    };
    
    checkExpirations();
  }, [customers]);
  
  const isDuplicateCustomer = (phone: string, email?: string): { isDuplicate: boolean, existingCustomer?: Customer } => {
    const existingByPhone = customers.find(c => c.phone === phone);
    if (existingByPhone) {
      return { isDuplicate: true, existingCustomer: existingByPhone };
    }
    
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
      const { isDuplicate, existingCustomer } = isDuplicateCustomer(customer.phone, customer.email);
      
      if (isDuplicate && existingCustomer) {
        toast({
          title: 'Duplicate Customer',
          description: `A customer with this ${existingCustomer.phone === customer.phone ? 'phone number' : 'email'} already exists.`,
          variant: 'destructive'
        });
        return existingCustomer;
      }
      
      let membershipSecondsLeft = undefined;
      if (customer.membershipSecondsLeft !== undefined) {
        membershipSecondsLeft = customer.membershipSecondsLeft;
      }
      
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
          membership_seconds_left: membershipSecondsLeft,
          membership_duration: customer.membershipDuration,
          loyalty_points: customer.loyaltyPoints || 0,
          total_spent: customer.totalSpent || 0,
          total_play_time: customer.totalPlayTime || 0
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error adding customer:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to add customer to database',
          variant: 'destructive'
        });
        return null;
      }
      
      if (data) {
        const newCustomer: Customer = {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email || undefined,
          isMember: data.is_member,
          membershipExpiryDate: data.membership_expiry_date ? new Date(data.membership_expiry_date) : undefined,
          membershipStartDate: data.membership_start_date ? new Date(data.membership_start_date) : undefined,
          membershipPlan: data.membership_plan || undefined,
          membershipSecondsLeft: data.membership_seconds_left || undefined,
          membershipDuration: data.membership_duration as 'weekly' | 'monthly' | undefined,
          loyaltyPoints: data.loyalty_points,
          totalSpent: data.total_spent,
          totalPlayTime: data.total_play_time,
          createdAt: new Date(data.created_at)
        };
        
        setCustomers(prev => [...prev, newCustomer]);
        
        toast({
          title: 'Success',
          description: 'Customer added successfully',
        });
        
        return newCustomer;
      }
      return null;
    } catch (error) {
      console.error('Error in addCustomer:', error);
      toast({
        title: 'Error',
        description: 'Failed to add customer',
        variant: 'destructive'
      });
      return null;
    }
  };

  const updateCustomerMembership = async (customerId: string, membershipData: {
    membershipPlan?: string;
    membershipDuration?: 'weekly' | 'monthly';
    membershipSecondsLeft?: number;
  }) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return null;
    
    const now = new Date();
    const membershipStartDate = now;
    let membershipExpiryDate = new Date(now);
    
    if (membershipData.membershipDuration === 'weekly') {
      membershipExpiryDate.setDate(membershipExpiryDate.getDate() + 7);
    } else if (membershipData.membershipDuration === 'monthly') {
      membershipExpiryDate.setMonth(membershipExpiryDate.getMonth() + 1);
    }
    
    let membershipSecondsLeft = membershipData.membershipSecondsLeft;
    if (membershipData.membershipPlan) {
      let defaultHours = 4;
      if (membershipData.membershipPlan.includes('Combo') || membershipData.membershipPlan.includes('Ultimate')) {
        defaultHours = 6;
      }
      membershipSecondsLeft = hoursToSeconds(defaultHours);
    }
    
    const updatedCustomer = {
      ...customer,
      isMember: true,
      membershipPlan: membershipData.membershipPlan || customer.membershipPlan,
      membershipDuration: membershipData.membershipDuration || customer.membershipDuration,
      membershipSecondsLeft: membershipSecondsLeft !== undefined 
        ? membershipSecondsLeft 
        : customer.membershipSecondsLeft,
      membershipStartDate,
      membershipExpiryDate
    };
    
    const result = await updateCustomer(updatedCustomer);
    
    toast({
      title: "Membership Updated",
      description: `${customer.name}'s membership has been updated successfully.`,
      variant: "default"
    });
    
    return result;
  };
  
  const updateCustomer = async (customer: Customer) => {
    try {
      const existingCustomer = customers.find(c => c.id === customer.id);
      
      if (existingCustomer) {
        if (existingCustomer.phone !== customer.phone) {
          const duplicatePhone = customers.find(c => c.id !== customer.id && c.phone === customer.phone);
          if (duplicatePhone) {
            toast({
              title: 'Duplicate Phone Number',
              description: 'This phone number is already used by another customer',
              variant: 'destructive'
            });
            return null;
          }
        }
        
        if (existingCustomer.email !== customer.email && customer.email) {
          const duplicateEmail = customers.find(c => c.id !== customer.id && c.email === customer.email);
          if (duplicateEmail) {
            toast({
              title: 'Duplicate Email',
              description: 'This email is already used by another customer',
              variant: 'destructive'
            });
            return null;
          }
        }
      }
      
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
          membership_seconds_left: customer.membershipSecondsLeft,
          membership_duration: customer.membershipDuration,
          loyalty_points: customer.loyaltyPoints,
          total_spent: customer.totalSpent,
          total_play_time: customer.totalPlayTime
        } as any) // Using type assertion to bypass TypeScript error for membership_seconds_left
        .eq('id', customer.id);
        
      if (error) {
        console.error('Error updating customer:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to update customer in database',
          variant: 'destructive'
        });
        return null;
      }
      
      setCustomers(customers.map(c => c.id === customer.id ? customer : c));
      
      if (selectedCustomer && selectedCustomer.id === customer.id) {
        setSelectedCustomer(customer);
      }
      
      toast({
        title: 'Success',
        description: 'Customer updated successfully',
      });
      
      return customer;
    } catch (error) {
      console.error('Error in updateCustomer:', error);
      toast({
        title: 'Error',
        description: 'Failed to update customer',
        variant: 'destructive'
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
        console.error('Error deleting customer:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete customer',
          variant: 'destructive'
        });
        return;
      }
      
      setCustomers(customers.filter(c => c.id !== id));
      
      if (selectedCustomer && selectedCustomer.id === id) {
        setSelectedCustomer(null);
      }
    } catch (error) {
      console.error('Error in deleteCustomer:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete customer',
        variant: 'destructive'
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
      if (customer.isMember && customer.membershipExpiryDate) {
        const expiryDate = new Date(customer.membershipExpiryDate);
        
        if (expiryDate < new Date()) {
          toast({
            title: "Membership Expired",
            description: `${customer.name}'s membership has expired on ${expiryDate.toLocaleDateString()}`,
            variant: "destructive"
          });
          
          const updatedCustomer = {
            ...customer,
            isMember: false
          };
          
          updateCustomer(updatedCustomer);
          setSelectedCustomer(updatedCustomer);
          return;
        }
        
        if (customer.membershipSecondsLeft !== undefined && customer.membershipSecondsLeft <= 0) {
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
    
    if (customer.membershipExpiryDate) {
      const expiryDate = new Date(customer.membershipExpiryDate);
      if (expiryDate < new Date()) {
        toast({
          title: "Membership Expired",
          description: `${customer.name}'s membership has expired on ${expiryDate.toLocaleDateString()}`,
          variant: "destructive"
        });
        
        updateCustomer({
          ...customer,
          isMember: false
        });
        
        return false;
      }
    }
    
    if (customer.membershipSecondsLeft !== undefined && customer.membershipSecondsLeft <= 0) {
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
    
    if (!customer || !customer.isMember || customer.membershipSecondsLeft === undefined) {
      return false;
    }
    
    const secondsToDeduct = hoursToSeconds(hours);
    
    if (customer.membershipSecondsLeft < secondsToDeduct) {
      toast({
        title: "Insufficient Hours",
        description: `Customer only has ${formatDurationFromSeconds(customer.membershipSecondsLeft)} remaining`,
        variant: "destructive"
      });
      return false;
    }
    
    const updatedCustomer = {
      ...customer,
      membershipSecondsLeft: customer.membershipSecondsLeft - secondsToDeduct
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
