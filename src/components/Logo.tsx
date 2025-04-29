
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const isMobile = useIsMobile();
  
  const sizeClasses = {
    sm: isMobile ? 'text-lg' : 'text-xl',
    md: isMobile ? 'text-xl' : 'text-2xl',
    lg: isMobile ? 'text-2xl' : 'text-4xl'
  };

  return (
    <div className={`font-bold ${sizeClasses[size]} ${className}`}>
      <span className="text-cuephoria-purple">Cue</span>
      <span className="text-cuephoria-orange">phoria</span>
      <span className="ml-1 text-cuephoria-blue">POS</span>
    </div>
  );
};

export default Logo;
