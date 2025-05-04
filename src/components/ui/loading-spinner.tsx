
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  color?: string;
  variant?: 'default' | 'futuristic';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '',
  color = '#9b87f5',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  if (variant === 'futuristic') {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className={`${sizeClasses[size]} relative`}>
          {/* Outer ring */}
          <div className="absolute inset-0 border-2 border-transparent border-t-current rounded-full animate-spin" 
            style={{ borderTopColor: color, animationDuration: '1s' }}></div>
          
          {/* Middle ring */}
          <div className="absolute inset-1 border-2 border-transparent border-t-current rounded-full animate-spin" 
            style={{ borderTopColor: color, animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          
          {/* Inner ring */}
          <div className="absolute inset-2 border-2 border-transparent border-t-current rounded-full animate-spin" 
            style={{ borderTopColor: color, animationDuration: '1.2s' }}></div>
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-current animate-pulse" style={{ backgroundColor: color }}></div>
          </div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full animate-pulse opacity-40 blur-sm" 
            style={{ boxShadow: `0 0 15px ${color}`, animationDuration: '2s' }}></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`animate-spin rounded-full border-4 border-t-transparent ${sizeClasses[size]}`}
        style={{ borderColor: `${color}33`, borderTopColor: 'transparent' }}
      ></div>
    </div>
  );
};
