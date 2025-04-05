
import { useToast } from '@/hooks/use-toast';
import { Bill, Customer, Product, CartItem } from '@/types/pos.types';
import { useNavigate } from 'react-router-dom';

export const useBillOperations = (
  bills: Bill[],
  setBills: React.Dispatch<React.SetStateAction<Bill[]>>,
  customers: Customer[],
  products: Product[],
  cart: CartItem[],
  selectedCustomer: Customer | null,
  clearCart: () => void,
  setSelectedCustomer: (customerId: string | null) => void,
  setIsStudentDiscount: (value: boolean) => void
) => {
  const { toast } = useToast();
  
  // Complete sale and generate bill
  const completeSale = (paymentMethod: 'cash' | 'upi') => {
    try {
      if (cart.length === 0) {
        toast({
          title: "Empty Cart",
          description: "Please add items to cart before completing the sale",
          variant: "destructive"
        });
        return undefined;
      }
      
      if (!selectedCustomer) {
        toast({
          title: "No Customer Selected",
          description: "Please select a customer before completing the sale",
          variant: "destructive"
        });
        return undefined;
      }
      
      // Calculate subtotal
      const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
      
      // Create bill ID
      const billId = crypto.randomUUID();
      
      // Use fixed discount type if needed
      const discountType = bills[0]?.discountType || 'percentage';
      
      // Create new bill
      const newBill: Bill = {
        id: billId,
        customerId: selectedCustomer.id,
        items: [...cart], // Clone cart items for the bill
        subtotal,
        discount: bills[0]?.discount || 0,
        discountValue: bills[0]?.discountValue || 0,
        discountType, // Fixed to 'percentage' or 'fixed'
        loyaltyPointsUsed: bills[0]?.loyaltyPointsUsed || 0,
        loyaltyPointsEarned: Math.floor(subtotal / 10), // Earn 1 point per 10 currency spent
        total: subtotal, // Will be calculated after any discounts
        paymentMethod,
        createdAt: new Date() 
      };
      
      // Add the bill to the collection
      const updatedBills = [newBill, ...bills];
      setBills(updatedBills);
      
      // Update the customer's loyalty points
      const updatedCustomers = customers.map(customer => {
        if (customer.id === selectedCustomer.id) {
          const earnedPoints = Math.floor(subtotal / 10);
          return {
            ...customer,
            loyaltyPoints: (customer.loyaltyPoints || 0) + earnedPoints - (newBill.loyaltyPointsUsed || 0),
            totalSpent: (customer.totalSpent || 0) + subtotal
          };
        }
        return customer;
      });
      
      // Show success toast
      toast({
        title: "Sale Completed",
        description: `Receipt #${billId.substring(0, 8)} has been generated.`,
      });
      
      // Reset the cart and student discount
      clearCart();
      setIsStudentDiscount(false);
      setSelectedCustomer(null);
      
      return newBill;
    } catch (error) {
      console.error('Error completing sale:', error);
      toast({
        title: "Error",
        description: "Failed to complete sale. Please try again.",
        variant: "destructive"
      });
      return undefined;
    }
  };
  
  // Delete a bill
  const deleteBill = async (billId: string, customerId: string): Promise<boolean> => {
    try {
      // Remove the bill from local state
      const updatedBills = bills.filter(bill => bill.id !== billId);
      setBills(updatedBills);
      
      // Show success toast
      toast({
        title: "Bill Deleted",
        description: `Receipt #${billId.substring(0, 8)} has been deleted.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: "Error",
        description: "Failed to delete bill. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Export bills to CSV
  const exportBills = () => {
    try {
      if (bills.length === 0) {
        toast({
          title: "No Bills",
          description: "There are no bills to export",
          variant: "destructive"
        });
        return;
      }
      
      // Convert bills to CSV format
      let csvContent = "Bill ID,Customer,Date,Items,Subtotal,Discount,Total,Payment Method\n";
      
      bills.forEach(bill => {
        const customer = customers.find(c => c.id === bill.customerId);
        const customerName = customer ? customer.name : "Unknown Customer";
        const date = new Date(bill.createdAt).toLocaleDateString();
        const itemsCount = bill.items.length;
        
        csvContent += `${bill.id},"${customerName}",${date},${itemsCount},${bill.subtotal},${bill.discountValue},${bill.total},${bill.paymentMethod}\n`;
      });
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'bills_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      toast({
        title: "Bills Exported",
        description: `${bills.length} bills exported to CSV file`,
      });
    } catch (error) {
      console.error('Error exporting bills:', error);
      toast({
        title: "Error",
        description: "Failed to export bills. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Export customers to CSV
  const exportCustomers = () => {
    try {
      if (customers.length === 0) {
        toast({
          title: "No Customers",
          description: "There are no customers to export",
          variant: "destructive"
        });
        return;
      }
      
      // Convert customers to CSV format
      let csvContent = "Customer ID,Name,Phone,Email,Member Status,Loyalty Points,Total Spent\n";
      
      customers.forEach(customer => {
        const memberStatus = customer.isMember ? "Member" : "Non-Member";
        
        csvContent += `${customer.id},"${customer.name}",${customer.phone || ""},"${customer.email || ""}",${memberStatus},${customer.loyaltyPoints || 0},${customer.totalSpent || 0}\n`;
      });
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'customers_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success toast
      toast({
        title: "Customers Exported",
        description: `${customers.length} customers exported to CSV file`,
      });
    } catch (error) {
      console.error('Error exporting customers:', error);
      toast({
        title: "Error",
        description: "Failed to export customers. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return {
    completeSale,
    deleteBill,
    exportBills,
    exportCustomers
  };
};
