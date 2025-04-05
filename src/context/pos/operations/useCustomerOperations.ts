import { Customer } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';
import { supabase } from "@/integrations/supabase/client";

export const useCustomerOperations = (
  customers: Customer[],
  selectedCustomer: Customer | null,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>
) => {
  const { toast } = useToast();

  // Check for expired memberships
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
  
  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<Customer | null> => {
    try {
      // Check for duplicate customer
      const { isDuplicate, existingCustomer } = isDuplicateCustomer(customer.phone, customer.email);
      
      if (isDuplicate && existingCustomer) {
        toast({
          title: 'Duplicate Customer',
          description: `A customer with this ${existingCustomer.phone === customer.phone ? 'phone number' : 'email'} already exists.`,
          variant: 'destructive'
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
        console.error('Error adding customer:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to add customer to database',
          variant: 'destructive'
        });
        return null;
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
        //setCustomers(prev => [...prev, newCustomer]);
        
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

  const updateCustomer = async (customer: Customer): Promise<Customer | null> => {
    try {
      // Check for duplicate phone/email only if they've changed
      const existingCustomer = customers.find(c => c.id === customer.id);
      
      if (existingCustomer) {
        if (existingCustomer.phone !== customer.phone) {
          // Phone number has changed, check if the new one is already used
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
          // Email has changed, check if the new one is already used
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
        console.error('Error updating customer:', error);
        toast({
          title: 'Database Error',
          description: 'Failed to update customer in database',
          variant: 'destructive'
        });
        return null;
      }
      
      // Update local state
      //setCustomers(customers.map(c => c.id === customer.id ? customer : c));
      
      // If we're updating the currently selected customer, update that too
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

  const updateCustomerMembership = (
    customerId: string, 
    membershipData: {
      membershipPlan?: string;
      membershipDuration?: 'weekly' | 'monthly';
      membershipHoursLeft?: number;
    }
  ): Customer | null => {
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
    
    // Notify user about the membership update
    toast({
      title: "Membership Updated",
      description: `${customer.name}'s membership has been updated successfully.`,
      variant: "default"
    });
    
    return updatedCustomer as Customer;
  };

  const deleteCustomer = async (customerId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);
        
      if (error) {
        console.error('Error deleting customer:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete customer',
          variant: 'destructive'
        });
        return;
      }
      
      //setCustomers(customers.filter(c => c.id !== customerId));
      
      // If we're deleting the currently selected customer, clear the selection
      if (selectedCustomer && selectedCustomer.id === customerId) {
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

  const selectCustomer = (id: string | null): void => {
    if (!id) {
      setSelectedCustomer(null);
      return;
    }
    
    const customer = customers.find(c => c.id === id);
    
    if (customer) {
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
    addCustomer,
    updateCustomer,
    updateCustomerMembership,
    deleteCustomer,
    selectCustomer,
    checkMembershipValidity,
    deductMembershipHours
  };
};
