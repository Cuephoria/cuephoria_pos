
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * This custom logo component renders the uploaded graphic for all use cases.
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  /**
   * Use the colorful brand graphic from /lovable-uploads/1ce327a1-4c4e-4a4f-9887-ca76023e50e9.png
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
  const width = height; // keep square

  return (
    <img
      src="/lovable-uploads/1ce327a1-4c4e-4a4f-9887-ca76023e50e9.png"
      alt="Cuephoria 8-Ball Club Logo"
      height={height}
      width={width}
      style={{
        borderRadius: 12,
        objectFit: "contain",
        background: "transparent",
        boxShadow: "0 2px 16px 0 rgba(110,89,165,0.07)",
        maxHeight: height, maxWidth: width,
      }}
      className={`select-none ${className || ""}`}
      draggable={false}
      loading="lazy"
    />
  );
};

export default Logo;
