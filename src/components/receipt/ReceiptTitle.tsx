
import React from 'react';

interface ReceiptTitleProps {
  onClose: () => void;
  date: Date;
}

const ReceiptTitle: React.FC<ReceiptTitleProps> = ({ onClose, date }) => {
  return (
    <div className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple p-4 text-white flex justify-between items-center">
      <div>
        <h2 className="text-xl font-bold font-heading">Payment Receipt</h2>
        <p className="text-sm text-white/80">
          {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
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
