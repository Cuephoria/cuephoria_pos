
import { useState, useEffect } from 'react';
import { Bill, CartItem, Customer, Product } from '@/types/pos.types';
import { generateId, exportBillsToCSV, exportCustomersToCSV } from '@/utils/pos.utils';

export const useBills = (
  updateCustomer: (customer: Customer) => void,
  updateProduct: (product: Product) => void
) => {
  const [bills, setBills] = useState<Bill[]>([]);
  
  // Load data from localStorage
  useEffect(() => {
    const storedBills = localStorage.getItem('cuephoriaBills');
    if (storedBills) setBills(JSON.parse(storedBills));
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
    if (!selectedCustomer || cart.length === 0) return undefined;
    
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
