
import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, ArrowLeft, Check } from 'lucide-react';
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

  // Focus the download button when the component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      const downloadBtn = document.getElementById('download-receipt-btn');
      if (downloadBtn) downloadBtn.focus();
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    try {
      // Show loading indicator in the button
      const downloadBtn = document.getElementById('download-receipt-btn');
      if (downloadBtn) {
        downloadBtn.innerHTML = '<span class="animate-pulse">Generating PDF...</span>';
        downloadBtn.setAttribute('disabled', 'true');
      }
      
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true
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
      
      // Reset button
      if (downloadBtn) {
        downloadBtn.innerHTML = '<svg class="h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Download PDF';
        downloadBtn.removeAttribute('disabled');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full animate-scale-in overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2">
              <Check className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-heading">Payment Successful</h2>
              <p className="text-white/80 font-quicksand">
                Transaction #{bill.id.substring(0, 6).toUpperCase()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full p-1"
          >
            ✕
          </button>
        </div>
        
        <div className="grid md:grid-cols-5 gap-0">
          {/* Receipt Content */}
          <div ref={receiptRef} className="p-6 text-black md:col-span-3 border-r">
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
          
          {/* Actions Panel */}
          <div className="bg-gray-50 p-6 md:col-span-2 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-semibold font-heading mb-2">Transaction Summary</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your transaction has been successfully processed.
              </p>
              
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-6">
                <div className="flex items-center mb-2">
                  <Check className="h-4 w-4 text-green-600 mr-2" />
                  <span className="font-medium text-green-800">Payment Complete</span>
                </div>
                <p className="text-xs text-green-700">
                  Your transaction of ₹{bill.total.toLocaleString('en-IN')} has been successfully processed via {bill.paymentMethod.toUpperCase()}.
                </p>
              </div>
              
              <div className="border-t border-gray-200 pt-4 mb-6">
                <p className="text-sm font-medium mb-2">Receipt Options</p>
                <div className="space-y-3">
                  <Button 
                    id="download-receipt-btn"
                    onClick={handleDownloadPDF}
                    className="w-full bg-cuephoria-purple hover:bg-cuephoria-purple/90 justify-start"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handlePrint}
                    className="w-full justify-start"
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Print Receipt
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-200">
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="w-full justify-start hover:bg-gray-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to POS
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
