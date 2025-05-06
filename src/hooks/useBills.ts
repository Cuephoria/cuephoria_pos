import { useState, useEffect } from 'react';
import { Bill, Customer, CartItem, Product } from '@/types/pos.types';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';

export const useBills = (
  updateCustomer: (customer: Customer) => void,
  updateProduct: (product: Product) => void
) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const { toast } = useToast();

  const fetchBills = async () => {
    try {
      const { data: billsData, error: billsError } = await supabase
        .from('bills')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (billsError) {
        console.error('Error fetching bills:', billsError);
        return;
      }
      
      if (!billsData) {
        console.log('No bills found in database');
        return;
      }
      
      const transformedBills: Bill[] = [];
      
      for (const billData of billsData) {
        const { data: itemsData, error: itemsError } = await supabase
          .from('bill_items')
          .select('*')
          .eq('bill_id', billData.id);
          
        if (itemsError) {
          console.error(`Error fetching items for bill ${billData.id}:`, itemsError);
          continue;
        }
        
        if (!itemsData) {
          console.log(`No items found for bill ${billData.id}`);
          continue;
        }
        
        const items: CartItem[] = itemsData.map(item => ({
          id: item.item_id,
          type: item.item_type as 'product' | 'session',
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        }));
        
        transformedBills.push({
          id: billData.id,
          customerId: billData.customer_id,
          items,
          subtotal: billData.subtotal,
          discount: billData.discount,
          discountValue: billData.discount_value,
          discountType: billData.discount_type as 'percentage' | 'fixed',
          loyaltyPointsUsed: billData.loyalty_points_used,
          loyaltyPointsEarned: billData.loyalty_points_earned,
          total: billData.total,
          paymentMethod: billData.payment_method as 'cash' | 'upi',
          createdAt: new Date(billData.created_at)
        });
      }
      
      setBills(transformedBills);
    } catch (error) {
      console.error('Error in fetchBills:', error);
    }
  };

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const storedBills = localStorage.getItem('cuephoriaBills');
        if (storedBills) {
          const parsedBills = JSON.parse(storedBills);
          
          const billsWithDates = parsedBills.map((bill: any) => ({
            ...bill,
            createdAt: new Date(bill.createdAt)
          }));
          
          setBills(billsWithDates);
          
          for (const bill of billsWithDates) {
            const { data: billData, error: billError } = await supabase
              .from('bills')
              .upsert({
                id: bill.id,
                customer_id: bill.customerId,
                subtotal: bill.subtotal,
                discount: bill.discount,
                discount_value: bill.discountValue,
                discount_type: bill.discountType,
                loyalty_points_used: bill.loyaltyPointsUsed,
                loyalty_points_earned: bill.loyaltyPointsEarned,
                total: bill.total,
                payment_method: bill.paymentMethod,
                created_at: bill.createdAt.toISOString()
              }, { onConflict: 'id' })
              .select()
              .single();
            
            if (billError) {
              console.error('Error migrating bill:', billError);
              continue;
            }
            
            for (const item of bill.items) {
              await supabase
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
            }
          }
          
          localStorage.removeItem('cuephoriaBills');
          return;
        }
        
        const { data: billsData, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (billsError) {
          console.error('Error fetching bills:', billsError);
          return;
        }
        
        if (!billsData) {
          console.log('No bills found in database');
          return;
        }
        
        const transformedBills: Bill[] = [];
        
        for (const billData of billsData) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('bill_items')
            .select('*')
            .eq('bill_id', billData.id);
            
          if (itemsError) {
            console.error(`Error fetching items for bill ${billData.id}:`, itemsError);
            continue;
          }
          
          if (!itemsData) {
            console.log(`No items found for bill ${billData.id}`);
            continue;
          }
          
          const items: CartItem[] = itemsData.map(item => ({
            id: item.item_id,
            type: item.item_type as 'product' | 'session',
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          }));
          
          transformedBills.push({
            id: billData.id,
            customerId: billData.customer_id,
            items,
            subtotal: billData.subtotal,
            discount: billData.discount,
            discountValue: billData.discount_value,
            discountType: billData.discount_type as 'percentage' | 'fixed',
            loyaltyPointsUsed: billData.loyalty_points_used,
            loyaltyPointsEarned: billData.loyalty_points_earned,
            total: billData.total,
            paymentMethod: billData.payment_method as 'cash' | 'upi',
            createdAt: new Date(billData.created_at)
          });
        }
        
        setBills(transformedBills);
      } catch (error) {
        console.error('Error in fetchBills:', error);
      }
    };
    
    fetchBills();
  }, []);
  
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
    if (!selectedCustomer) return undefined;
    
    const membershipItems = cart.filter(item => {
      const product = products.find(p => p.id === item.id && p.category === 'membership');
      return product !== undefined;
    });
    
    if (membershipItems.length > 0 && selectedCustomer.isMember) {
      const currentDate = new Date();
      const membershipExpiryDate = selectedCustomer.membershipExpiryDate 
        ? new Date(selectedCustomer.membershipExpiryDate) 
        : null;
      
      if (membershipExpiryDate && membershipExpiryDate > currentDate) {
        console.error("Customer already has an active membership that hasn't expired yet");
        toast({
          title: "Active Membership",
          description: "Customer already has an active membership that expires on " + 
                      membershipExpiryDate.toLocaleDateString(),
          variant: "destructive"
        });
        throw new Error("Customer already has an active membership that hasn't expired yet");
      }
    }
    
    try {
      const total = calculateTotal();
      const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
      
      let discountValue = 0;
      if (discountType === 'percentage') {
        discountValue = subtotal * (discount / 100);
      } else {
        discountValue = discount;
      }
      
      // Calculate loyalty points based on the new rule
      // Members: 5 points per 100 INR spent
      // Non-members: 2 points per 100 INR spent
      const pointsRate = selectedCustomer.isMember ? 5 : 2;
      const loyaltyPointsEarned = Math.floor((total / 100) * pointsRate);
      
      const billId = generateId();
      console.log("Generated bill ID:", billId);
      
      const { data: billData, error: billError } = await supabase
        .from('bills')
        .insert({
          id: billId,
          customer_id: selectedCustomer.id,
          subtotal,
          discount,
          discount_value: discountValue,
          discount_type: discountType,
          loyalty_points_used: loyaltyPointsUsed,
          loyalty_points_earned: loyaltyPointsEarned,
          total,
          payment_method: paymentMethod
        })
        .select()
        .single();
        
      if (billError) {
        console.error('Error creating bill:', billError);
        toast({
          title: 'Error',
          description: 'Failed to complete sale: ' + billError.message,
          variant: 'destructive'
        });
        return undefined;
      }
      
      for (const item of cart) {
        const billItemId = generateId();
        
        const { error: itemError } = await supabase
          .from('bill_items')
          .insert({
            id: billItemId,
            bill_id: billId,
            item_id: item.id,
            item_type: item.type,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          });
          
        if (itemError) {
          console.error('Error creating bill item:', itemError);
          console.log('Failed item data:', {
            id: billItemId,
            bill_id: billId,
            item_id: item.id,
            item_type: item.type,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          });
        }
      }
      
      const bill: Bill = {
        id: billId,
        customerId: selectedCustomer.id,
        items: [...cart],
        subtotal,
        discount,
        discountValue,
        discountType,
        loyaltyPointsUsed,
        loyaltyPointsEarned,
        total,
        paymentMethod,
        createdAt: new Date(billData?.created_at || Date.now())
      };
      
      setBills(prevBills => [bill, ...prevBills]);
      
      const updatedCustomer = {
        ...selectedCustomer,
        loyaltyPoints: selectedCustomer.loyaltyPoints - loyaltyPointsUsed + loyaltyPointsEarned,
        totalSpent: selectedCustomer.totalSpent + total
      };
      
      if (membershipItems.length > 0) {
        const membershipProduct = products.find(p => 
          p.id === membershipItems[0].id && p.category === 'membership'
        );
        
        if (membershipProduct) {
          const currentDate = new Date();
          let expiryDate = new Date();
          
          if (membershipProduct.name.toLowerCase().includes("weekly")) {
            expiryDate.setDate(currentDate.getDate() + 7);
          } else if (membershipProduct.name.toLowerCase().includes("monthly")) {
            expiryDate.setDate(currentDate.getDate() + 30);
          }
          
          updatedCustomer.isMember = true;
          updatedCustomer.membershipExpiryDate = expiryDate;
          updatedCustomer.membershipPlan = membershipProduct.name;
          
          if (membershipProduct.membershipHours) {
            updatedCustomer.membershipHoursLeft = membershipProduct.membershipHours;
          }
          
          if (membershipProduct.duration) {
            updatedCustomer.membershipDuration = membershipProduct.duration;
          } else if (membershipProduct.name.toLowerCase().includes("weekly")) {
            updatedCustomer.membershipDuration = "weekly";
          } else if (membershipProduct.name.toLowerCase().includes("monthly")) {
            updatedCustomer.membershipDuration = "monthly";
          }
        }
      }
      
      updateCustomer(updatedCustomer);
      
      for (const item of cart) {
        if (item.type === 'product') {
          const product = products.find(p => p.id === item.id);
          if (product && product.category !== 'membership') {
            updateProduct({
              ...product,
              stock: product.stock - item.quantity
            });
          }
        }
      }
      
      console.log("Sale completed successfully with bill ID:", billId);
      return bill;
    } catch (error) {
      console.error('Error in completeSale:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete sale',
        variant: 'destructive'
      });
      return undefined;
    }
  };
  
  const deleteBill = async (billId: string, customerId: string) => {
    try {
      const billToDelete = bills.find(bill => bill.id === billId);
      if (!billToDelete) {
        console.error('Bill not found:', billId);
        toast({
          title: 'Error',
          description: 'Bill not found',
          variant: 'destructive'
        });
        return false;
      }
      
      // Modified to handle the case where the customer might have been deleted
      let customerData = null;
      if (customerId) {
        const { data: customer, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', customerId)
          .single();
          
        if (!customerError) {
          customerData = customer;
        } else {
          console.log('Customer not found or deleted, continuing with bill deletion');
        }
      }
      
      const { error: itemsDeleteError } = await supabase
        .from('bill_items')
        .delete()
        .eq('bill_id', billId);
        
      if (itemsDeleteError) {
        console.error('Error deleting bill items:', itemsDeleteError);
        toast({
          title: 'Error',
          description: 'Failed to delete bill items',
          variant: 'destructive'
        });
        return false;
      }
      
      const { error: billDeleteError } = await supabase
        .from('bills')
        .delete()
        .eq('id', billId);
        
      if (billDeleteError) {
        console.error('Error deleting bill:', billDeleteError);
        toast({
          title: 'Error',
          description: 'Failed to delete bill',
          variant: 'destructive'
        });
        return false;
      }
      
      setBills(prevBills => prevBills.filter(bill => bill.id !== billId));
      
      // Update the customer data only if the customer still exists
      if (customerData) {
        const updatedCustomer = {
          ...customerData,
          loyalty_points: Math.max(0, customerData.loyalty_points - billToDelete.loyaltyPointsEarned + billToDelete.loyaltyPointsUsed),
          total_spent: Math.max(0, customerData.total_spent - billToDelete.total)
        };
        
        const { error: customerUpdateError } = await supabase
          .from('customers')
          .update(updatedCustomer)
          .eq('id', customerId);
          
        if (customerUpdateError) {
          console.error('Error updating customer:', customerUpdateError);
        }
        
        const localCustomer: Customer = {
          id: customerData.id,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email,
          isMember: customerData.is_member,
          membershipExpiryDate: customerData.membership_expiry_date ? new Date(customerData.membership_expiry_date) : undefined,
          membershipStartDate: customerData.membership_start_date ? new Date(customerData.membership_start_date) : undefined,
          membershipPlan: customerData.membership_plan,
          membershipHoursLeft: customerData.membership_hours_left,
          membershipDuration: (customerData.membership_duration as 'weekly' | 'monthly' | undefined),
          loyaltyPoints: updatedCustomer.loyalty_points,
          totalSpent: updatedCustomer.total_spent,
          totalPlayTime: customerData.total_play_time,
          createdAt: new Date(customerData.created_at)
        };
        
        updateCustomer(localCustomer);
      }
      
      const { data: productsData } = await supabase
        .from('products')
        .select('*');
      
      const products = productsData || [];
      
      for (const item of billToDelete.items) {
        if (item.type === 'product') {
          const product = products.find(p => p.id === item.id);
          if (product && product.category !== 'membership') {
            const productToUpdate: Product = {
              id: product.id,
              name: product.name,
              price: product.price,
              category: product.category as 'food' | 'drinks' | 'tobacco' | 'challenges' | 'membership',
              stock: product.stock + item.quantity,
              image: product.image,
              originalPrice: product.original_price,
              offerPrice: product.offer_price,
              studentPrice: product.student_price,
              duration: product.duration as 'weekly' | 'monthly' | undefined,
              membershipHours: product.membership_hours
            };
            updateProduct(productToUpdate);
          }
        }
      }
      
      toast({
        title: 'Success',
        description: 'Bill deleted successfully',
        variant: 'default'
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
    if (bills.length === 0) {
      console.log("No bills to export.");
      return;
    }
    
    const billData = bills.map(bill => {
      const customer = customers.find(c => c.id === bill.customerId);
      const customerName = customer ? customer.name : 'Unknown Customer';
      
      const itemsData = bill.items.map(item => {
        return `${item.name} (₹${item.price.toFixed(2)} x ${item.quantity})`;
      }).join(', ');
      
      return `
        Bill ID: ${bill.id}
        Customer: ${customerName}
        Items: ${itemsData}
        Subtotal: ₹${bill.subtotal.toFixed(2)}
        Discount: ${bill.discount}%
        Total: ₹${bill.total.toFixed(2)}
        Payment Method: ${bill.paymentMethod}
        Date: ${bill.createdAt.toLocaleString()}
        --------------------------------------------------
      `;
    }).join('\n');
    
    const filename = 'cuephoria_bills.txt';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(billData));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    
    element.click();
    
    document.body.removeChild(element);
  };
  
  const exportCustomers = (customers: Customer[]) => {
    if (customers.length === 0) {
      console.log("No customers to export.");
      return;
    }
    
    const customerData = customers.map(customer => {
      return `
        Customer ID: ${customer.id}
        Name: ${customer.name}
        Phone: ${customer.phone}
        Email: ${customer.email || 'N/A'}
        Is Member: ${customer.isMember ? 'Yes' : 'No'}
        Membership Expiry: ${customer.membershipExpiryDate ? customer.membershipExpiryDate.toLocaleDateString() : 'N/A'}
        Loyalty Points: ${customer.loyaltyPoints}
        Total Spent: ₹${customer.totalSpent.toFixed(2)}
        Created At: ${customer.createdAt.toLocaleString()}
        --------------------------------------------------
      `;
    }).join('\n');
    
    const filename = 'cuephoria_customers.txt';
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(customerData));
    element.setAttribute('download', filename);
    
    element.style.display = 'none';
    document.body.appendChild(element);
    
    element.click();
    
    document.body.removeChild(element);
  };

  return {
    bills,
    setBills,
    completeSale,
    deleteBill,
    exportBills,
    exportCustomers,
    fetchBills
  };
};
