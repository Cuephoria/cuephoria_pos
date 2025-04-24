
import { toast as sonnerToast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title: string;
  message: string;
  type?: ToastType;
  duration?: number;
}

export const showToast = ({
  title,
  message,
  type = "info",
  duration = 3000
}: ToastOptions) => {
  switch (type) {
    case "success":
      sonnerToast.success(title, {
        description: message,
        duration: duration,
      });
      break;
    case "error":
      sonnerToast.error(title, {
        description: message,
        duration: duration,
      });
      break;
    case "warning":
      sonnerToast.warning(title, {
        description: message,
        duration: duration,
      });
      break;
    case "info":
    default:
      sonnerToast.info(title, {
        description: message,
        duration: duration,
      });
      break;
  }
};

export const showSuccessToast = (title: string, message: string) => {
  showToast({ title, message, type: "success" });
};

export const showErrorToast = (title: string, message: string) => {
  showToast({ title, message, type: "error" });
};

export const showWarningToast = (title: string, message: string) => {
  showToast({ title, message, type: "warning" });
};

export const showInfoToast = (title: string, message: string) => {
  showToast({ title, message, type: "info" });
};
