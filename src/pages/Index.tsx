
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Award, Calendar, User, ShoppingBag } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-cuephoria-darker to-black overflow-hidden">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-12 pb-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center mb-16 relative"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#5D6BFF_0%,_transparent_70%)] opacity-20"></div>
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/40 to-cuephoria-blue/20 blur-xl"></div>
            <img
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png"
              alt="Cuephoria 8-Ball Club"
              className="relative w-full h-auto drop-shadow-[0_0_25px_rgba(155,135,245,0.5)]"
            />
          </div>

          <h1 className="mt-8 text-5xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#9b87f5] to-[#C77DFF] bg-clip-text text-transparent text-center">
            CUEPHORIA
          </h1>
          <p className="mt-3 text-xl md:text-2xl font-light text-white/80 text-center max-w-2xl">
            Where precision meets passion in the ultimate gaming experience
          </p>
        </motion.div>

        {/* Portal Options */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Staff Portal */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-cuephoria-darker/90 to-[#2A1E66]/80 rounded-2xl overflow-hidden border border-purple-700/30 shadow-[0_0_25px_rgba(155,135,245,0.15)] group hover:shadow-[0_0_35px_rgba(155,135,245,0.25)] transition-all duration-500"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-3 rounded-xl">
                  <User size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Admin & Staff Portal</h2>
                  <p className="text-purple-300/90">Management & Operations</p>
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-gray-300 mb-4">
                  Designed for staff to manage all aspects of Cuephoria including:
                </p>
                <ul className="space-y-2 text-gray-300/80">
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
              
              <Link to="/login">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white group-hover:shadow-lg group-hover:shadow-purple-600/20 border-none h-14">
                  <span className="text-lg">Staff Login</span>
                </Button>
              </Link>
              <p className="text-center text-sm text-gray-400 mt-3">
                For authorized personnel only
              </p>
            </div>
          </motion.div>
          
          {/* Customer Portal */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-gradient-to-br from-cuephoria-darker/90 to-[#664F1E]/80 rounded-2xl overflow-hidden border border-orange-700/30 shadow-[0_0_25px_rgba(247,173,102,0.15)] group hover:shadow-[0_0_35px_rgba(247,173,102,0.25)] transition-all duration-500"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-500 to-orange-700 p-3 rounded-xl">
                  <Award size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Customer Portal</h2>
                  <p className="text-orange-300/90">Members & Players</p>
                </div>
              </div>
              
              <div className="mb-8">
                <p className="text-gray-300 mb-4">
                  Exclusive benefits for our valued customers:
                </p>
                <ul className="space-y-2 text-gray-300/80">
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
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/customer/login" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white h-14 group-hover:shadow-lg group-hover:shadow-orange-600/20 border-none">
                    <span className="text-lg">Customer Login</span>
                  </Button>
                </Link>
                <Link to="/customer/register" className="flex-1">
                  <Button className="w-full bg-gradient-to-r from-orange-400/20 to-orange-500/20 hover:from-orange-400/30 hover:to-orange-500/30 text-orange-400 border border-orange-500/40 h-14">
                    <span className="text-lg">Sign Up</span>
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-r from-cuephoria-darker/90 to-cuephoria-darker/70 border border-cuephoria-lightpurple/20 rounded-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-cuephoria-lightpurple/10 to-transparent opacity-50"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 flex items-center gap-3">
                <Calendar className="text-cuephoria-orange h-7 w-7" />
                <span>Book Online & Save 10%</span>
              </h2>
              <p className="text-lg text-gray-300 mb-8 max-w-xl">
                Reserve your gaming session in advance and enjoy a 10% discount on your bill. 
                Perfect for birthdays, team events, or just a night out with friends.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="https://cuephoria.in" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-gradient-to-r from-cuephoria-orange to-cuephoria-lightpurple hover:from-cuephoria-orange/90 hover:to-cuephoria-lightpurple/90 text-white px-8 h-12 shadow-lg shadow-cuephoria-orange/20">
                    <Calendar className="mr-2 h-5 w-5" />
                    <span>Book Now</span>
                  </Button>
                </a>
                
                <a href="https://cuephoria.in/membership" target="_blank" rel="noopener noreferrer">
                  <Button className="bg-transparent border border-cuephoria-lightpurple/60 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10 px-8 h-12">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    <span>Get Membership</span>
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(93,107,255,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <footer className="text-center py-6 text-sm text-gray-500 border-t border-gray-800/30">
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
