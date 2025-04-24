
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, Clock, Award, Star, Users, Globe, Phone, Mail, MapPin } from 'lucide-react';

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
        <div className="text-center space-y-10 max-w-xl z-10 relative mb-12">
          {/* Logo with glow effect */}
          <motion.div 
            className="relative mx-auto"
            variants={itemVariants}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/50 to-accent/30 blur-xl"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria" 
              className="mx-auto w-40 h-40 sm:w-48 sm:h-48 relative drop-shadow-[0_0_15px_rgba(155,135,245,0.5)]"
            />
          </motion.div>
          
          {/* Title with gradient text */}
          <motion.h1 
            className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-cuephoria-lightpurple via-white to-accent bg-clip-text text-transparent"
            variants={itemVariants}
          >
            Welcome to Cuephoria
          </motion.h1>
          
          {/* Subtitle */}
          <motion.p 
            className="text-lg sm:text-xl text-muted-foreground max-w-lg mx-auto px-4"
            variants={itemVariants}
          >
            The premier destination for pool enthusiasts. Experience world-class tables, gaming, and refreshments in a vibrant atmosphere.
          </motion.p>
          
          {/* Key Features */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-6 pt-4"
          >
            <div className="flex items-center text-cuephoria-lightpurple">
              <Clock className="mr-2 h-5 w-5" />
              <span>Open 24/7</span>
            </div>
            <div className="flex items-center text-cuephoria-orange">
              <Award className="mr-2 h-5 w-5" />
              <span>Premium Equipment</span>
            </div>
            <div className="flex items-center text-accent">
              <Star className="mr-2 h-5 w-5" />
              <span>Membership Benefits</span>
            </div>
            <div className="flex items-center text-cuephoria-green">
              <Users className="mr-2 h-5 w-5" />
              <span>Friendly Staff</span>
            </div>
          </motion.div>
          
          {/* Portal Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center mt-8"
            variants={itemVariants}
          >
            <Button 
              onClick={() => navigate('/login')} 
              className="group relative bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:from-accent hover:to-cuephoria-lightpurple text-white px-8 py-8 rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-cuephoria-lightpurple/30"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-medium tracking-wide text-lg">
                Admin & Staff
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Button>
            
            <Button 
              onClick={() => navigate('/customer')} 
              className="group relative bg-gradient-to-r from-cuephoria-orange to-pink-500 hover:from-pink-500 hover:to-cuephoria-orange text-white px-8 py-8 rounded-lg overflow-hidden transition-all duration-300 shadow-lg hover:shadow-cuephoria-orange/30"
              size="lg"
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-medium tracking-wide text-lg">
                Customer Portal
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </Button>
          </motion.div>
          
          {/* Visit Website Button */}
          <motion.div
            variants={itemVariants}
            className="mt-8 pt-4"
          >
            <Button 
              onClick={() => window.location.href = 'https://cuephoria.in'}
              variant="outline"
              className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10 gap-2"
            >
              <Globe size={16} />
              Visit Our Website
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Enhanced Footer with animated background */}
      <footer className="relative z-10 py-8 px-6">
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Cuephoria 8-Ball Club</h3>
              <p className="text-sm text-muted-foreground mb-4">The ultimate destination for pool enthusiasts and gamers in the heart of the city.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-cuephoria-lightpurple hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-cuephoria-lightpurple hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path>
                  </svg>
                </a>
                <a href="#" className="text-cuephoria-lightpurple hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Hours & Location</h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                  <span>Open 24 Hours, 7 Days a Week</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                  <span>123 Pool Street, Game City, 400001</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                  <span>+91 98765 43210</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
                  <span>info@cuephoria.in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://cuephoria.in" className="text-muted-foreground hover:text-cuephoria-lightpurple transition-colors">Home</a>
                </li>
                <li>
                  <a href="https://cuephoria.in/about" className="text-muted-foreground hover:text-cuephoria-lightpurple transition-colors">About Us</a>
                </li>
                <li>
                  <a href="https://cuephoria.in/services" className="text-muted-foreground hover:text-cuephoria-lightpurple transition-colors">Services</a>
                </li>
                <li>
                  <a href="https://cuephoria.in/membership" className="text-muted-foreground hover:text-cuephoria-lightpurple transition-colors">Membership</a>
                </li>
                <li>
                  <a href="https://cuephoria.in/contact" className="text-muted-foreground hover:text-cuephoria-lightpurple transition-colors">Contact</a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-cuephoria-lightpurple/10 mt-8 pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.
            </p>
            <p className="text-xs text-cuephoria-lightpurple/70 mt-1">
              Designed and developed by RK
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
