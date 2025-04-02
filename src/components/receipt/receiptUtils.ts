
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const injectStyles = () => {
  // Create a style element to ensure proper styling in the PDF
  const styleEl = document.createElement('style');
  styleEl.innerHTML = `
    .pdf-receipt {
      font-family: monospace;
      max-width: 85mm;
      margin: 0 auto;
      padding: 20px;
      background: white;
    }
    .pdf-receipt h1 {
      font-size: 24px;
      text-align: center;
      margin-bottom: 8px;
    }
    .pdf-receipt p {
      margin: 0 0 8px;
    }
    .pdf-receipt .border-b {
      border-bottom: 1px solid #eee;
      padding-bottom: 8px;
      margin-bottom: 8px;
    }
    .pdf-receipt .text-center {
      text-align: center;
    }
    .pdf-receipt .flex {
      display: flex;
      justify-content: space-between;
    }
  `;
  document.head.appendChild(styleEl);
  
  return () => {
    document.head.removeChild(styleEl);
  };
};

export const generatePDF = async (element: HTMLElement, billId: string): Promise<void> => {
  if (!element) {
    console.error("Element is null, cannot generate PDF");
    return;
  }
  
  console.log('Starting PDF generation for bill:', billId);
  
  try {
    // Clone the element to avoid modifying the original
    const clonedElement = element.cloneNode(true) as HTMLElement;
    const tempContainer = document.createElement('div');
    tempContainer.className = 'pdf-receipt';
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.width = '85mm';
    tempContainer.style.backgroundColor = '#ffffff';
    tempContainer.appendChild(clonedElement);
    document.body.appendChild(tempContainer);
    
    // Add cleanup styles that will be removed later
    const removeStyles = injectStyles();
    
    // Add a delay to ensure everything is rendered properly
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Capturing canvas...');
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: true,
      useCORS: true,
      allowTaint: true
    });
    
    console.log('Canvas created successfully, dimensions:', canvas.width, 'x', canvas.height);
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [85, (canvas.height * 85) / canvas.width]
    });
    
    pdf.addImage(imgData, 'PNG', 0, 0, 85, (canvas.height * 85) / canvas.width);
    console.log('PDF created, saving as:', `cuephoria_receipt_${billId}.pdf`);
    pdf.save(`cuephoria_receipt_${billId}.pdf`);
    
    // Clean up
    document.body.removeChild(tempContainer);
    removeStyles();
    
    return;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

export const handlePrint = (printContent: string): void => {
  // Store the current page content
  const originalContents = document.body.innerHTML;
  
  // Replace with our receipt content
  document.body.innerHTML = printContent;
  
  // Trigger the browser print dialog
  window.print();
  
  // Restore original content after print dialog closes
  setTimeout(() => {
    document.body.innerHTML = originalContents;
  }, 100);
};
