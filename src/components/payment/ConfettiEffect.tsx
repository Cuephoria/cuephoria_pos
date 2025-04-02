
import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';

interface ConfettiEffectProps {
  isActive: boolean;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ isActive }) => {
  useEffect(() => {
    if (isActive) {
      // More controlled confetti that won't cause glitches
      const runConfetti = () => {
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.6 },
          colors: ['#9b87f5', '#6E59A5', '#0EA5E9'],
          disableForReducedMotion: true
        });
      };
      
      // Run once immediately
      runConfetti();
      
      // Then run only once more with delay
      const timer1 = setTimeout(() => runConfetti(), 500);
      
      return () => {
        clearTimeout(timer1);
      };
    }
  }, [isActive]);

  return null; // This component doesn't render anything visible
};

export default ConfettiEffect;
