
import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface EmptyStateMessageProps {
  loading?: boolean;
  stationType?: 'ps5' | '8ball' | 'all';
}

const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ 
  loading = false, 
  stationType = 'all' 
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Loading stations...</span>
      </div>
    );
  }
  
  return (
    <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
      <h3 className="text-lg font-medium">No Stations Available</h3>
      <p className="text-gray-400 mt-2">
        {stationType === 'all' 
          ? 'No stations available for the selected time slot' 
          : stationType === 'ps5' 
            ? 'No PlayStation 5 stations available' 
            : 'No pool tables available'}
      </p>
    </div>
  );
};

export default EmptyStateMessage;
