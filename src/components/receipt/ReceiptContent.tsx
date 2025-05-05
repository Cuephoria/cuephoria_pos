
import React, { ReactNode, RefObject, useState } from 'react';
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
  const { updateCustomer } = usePOS();
  const { toast } = useToast();
  
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
    // Store old total before recalculating to track loyalty point differences
    const oldTotal = bill.total;
    const oldItems = [...bill.items];
    
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

    // Calculate loyalty points difference based on the new total
    // Using the same logic from completeSale: Members 5 points per 100, Non-members 2 points per 100
    const pointsRate = customer.isMember ? 5 : 2;
    const newLoyaltyPointsEarned = Math.floor((total / 100) * pointsRate);
    const loyaltyPointsDelta = newLoyaltyPointsEarned - bill.loyaltyPointsEarned;
    
    // Log for debugging
    console.log('Old total:', oldTotal, 'New total:', total);
    console.log('Old loyalty points earned:', bill.loyaltyPointsEarned, 'New loyalty points earned:', newLoyaltyPointsEarned);
    console.log('Loyalty points delta:', loyaltyPointsDelta);
    
    setBill({
      ...bill,
      items: updatedItems,
      subtotal,
      discountValue,
      total,
      loyaltyPointsEarned: newLoyaltyPointsEarned
    });
  };

  const handleBillUpdate = (updatedBill: Partial<Bill>) => {
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
      // Calculate what changed for loyalty points
      const loyaltyPointsDelta = bill.loyaltyPointsEarned - initialBill.loyaltyPointsEarned;
      const totalSpentDelta = bill.total - initialBill.total;
      
      console.log('Loyalty points delta:', loyaltyPointsDelta);
      console.log('Total spent delta:', totalSpentDelta);
      
      // Update bill in database
      const { error: billError } = await supabase
        .from('bills')
        .update({
          subtotal: bill.subtotal,
          discount: bill.discount,
          discount_value: bill.discountValue,
          discount_type: bill.discountType,
          loyalty_points_used: bill.loyaltyPointsUsed,
          loyalty_points_earned: bill.loyaltyPointsEarned,
          total: bill.total,
          payment_method: bill.paymentMethod
        })
        .eq('id', bill.id);
        
      if (billError) {
        throw new Error(`Failed to update bill: ${billError.message}`);
      }
      
      // Delete existing bill items and insert new ones
      const { error: deleteError } = await supabase
        .from('bill_items')
        .delete()
        .eq('bill_id', bill.id);
        
      if (deleteError) {
        throw new Error(`Failed to update bill items: ${deleteError.message}`);
      }
      
      // Insert updated items
      for (const item of bill.items) {
        const { error: itemError } = await supabase
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
          
        if (itemError) {
          console.error('Error creating bill item:', itemError);
        }
      }
      
      // Save edit history using the RPC function
      try {
        // Define the parameter types for the RPC function
        interface SaveBillEditAuditParams {
          p_bill_id: string;
          p_editor_name: string;
          p_changes: string;
        }
        
        // Fix: Use correct method signature for rpc call
        const { error: auditError } = await supabase
          .rpc('save_bill_edit_audit', {
            p_bill_id: bill.id,
            p_editor_name: editorName,
            p_changes: 'Bill edited: ' + new Date().toISOString()
          });
          
        if (auditError) {
          // Fallback method if RPC doesn't exist
          console.error('RPC error:', auditError);
          
          // Use a direct SQL query as a fallback
          const { error: fallbackError } = await supabase.from('bill_edit_audit' as any)
            .insert({
              bill_id: bill.id,
              editor_name: editorName,
              changes: 'Bill edited: ' + new Date().toISOString()
            });
            
          if (fallbackError) {
            console.error('Error saving edit audit:', fallbackError);
          }
        }
      } catch (auditError) {
        console.error('Error saving edit audit:', auditError);
      }
      
      // Update customer loyalty points and total spent
      const updatedCustomer = {
        ...customer,
        loyaltyPoints: customer.loyaltyPoints + loyaltyPointsDelta,
        totalSpent: customer.totalSpent + totalSpentDelta
      };
      
      setCustomer(updatedCustomer);
      updateCustomer(updatedCustomer);
      
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          loyalty_points: updatedCustomer.loyaltyPoints,
          total_spent: updatedCustomer.totalSpent
        })
        .eq('id', customer.id);
        
      if (customerError) {
        console.error('Error updating customer:', customerError);
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
