
import React, { ReactNode, useEffect } from 'react';

interface ReceiptContainerProps {
  children: ReactNode;
}

const ReceiptContainer: React.FC<ReceiptContainerProps> = ({ children }) => {
  // Prevent scrolling of the background when receipt is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-scale-in overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ReceiptContainer;
