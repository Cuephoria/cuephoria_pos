
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        duration: 4000,
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-md",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-md",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-md",
          success: "bg-gradient-to-r from-green-500 to-green-600 text-white",
          error: "bg-gradient-to-r from-red-500 to-red-600 text-white",
          info: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
          warning: "bg-gradient-to-r from-yellow-500 to-amber-600 text-white",
          title: "font-medium text-base", 
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
