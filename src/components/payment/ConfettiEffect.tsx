
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  isActive: boolean;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isActive }) => {
  useEffect(() => {
    if (isActive) {
      // Lighter confetti for better performance
      const runConfetti = () => {
        confetti({
          particleCount: 20,  // Reduced particle count
          spread: 40,
          origin: { y: 0.6 },
          colors: ['#9b87f5', '#6E59A5', '#0EA5E9'],
          disableForReducedMotion: true,
          scalar: 0.8  // Smaller confetti particles
        });
      };
      
      // Run once with a short delay
      const timer = setTimeout(() => runConfetti(), 100);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [isActive]);

  return null;
};

export default ConfettiEffect;
