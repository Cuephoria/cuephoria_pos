
import React, { useState, useEffect } from 'react';
import { Bill, Customer } from '@/types/pos.types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CurrencyDisplay } from '@/components/ui/currency';

interface ReceiptSummaryProps {
  bill: Bill;
  customer?: Customer;
  onUpdateBill?: (updatedBill: Partial<Bill>) => void;
  editable?: boolean;
}

const ReceiptSummary: React.FC<ReceiptSummaryProps> = ({ 
  bill, 
  customer,
  onUpdateBill,
  editable = false 
}) => {
  const [discount, setDiscount] = useState<number>(bill.discount);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(bill.discountType);
  const [loyaltyPointsUsed, setLoyaltyPointsUsed] = useState<number>(bill.loyaltyPointsUsed);
  
  // Calculate discount value
  const discountValue = discountType === 'percentage'
    ? bill.subtotal * (discount / 100)
    : discount;
    
  // Calculate total
  const total = Math.max(0, bill.subtotal - discountValue - loyaltyPointsUsed);

  useEffect(() => {
    if (editable && onUpdateBill) {
      onUpdateBill({
        discount,
        discountType,
        discountValue,
        loyaltyPointsUsed,
        total
      });
    }
  }, [discount, discountType, loyaltyPointsUsed]);

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setDiscount(value);
  };
  
  const handleDiscountTypeChange = (value: string) => {
    setDiscountType(value as 'percentage' | 'fixed');
  };
  
  const handleLoyaltyPointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    
    // Validate that loyalty points used don't exceed available points
    if (customer && value > customer.loyaltyPoints) {
      return; // Don't update if exceeds available points
    }
    
    setLoyaltyPointsUsed(value);
  };
  
  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      <h3 className="text-lg font-medium">Summary</h3>
      
      <div className="mt-2 space-y-2">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <CurrencyDisplay amount={bill.subtotal} />
        </div>
        
        {editable ? (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <Label htmlFor="discount">Discount:</Label>
              <div className="flex gap-2">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  value={discount}
                  onChange={handleDiscountChange}
                  className="w-full"
                />
                <Select value={discountType} onValueChange={handleDiscountTypeChange}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">%</SelectItem>
                    <SelectItem value="fixed">₹</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ) : bill.discount > 0 ? (
          <div className="flex justify-between">
            <span>Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:</span>
            <CurrencyDisplay amount={bill.discountValue} />
          </div>
        ) : null}
        
        {editable ? (
          <div>
            <Label htmlFor="loyaltyPoints" className="flex justify-between">
              <span>Loyalty Points:</span>
              {customer && (
                <span className="text-sm text-muted-foreground">
                  Available: {customer.loyaltyPoints}
                </span>
              )}
            </Label>
            <Input
              id="loyaltyPoints"
              type="number"
              min="0"
              max={customer?.loyaltyPoints || 0}
              value={loyaltyPointsUsed}
              onChange={handleLoyaltyPointsChange}
              className="w-full"
            />
          </div>
        ) : bill.loyaltyPointsUsed > 0 ? (
          <div className="flex justify-between">
            <span>Loyalty Points Used:</span>
            <CurrencyDisplay amount={bill.loyaltyPointsUsed} />
          </div>
        ) : null}
        
        {bill.loyaltyPointsEarned > 0 && (
          <div className="flex justify-between">
            <span>Loyalty Points Earned:</span>
            <span>{bill.loyaltyPointsEarned} points</span>
          </div>
        )}
        
        <div className="flex justify-between font-bold pt-2 border-t border-gray-200 mt-2">
          <span>Total:</span>
          <CurrencyDisplay amount={editable ? total : bill.total} />
        </div>
        
        <div className="flex justify-between text-sm">
          <span>Payment Method:</span>
          <span className="capitalize">{bill.paymentMethod}</span>
        </div>
      </div>
    </div>
  );
};

export default ReceiptSummary;
