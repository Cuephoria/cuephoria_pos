import React, { useRef, useState, useEffect } from 'react';
import { Bill, Customer } from '@/context/POSContext';
import { generatePDF, handlePrint } from './receipt/receiptUtils';
import ReceiptContainer from './receipt/ReceiptContainer';
import ReceiptTitle from './receipt/ReceiptTitle';
import ReceiptContent from './receipt/ReceiptContent';
import ReceiptActions from './receipt/ReceiptActions';
import SuccessMessage from './receipt/SuccessMessage';
import { useToast } from '@/hooks/use-toast';
import { usePOS } from '@/context/POSContext';

interface ReceiptProps {
  billId: string;
  customerId: string;
  onClose: () => void;
  allowEdit?: boolean;
  onPrint?: () => void;
  onRefresh?: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ 
  billId, 
  customerId, 
  onClose, 
  allowEdit = false, 
  onPrint = () => {},
  onRefresh
}) => {
  const { customers, bills } = usePOS();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [bill, setBill] = useState<Bill | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Find bill and customer
        const billData = bills.find(b => b.id === billId);
        
        if (!billData) {
          setError("Receipt not found");
          setLoading(false);
          return;
        }
        
        const customerData = customers.find(c => c.id === (customerId || billData.customerId));
        
        if (!customerData) {
          setError("Customer information not available");
        }
        
        setBill(billData);
        setCustomer(customerData || null);
      } catch (error) {
        console.error("Error fetching receipt data:", error);
        setError("Failed to load receipt");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [billId, customerId, bills, customers]);

  // Handle bill update and refresh parent components if needed
  const handleBillUpdated = (updatedBill: Bill, updatedCustomer: Customer) => {
    setBill(updatedBill);
    setCustomer(updatedCustomer);
    
    // Call the onRefresh callback if provided
    if (onRefresh) {
      onRefresh();
    }
  };
  
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
      <div className="max-h-[calc(100vh-220px)] overflow-auto">
        {bill && customer ? (
          <ReceiptContent 
            bill={bill} 
            customer={customer} 
            receiptRef={receiptRef}
            allowEdit={allowEdit}
            onBillUpdated={handleBillUpdated}
          />
        ) : (
          <div className="p-6 text-center">
            <p>Receipt data not available</p>
          </div>
        )}
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
