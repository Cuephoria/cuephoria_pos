
import { useEffect, useState } from "react";

interface CalendlyEmbedProps {
  url: string;
  styles?: React.CSSProperties;
}

const CalendlyEmbed = ({ url, styles }: CalendlyEmbedProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load the Calendly script if it's not already loaded
    const existingScript = document.getElementById('calendly-script');
    if (!existingScript) {
      try {
        const script = document.createElement('script');
        script.id = 'calendly-script';
        script.src = 'https://assets.calendly.com/assets/external/widget.js';
        script.async = true;
        script.onload = () => {
          setIsLoading(false);
        };
        script.onerror = (error) => {
          console.error('Failed to load Calendly widget:', error);
          setIsLoading(false);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error initializing Calendly widget:', error);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }

    // Clean up on unmount
    return () => {
      // We don't remove the script since it might be needed elsewhere
    };
  }, []);

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
