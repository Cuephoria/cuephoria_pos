
import React from 'react';

interface MultiSelectInfoProps {
  show: boolean;
}

const MultiSelectInfo: React.FC<MultiSelectInfoProps> = ({ show }) => {
  if (!show) return null;
  
  return (
    <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
      <div className="flex items-center text-sm text-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-cuephoria-lightpurple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>You can select multiple stations for group bookings. All stations must be available at the same time slot.</span>
      </div>
    </div>
  );
};

export default MultiSelectInfo;
