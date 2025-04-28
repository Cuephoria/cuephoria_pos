
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, User, Star, Award, Gift, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const Index = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Preload images for better user experience
    const preloadImages = async () => {
      const imagesToPreload = [
        '/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png'
      ];
      
      imagesToPreload.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };
    
    preloadImages();
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
        type: 'spring',
        stiffness: 100
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  // Random stars for background effect
  const stars = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 5 + 5
  }));

  return (
    <div className="min-h-screen bg-cuephoria-dark flex flex-col items-center relative overflow-hidden">
      {/* Animated stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute bg-white rounded-full opacity-70 animate-twinkle"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.duration}s`
          }}
        />
      ))}
      
      {/* Gradient background */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cuephoria-lightpurple/20 via-transparent to-transparent"></div>
      <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-cuephoria-orange/10 via-transparent to-transparent"></div>
      
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      
      <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-cuephoria-lightpurple/5 rounded-full filter blur-3xl"></div>
      <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-cuephoria-orange/5 rounded-full filter blur-3xl"></div>
      
      <div className="container mx-auto px-4 py-10 z-10 h-full flex flex-col">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="relative mx-auto w-full max-w-[220px] h-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-cuephoria-orange/10 blur-lg"></div>
            <motion.img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png"
              alt="Cuephoria 8-Ball Club" 
              className="w-full h-auto drop-shadow-[0_0_25px_rgba(155,135,245,0.5)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold mt-6 text-transparent bg-clip-text bg-gradient-to-r from-cuephoria-lightpurple via-white to-cuephoria-orange"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
          >
            CUEPHORIA
          </motion.h1>
          
          <motion.p
            className="text-xl mt-2 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
          >
            Premium 8-Ball Club
          </motion.p>
        </motion.div>
        
        <motion.div 
          className="flex-1 flex flex-col justify-center items-center"
          variants={containerVariants}
          initial="hidden"
          animate={mounted ? "visible" : "hidden"}
        >
          <motion.h2 
            className="text-2xl md:text-3xl font-bold mb-8 text-center text-white"
            variants={itemVariants}
          >
            Select Your Portal
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <motion.div variants={itemVariants}>
              <Link to="/customer/login" className="block h-full">
                <Card className="bg-gradient-to-br from-cuephoria-darker to-cuephoria-dark border-cuephoria-lightpurple/30 hover:border-cuephoria-lightpurple/70 hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 transition-all duration-300 h-full group">
                  <div className="p-8 flex flex-col items-center text-center h-full">
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-cuephoria-lightpurple/20 rounded-full blur-lg group-hover:bg-cuephoria-lightpurple/30 transition-all"></div>
                      <div className="relative p-5 bg-cuephoria-darker rounded-full border border-cuephoria-lightpurple/40 group-hover:border-cuephoria-lightpurple/70 transition-all">
                        <User className="h-12 w-12 text-cuephoria-lightpurple" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cuephoria-lightpurple transition-colors">Customer Portal</h3>
                    <p className="text-gray-400 mb-6">Access your membership, earn rewards and track game stats</p>
                    
                    <div className="flex space-x-4 mb-8 justify-center">
                      <div className="flex flex-col items-center">
                        <Star className="h-5 w-5 text-cuephoria-orange mb-1" />
                        <span className="text-xs text-gray-400">Rewards</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Gift className="h-5 w-5 text-cuephoria-orange mb-1" />
                        <span className="text-xs text-gray-400">Promotions</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Award className="h-5 w-5 text-cuephoria-orange mb-1" />
                        <span className="text-xs text-gray-400">Profile</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Button
                        className="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-lightpurple/80 hover:from-cuephoria-lightpurple hover:to-cuephoria-lightpurple shadow-lg shadow-cuephoria-lightpurple/20 transition-all duration-300 group-hover:shadow-cuephoria-lightpurple/30"
                      >
                        Enter as Customer
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link to="/login" className="block h-full">
                <Card className="bg-gradient-to-br from-cuephoria-darker to-cuephoria-dark border-cuephoria-orange/30 hover:border-cuephoria-orange/70 hover:shadow-lg hover:shadow-cuephoria-orange/20 transition-all duration-300 h-full group">
                  <div className="p-8 flex flex-col items-center text-center h-full">
                    <div className="mb-6 relative">
                      <div className="absolute inset-0 bg-cuephoria-orange/20 rounded-full blur-lg group-hover:bg-cuephoria-orange/30 transition-all"></div>
                      <div className="relative p-5 bg-cuephoria-darker rounded-full border border-cuephoria-orange/40 group-hover:border-cuephoria-orange/70 transition-all">
                        <Users className="h-12 w-12 text-cuephoria-orange" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-cuephoria-orange transition-colors">Staff Portal</h3>
                    <p className="text-gray-400 mb-6">Manage tables, customers, and track business performance</p>
                    
                    <div className="flex space-x-4 mb-8 justify-center">
                      <div className="flex flex-col items-center">
                        <Users className="h-5 w-5 text-cuephoria-lightpurple mb-1" />
                        <span className="text-xs text-gray-400">Customers</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Zap className="h-5 w-5 text-cuephoria-lightpurple mb-1" />
                        <span className="text-xs text-gray-400">Sales</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Gift className="h-5 w-5 text-cuephoria-lightpurple mb-1" />
                        <span className="text-xs text-gray-400">Rewards</span>
                      </div>
                    </div>
                    
                    <div className="mt-auto">
                      <Button
                        className="bg-gradient-to-r from-cuephoria-orange to-cuephoria-orange/80 hover:from-cuephoria-orange hover:to-cuephoria-orange shadow-lg shadow-cuephoria-orange/20 transition-all duration-300 group-hover:shadow-cuephoria-orange/30"
                      >
                        Enter as Staff
                      </Button>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-12 text-center text-gray-500 text-sm"
            variants={fadeInUp}
          >
            <p>&copy; {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
