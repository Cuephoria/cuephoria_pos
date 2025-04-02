
import React, { useRef, useState, useEffect } from 'react';
import { Bill, Customer } from '@/context/POSContext';
import { generatePDF, handlePrint } from './receipt/receiptUtils';
import ReceiptContainer from './receipt/ReceiptContainer';
import ReceiptTitle from './receipt/ReceiptTitle';
import ReceiptContent from './receipt/ReceiptContent';
import ReceiptActions from './receipt/ReceiptActions';
import SuccessMessage from './receipt/SuccessMessage';

interface ReceiptProps {
  bill: Bill;
  customer: Customer;
  onClose: () => void;
  autoDownload?: boolean;
}

const Receipt: React.FC<ReceiptProps> = ({ bill, customer, onClose, autoDownload = false }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(true);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) {
      console.error('Receipt reference is null');
      return;
    }
    
    setIsDownloading(true);
    console.log('Starting download process for bill:', bill.id);
    
    try {
      await generatePDF(receiptRef.current, bill.id);
      console.log('PDF generated successfully');
      setPdfGenerated(true);
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

  const handleCloseSuccessMsg = () => {
    setShowSuccessMsg(false);
  };

  // Auto-download PDF if autoDownload is true
  useEffect(() => {
    console.log('Receipt component mounted, autoDownload:', autoDownload);
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (autoDownload && !pdfGenerated) {
      // Add a longer delay to ensure the component is fully rendered
      timeoutId = setTimeout(() => {
        console.log('Attempting auto-download now...');
        handleDownloadPDF();
      }, 1000);
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [autoDownload, bill.id, pdfGenerated]);

  return (
    <ReceiptContainer>
      {showSuccessMsg && <SuccessMessage onClose={handleCloseSuccessMsg} />}
      <ReceiptTitle onClose={onClose} />
      <div className="pdf-container overflow-auto max-h-[calc(100vh-250px)]">
        <ReceiptContent 
          bill={bill} 
          customer={customer} 
          receiptRef={receiptRef} 
        />
      </div>
      <ReceiptActions 
        onPrint={handlePrintReceipt}
        onDownload={handleDownloadPDF}
        onClose={onClose}
        isPrinting={isPrinting}
        isDownloading={isDownloading}
      />
    </ReceiptContainer>
  );
};

export default Receipt;
