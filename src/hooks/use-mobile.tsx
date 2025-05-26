
import * as React from "react"

const MOBILE_BREAKPOINT = 768 // Increased for better mobile support

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkMobile()
    
    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(checkMobile, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  return !!isMobile
}

// Helper function to make layout more responsive
function useResponsiveLayout() {
  const isMobile = useIsMobile()
  const [columnCount, setColumnCount] = React.useState(3)
  const [containerWidth, setContainerWidth] = React.useState("100%")
  
  React.useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth
      if (width < 640) { // sm breakpoint
        setColumnCount(1)
        setContainerWidth("100%")
      } else if (width < 1024) { // lg breakpoint
        setColumnCount(2)
        setContainerWidth("95%")
      } else {
        setColumnCount(3)
        setContainerWidth("90%")
      }
    }
    
    updateLayout()
    
    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateLayout, 100)
    }
    
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [isMobile])
  
  return { columnCount, containerWidth, isMobile }
}
