
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <div className="min-h-screen bg-cuephoria-dark flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl relative z-10"
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-8"
          >
            <div className="relative mx-auto w-32 h-32 sm:w-40 sm:h-40">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/40 to-cuephoria-blue/20 blur-xl"></div>
              <img 
                src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
                alt="Cuephoria 8-Ball Club" 
                className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.4)]"
              />
            </div>
            
            <h1 className="mt-8 text-5xl sm:text-6xl md:text-7xl font-bold bg-gradient-to-r from-[#5D6BFF] via-[#8A7CFE] to-[#C77DFF] bg-clip-text text-transparent">
              Welcome to Cuephoria
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-gray-300">
              The ultimate gaming destination for billiards enthusiasts and gamers alike
            </p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-r from-cuephoria-darker/50 to-cuephoria-dark/50 p-8 rounded-xl backdrop-blur border border-cuephoria-lightpurple/20 shadow-2xl shadow-cuephoria-lightpurple/10"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">Select Your Portal</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  className="w-full text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 border border-purple-400/20 shadow-lg shadow-purple-500/20 h-20 sm:h-28 p-4"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">Admin & Staff</span>
                    <span className="text-xs opacity-80">Management Portal</span>
                  </div>
                </Button>
              </Link>
              
              <Link to="/customer/login" className="w-full sm:w-auto">
                <Button 
                  variant="ghost" 
                  className="w-full text-white bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 border border-orange-400/20 shadow-lg shadow-orange-500/20 h-20 sm:h-28 p-4"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-lg font-bold">Customer</span>
                    <span className="text-xs opacity-80">Players Portal</span>
                  </div>
                </Button>
              </Link>
            </div>
          </motion.div>
        </motion.div>
        
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#2a2062_0%,_transparent_70%)] opacity-50"></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>
      
      <footer className="text-center py-4 text-sm text-gray-500">
        © 2025 Cuephoria 8-Ball Club. All rights reserved.
      </footer>
    </div>
  );
};

export default Index;
