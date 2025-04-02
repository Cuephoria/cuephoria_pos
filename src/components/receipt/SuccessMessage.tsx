
import React from 'react';
import { Check } from 'lucide-react';

interface SuccessMessageProps {
  onClose: () => void;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ onClose }) => {
  return (
    <div className="bg-green-500 text-white p-3 flex items-center justify-between animate-fade-in gap-2">
      <div className="flex items-center gap-2">
        <Check className="h-5 w-5" />
        <span className="font-medium">Payment Successful!</span>
      </div>
      <button 
        onClick={onClose}
        className="hover:bg-white/20 rounded-full p-1"
      >
        ✕
      </button>
    </div>
  );
};

export default SuccessMessage;
