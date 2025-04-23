
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Gamepad, ZapIcon, User, UserPlus, Mail, Phone, Lock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

const CustomerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { login, signUp, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const [animationClass, setAnimationClass] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('animate-scale-in');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // If already authenticated, redirect to customer dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/customer/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      navigate('/customer/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name || !phone) {
      return;
    }
    
    setIsLoading(true);
    const success = await signUp(email, password, name, phone);
    setIsLoading(false);
    
    if (success) {
      navigate('/customer/dashboard');
    }
  };

  const handleRedirect = () => {
    window.location.href = 'https://cuephoria.in';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative px-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        
        <div className="absolute top-1/3 right-1/4 w-48 h-64 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent rounded-tr-[50%]"></div>
        
        <div className="absolute top-[15%] left-[12%] text-cuephoria-lightpurple opacity-20 animate-float">
          <Gamepad size={isMobile ? 24 : 36} className="animate-wiggle" />
        </div>
        
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"></div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>
      
      <div className={`w-full max-w-md z-10 ${animationClass}`}>
        <div className="mb-6 text-center">
          <div className="relative mx-auto w-full max-w-[180px] h-auto sm:w-56 sm:h-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 blur-lg"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria 8-Ball Club" 
              className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.3)]"
            />
          </div>
          <p className="mt-2 text-muted-foreground font-bold tracking-wider animate-fade-in bg-gradient-to-r from-cuephoria-lightpurple via-accent to-cuephoria-lightpurple bg-clip-text text-transparent text-sm">
            CUSTOMER PORTAL
          </p>
        </div>
        
        <Card className="bg-cuephoria-darker/90 border border-cuephoria-lightpurple/30 shadow-xl shadow-cuephoria-lightpurple/20 backdrop-blur-lg animate-fade-in delay-100 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cuephoria-lightpurple/5 to-accent/5 opacity-50 rounded-xl"></div>
          <div className="absolute w-full h-full bg-grid-pattern opacity-5"></div>
          
          <CardHeader className="relative z-10 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl gradient-text font-bold text-center">Customer Portal</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm text-center">Sign in to access your game stats and rewards</CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
            <Tabs defaultValue="login" value={authMode} onValueChange={setAuthMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <User size={14} />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center gap-2">
                  <UserPlus size={14} />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Mail size={14} className="inline-block" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Lock size={14} className="inline-block" />
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 transition-opacity" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <User size={14} className="inline-block" />
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Mail size={14} className="inline-block" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Phone size={14} className="inline-block" />
                      Phone Number
                    </Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Lock size={14} className="inline-block" />
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30"
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 transition-opacity" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating account...
                      </>
                    ) : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          <CardFooter className="relative z-10 p-4 sm:p-6 pt-2 flex flex-col space-y-3">
            <Button onClick={handleRedirect} variant="outline" className="w-full border-cuephoria-lightpurple/30 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10">
              Visit Cuephoria Website
            </Button>
            <Button onClick={() => navigate('/login')} variant="link" className="text-xs text-cuephoria-lightpurple/70">
              Admin/Staff Login
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center">
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-3 rounded-lg backdrop-blur-sm border border-pink-500/20">
            <p className="text-white text-sm">
              <span className="font-bold text-pink-300">Special Offer:</span> Get 10% off on online bookings!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
