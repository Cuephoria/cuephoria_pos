
import { useState, useEffect } from 'react';
import { Bill, CartItem, Customer, Product } from '@/types/pos.types';
import { generateId, exportBillsToCSV, exportCustomersToCSV } from '@/utils/pos.utils';
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
    if (storedBills) setBills(JSON.parse(storedBills));
  }, []);
  
  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('cuephoriaBills', JSON.stringify(bills));
  }, [bills]);

  const processMembershipPurchase = (
    customer: Customer,
    item: CartItem
  ): { updatedCustomer: Customer; error?: string } => {
    // Check if customer is already a member with valid membership
    if (customer.isMember) {
      const expiryDate = customer.membershipExpiryDate 
        ? new Date(customer.membershipExpiryDate) 
        : undefined;
      
      if (expiryDate && expiryDate > new Date()) {
        return { 
          updatedCustomer: customer, 
          error: "Customer already has an active membership" 
        };
      }
    }
    
    // Calculate new expiry date based on pass type
    const today = new Date();
    let expiryDate = new Date();
    
    // Weekly or monthly pass
    if (item.name.toLowerCase().includes('weekly')) {
      expiryDate.setDate(today.getDate() + 7); // 7 days from now
    } else if (item.name.toLowerCase().includes('monthly')) {
      expiryDate.setMonth(today.getMonth() + 1); // 1 month from now
    } else {
      // Default to 7 days if can't determine
      expiryDate.setDate(today.getDate() + 7); 
    }
    
    // Update customer with new membership status
    return {
      updatedCustomer: {
        ...customer,
        isMember: true,
        membershipExpiryDate: expiryDate
      }
    };
  };
  
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
    if (!selectedCustomer || cart.length === 0) return undefined;
    
    // Check for membership products and handle accordingly
    const membershipItems = cart.filter(item => {
      const product = products.find(p => p.id === item.id);
      return product && product.category === 'membership';
    });
    
    // Process membership purchases if any
    if (membershipItems.length > 0) {
      for (const item of membershipItems) {
        const { updatedCustomer, error } = processMembershipPurchase(selectedCustomer, item);
        
        if (error) {
          toast({
            title: "Membership Error",
            description: error,
            variant: "destructive"
          });
          return undefined;
        }
        
        // Update the customer with new membership information
        selectedCustomer = updatedCustomer;
      }
    }
    
    const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
    
    let discountValue = 0;
    if (discountType === 'percentage') {
      discountValue = subtotal * (discount / 100);
    } else {
      discountValue = discount;
    }
    
    const total = calculateTotal();
    
    // Calculate loyalty points earned (1 point for every ₹10 spent)
    const loyaltyPointsEarned = Math.floor(total / 10);
    
    // Create the bill
    const newBill = {
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
    
    setBills([...bills, newBill]);
    
    // Update customer data
    updateCustomer({
      ...selectedCustomer,
      loyaltyPoints: selectedCustomer.loyaltyPoints + loyaltyPointsEarned - loyaltyPointsUsed,
      totalSpent: selectedCustomer.totalSpent + total
    });
    
    // Update product stock
    cart.forEach(item => {
      if (item.type === 'product') {
        const product = products.find(p => p.id === item.id);
        if (product) {
          updateProduct({
            ...product,
            stock: product.stock - item.quantity
          });
        }
      }
    });
    
    return newBill;
  };
  
  const exportBills = (customers: Customer[]) => {
    exportBillsToCSV(bills, customers);
  };
  
  const exportCustomers = (customers: Customer[]) => {
    exportCustomersToCSV(customers);
  };
  
  return {
    bills,
    setBills,
    completeSale,
    exportBills,
    exportCustomers
  };
};
