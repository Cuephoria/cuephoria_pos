
import { useEffect } from "react";

interface CalendlyEmbedProps {
  url: string;
  styles?: React.CSSProperties;
}

const CalendlyEmbed = ({ url, styles }: CalendlyEmbedProps) => {
  useEffect(() => {
    // Load the Calendly script if it's not already loaded
    const existingScript = document.getElementById('calendly-script');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'calendly-script';
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);
    }

    // Clean up on unmount
    return () => {
      // We don't remove the script since it might be needed elsewhere
    };
  }, []);

  return (
    <div 
      className="calendly-inline-widget" 
      data-url={url}
      style={{ 
        minWidth: '320px', 
        height: '700px', 
        ...styles 
      }} 
    />
  );
};

export default CalendlyEmbed;
