
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  isExistingCustomer: boolean;
  customerId?: string;
}

interface CustomerInfoFormProps {
  customerInfo: CustomerInfo;
  onChange: (info: CustomerInfo) => void;
}

const CustomerInfoForm = ({ customerInfo, onChange }: CustomerInfoFormProps) => {
  const [isSearching, setIsSearching] = useState(false);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({
      ...customerInfo,
      [name]: value
    });
  };
  
  // Search for existing customer
  const searchCustomer = async () => {
    if (!customerInfo.phone) {
      toast.error('Please enter a phone number to search');
      return;
    }
    
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', customerInfo.phone)
        .limit(1);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        const customer = data[0];
        onChange({
          name: customer.name,
          phone: customer.phone,
          email: customer.email || '',
          isExistingCustomer: true,
          customerId: customer.id
        });
        
        toast.success(`Welcome back, ${customer.name}!`);
        
        // Add membership badge if customer is a member
        if (customer.is_member) {
          toast.info('Member benefits applied!', {
            description: 'Your membership benefits will be applied to this booking'
          });
        }
      } else {
        toast.info('No existing customer found with this phone number');
        // Reset the form except for the phone
        onChange({
          ...customerInfo,
          name: '',
          email: '',
          isExistingCustomer: false,
          customerId: undefined
        });
      }
    } catch (error) {
      console.error('Error searching for customer:', error);
      toast.error('Failed to search for customer');
    } finally {
      setIsSearching(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-800 pb-6">
        <h3 className="text-lg font-medium mb-4">Find Existing Customer</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="searchPhone">Phone Number</Label>
            <Input
              id="searchPhone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter phone number to search"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={searchCustomer} 
              disabled={isSearching || !customerInfo.phone}
              type="button"
            >
              {isSearching ? (
                <>
                  <LoadingSpinner className="mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>
        
        {customerInfo.isExistingCustomer && customerInfo.customerId && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-900/30 rounded-md">
            <div className="flex items-center justify-between">
              <span className="text-green-400">Existing customer found!</span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  onChange({
                    name: '',
                    phone: customerInfo.phone,
                    email: '',
                    isExistingCustomer: false,
                    customerId: undefined
                  });
                }}
              >
                New Customer
              </Button>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">
          {customerInfo.isExistingCustomer ? 'Customer Information' : 'Your Information'}
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={customerInfo.name}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              value={customerInfo.phone}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter your phone number"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={customerInfo.email}
              onChange={handleChange}
              className="mt-1"
              placeholder="Enter your email address"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll send booking confirmation to this email
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerInfoForm;
