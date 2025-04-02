
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { User } from 'lucide-react';
import { Customer } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';

interface CheckoutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCustomer: Customer | null;
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  loyaltyPointsUsed: number;
  total: number;
  onApplyDiscount: (amount: number, type: 'percentage' | 'fixed') => void;
  onApplyLoyaltyPoints: (points: number) => void;
  onCompleteSale: (paymentMethod: 'cash' | 'upi') => void;
}

const CheckoutDialog: React.FC<CheckoutDialogProps> = ({
  isOpen,
  onOpenChange,
  selectedCustomer,
  subtotal,
  discount,
  discountType,
  discountValue,
  loyaltyPointsUsed,
  total,
  onApplyDiscount,
  onApplyLoyaltyPoints,
  onCompleteSale
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [customDiscountAmount, setCustomDiscountAmount] = useState(discount.toString());
  const [customDiscountType, setCustomDiscountType] = useState<'percentage' | 'fixed'>(discountType);
  const [customLoyaltyPoints, setCustomLoyaltyPoints] = useState(loyaltyPointsUsed.toString());

  useEffect(() => {
    setCustomDiscountAmount(discount.toString());
    setCustomDiscountType(discountType);
    setCustomLoyaltyPoints(loyaltyPointsUsed.toString());
  }, [discount, discountType, loyaltyPointsUsed]);

  const handleApplyDiscount = () => {
    onApplyDiscount(Number(customDiscountAmount), customDiscountType);
  };

  const handleApplyLoyaltyPoints = () => {
    onApplyLoyaltyPoints(Number(customLoyaltyPoints));
  };

  const handleCompleteSale = () => {
    onCompleteSale(paymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Complete Transaction</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {selectedCustomer && (
            <div className="border rounded-md p-3 bg-gradient-to-r from-cuephoria-purple/10 to-transparent animate-fade-in">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium flex items-center">
                    <User className="h-4 w-4 mr-2 text-cuephoria-lightpurple" /> {selectedCustomer.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                </div>
                {selectedCustomer.isMember && (
                  <div className="bg-cuephoria-purple text-white text-xs px-2 py-1 rounded">
                    Member
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm">
                Available Points: <span className="font-semibold">{selectedCustomer.loyaltyPoints}</span>
              </div>
            </div>
          )}
          
          <div className="space-y-3 animate-slide-up delay-100">
            <h4 className="font-medium font-heading">Apply Discount</h4>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={customDiscountAmount}
                  onChange={(e) => setCustomDiscountAmount(e.target.value)}
                  placeholder="Discount amount"
                  className="font-quicksand"
                />
              </div>
              <select
                className="px-3 py-2 rounded-md border border-input bg-background font-quicksand"
                value={customDiscountType}
                onChange={(e) => setCustomDiscountType(e.target.value as 'percentage' | 'fixed')}
              >
                <option value="percentage">%</option>
                <option value="fixed">₹</option>
              </select>
              <Button 
                onClick={handleApplyDiscount}
                className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
              >
                Apply
              </Button>
            </div>
          </div>
          
          {selectedCustomer && selectedCustomer.loyaltyPoints > 0 && (
            <div className="space-y-3 animate-slide-up delay-200">
              <h4 className="font-medium font-heading">Use Loyalty Points</h4>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  value={customLoyaltyPoints}
                  onChange={(e) => setCustomLoyaltyPoints(e.target.value)}
                  placeholder="Points to use"
                  className="font-quicksand"
                />
                <Button 
                  onClick={handleApplyLoyaltyPoints}
                  className="bg-cuephoria-orange hover:bg-cuephoria-orange/80"
                >
                  Apply
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Customer has {selectedCustomer.loyaltyPoints} points (₹1 per point)
              </p>
            </div>
          )}
          
          <div className="border-t pt-4 mt-2 animate-slide-up delay-300">
            <div className="flex justify-between py-1">
              <span>Subtotal</span>
              <CurrencyDisplay amount={subtotal} className="font-mono" />
            </div>
            {discount > 0 && (
              <div className="flex justify-between py-1 text-cuephoria-purple">
                <span>
                  Discount {discountType === 'percentage' ? `(${discount}%)` : ''}
                </span>
                <span>-<CurrencyDisplay amount={discountValue} className="font-mono" /></span>
              </div>
            )}
            {loyaltyPointsUsed > 0 && (
              <div className="flex justify-between py-1 text-cuephoria-orange">
                <span>Loyalty Points Used</span>
                <span>-<CurrencyDisplay amount={loyaltyPointsUsed} className="font-mono" /></span>
              </div>
            )}
            <div className="flex justify-between py-1 text-lg font-bold border-t mt-2 pt-2">
              <span>Total</span>
              <CurrencyDisplay amount={total} className="font-mono text-cuephoria-lightpurple" />
            </div>
          </div>
          
          <div className="space-y-3 animate-slide-up delay-400">
            <h4 className="font-medium font-heading">Payment Method</h4>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as 'cash' | 'upi')}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="font-quicksand">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="font-quicksand">UPI</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        <DialogFooter className="animate-slide-up delay-500">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCompleteSale} className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90">
            Complete Sale (<CurrencyDisplay amount={total} />)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
