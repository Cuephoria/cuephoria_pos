
// Import React properly
import React from 'react';

// Export hooks from this directory
export * from './useSessionsData';
export * from './useSessionActions';
export * from './useEndSession';
export * from './useStationsData';
export * from './useStations';  // Add the new useStations hook

// This hook periodically updates booking statuses
export const useUpdateBookingStatuses = () => {
  React.useEffect(() => {
    // Function to update booking statuses
    const updateBookingStatuses = async () => {
      try {
        const response = await fetch('https://apltkougkglbsfphbghi.supabase.co/functions/v1/update-booking-statuses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update booking statuses: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Booking statuses updated:', data);
      } catch (error) {
        console.error('Error updating booking statuses:', error);
      }
    };
    
    // Run once on component mount
    updateBookingStatuses();
    
    // Schedule to run every 15 minutes
    const intervalId = setInterval(updateBookingStatuses, 15 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
};

// Also export the useStations hook directly for backward compatibility
export { useStations } from './useStations';
