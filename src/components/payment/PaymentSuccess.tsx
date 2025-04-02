
import React, { useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2 } from 'lucide-react';
import { Bill, Customer } from '@/context/POSContext';
import ReceiptContent from './ReceiptContent';
import ReceiptActions from './ReceiptActions';
import ConfettiEffect from './ConfettiEffect';

interface PaymentSuccessProps {
  bill: Bill;
  customer: Customer;
  isOpen: boolean;
  onClose: () => void;
  onBackToPos: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({ 
  bill, 
  customer, 
  isOpen, 
  onClose,
  onBackToPos
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden bg-gradient-to-b from-white to-gray-50 border-none sm:max-h-[90vh] flex flex-col" aria-labelledby="payment-success-title" aria-describedby="payment-success-description">
        <DialogTitle id="payment-success-title" className="sr-only">Payment Successful</DialogTitle>
        <DialogDescription id="payment-success-description" className="sr-only">Your payment has been processed successfully</DialogDescription>
        
        {/* ConfettiEffect is still rendered but does nothing now */}
        <ConfettiEffect isActive={isOpen} />
        
        <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple p-6 text-white flex flex-col items-center justify-center">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm mb-3">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-1">Payment Successful!</h2>
          <p className="text-white/80 text-center">Your transaction has been completed</p>
        </div>
        
        <div className="p-4 overflow-auto flex-grow">
          <ReceiptContent 
            bill={bill} 
            customer={customer} 
            receiptRef={receiptRef} 
          />
        </div>
        
        <ReceiptActions 
          receiptRef={receiptRef} 
          billId={bill.id} 
          onBackToPos={onBackToPos} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccess;
