
import { Bill, CartItem, Customer } from '@/types/pos.types';

// Helper functions
export const generateId = () => Math.random().toString(36).substring(2, 9);

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
