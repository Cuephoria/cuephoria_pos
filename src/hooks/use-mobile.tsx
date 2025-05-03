
import * as React from "react"

// Mobile breakpoint definitions for responsive design
const BREAKPOINTS = {
  MOBILE: 640,  // Smaller phones (was 768, now more targeted)
  TABLET: 768,  // Tablets and larger phones
  DESKTOP: 1024 // Desktop and larger screens
}

export interface ScreenSizeState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number | undefined;
}

export function useIsMobile() {
  const [screenState, setScreenState] = React.useState<ScreenSizeState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: undefined
  });

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenState({
        isMobile: width < BREAKPOINTS.MOBILE,
        isTablet: width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.DESKTOP,
        isDesktop: width >= BREAKPOINTS.DESKTOP,
        screenWidth: width
      });
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener with debounce for performance
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // For backward compatibility, return isMobile as boolean
  return screenState.isMobile;
}

// Export the new enhanced hook for more granular control
export function useScreenSize(): ScreenSizeState {
  const [screenState, setScreenState] = React.useState<ScreenSizeState>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: undefined
  });

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenState({
        isMobile: width < BREAKPOINTS.MOBILE,
        isTablet: width >= BREAKPOINTS.MOBILE && width < BREAKPOINTS.DESKTOP,
        isDesktop: width >= BREAKPOINTS.DESKTOP,
        screenWidth: width
      });
    };
    
    // Initial check
    checkScreenSize();
    
    // Add event listener with debounce
    let timeoutId: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkScreenSize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return screenState;
}

// Export the breakpoints for use in components
export const SCREEN_BREAKPOINTS = BREAKPOINTS;
