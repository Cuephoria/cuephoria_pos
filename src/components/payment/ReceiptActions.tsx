
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Printer, ArrowLeft } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ReceiptActionsProps {
  receiptRef: React.RefObject<HTMLDivElement>;
  billId: string;
  onBackToPos: () => void;
}

const ReceiptActions: React.FC<ReceiptActionsProps> = ({ 
  receiptRef, 
  billId,
  onBackToPos
}) => {
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
    pdf.save(`cuephoria_receipt_${billId}.pdf`);
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
  );
};

export default ReceiptActions;
