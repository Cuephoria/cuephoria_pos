
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * This custom logo component renders the uploaded graphic for all use cases.
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /**
   * Use the colorful brand graphic from the uploaded logo
   * for all logo purposes, scaling with prop or parent container
   */
}

const imgMap = {
  sm: 32,
  md: 52,
  lg: 80,
};

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const isMobile = useIsMobile();
  // Prefer smaller logo for mobile regardless of size prop (for navbar fit)
  const height = isMobile ? 36 : imgMap[size] || 52;
  const width = height * 1.2; // slightly wider than tall for logo aspect ratio

  // Updated to use the new logo
  return (
    <img
      src="/lovable-uploads/53af0330-cafd-49f9-b4c6-a08c55940cc3.png"
      alt="Cuephoria 8-Ball Club Logo"
      height={height}
      width={width}
      style={{
        objectFit: "contain",
        background: "transparent",
        maxHeight: height, 
        maxWidth: width,
      }}
      className={`select-none ${className || ""}`}
      draggable={false}
      loading="lazy"
    />
  );
};

export default Logo;
