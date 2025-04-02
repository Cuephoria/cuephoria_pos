
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const generatePDF = async (element: HTMLElement, billId: string): Promise<void> => {
  if (!element) return;
  
  console.log('Starting PDF generation for bill:', billId);
  
  try {
    // Add a small delay to ensure the element is fully rendered
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: true,
      useCORS: true,
      allowTaint: true
    });
    
    console.log('Canvas created successfully');
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    const imgWidth = 210;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    console.log('PDF created, saving as:', `cuephoria_receipt_${billId}.pdf`);
    pdf.save(`cuephoria_receipt_${billId}.pdf`);
    
    return;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const handlePrint = (printContent: string): void => {
  const originalContents = document.body.innerHTML;

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
        ${printContent}
      </body>
    </html>
  `;

  window.print();
  document.body.innerHTML = originalContents;
};
