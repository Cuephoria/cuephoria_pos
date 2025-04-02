
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-4xl'
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
