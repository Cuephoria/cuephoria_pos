
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
      style={{ zIndex: 60 }} // Ensure toasts are above other elements
      visibleToasts={2}   // Show only 2 toasts at a time, stack others
      toastOptions={{
        duration: 3000,   // Shorter duration
        classNames: {
          toast: "group toast group-[.toaster]:bg-background/95 group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:rounded-md group-[.toaster]:p-3 group-[.toaster]:backdrop-blur-md hover:backdrop-blur-lg transition-all",
          description: "group-[.toast]:text-muted-foreground mt-1 text-xs",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md group-[.toast]:text-xs",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md group-[.toast]:text-xs",
          success: "bg-gradient-to-r from-green-500 to-green-600 text-white border-none shadow-lg shadow-green-500/20",
          error: "bg-gradient-to-r from-red-500 to-red-600 text-white border-none shadow-lg shadow-red-500/20",
          info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/20",
          warning: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-none shadow-lg shadow-yellow-500/20",
          title: "font-medium text-sm pb-1", 
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
