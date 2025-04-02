
import React, { ReactNode } from 'react';

interface ReceiptContainerProps {
  children: ReactNode;
}

const ReceiptContainer: React.FC<ReceiptContainerProps> = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in p-4">
      <div className="bg-white rounded-xl shadow-2xl w-auto overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default ReceiptContainer;
