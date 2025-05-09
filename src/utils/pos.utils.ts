
import { Bill, CartItem, Customer } from '@/types/pos.types';

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

// New function to export sessions data to CSV
export const exportSessionsToCSV = (
  sessions: any[], 
  customers: Customer[], 
  stationsLookup: Record<string, string> = {}
) => {
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Header row
  csvContent += "Session ID,Station,Customer,Phone,Email,Start Time,End Time,Duration,Status\n";
  
  // Data rows
  sessions.forEach(session => {
    const customer = customers.find(c => c.id === session.customerId);
    
    // Calculate session duration
    let durationDisplay = "0h 1m"; // Default duration
    if (session.endTime) {
      const startMs = new Date(session.startTime).getTime();
      const endMs = new Date(session.endTime).getTime();
      const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      durationDisplay = `${hours}h ${minutes}m`;
    } else if (session.duration) {
      const hours = Math.floor(session.duration / 60);
      const minutes = session.duration % 60;
      durationDisplay = `${hours}h ${minutes}m`;
    }
    
    const row = [
      session.id,
      stationsLookup[session.stationId] || session.stationId,
      customer ? customer.name : "Unknown",
      customer ? customer.phone : "",
      customer ? (customer.email || "") : "",
      new Date(session.startTime).toLocaleString(),
      session.endTime ? new Date(session.endTime).toLocaleString() : "Active",
      durationDisplay,
      session.endTime ? "Completed" : "Active"
    ];
    
    csvContent += row.join(",") + "\n";
  });
  
  // Create download link
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "cuephoria_sessions.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
