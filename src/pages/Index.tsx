
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 100 
      }
    }
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: { scale: 0.95 }
  };

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-cuephoria-dark via-cuephoria-darker to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-[15%] left-[10%] w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-2xl animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-2xl animate-pulse-slow delay-700"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        {/* Glowing lines */}
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"></div>
      </div>
      
      <motion.div 
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
        variants={containerVariants}
        className="container mx-auto flex flex-col items-center justify-center min-h-screen px-4 py-12 relative z-10"
      >
        <motion.div variants={itemVariants} className="relative mb-8">
          <div className="absolute -inset-6 bg-gradient-to-r from-cuephoria-lightpurple to-accent opacity-75 blur-lg rounded-full"></div>
          <img 
            src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
            alt="Cuephoria" 
            className="relative w-40 h-40 sm:w-48 sm:h-48 drop-shadow-[0_0_15px_rgba(155,135,245,0.6)] animate-float"
          />
        </motion.div>
        
        <motion.h1 
          variants={itemVariants}
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-white via-cuephoria-lightpurple to-accent bg-clip-text text-transparent"
        >
          Welcome to Cuephoria
        </motion.h1>
        
        <motion.p 
          variants={itemVariants} 
          className="text-xl text-center text-gray-300 max-w-lg mb-10"
        >
          The ultimate gaming destination for billiards enthusiasts and gamers alike
        </motion.p>
        
        <motion.div 
          variants={itemVariants}
          className="relative p-8 sm:p-10 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl w-full max-w-lg mb-8"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cuephoria-lightpurple/50 to-accent/50 rounded-2xl blur opacity-20"></div>
          <h2 className="text-2xl font-bold mb-4 text-center bg-gradient-to-r from-cuephoria-lightpurple to-accent bg-clip-text text-transparent">
            Select Your Portal
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                onClick={() => navigate('/login')} 
                className="w-full h-20 bg-gradient-to-r from-cuephoria-lightpurple to-purple-600 hover:opacity-90 border border-white/10 shadow-lg shadow-purple-900/20 text-white"
                size="lg"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">Admin & Staff</span>
                  <span className="text-xs opacity-80">Management Portal</span>
                </div>
              </Button>
            </motion.div>
            
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Button 
                onClick={() => navigate('/customer')} 
                className="w-full h-20 bg-gradient-to-r from-cuephoria-orange to-amber-500 hover:opacity-90 border border-white/10 shadow-lg shadow-orange-900/20 text-white"
                size="lg"
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-lg font-bold">Customer</span>
                  <span className="text-xs opacity-80">Players Portal</span>
                </div>
              </Button>
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          variants={itemVariants}
          className="absolute bottom-4 w-full max-w-lg mx-auto text-center text-sm text-gray-400 px-4"
        >
          <p>© {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
          <p className="mt-1 font-light text-xs">Designed and developed by RK</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
