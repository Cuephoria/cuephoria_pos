
import { useEffect, useState } from "react";

interface CalendlyEmbedProps {
  url: string;
  styles?: React.CSSProperties;
  hideGdpr?: boolean;
}

const CalendlyEmbed = ({ url, styles, hideGdpr = true }: CalendlyEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Load the Calendly script if it's not already loaded
    const existingScript = document.getElementById('calendly-script');
    
    const loadScript = () => {
      try {
        const script = document.createElement('script');
        script.id = 'calendly-script';
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onload = () => {
          console.log("Calendly script loaded successfully");
          setIsLoading(false);
          
          // Give a small delay to ensure DOM is ready
          setTimeout(() => {
            // Explicitly initialize Calendly if it exists - helps with refresh
            if (window.Calendly) {
              window.Calendly.initInlineWidget({
                url: formattedUrl,
                parentElement: document.querySelector('.calendly-inline-widget'),
                prefill: {},
                utm: {}
              });
            }
          }, 200);
        };
        script.onerror = () => {
          console.error('Failed to load Calendly widget');
          setIsLoading(false);
          setHasError(true);
        };
        document.body.appendChild(script);
        
        // Set a timeout to prevent infinite loading state
        const timeout = setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
            console.warn('Calendly widget load timed out');
          }
        }, 10000); // 10 second timeout
        
        return () => clearTimeout(timeout);
      } catch (error) {
        console.error('Error initializing Calendly widget:', error);
        setIsLoading(false);
        setHasError(true);
        return () => {};
      }
    };
    
    // Format the URL with hide_gdpr_banner parameter if needed
    const formattedUrl = hideGdpr && !url.includes('hide_gdpr_banner') 
      ? `${url}${url.includes('?') ? '&' : '?'}hide_gdpr_banner=1` 
      : url;
    
    if (!existingScript) {
      return loadScript();
    } else {
      // If script already exists, just set loading to false
      console.log("Calendly script already loaded");
      setIsLoading(false);
      
      // Still try to reinitialize in case we're on a new page
      if (window.Calendly) {
        setTimeout(() => {
          try {
            window.Calendly.initInlineWidget({
              url: formattedUrl,
              parentElement: document.querySelector('.calendly-inline-widget'),
              prefill: {},
              utm: {}
            });
          } catch (err) {
            console.error("Error reinitializing Calendly widget:", err);
          }
        }, 300);
      }
      
      return () => {};
    }
  }, [url, hideGdpr, isLoading]);

  // Format the URL with hide_gdpr_banner parameter if needed
  const formattedUrl = hideGdpr && !url.includes('hide_gdpr_banner') 
    ? `${url}${url.includes('?') ? '&' : '?'}hide_gdpr_banner=1` 
    : url;

  if (hasError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 bg-gray-800 rounded-lg p-6 text-center">
        <div className="text-red-400 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Failed to load calendar</h3>
        <p className="text-gray-400">Please try refreshing the page or check your internet connection.</p>
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-8 w-8 border-4 border-cuephoria-lightpurple border-t-transparent rounded-full"></div>
        </div>
      )}
      <div 
        className="calendly-inline-widget" 
        data-url={formattedUrl}
        style={{ 
          minWidth: '320px', 
          height: '700px',
          ...(isLoading ? { display: 'none' } : {}),
          ...styles 
        }} 
      />
    </>
  );
};

// Add TypeScript definition for the Calendly global object
declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: {
        url: string;
        parentElement: Element | null;
        prefill?: Record<string, any>;
        utm?: Record<string, any>;
      }) => void;
    };
  }
}

export default CalendlyEmbed;
