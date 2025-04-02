
import React from 'react';

interface ReceiptTitleProps {
  onClose: () => void;
}

const ReceiptTitle: React.FC<ReceiptTitleProps> = ({ onClose }) => {
  return (
    <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple p-4 text-white flex justify-between items-center">
      <h2 className="text-xl font-bold font-heading">Payment Receipt</h2>
      <button 
        onClick={onClose} 
        className="text-white hover:bg-white/20 rounded-full p-1"
      >
        ✕
      </button>
    </div>
  );
};

export default ReceiptTitle;
