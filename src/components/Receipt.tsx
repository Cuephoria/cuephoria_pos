
import React, { useRef, useState, useEffect } from 'react';
import { Bill, Customer } from '@/types/pos.types';
import { generatePDF, handlePrint } from './receipt/receiptUtils';
import ReceiptContainer from './receipt/ReceiptContainer';
import ReceiptTitle from './receipt/ReceiptTitle';
import ReceiptContent from './receipt/ReceiptContent';
import ReceiptActions from './receipt/ReceiptActions';
import SuccessMessage from './receipt/SuccessMessage';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';

interface ReceiptProps {
  bill: Bill;
  customer: Customer;
  onClose: () => void;
  allowEdit?: boolean;
}

const Receipt: React.FC<ReceiptProps> = ({ bill: initialBill, customer: initialCustomer, onClose, allowEdit = true }) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(true);
  const [bill, setBill] = useState<Bill>(initialBill);
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const { toast } = useToast();
  const { customers } = usePOS();
  
  // Keep the customer data updated if it changes in the context
  useEffect(() => {
    const updatedCustomer = customers.find(c => c.id === customer.id);
    if (updatedCustomer) {
      console.log('Receipt: Customer updated from context:', {
        oldTotalSpent: customer.totalSpent,
        newTotalSpent: updatedCustomer.totalSpent
      });
      setCustomer(updatedCustomer);
    }
  }, [customers, customer.id]);

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
