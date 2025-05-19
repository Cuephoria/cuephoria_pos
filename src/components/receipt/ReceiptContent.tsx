import React, { ReactNode, RefObject, useState, useEffect } from 'react';
import { Bill, Customer, CartItem } from '@/types/pos.types';
import ReceiptHeader from './ReceiptHeader';
import CustomerInfo from './CustomerInfo';
import ReceiptItems from './ReceiptItems';
import ReceiptSummary from './ReceiptSummary';
import ReceiptFooter from './ReceiptFooter';
import BillEditAudit from './BillEditAudit';
import { Button } from '@/components/ui/button';
import { Edit2, Save, RotateCcw } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BillEditInfo {
  editorName: string;
  timestamp: Date;
  changes: string;
}

interface ReceiptContentProps {
  bill: Bill;
  customer: Customer;
  receiptRef: RefObject<HTMLDivElement>;
  allowEdit?: boolean;
}

const ReceiptContent: React.FC<ReceiptContentProps> = ({ 
  bill: initialBill, 
  customer: initialCustomer, 
  receiptRef,
  allowEdit = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [bill, setBill] = useState<Bill>(initialBill);
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [editHistory, setEditHistory] = useState<BillEditInfo[]>([]);
  const [editorName, setEditorName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const { updateCustomer, selectCustomer, customers } = usePOS();
  const { toast } = useToast();
  
  // Update local bill and customer state if props change
  useEffect(() => {
    setBill(initialBill);
    setCustomer(initialCustomer);
  }, [initialBill, initialCustomer]);
  
  // Keep customer data in sync with context
  useEffect(() => {
    const updatedCustomer = customers.find(c => c.id === customer.id);
    if (updatedCustomer) {
      console.log(`ReceiptContent: Customer ${customer.id} updated from context:`, {
        oldTotalSpent: customer.totalSpent,
        newTotalSpent: updatedCustomer.totalSpent,
        oldLoyaltyPoints: customer.loyaltyPoints,
        newLoyaltyPoints: updatedCustomer.loyaltyPoints
      });
      setCustomer(updatedCustomer);
    }
  }, [customers, customer.id]);
  
  // Check if bill is valid
  if (!bill || !bill.id) {
    return (
      <div ref={receiptRef} className="p-6 text-black max-h-[calc(100vh-250px)] overflow-auto">
        <div className="text-center py-8">
          <h3 className="text-xl font-bold">Error: Invalid Bill Data</h3>
          <p className="mt-2">Unable to display receipt. Bill information is missing or invalid.</p>
        </div>
      </div>
    );
  }

  const handleItemsUpdate = (updatedItems: CartItem[]) => {
    // Recalculate subtotal based on updated items
    const subtotal = updatedItems.reduce((sum, item) => sum + item.total, 0);
    
    // Recalculate discount value based on type
    let discountValue = 0;
    if (bill.discountType === 'percentage') {
      discountValue = subtotal * (bill.discount / 100);
    } else {
      discountValue = bill.discount;
    }
    
    // Calculate new total
    const total = Math.max(0, subtotal - discountValue - bill.loyaltyPointsUsed);
    
    setBill({
      ...bill,
      items: updatedItems,
      subtotal,
      discountValue,
      total
    });
  };

  const handleBillUpdate = (updatedBill: Partial<Bill>) => {
    console.log("Updating bill with:", updatedBill);
    setBill({
      ...bill,
      ...updatedBill
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveEditorInfo = (name: string, changes: string) => {
    setEditorName(name);
    setEditHistory([
      ...editHistory,
      {
        editorName: name,
        timestamp: new Date(),
        changes
      }
    ]);
  };

  const handleSaveChanges = async () => {
    if (!editorName) {
      toast({
        title: 'Editor Name Required',
        description: 'Please provide your name to save changes',
        variant: 'destructive'
      });
      return;
    }
    
    setIsSaving(true);
    
    try {
      // First, get the latest customer data from database to ensure we have the most accurate values
      const { data: latestCustomerData, error: customerFetchError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customer.id)
        .single();
        
      if (customerFetchError) {
        console.error('Error fetching latest customer data:', customerFetchError);
        throw new Error(`Failed to fetch latest customer data: ${customerFetchError.message}`);
      }
      
      // Map the database customer to our Customer type
      const latestCustomer: Customer = {
        id: latestCustomerData.id,
        name: latestCustomerData.name,
        phone: latestCustomerData.phone,
        email: latestCustomerData.email || undefined,
        isMember: latestCustomerData.is_member,
        membershipExpiryDate: latestCustomerData.membership_expiry_date ? new Date(latestCustomerData.membership_expiry_date) : undefined,
        membershipStartDate: latestCustomerData.membership_start_date ? new Date(latestCustomerData.membership_start_date) : undefined,
        membershipPlan: latestCustomerData.membership_plan || undefined,
        membershipHoursLeft: latestCustomerData.membership_hours_left || undefined,
        membershipDuration: latestCustomerData.membership_duration as 'weekly' | 'monthly' | undefined,
        loyaltyPoints: latestCustomerData.loyalty_points,
        totalSpent: latestCustomerData.total_spent,
        totalPlayTime: latestCustomerData.total_play_time,
        createdAt: new Date(latestCustomerData.created_at)
      };
      
      // Calculate the difference in total amount from the original bill
      const totalDifference = bill.total - initialBill.total;
      console.log('Bill total difference:', totalDifference);
      console.log('Initial bill total:', initialBill.total);
      console.log('Updated bill total:', bill.total);
      console.log('Updated payment method:', bill.paymentMethod);
      console.log('Is split payment:', bill.isSplitPayment);
      console.log('Cash amount:', bill.cashAmount);
      console.log('UPI amount:', bill.upiAmount);
      
      // Update bill in database using the context's updateBill function 
      const { updateBill } = usePOS();
      const updatedBill = await updateBill(
        initialBill,
        bill.items,
        latestCustomer,
        bill.discount,
        bill.discountType,
        bill.loyaltyPointsUsed,
        bill.isSplitPayment,
        bill.cashAmount,
        bill.upiAmount
      );
      
      if (!updatedBill) {
        throw new Error('Failed to update transaction');
      }
      
      // Save edit history using the RPC function
      try {
        // Define the parameter types for the RPC function
        interface SaveBillEditAuditParams {
          p_bill_id: string;
          p_editor_name: string;
          p_changes: string;
        }
        
        // Call RPC function to save edit audit
        const { error: auditError } = await supabase
          .rpc('save_bill_edit_audit', {
            p_bill_id: bill.id,
            p_editor_name: editorName,
            p_changes: `Bill edited: Total changed from ${initialBill.total} to ${bill.total}`
          });
          
        if (auditError) {
          // Fallback method if RPC doesn't exist
          console.error('RPC error:', auditError);
          
          // Use a direct SQL query as a fallback
          const { error: fallbackError } = await supabase.from('bill_edit_audit' as any)
            .insert({
              bill_id: bill.id,
              editor_name: editorName,
              changes: `Bill edited: Total changed from ${initialBill.total} to ${bill.total}`
            });
            
          if (fallbackError) {
            console.error('Error saving edit audit:', fallbackError);
          }
        }
      } catch (auditError) {
        console.error('Error saving edit audit:', auditError);
      }
      
      // Get the updated customer from the database to ensure we have the most recent data
      const { data: refreshedCustomerData, error: refreshError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customer.id)
        .single();
        
      if (!refreshError && refreshedCustomerData) {
        const refreshedCustomer: Customer = {
          id: refreshedCustomerData.id,
          name: refreshedCustomerData.name,
          phone: refreshedCustomerData.phone,
          email: refreshedCustomerData.email || undefined,
          isMember: refreshedCustomerData.is_member,
          membershipExpiryDate: refreshedCustomerData.membership_expiry_date ? new Date(refreshedCustomerData.membership_expiry_date) : undefined,
          membershipStartDate: refreshedCustomerData.membership_start_date ? new Date(refreshedCustomerData.membership_start_date) : undefined,
          membershipPlan: refreshedCustomerData.membership_plan || undefined,
          membershipHoursLeft: refreshedCustomerData.membership_hours_left || undefined,
          membershipDuration: refreshedCustomerData.membership_duration as 'weekly' | 'monthly' | undefined,
          loyaltyPoints: refreshedCustomerData.loyalty_points,
          totalSpent: refreshedCustomerData.total_spent,
          totalPlayTime: refreshedCustomerData.total_play_time,
          createdAt: new Date(refreshedCustomerData.created_at)
        };
        
        // Update the context with the refreshed customer data
        await updateCustomer(refreshedCustomer);
        
        // Temporarily clear selection and reselect to force UI refresh without page reload
        selectCustomer(null);
        setTimeout(() => {
          selectCustomer(customer.id);
        }, 50);
      }
      
      toast({
        title: 'Changes Saved',
        description: 'Bill has been updated successfully',
      });
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving changes:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save changes',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetChanges = () => {
    setBill(initialBill);
    setCustomer(initialCustomer);
    setIsEditing(false);
    toast({
      title: 'Changes Reset',
      description: 'All changes have been discarded',
    });
  };

  return (
    <div ref={receiptRef} className="p-6 text-black max-h-[calc(100vh-250px)] overflow-auto">
      {allowEdit && (
        <div className="flex justify-end mb-3">
          {!isEditing ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs flex items-center gap-1"
              onClick={handleEditToggle}
            >
              <Edit2 className="h-3 w-3" />
              Edit Bill
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex items-center gap-1"
                onClick={handleResetChanges}
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="text-xs flex items-center gap-1 bg-cuephoria-purple hover:bg-cuephoria-purple/80"
                onClick={handleSaveChanges}
                disabled={isSaving}
              >
                <Save className="h-3 w-3" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          )}
        </div>
      )}
      
      <ReceiptHeader bill={bill} />
      <CustomerInfo customer={customer} />
      <ReceiptItems 
        bill={bill} 
        onUpdateItems={handleItemsUpdate}
        editable={isEditing}
      />
      <ReceiptSummary 
        bill={bill}
        customer={customer}
        onUpdateBill={handleBillUpdate}
        editable={isEditing}
      />
      <BillEditAudit 
        edits={editHistory}
        onSaveEdit={handleSaveEditorInfo}
        isEditing={isEditing}
      />
      <ReceiptFooter />
    </div>
  );
};

export default ReceiptContent;
