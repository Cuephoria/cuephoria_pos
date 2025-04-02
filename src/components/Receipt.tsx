
import React, { useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { Bill, Customer } from '@/context/POSContext';
import ReceiptHeader from './receipt/ReceiptHeader';
import CustomerInfo from './receipt/CustomerInfo';
import ReceiptItems from './receipt/ReceiptItems';
import ReceiptSummary from './receipt/ReceiptSummary';
import ReceiptFooter from './receipt/ReceiptFooter';
import ReceiptActions from './receipt/ReceiptActions';
import { generatePDF, handlePrint } from './receipt/receiptUtils';

interface ReceiptProps {
  bill: Bill;
  customer: Customer;
  onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ bill, customer, onClose }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(true);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    
    try {
      await generatePDF(receiptRef.current, bill.id);
      setShowSuccessMsg(true);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintReceipt = () => {
    setIsPrinting(true);
    
    if (receiptRef.current) {
      handlePrint(receiptRef.current.innerHTML);
    }
    
    setIsPrinting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
        {showSuccessMsg && (
          <div className="bg-green-500 text-white p-3 flex items-center justify-center animate-fade-in gap-2">
            <Check className="h-5 w-5" />
            <span className="font-medium">Payment Successful!</span>
          </div>
        )}
        
        <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold font-heading">Payment Receipt</h2>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 rounded-full p-1"
          >
            ✕
          </button>
        </div>
        
        <div ref={receiptRef} className="p-6 text-black max-h-[calc(100vh-250px)] overflow-auto">
          <ReceiptHeader bill={bill} />
          <CustomerInfo customer={customer} />
          <ReceiptItems bill={bill} />
          <ReceiptSummary bill={bill} />
          <ReceiptFooter />
        </div>
        
        <ReceiptActions 
          onPrint={handlePrintReceipt}
          onDownload={handleDownloadPDF}
          onClose={onClose}
          isPrinting={isPrinting}
          isDownloading={isDownloading}
        />
      </div>
    </div>
  );
};

export default Receipt;
