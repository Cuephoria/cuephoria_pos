
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const Index = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cuephoria-dark via-cuephoria-dark to-[#100e1d] relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-64 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent rounded-tr-[50%]"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        {/* Animated Lines */}
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"></div>
        <div className="absolute top-1/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-orange/20 to-transparent"></div>
        <div className="absolute top-2/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-green/20 to-transparent"></div>
      </div>

      <motion.div 
        className="flex-1 flex flex-col items-center justify-center p-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="text-center space-y-8 max-w-lg z-10 relative">
          {/* Logo with glow effect */}
          <motion.div 
            className="relative mx-auto"
            variants={itemVariants}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/50 to-accent/30 blur-xl"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria" 
              className="mx-auto w-40 h-40 relative drop-shadow-[0_0_15px_rgba(155,135,245,0.5)]"
            />
          </motion.div>
          
          {/* Title with gradient text */}
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-cuephoria-lightpurple via-white to-accent bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Welcome to Cuephoria
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-lg text-muted-foreground max-w-md mx-auto"
            variants={itemVariants}
          >
            The premier destination for pool enthusiasts. Experience world-class tables, gaming, and refreshments in a vibrant atmosphere.
          </motion.p>
          
          {/* Portal Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mt-8"
            variants={itemVariants}
          >
            <Button 
              onClick={() => navigate('/login')} 
              className="group relative bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:from-accent hover:to-cuephoria-lightpurple text-white px-8 py-7 rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-cuephoria-lightpurple/30"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-medium tracking-wide">
                Admin & Staff
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Button>
            
            <Button 
              onClick={() => navigate('/customer')} 
              className="group relative bg-gradient-to-r from-cuephoria-orange to-pink-500 hover:from-pink-500 hover:to-cuephoria-orange text-white px-8 py-7 rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-cuephoria-orange/30"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-medium tracking-wide">
                Customer Portal
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Footer with animated background */}
      <footer className="relative z-10 p-6 text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div className="relative">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.
          </p>
          <p className="text-xs text-cuephoria-lightpurple/70 mt-1">
            Designed and developed by RK
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
