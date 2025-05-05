
import React from 'react';
import { format } from 'date-fns';

interface ReceiptTitleProps {
  date: Date;
  onClose?: () => void;
}

const ReceiptTitle: React.FC<ReceiptTitleProps> = ({ date, onClose }) => {
  return (
    <div className={`${onClose ? 'bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple p-4 text-white flex justify-between items-center' : 'mb-4'}`}>
      <div>
        <h2 className={`${onClose ? 'text-xl font-bold font-heading' : 'text-xl font-bold'}`}>
          Payment Receipt
        </h2>
        {!onClose && (
          <p className="text-sm text-gray-600 mt-1">
            {format(date, 'MMMM d, yyyy - h:mm a')}
          </p>
        )}
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="text-white hover:bg-white/20 rounded-full p-1"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default ReceiptTitle;
