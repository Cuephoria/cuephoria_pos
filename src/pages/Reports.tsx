import React from 'react';
import { useProducts } from '@/hooks/useProducts';

const ReportsPage: React.FC = () => {
  const { displayLowStockWarning } = useProducts();
  
  // Fix for line 131 that was passing an argument to displayLowStockWarning
  const handleLowStockWarning = () => {
    displayLowStockWarning(); // Call without arguments
  };
  
  // Your reports page content
  return (
    <div>
      <button onClick={handleLowStockWarning}>Show Low Stock Warning</button>
    </div>
  );
};

export default ReportsPage;
