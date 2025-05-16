
import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { toast } from 'sonner';

export const useStartSession = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { startSession } = usePOS();

  const handleStartSession = async (
    stationId: string,
    customerId: string
  ) => {
    try {
      setIsLoading(true);
      await startSession(stationId, customerId);
      
      toast.success("Session Started", {
        description: "Session started successfully",
        duration: 2500, // Short duration for success messages
      });
      
      return true;
    } catch (error) {
      console.error("Error starting session:", error);
      
      toast.error("Error", {
        description: "Failed to start session",
        duration: 4000 // Slightly longer for errors
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleStartSession, isLoading };
};
