
import React, { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Gamepad2 } from 'lucide-react';

/**
 * This custom logo component renders the animated Cuephoria logo.
 */
interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 52,
  lg: 80,
};

const Logo: React.FC<LogoProps> = ({ size = 'md', className, showText = false }) => {
  const isMobile = useIsMobile();
  const [animate, setAnimate] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Prefer smaller logo for mobile regardless of size prop (for navbar fit)
  const height = isMobile ? 36 : sizeMap[size] || 52;
  const width = height;

  // Add animation after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={`flex items-center gap-3 ${className || ""}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div 
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-[#9b87f5] to-[#7661d7] shadow-lg 
                  transition-all duration-500`}
        style={{ 
          height, 
          width,
          boxShadow: animate ? (hovered ? '0 0 30px rgba(155, 135, 245, 0.7)' : '0 0 20px rgba(155, 135, 245, 0.4)') : 'none',
          transform: hovered ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        <Gamepad2 
          className={`text-white transition-all duration-300 ${animate ? 'animate-scale-in' : ''}`}
          style={{
            filter: hovered ? 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.8))' : 'none',
            transform: hovered ? 'rotate(5deg)' : 'rotate(0deg)'
          }}
          size={Math.round(height * 0.6)} 
        />
      </div>
      
      {showText && (
        <span 
          className={`font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#9b87f5] to-[#D6BCFA] whitespace-nowrap 
                      ${animate ? 'animate-fade-in' : 'opacity-0'} transition-all duration-300
                      ${size === 'sm' ? 'text-xl' : size === 'lg' ? 'text-3xl' : 'text-2xl'}`}
          style={{
            textShadow: hovered ? '0 0 10px rgba(155, 135, 245, 0.5)' : 'none'
          }}
        >
          Cuephoria
        </span>
      )}
    </div>
  );
};

export default Logo;
