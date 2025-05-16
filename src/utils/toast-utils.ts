
import { toast } from 'sonner';

// Toast duration presets
const TOAST_DURATIONS = {
  SHORT: 2000,    // For quick confirmations
  MEDIUM: 3000,   // Default
  LONG: 4000,     // For errors and important messages
  VERY_LONG: 6000 // For critical messages
};

// Success toast with configurable duration
export const showSuccess = (
  title: string, 
  message?: string, 
  duration: number = TOAST_DURATIONS.SHORT
) => {
  toast.success(title, {
    description: message,
    duration: duration
  });
};

// Error toast with configurable duration
export const showError = (
  title: string, 
  message?: string, 
  duration: number = TOAST_DURATIONS.LONG
) => {
  toast.error(title, {
    description: message,
    duration: duration
  });
};

// Info toast with configurable duration
export const showInfo = (
  title: string,
  message?: string,
  duration: number = TOAST_DURATIONS.MEDIUM
) => {
  toast.info(title, {
    description: message,
    duration: duration
  });
};

// Warning toast with configurable duration
export const showWarning = (
  title: string,
  message?: string,
  duration: number = TOAST_DURATIONS.MEDIUM
) => {
  toast.warning(title, {
    description: message,
    duration: duration
  });
};

export const TOAST_DURATIONS_EXPORT = TOAST_DURATIONS;
