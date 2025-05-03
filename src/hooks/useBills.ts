
import { useState, useEffect } from 'react';
import { Bill, CartItem, Customer, Product } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';

export const useBills = (updateCustomer: Function, updateProduct: Function) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const { data, error } = await supabase
          .from('bills')
          .select('*');

        if (error) {
          console.error('Error fetching bills:', error);
          toast({
            title: 'Database Error',
            description: 'Failed to fetch bills from database',
            variant: 'destructive'
          });
          return;
        }

        if (data) {
          const transformedBills = data.map(item => ({
            id: item.id,
            customerId: item.customer_id,
            items: [], // You might need to fetch items separately
            subtotal: item.subtotal,
            discount: item.discount,
            discountValue: item.discount_value,
            discountType: item.discount_type as "percentage" | "fixed", // Explicitly cast to match type
            loyaltyPointsUsed: item.loyalty_points_used,
            loyaltyPointsEarned: item.loyalty_points_earned,
            total: item.total,
            paymentMethod: item.payment_method as "cash" | "upi", // Explicitly cast payment method as well
            createdAt: new Date(item.created_at)
          })) as Bill[]; // Cast the entire array to Bill[]
          setBills(transformedBills);
        }
      } catch (error) {
        console.error('Error in fetchBills:', error);
        toast({
          title: 'Error',
          description: 'Failed to load bills',
          variant: 'destructive'
        });
        setBills([]);
      }
    };

    fetchBills();
  }, []);

  const deleteBill = async (billId: string, customerId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', billId);
        
      if (error) {
        console.error('Error deleting bill:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete bill',
          variant: 'destructive'
        });
        return false;
      }
      
      setBills(bills.filter(bill => bill.id !== billId));
      
      // Optionally, update customer's totalSpent and loyaltyPoints
      // You might need to fetch the bill details before deleting to correctly adjust the customer's data
      
      toast({
        title: 'Success',
        description: 'Bill deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error in deleteBill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bill',
        variant: 'destructive'
      });
      return false;
    }
  };

  const exportBills = (customers: Customer[]) => {
    if (!bills || bills.length === 0) {
      toast({
        title: 'No Bills to Export',
        description: 'There are no bills available to export.',
        variant: 'destructive' // Changed from 'warning' to 'destructive'
      });
      return;
    }
    
    const billsWithCustomerInfo = bills.map(bill => {
      const customer = customers.find(c => c.id === bill.customerId);
      return {
        ...bill,
        customerName: customer ? customer.name : 'Unknown',
        customerPhone: customer ? customer.phone : 'Unknown',
        customerEmail: customer ? customer.email : 'Unknown'
      };
    });

    const csvRows = [];
    const headers = Object.keys(billsWithCustomerInfo[0]);
    csvRows.push(headers.join(','));

    for (const row of billsWithCustomerInfo) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', 'true');
    a.setAttribute('href', url);
    a.setAttribute('download', 'bills.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: 'Bills Exported',
      description: 'Bills data has been exported to a CSV file.',
    });
  };

  const exportCustomers = (customers: Customer[]) => {
    if (!customers || customers.length === 0) {
      toast({
        title: 'No Customers to Export',
        description: 'There are no customers available to export.',
        variant: 'destructive' // Changed from 'warning' to 'destructive'
      });
      return;
    }

    const csvRows = [];
    const headers = Object.keys(customers[0]);
    csvRows.push(headers.join(','));

    for (const row of customers) {
      const values = headers.map(header => {
        const value = row[header];
        return typeof value === 'string' ? `"${value}"` : value;
      });
      csvRows.push(values.join(','));
    }

    const csvData = csvRows.join('\n');
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', 'true');
    a.setAttribute('href', url);
    a.setAttribute('download', 'customers.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast({
      title: 'Customers Exported',
      description: 'Customer data has been exported to a CSV file.',
    });
  };
  
  const completeSale = async (
    cart: CartItem[], 
    selectedCustomer: Customer | null,
    discount: number,
    discountType: 'percentage' | 'fixed',
    loyaltyPointsUsed: number,
    calculateTotal: () => number,
    paymentMethod: 'cash' | 'upi',
    products: Product[]
  ) => {
    try {
      if (!selectedCustomer) {
        console.error("No customer selected for billing");
        return null;
      }
      
      const total = calculateTotal();
      console.log("Sale total:", total);
      
      // Updated to calculate loyalty points at 5 points per 100 INR spent
      const loyaltyPointsEarned = Math.floor((total / 100) * 5);
      console.log("Loyalty points earned:", loyaltyPointsEarned);
      
      const bill: Bill = {
        id: generateId(),
        customerId: selectedCustomer.id,
        items: cart,
        subtotal: cart.reduce((sum, item) => sum + item.total, 0),
        discount,
        discountValue: discount > 0 ? 
          (discountType === 'percentage' ? 
            (cart.reduce((sum, item) => sum + item.total, 0) * discount / 100) : 
            discount) : 0,
        discountType,
        loyaltyPointsUsed,
        loyaltyPointsEarned,
        total,
        paymentMethod,
        createdAt: new Date()
      };

      const { data: billRecord, error: billError } = await supabase
        .from('bills')
        .insert({
          id: bill.id,
          customer_id: bill.customerId,
          subtotal: bill.subtotal,
          discount: bill.discount,
          discount_value: bill.discountValue,
          discount_type: bill.discountType,
          loyalty_points_used: bill.loyaltyPointsUsed,
          loyalty_points_earned: bill.loyaltyPointsEarned,
          total: bill.total,
          payment_method: bill.paymentMethod
        })
        .select()
        .single();
        
      if (billError) {
        console.error("Error inserting bill:", billError);
        throw billError;
      }
      
      // Process each item in the cart
      for (const item of cart) {
        if (item.type === 'product') {
          const product = products.find(p => p.id === item.id);
          if (product) {
            const updatedStock = product.stock - item.quantity;
            
            // Update the product stock in the database
            const { error: productError } = await supabase
              .from('products')
              .update({ stock: updatedStock })
              .eq('id', product.id);
              
            if (productError) {
              console.error("Error updating product stock:", productError);
            } else {
              // Update the product locally
              updateProduct({ ...product, stock: updatedStock });
            }
          }
        }
        
        // Insert each item into the bill_items table
        const { error: billItemError } = await supabase
          .from('bill_items')
          .insert({
            bill_id: bill.id,
            item_id: item.id,
            item_type: item.type,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          });
          
        if (billItemError) {
          console.error("Error inserting bill item:", billItemError);
        }
      }
      
      // Update customer with earned/spent loyalty points and total spent
      const updatedCustomer = {
        ...selectedCustomer,
        loyaltyPoints: selectedCustomer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsUsed,
        totalSpent: selectedCustomer.totalSpent + total
      };
      
      await updateCustomer(updatedCustomer);
      
      // Record loyalty points transaction if earned or spent
      if (loyaltyPointsEarned > 0) {
        await supabase
          .from('loyalty_transactions')
          .insert({
            customer_id: selectedCustomer.id,
            points: loyaltyPointsEarned,
            source: 'purchase',
            description: `Points earned from purchase #${bill.id}`
          });
      }
      
      if (loyaltyPointsUsed > 0) {
        await supabase
          .from('loyalty_transactions')
          .insert({
            customer_id: selectedCustomer.id,
            points: -loyaltyPointsUsed,
            source: 'redemption',
            description: `Points redeemed for discount on purchase #${bill.id}`
          });
      }
      
      setBills(prev => [...prev, bill]);
      
      return bill;
    } catch (error) {
      console.error("Error in completeSale:", error);
      return null;
    }
  };

  return {
    bills,
    setBills,
    completeSale,
    deleteBill,
    exportBills,
    exportCustomers
  };
};
