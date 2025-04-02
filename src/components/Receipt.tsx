
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { Bill, Customer } from '@/context/POSContext';
import { formatCurrency } from '@/components/ui/currency';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptProps {
  bill: Bill;
  customer: Customer;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ bill, customer, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
        <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold font-heading">Receipt</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full p-1"
          >
            ✕
          </button>
        </div>
        
        <div ref={receiptRef} className="p-6 text-black">
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
                <span>-₹{bill.discount.toLocaleString('en-IN')}</span>
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
        
        <div className="bg-gray-100 p-4 flex space-x-2 justify-center">
          <Button 
            variant="outline" 
            onClick={handlePrint}
            className="flex items-center gap-1"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-1 bg-cuephoria-purple hover:bg-cuephoria-purple/80"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
