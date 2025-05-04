
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
export function useResponsiveLayout() {
  const isMobile = useIsMobile()
  const [columnCount, setColumnCount] = React.useState(3)
  
  React.useEffect(() => {
    if (isMobile) {
      setColumnCount(1)
    } else if (window.innerWidth < 1024) {
      setColumnCount(2)
    } else {
      setColumnCount(3)
    }
  }, [isMobile])
  
  return { columnCount, isMobile }
}
