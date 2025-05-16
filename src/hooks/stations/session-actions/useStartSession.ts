
import { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';
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
      
      // Use shorter duration for success toast (3 seconds)
      toast.success("Session Started", {
        description: "Session started successfully",
        duration: 3000
      });
      
      return true;
    } catch (error) {
      console.error("Error starting session:", error);
      
      toast.error("Error", {
        description: "Failed to start session",
        duration: 5000
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { handleStartSession, isLoading };
};
