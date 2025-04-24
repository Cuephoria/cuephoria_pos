
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Mail, Lock, ExternalLink } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showErrorToast } from '@/utils/toast-utils';
import CustomerSignup from '@/components/customer/CustomerSignup';
import { motion } from 'framer-motion';

const CustomerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('login');

  const { login, isAuthenticated, isLoading } = useCustomerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/customer/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      showErrorToast('Login failed', 'Please enter both email and password.');
      return;
    }
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/customer/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  const handleSuccessfulSignup = () => {
    // After successful signup, switch back to login tab
    setActiveTab('login');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
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

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Reset to the top of the page when changing tabs
    window.scrollTo(0, 0);
  };
  
  useEffect(() => {
    // Reset to top when the page loads
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden relative bg-gradient-to-br from-cuephoria-dark via-cuephoria-darker to-black">
      {/* Animated background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-purple-800/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
        
        {/* Decorative elements */}
        <div className="absolute top-[15%] left-[10%] w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/10 to-purple-500/10 blur-2xl animate-pulse-soft"></div>
        <div className="absolute bottom-[20%] right-[15%] w-32 h-32 rounded-full bg-gradient-to-r from-blue-500/10 to-teal-500/10 blur-2xl animate-pulse-soft delay-700"></div>
        
        {/* Glowing lines */}
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"></div>
      </div>

      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center h-screen relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md"
        >
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="relative mb-5 inline-block">
              <div className="absolute -inset-6 bg-gradient-to-r from-cuephoria-lightpurple to-accent opacity-75 blur-lg rounded-full"></div>
              <img 
                src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
                alt="Cuephoria" 
                className="relative w-24 h-24 sm:w-32 sm:h-32 drop-shadow-[0_0_15px_rgba(155,135,245,0.6)]"
              />
            </div>
            
            <motion.h1 
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 bg-gradient-to-r from-white via-cuephoria-lightpurple to-accent bg-clip-text text-transparent"
            >
              CUSTOMER PORTAL
            </motion.h1>
            
            <motion.p 
              variants={itemVariants} 
              className="text-xl text-center text-gray-300"
            >
              Sign in to access your game stats and rewards
            </motion.p>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="relative p-6 sm:p-8 bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl w-full"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cuephoria-lightpurple/50 to-accent/50 rounded-2xl blur opacity-20"></div>
            <div className="relative">
              <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="login" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">Login</TabsTrigger>
                  <TabsTrigger value="signup" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                      </div>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email"
                          className="bg-cuephoria-darker/70 border-cuephoria-lightpurple/20"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Lock className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                          <label htmlFor="password" className="text-sm font-medium">Password</label>
                        </div>
                        <a href="#" className="text-xs text-cuephoria-lightpurple hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="bg-cuephoria-darker/70 border-cuephoria-lightpurple/20"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </Button>
                      </div>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                          Signing In...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <CustomerSignup 
                    onSuccessfulSignup={handleSuccessfulSignup}
                    onBackToLogin={() => setActiveTab('login')}
                  />
                </TabsContent>
              </Tabs>

              <div className="mt-6 pt-6 border-t border-white/10 text-center">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="w-full border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                  onClick={() => window.location.href = 'https://cuephoria.in'}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visit Cuephoria Website
                </Button>
              </div>
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="text-center mt-6">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-gray-300"
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerAuth;
