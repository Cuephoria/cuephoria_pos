
import { useEffect, useState } from "react";

interface CalendlyEmbedProps {
  url: string;
  styles?: React.CSSProperties;
}

const CalendlyEmbed = ({ url, styles }: CalendlyEmbedProps) => {
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
          setIsLoading(false);
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
    
    if (!existingScript) {
      return loadScript();
    } else {
      setIsLoading(false);
      return () => {};
    }
  }, [isLoading]);

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
        data-url={url}
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

export default CalendlyEmbed;
