
import { toast } from "@/hooks/use-toast";

/**
 * Utility function to show toast notifications without using the hook directly
 */
export const showToast = (
  title: string, 
  description: string, 
  variant?: "default" | "destructive" = "default"
) => {
  toast({
    title,
    description,
    variant
  });
};
