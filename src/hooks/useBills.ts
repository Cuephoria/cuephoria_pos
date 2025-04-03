
import { useState, useEffect } from 'react';
import { Bill, Customer, CartItem, Product } from '@/types/pos.types';
import { generateId } from '@/utils/pos.utils';
import { useToast } from '@/hooks/use-toast';

export const useBills = (
  updateCustomer: (customer: Customer) => void,
  updateProduct: (product: Product) => void
) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const storedBills = localStorage.getItem('cuephoriaBills');
    if (storedBills) {
      setBills(JSON.parse(storedBills));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaBills', JSON.stringify(bills));
  }, [bills]);
  
  const completeSale = (
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
    
    // Check if customer is trying to buy a membership when already a member
    const membershipItems = cart.filter(item => {
      const product = products.find(p => p.id === item.id && p.category === 'membership');
      return product !== undefined;
    });
    
    if (membershipItems.length > 0 && selectedCustomer.isMember) {
      // Get current date and membership expiry date
      const currentDate = new Date();
      const membershipExpiryDate = selectedCustomer.membershipExpiryDate 
        ? new Date(selectedCustomer.membershipExpiryDate) 
        : null;
      
      // Only allow membership purchase if current membership has expired
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
    
    // Create bill
    const total = calculateTotal();
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = subtotal * (discount / 100);
    } else {
      discountValue = discount;
    }
    
    // Calculate loyalty points earned (1 point per 100 rupees spent)
    const loyaltyPointsEarned = Math.floor(total / 100);
    
    const bill: Bill = {
      id: generateId(),
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
      createdAt: new Date()
    };
    
    // Update bills
    setBills([...bills, bill]);
    
    // Update customer data
    const updatedCustomer = {
      ...selectedCustomer,
      loyaltyPoints: selectedCustomer.loyaltyPoints - loyaltyPointsUsed + loyaltyPointsEarned,
      totalSpent: selectedCustomer.totalSpent + total
    };
    
    // Handle membership purchase
    if (membershipItems.length > 0) {
      const membershipProduct = products.find(p => 
        p.id === membershipItems[0].id && p.category === 'membership'
      );
      
      if (membershipProduct) {
        // Set membership expiry date based on product name
        const currentDate = new Date();
        let expiryDate = new Date();
        
        if (membershipProduct.name.toLowerCase().includes("weekly")) {
          // Add 7 days for weekly pass
          expiryDate.setDate(currentDate.getDate() + 7);
        } else if (membershipProduct.name.toLowerCase().includes("monthly")) {
          // Add 30 days for monthly pass
          expiryDate.setDate(currentDate.getDate() + 30);
        }
        
        updatedCustomer.isMember = true;
        updatedCustomer.membershipExpiryDate = expiryDate;
        updatedCustomer.membershipPlan = membershipProduct.name;
        
        // Set membership hours if available in the product
        if (membershipProduct.membershipHours) {
          updatedCustomer.membershipHoursLeft = membershipProduct.membershipHours;
        }
        
        // Set membership type based on product name
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
    
    // Update product stock
    cart.forEach(item => {
      if (item.type === 'product') {
        const product = products.find(p => p.id === item.id);
        if (product && product.category !== 'membership') {
          updateProduct({
            ...product,
            stock: product.stock - item.quantity
          });
        }
      }
    });
    
    return bill;
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
    exportBills,
    exportCustomers
  };
};
