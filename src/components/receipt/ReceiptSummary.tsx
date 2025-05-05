
import React, { useState } from 'react';
import { Bill } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Button } from '@/components/ui/button';
import { Pencil, Save, X } from 'lucide-react';

interface ReceiptSummaryProps {
  bill: Bill;
  onUpdateBill?: (updatedBill: Partial<Bill>) => void;
  editable?: boolean;
}

const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({ 
  bill, 
  onUpdateBill,
  editable = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    subtotal: bill.subtotal,
    discount: bill.discount,
    discountType: bill.discountType,
    loyaltyPointsUsed: bill.loyaltyPointsUsed,
    paymentMethod: bill.paymentMethod
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditValues({
        subtotal: bill.subtotal,
        discount: bill.discount,
        discountType: bill.discountType,
        loyaltyPointsUsed: bill.loyaltyPointsUsed,
        paymentMethod: bill.paymentMethod
      });
    }
  };

  const handleSaveChanges = () => {
    // Calculate the new discount value based on type
    let discountValue = 0;
    if (editValues.discountType === 'percentage') {
      discountValue = editValues.subtotal * (editValues.discount / 100);
    } else {
      discountValue = editValues.discount;
    }

    // Calculate new total
    const total = Math.max(0, editValues.subtotal - discountValue - editValues.loyaltyPointsUsed);

    if (onUpdateBill) {
      onUpdateBill({
        subtotal: editValues.subtotal,
        discount: editValues.discount,
        discountType: editValues.discountType,
        discountValue,
        loyaltyPointsUsed: editValues.loyaltyPointsUsed,
        total,
        paymentMethod: editValues.paymentMethod
      });
    }

    setIsEditing(false);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Read-only view
  if (!editable || !isEditing) {
    return (
      <div className="space-y-1 text-sm">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Payment Summary</div>
          {editable && !isEditing && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={handleEditToggle}>
              <Pencil className="h-3 w-3 mr-1" /> Edit
            </Button>
          )}
        </div>
        
        <div className="receipt-item">
          <span>Subtotal:</span>
          <CurrencyDisplay amount={bill.subtotal} />
        </div>
        
        {bill.discount > 0 && (
          <div className="receipt-item text-cuephoria-purple">
            <span>
              Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:
            </span>
            <CurrencyDisplay amount={bill.discountValue} className="text-cuephoria-purple" />
          </div>
        )}
        
        {bill.loyaltyPointsUsed > 0 && (
          <div className="receipt-item text-cuephoria-orange">
            <span>Loyalty Points:</span>
            <CurrencyDisplay amount={bill.loyaltyPointsUsed} className="text-cuephoria-orange" />
          </div>
        )}
        
        <div className="receipt-total flex justify-between font-bold">
          <span>Total:</span>
          <CurrencyDisplay amount={bill.total} />
        </div>
        
        <div className="text-xs text-gray-600 mt-4">
          <div>Payment Method: {bill.paymentMethod.toUpperCase()}</div>
          {bill.loyaltyPointsEarned > 0 && (
            <div className="mt-1">Points Earned: {bill.loyaltyPointsEarned} 
              <span className="text-xs text-gray-500 ml-1">
                ({bill.loyaltyPointsEarned / bill.total * 100 > 2.1 ? '5 points' : '2 points'} per ₹100)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Editable view
  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between items-center">
        <div className="text-sm font-medium">Edit Payment Summary</div>
        <div className="space-x-1">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setIsEditing(false)}>
            <X className="h-3 w-3 mr-1" /> Cancel
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            className="h-7 px-2 text-xs bg-cuephoria-purple hover:bg-cuephoria-purple/80" 
            onClick={handleSaveChanges}
          >
            <Save className="h-3 w-3 mr-1" /> Save
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-800/30 p-3 rounded-md border border-gray-700 space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Subtotal</label>
          <input
            type="number"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            value={editValues.subtotal}
            onChange={(e) => handleInputChange('subtotal', parseFloat(e.target.value))}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Discount</label>
            <input
              type="number"
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              value={editValues.discount}
              onChange={(e) => handleInputChange('discount', parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Discount Type</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
              value={editValues.discountType}
              onChange={(e) => handleInputChange('discountType', e.target.value as 'percentage' | 'fixed')}
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Loyalty Points Used</label>
          <input
            type="number"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            value={editValues.loyaltyPointsUsed}
            onChange={(e) => handleInputChange('loyaltyPointsUsed', parseInt(e.target.value))}
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Payment Method</label>
          <select
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-sm"
            value={editValues.paymentMethod}
            onChange={(e) => handleInputChange('paymentMethod', e.target.value as 'cash' | 'upi')}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
          </select>
        </div>
      </div>
      
      <div className="receipt-total flex justify-between font-bold mt-2">
        <span>New Total:</span>
        <CurrencyDisplay 
          amount={
            Math.max(0, 
              editValues.subtotal - 
              (editValues.discountType === 'percentage' 
                ? editValues.subtotal * (editValues.discount / 100) 
                : editValues.discount) - 
              editValues.loyaltyPointsUsed
            )
          } 
        />
      </div>
    </div>
  );
};

export default ReceiptSummary;
