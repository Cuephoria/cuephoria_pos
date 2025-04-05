import { Bill, CartItem, Customer, Product } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';
import { generateId } from '@/utils/pos.utils';
import { supabase } from "@/integrations/supabase/client";

export const useBillOperations = (
  bills: Bill[],
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>,
  customers: Customer[],
  products: Product[],
  cart: CartItem[],
  selectedCustomer: Customer | null,
  clearCart: () => void,
  setSelectedCustomer: React.Dispatch<React.SetStateAction<Customer | null>>,
  setIsStudentDiscount: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  const completeSale = (paymentMethod: 'cash' | 'upi'): Bill | undefined => {
    if (!selectedCustomer) {
      toast({
        title: 'No Customer Selected',
        description: 'Please select a customer before completing the sale',
        variant: 'destructive',
      });
      return undefined;
    }
    
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to the cart before completing the sale',
        variant: 'destructive',
      });
      return undefined;
    }
    
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
        return undefined;
      }
    }
    
    try {
      let total = cart.reduce((sum, item) => sum + item.total, 0);
      let discountValue = 0;
      let discountType = 'percentage';
      let discount = 0;
      let loyaltyPointsUsed = 0;

      if (selectedCustomer) {
        discount = selectedCustomer.loyaltyPoints;
        loyaltyPointsUsed = selectedCustomer.loyaltyPoints;
      }
      
      const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
      
      if (discountType === 'percentage') {
        discountValue = subtotal * (discount / 100);
      } else {
        discountValue = discount;
      }
      
      const loyaltyPointsEarned = Math.floor(total / 100);
      
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
      
      // updateCustomer(updatedCustomer);
      
      for (const item of cart) {
        if (item.type === 'product') {
          const product = products.find(p => p.id === item.id);
          if (product && product.category !== 'membership') {
            // updateProduct({
            //   ...product,
            //   stock: product.stock - item.quantity
            // });
          }
        }
      }
      
      console.log("Sale completed successfully with bill ID:", billId);
      return bill;
    } catch (error) {
      console.error("Error in completeSale:", error);
      toast({
        title: 'Error',
        description: 'Failed to complete sale',
        variant: 'destructive'
      });
      return undefined;
    }
  };

  const deleteBill = async (billId: string, customerId: string): Promise<boolean> => {
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
      
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
        
      if (customerError) {
        console.error('Error fetching customer:', customerError);
        toast({
          title: 'Error',
          description: 'Failed to fetch customer data',
          variant: 'destructive'
        });
        return false;
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
      
      if (customer) {
        const customerData = customer;
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
        
        // updateCustomer(localCustomer);
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
            // updateProduct(productToUpdate);
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

  const exportBills = (): void => {
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

  const exportCustomers = (): void => {
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
    completeSale,
    deleteBill,
    exportBills,
    exportCustomers
  };
};
