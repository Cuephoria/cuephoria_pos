
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';

const CustomerSignupSuccess: React.FC = () => {
  const navigate = useNavigate();
  
  // Auto-redirect after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/customer/login');
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-cuephoria-darker to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(93,107,255,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      {/* Animated particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-green-400/30"
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
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full"
      >
        <Card className="border-green-500/20 bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/80 overflow-hidden">
          <CardContent className="p-6 flex flex-col items-center">
            <motion.div 
              className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mb-6"
              variants={itemVariants}
              animate={{
                boxShadow: [
                  "0 0 0 rgba(34, 197, 94, 0.2)",
                  "0 0 20px rgba(34, 197, 94, 0.4)",
                  "0 0 0 rgba(34, 197, 94, 0.2)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="h-10 w-10 text-green-500" />
            </motion.div>
            
            <motion.h1 
              className="text-2xl font-bold text-white mb-2 text-center"
              variants={itemVariants}
            >
              Email Confirmed!
            </motion.h1>
            
            <motion.p 
              className="text-gray-300 text-center mb-6"
              variants={itemVariants}
            >
              Your account has been successfully verified. You can now log in to access your customer dashboard.
            </motion.p>
            
            <motion.div className="w-full" variants={itemVariants}>
              <Button 
                className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white"
                onClick={() => navigate('/customer/login')}
              >
                Continue to Login
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-center text-sm text-gray-400 mt-4">
                You will be automatically redirected in a few seconds...
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
      
      <motion.div 
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <img 
          src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png"
          alt="Cuephoria Logo"
          className="w-16 h-16 opacity-80"
        />
      </motion.div>
    </div>
  );
};

export default CustomerSignupSuccess;
