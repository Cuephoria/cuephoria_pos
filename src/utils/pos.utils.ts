
import { Bill, CartItem, Customer, TimeSlot } from '@/types/pos.types';

// Helper functions
export const generateId = (): string => {
  // Use built-in randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  
  // Fallback implementation for UUID v4
  // Format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // Where y is 8, 9, a, or b
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate formatted date string (YYYY-MM-DD)
export const getFormattedDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Generate time slots for a day with given interval
export const generateTimeSlots = (interval: number = 60): { time: string; available: boolean }[] => {
  const slots: { time: string; available: boolean }[] = [];
  
  // Generate slots from 10:00 AM to 10:00 PM (business hours)
  // Can be customized based on business requirements
  const startHour = 10; // 10 AM
  const endHour = 22;   // 10 PM
  
  for (let hour = startHour; hour < endHour; hour++) {
    // For each hour, generate slots based on the interval
    const intervals = 60 / interval;
    
    for (let i = 0; i < intervals; i++) {
      const minutes = i * interval;
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      
      slots.push({
        time: `${formattedHour}:${formattedMinutes}`,
        available: true
      });
    }
  }
  
  return slots;
};

// Export functions for CSV generation
export const exportCustomersToCSV = (customers: Customer[]) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Header row
  csvContent += "Customer ID,Name,Phone,Email,Member Status,Loyalty Points,Total Spent,Total Play Time (mins),Join Date\n";
  
  // Data rows
  customers.forEach(customer => {
    const row = [
      customer.id,
      customer.name,
      customer.phone,
      customer.email || "",
      customer.isMember ? "Member" : "Non-Member",
      customer.loyaltyPoints,
      customer.totalSpent,
      customer.totalPlayTime,
      new Date(customer.createdAt).toLocaleDateString()
    ];
    csvContent += row.join(",") + "\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "cuephoria_customers.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportBillsToCSV = (bills: Bill[], customers: Customer[]) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Header row
  csvContent += "Bill ID,Customer,Date,Items,Subtotal,Discount,Loyalty Points Used,Total,Payment Method\n";
  
  // Data rows
  bills.forEach(bill => {
    const customer = customers.find(c => c.id === bill.customerId);
    const items = bill.items.map(item => `${item.name} x${item.quantity}`).join(", ");
    const row = [
      bill.id,
      customer ? customer.name : "Unknown",
      new Date(bill.createdAt).toLocaleDateString(),
      `"${items}"`,
      bill.subtotal,
      bill.discount,
      bill.loyaltyPointsUsed,
      bill.total,
      bill.paymentMethod
    ];
    csvContent += row.join(",") + "\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "cuephoria_bills.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Calculate cart totals
export const calculateCartTotal = (
  cart: CartItem[], 
  discount: number, 
  discountType: 'percentage' | 'fixed',
  loyaltyPointsUsed: number
) => {
  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  
  let discountValue = 0;
  if (discountType === 'percentage') {
    discountValue = subtotal * (discount / 100);
  } else {
    discountValue = discount;
  }
  
  return Math.max(0, subtotal - discountValue - loyaltyPointsUsed);
};
