import { useToast } from '@/hooks/use-toast';
import { ResetOptions } from '@/types/pos.types';

export const usePOSUtilities = () => {
  const { toast } = useToast();

  const handleResetToSampleData = async (options?: ResetOptions): Promise<boolean> => {
    try {
      const { resetToSampleData } = await import('@/services/dataOperations');
      const result = await resetToSampleData(
        options,
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        () => {}
      );
      return result || false;
    } catch (error) {
      console.error('Error in handleResetToSampleData:', error);
      return false;
    }
  };
  
  const handleAddSampleIndianData = () => {
    const { toast } = useToast();
    toast({
      description: "Sample data has been removed from the application."
    });
  };

  return {
    handleResetToSampleData,
    handleAddSampleIndianData
  };
};
