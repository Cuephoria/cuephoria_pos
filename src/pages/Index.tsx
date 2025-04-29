
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Award, Calendar, User, ShoppingBag, ArrowRight, Shield, Zap, Gift } from 'lucide-react';

const Index = () => {
  // Preload images for smoother UI
  useEffect(() => {
    const preloadImages = [
      '/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png',
      '/lovable-uploads/3cc0cd73-2903-4939-ac4d-711f0e8222a1.png',
      '/lovable-uploads/94aa8ae9-59ce-4416-8a48-95379e1dd47c.png'
    ];
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cuephoria-darker to-black overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(93,107,255,0.15)_0%,_transparent_70%)] animate-pulse-slow pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cuephoria-lightpurple/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -15, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 pt-8 pb-8 relative z-10">
        {/* Logo and Hero Section - Compact version */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center mb-8 relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#5D6BFF_0%,_transparent_70%)] opacity-20"></div>
          <div className="relative w-24 h-24 sm:w-32 sm:h-32 mb-2">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/40 to-cuephoria-blue/20 blur-xl"></div>
            <img
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png"
              alt="Cuephoria 8-Ball Club"
              className="relative w-full h-auto drop-shadow-[0_0_25px_rgba(155,135,245,0.5)]"
            />
          </div>

          <h1 className="mt-2 text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#9b87f5] to-[#C77DFF] bg-clip-text text-transparent text-center animate-pulse-soft">
            CUEPHORIA
          </h1>
          <motion.p 
            className="mt-1 text-lg md:text-xl font-light text-white/80 text-center max-w-xl"
            animate={{ 
              background: [
                "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) 100%)",
                "linear-gradient(90deg, rgba(155,135,245,0.8) 0%, rgba(255,255,255,0.8) 100%)",
                "linear-gradient(90deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.8) 100%)"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity }}
            style={{ WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}
          >
            Where precision meets passion in the ultimate gaming experience
          </motion.p>
        </motion.div>

        {/* Portal Options - Enhanced with images and clearer descriptions */}
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {/* Staff Portal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-cuephoria-darker/90 to-[#2A1E66]/80 rounded-xl overflow-hidden border border-purple-700/30 shadow-[0_0_25px_rgba(155,135,245,0.15)] hover:shadow-[0_0_35px_rgba(155,135,245,0.25)] transition-all duration-500"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-2 rounded-xl">
                  <User size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Admin & Staff Portal</h2>
                  <p className="text-purple-300/90 text-sm">Management & Operations</p>
                </div>
              </div>
              
              <div className="mb-4 flex items-center gap-4">
                <div className="hidden sm:block w-1/4">
                  <img 
                    src="/lovable-uploads/94aa8ae9-59ce-4416-8a48-95379e1dd47c.png" 
                    alt="Staff Dashboard" 
                    className="rounded-lg w-full object-cover h-24 opacity-90"
                  />
                </div>
                <div className="w-full sm:w-3/4">
                  <p className="text-gray-300 text-sm mb-2">
                    Designed for staff to manage all aspects of Cuephoria:
                  </p>
                  <ul className="space-y-1 text-gray-300/80 text-sm">
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Managing gaming sessions & sales</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Handling inventory & customer records</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-purple-400 mr-2">•</span>
                      <span>Accessing financial reports & analytics</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white border-none h-10">
                  <span>Staff Login</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-center text-xs text-gray-400 mt-2">
                For authorized personnel only
              </p>
            </div>
          </motion.div>
          
          {/* Customer Portal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className="bg-gradient-to-br from-cuephoria-darker/90 to-[#664F1E]/80 rounded-xl overflow-hidden border border-orange-700/30 shadow-[0_0_25px_rgba(247,173,102,0.15)] hover:shadow-[0_0_35px_rgba(247,173,102,0.25)] transition-all duration-500"
          >
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-2 rounded-xl">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Customer Portal</h2>
                  <p className="text-orange-300/90 text-sm">Members & Players</p>
                </div>
              </div>
              
              <div className="mb-4 flex items-center gap-4">
                <div className="hidden sm:block w-1/4">
                  <img 
                    src="/lovable-uploads/3cc0cd73-2903-4939-ac4d-711f0e8222a1.png" 
                    alt="Customer Dashboard" 
                    className="rounded-lg w-full object-cover h-24 opacity-90"
                  />
                </div>
                <div className="w-full sm:w-3/4">
                  <p className="text-gray-300 text-sm mb-2">
                    Exclusive benefits for our valued customers:
                  </p>
                  <ul className="space-y-1 text-gray-300/80 text-sm">
                    <li className="flex items-start">
                      <span className="text-orange-400 mr-2">•</span>
                      <span>Track your gaming history & stats</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-400 mr-2">•</span>
                      <span>Earn & redeem loyalty points</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-orange-400 mr-2">•</span>
                      <span>Access exclusive promotions & events</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link to="/customer/login" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white h-10 border-none">
                    <span>Customer Login</span>
                  </Button>
                </Link>
                <Link to="/customer/register" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-orange-400/20 to-orange-500/20 hover:from-orange-400/30 hover:to-orange-500/30 text-orange-400 border border-orange-500/40 h-10">
                    <span>Sign Up</span>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Call to Action Section - Enhanced with gradient buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-8 max-w-5xl mx-auto"
        >
          <div className="bg-gradient-to-r from-cuephoria-darker/90 to-cuephoria-darker/70 border border-cuephoria-lightpurple/20 rounded-xl p-4 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cuephoria-lightpurple/10 to-transparent opacity-50"></div>
            
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-2/3">
                <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Calendar className="text-cuephoria-orange h-6 w-6" />
                  <motion.span
                    animate={{ 
                      textShadow: [
                        "0 0 5px rgba(249, 115, 22, 0)",
                        "0 0 15px rgba(249, 115, 22, 0.3)",
                        "0 0 5px rgba(249, 115, 22, 0)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Book Online & Save 10%
                  </motion.span>
                </h2>
                <p className="text-gray-300 mb-4 text-sm sm:text-base">
                  Reserve your gaming session in advance and enjoy a 10% discount on your bill. 
                  Perfect for birthdays, team events, or just a night out with friends.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-1/3">
                <a href="https://cuephoria.in" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-cuephoria-orange to-cuephoria-lightpurple hover:from-cuephoria-orange/90 hover:to-cuephoria-lightpurple/90 text-white shadow-lg shadow-cuephoria-orange/20">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Book Now</span>
                  </Button>
                </a>
                
                <a href="https://cuephoria.in/membership" target="_blank" rel="noopener noreferrer" className="flex-1">
                  <Button className="w-full bg-transparent border border-cuephoria-lightpurple/60 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10">
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Get Membership</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Animated Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-6 max-w-5xl mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-cuephoria-darker/50 border border-cuephoria-lightpurple/20 rounded-lg p-4 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-gradient-to-br from-cuephoria-lightpurple/20 to-cuephoria-blue/10 p-2 rounded-full mb-2">
                <Trophy className="h-5 w-5 text-cuephoria-lightpurple" />
              </div>
              <h3 className="text-sm font-medium text-white">Regular Tournaments</h3>
              <p className="text-xs text-gray-400 mt-1">Compete with the best players</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-cuephoria-darker/50 border border-cuephoria-orange/20 rounded-lg p-4 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-gradient-to-br from-cuephoria-orange/20 to-cuephoria-lightpurple/10 p-2 rounded-full mb-2">
                <Gift className="h-5 w-5 text-cuephoria-orange" />
              </div>
              <h3 className="text-sm font-medium text-white">Loyalty Program</h3>
              <p className="text-xs text-gray-400 mt-1">Earn points with every visit</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-cuephoria-darker/50 border border-cuephoria-blue/20 rounded-lg p-4 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-gradient-to-br from-cuephoria-blue/20 to-cuephoria-orange/10 p-2 rounded-full mb-2">
                <Zap className="h-5 w-5 text-cuephoria-blue" />
              </div>
              <h3 className="text-sm font-medium text-white">Premium Equipment</h3>
              <p className="text-xs text-gray-400 mt-1">State-of-the-art gaming setup</p>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-cuephoria-darker/50 border border-cuephoria-green/20 rounded-lg p-4 flex flex-col items-center justify-center text-center"
            >
              <div className="bg-gradient-to-br from-cuephoria-green/20 to-cuephoria-blue/10 p-2 rounded-full mb-2">
                <ShoppingBag className="h-5 w-5 text-cuephoria-green" />
              </div>
              <h3 className="text-sm font-medium text-white">Food & Beverages</h3>
              <p className="text-xs text-gray-400 mt-1">Enjoy snacks while you play</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
      
      <footer className="text-center py-4 text-xs text-gray-500 border-t border-gray-800/30">
        <div className="container mx-auto px-4">
          <p>© 2025 Cuephoria 8-Ball Club. All rights reserved.</p>
          <p className="mt-1 text-xs text-gray-600">
            8th Cross Rd, Koramangala, Bengaluru, Karnataka 560034
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
