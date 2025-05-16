
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-right"
      expand={true}       // Expand on hover
      richColors={true}   // More vibrant colors
      closeButton={true}  // Add close button
      style={{ zIndex: 50 }} // Ensure toasts are above other elements
      visibleToasts={2}   // Show only 2 toasts at a time, stack others
      toastOptions={{
        duration: 4000,
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:p-4 group-[.toaster]:backdrop-blur-sm",
          description: "group-[.toast]:text-muted-foreground mt-1 text-sm",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          success: "bg-gradient-to-r from-green-500 to-green-600 text-white border-none",
          error: "bg-gradient-to-r from-red-500 to-red-600 text-white border-none",
          info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none",
          warning: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-none",
          title: "font-medium text-base", 
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
