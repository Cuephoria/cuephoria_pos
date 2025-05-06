
import React, { useRef, useState } from 'react';
import { Bill, Customer } from '@/context/POSContext';
import { generatePDF, handlePrint } from './receipt/receiptUtils';
import ReceiptContainer from './receipt/ReceiptContainer';
import ReceiptTitle from './receipt/ReceiptTitle';
import ReceiptContent from './receipt/ReceiptContent';
import ReceiptActions from './receipt/ReceiptActions';
import SuccessMessage from './receipt/SuccessMessage';
import { useToast } from '@/hooks/use-toast';

interface ReceiptProps {
  bill: Bill;
  customer: Customer;
  onClose: () => void;
  allowEdit?: boolean;
}

const Receipt: React.FC<ReceiptProps> = ({ bill, customer, onClose, allowEdit = true }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(true);
  const { toast } = useToast();

  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;
    
    setIsDownloading(true);
    
    try {
      await generatePDF(receiptRef.current, bill.id);
      toast({
        title: "Success",
        description: "Receipt downloaded successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to download receipt",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrintReceipt = () => {
    setIsPrinting(true);
    
    try {
      if (receiptRef.current) {
        handlePrint(receiptRef.current.innerHTML);
        toast({
          title: "Print",
          description: "Print dialog opened",
        });
      }
    } catch (error) {
      console.error('Error printing receipt:', error);
      toast({
        title: "Error",
        description: "Failed to print receipt",
        variant: "destructive"
      });
    } finally {
      setIsPrinting(false);
    }
  };

  const handleCloseSuccessMsg = () => {
    setShowSuccessMsg(false);
  };

  return (
    <ReceiptContainer>
      {showSuccessMsg && <SuccessMessage onClose={handleCloseSuccessMsg} />}
      <ReceiptTitle onClose={onClose} date={bill.createdAt} />
      <ReceiptContent 
        bill={bill} 
        customer={customer} 
        receiptRef={receiptRef} 
        allowEdit={allowEdit}
      />
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
