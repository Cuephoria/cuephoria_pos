
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
    <div className={`font-bold ${sizeClasses[size]} ${className} flex items-center`}>
      <div className="inline-flex items-center bg-gradient-to-r from-cuephoria-purple via-cuephoria-orange to-cuephoria-blue bg-clip-text text-transparent">
        <span className="font-heading">Cuephoria</span>
        <span className="ml-1 font-heading">POS</span>
      </div>
    </div>
  );
};

export default Logo;
