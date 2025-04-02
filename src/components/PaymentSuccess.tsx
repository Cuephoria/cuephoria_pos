
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { Download, Printer, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Bill, Customer } from '@/context/POSContext';
import { formatCurrency } from '@/components/ui/currency';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import confetti from 'canvas-confetti';

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
  
  useEffect(() => {
    if (isOpen) {
      // More controlled confetti that won't cause glitches
      const runConfetti = () => {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#9b87f5', '#6E59A5', '#0EA5E9'],
          disableForReducedMotion: true
        });
      };
      
      // Run once immediately
      runConfetti();
      
      // Then run only once more with delay
      const timer1 = setTimeout(() => runConfetti(), 500);
      
      return () => {
        clearTimeout(timer1);
      };
    }
  }, [isOpen]);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    const canvas = await html2canvas(receiptRef.current, {
      scale: 2,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`cuephoria_receipt_${bill.id}.pdf`);
  };

  const handlePrint = () => {
    const printContents = receiptRef.current?.innerHTML;
    const originalContents = document.body.innerHTML;

    if (printContents) {
      document.body.innerHTML = `
        <html>
          <head>
            <title>Cuephoria Receipt</title>
            <style>
              body { font-family: 'Courier New', monospace; padding: 20px; }
              .receipt-header { text-align: center; border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 20px; }
              .receipt-item { display: flex; justify-content: space-between; margin-bottom: 8px; }
              .receipt-total { border-top: 1px dashed #ccc; margin-top: 20px; padding-top: 10px; font-weight: bold; }
            </style>
          </head>
          <body>
            ${printContents}
          </body>
        </html>
      `;

      window.print();
      document.body.innerHTML = originalContents;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full p-0 overflow-hidden animate-scale-in bg-gradient-to-b from-white to-gray-50 border-none" aria-labelledby="payment-success-title" aria-describedby="payment-success-description">
        <DialogTitle id="payment-success-title" className="sr-only">Payment Successful</DialogTitle>
        <DialogDescription id="payment-success-description" className="sr-only">Your payment has been processed successfully</DialogDescription>
        
        <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple p-8 text-white flex flex-col items-center justify-center">
          <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm mb-4">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold font-heading mb-2 animate-fade-in">Payment Successful!</h2>
          <p className="text-white/80 text-center animate-fade-in delay-100">Your transaction has been completed</p>
        </div>
        
        <div className="p-6 max-h-[calc(70vh-256px)] overflow-auto">
          <div ref={receiptRef} className="bg-white p-6 rounded-lg shadow-sm text-black">
            <div className="receipt-header">
              <h1 className="text-lg font-bold mb-1 font-heading">CUEPHORIA</h1>
              <p className="text-sm">Gaming Lounge & Café</p>
              <p className="text-xs text-gray-600 mt-2">
                Receipt #{bill.id.substring(0, 6).toUpperCase()}
              </p>
              <p className="text-xs text-gray-600">
                {new Date(bill.createdAt).toLocaleString()}
              </p>
            </div>
            
            <div className="mb-4">
              <p className="font-medium text-sm">Customer: {customer.name}</p>
              <p className="text-xs text-gray-600">{customer.phone}</p>
            </div>
            
            <div className="space-y-1 mb-4">
              <div className="text-sm font-medium border-b pb-1 mb-2">Items</div>
              {bill.items.map((item, index) => (
                <div key={index} className="receipt-item text-sm">
                  <div>
                    <span>{item.name}</span>
                    {item.quantity > 1 && <span className="text-gray-600"> x{item.quantity}</span>}
                  </div>
                  <span>₹{item.total.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="receipt-item">
                <span>Subtotal:</span>
                <span>₹{bill.subtotal.toLocaleString('en-IN')}</span>
              </div>
              
              {bill.discount > 0 && (
                <div className="receipt-item text-cuephoria-purple">
                  <span>
                    Discount {bill.discountType === 'percentage' ? `(${bill.discount}%)` : ''}:
                  </span>
                  <span>-₹{bill.discountValue.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              {bill.loyaltyPointsUsed > 0 && (
                <div className="receipt-item text-cuephoria-orange">
                  <span>Loyalty Points:</span>
                  <span>-₹{bill.loyaltyPointsUsed.toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="receipt-total flex justify-between font-bold">
                <span>Total:</span>
                <span>₹{bill.total.toLocaleString('en-IN')}</span>
              </div>
              
              <div className="text-xs text-gray-600 mt-4">
                <div>Payment Method: {bill.paymentMethod.toUpperCase()}</div>
                {bill.loyaltyPointsEarned > 0 && (
                  <div className="mt-1">Points Earned: {bill.loyaltyPointsEarned}</div>
                )}
              </div>
            </div>
            
            <div className="text-center text-xs text-gray-600 mt-6 pt-4 border-t">
              <p>Thank you for visiting Cuephoria!</p>
              <p>We hope to see you again soon.</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 flex flex-col space-y-3">
          <div className="flex space-x-3 justify-center">
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button 
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-cuephoria-purple hover:bg-cuephoria-purple/80"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
          <Button 
            variant="ghost" 
            onClick={onBackToPos}
            className="flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to POS
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccess;
