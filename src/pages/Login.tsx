
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Gamepad, ZapIcon, Stars, Dice1, Dice3, Dice5, Trophy, Joystick, User, Users, Shield } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [animationClass, setAnimationClass] = useState('');
  const isMobile = useIsMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('animate-scale-in');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both username and password',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const isAdminLogin = loginType === 'admin';
      const success = await login(username, password, isAdminLogin);
      if (success) {
        toast({
          title: 'Success',
          description: `${isAdminLogin ? 'Admin' : 'Staff'} logged in successfully!`,
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: `Invalid ${isAdminLogin ? 'admin' : 'staff'} credentials`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative px-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        
        <div className="absolute top-1/3 right-1/4 w-48 h-64 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent rounded-tr-[50%]"></div>
        
        {/* Game-themed floating icons */}
        <div className="absolute top-[8%] left-[12%] text-cuephoria-lightpurple opacity-20 animate-float">
          <Gamepad size={isMobile ? 24 : 36} className="animate-wiggle" />
        </div>
        <div className="absolute bottom-[15%] right-[15%] text-accent opacity-20 animate-float delay-300">
          <ZapIcon size={isMobile ? 24 : 36} className="animate-pulse-soft" />
        </div>
        <div className="absolute top-[30%] right-[30%] text-cuephoria-lightpurple opacity-20 animate-float delay-150">
          <Stars size={isMobile ? 18 : 24} className="animate-pulse-soft" />
        </div>
        <div className="absolute top-[15%] right-[12%] text-cuephoria-orange opacity-20 animate-float delay-250">
          <Dice1 size={isMobile ? 20 : 28} className="animate-wiggle" />
        </div>
        <div className="absolute bottom-[25%] left-[25%] text-cuephoria-blue opacity-20 animate-float delay-200">
          <Dice3 size={isMobile ? 22 : 30} className="animate-pulse-soft" />
        </div>
        <div className="absolute top-[50%] left-[15%] text-cuephoria-green opacity-20 animate-float delay-150">
          <Dice5 size={isMobile ? 24 : 32} className="animate-wiggle" />
        </div>
        <div className="absolute bottom-[10%] left-[10%] text-cuephoria-orange opacity-20 animate-float delay-300">
          <Trophy size={isMobile ? 24 : 34} className="animate-pulse-soft" />
        </div>
        <div className="absolute top-[25%] left-[25%] text-accent opacity-20 animate-float delay-400">
          <Joystick size={isMobile ? 28 : 38} className="animate-wiggle" />
        </div>
        
        {/* Decorative lines */}
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"></div>
        <div className="absolute top-1/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-orange/20 to-transparent"></div>
        <div className="absolute top-2/3 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-green/20 to-transparent"></div>
        
        {/* Grid background */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>
      
      <div className={`w-full max-w-md z-10 ${animationClass}`}>
        <div className="mb-8 text-center">
          <div className="relative mx-auto w-full max-w-[220px] h-auto sm:w-64 sm:h-64">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 blur-lg"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria 8-Ball Club" 
              className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.3)]"
            />
          </div>
          <p className="mt-2 text-muted-foreground font-bold tracking-wider animate-fade-in bg-gradient-to-r from-cuephoria-lightpurple via-accent to-cuephoria-lightpurple bg-clip-text text-transparent text-sm sm:text-base">
            ADMINISTRATOR PORTAL
          </p>
        </div>
        
        <Card className="bg-cuephoria-darker/90 border border-cuephoria-lightpurple/30 shadow-xl shadow-cuephoria-lightpurple/20 backdrop-blur-lg animate-fade-in delay-100 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cuephoria-lightpurple/5 to-accent/5 opacity-50 rounded-xl"></div>
          <div className="absolute w-full h-full bg-grid-pattern opacity-5"></div>
          
          <CardHeader className="text-center relative z-10 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl gradient-text font-bold">Game Master Login</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm">Enter your credentials to access the control panel</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="flex justify-center mb-4">
                <Tabs defaultValue="admin" value={loginType} onValueChange={setLoginType} className="w-full max-w-xs">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="admin" className="flex items-center gap-2">
                      <Shield size={14} />
                      Admin
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="flex items-center gap-2">
                      <Users size={14} />
                      Staff
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2 group">
                <label htmlFor="username" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple group-hover:text-accent transition-colors duration-300">
                  <User size={14} className="inline-block" />
                  Username
                  <div className="h-px flex-grow bg-gradient-to-r from-cuephoria-lightpurple/50 to-transparent group-hover:from-accent/50 transition-colors duration-300"></div>
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 hover:border-cuephoria-lightpurple/60 placeholder:text-muted-foreground/50 focus-within:shadow-sm focus-within:shadow-cuephoria-lightpurple/30 text-sm"
                />
              </div>
              
              <div className="space-y-2 group">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple group-hover:text-accent transition-colors duration-300">
                  <ZapIcon size={14} className="inline-block" />
                  Password
                  <div className="h-px flex-grow bg-gradient-to-r from-cuephoria-lightpurple/50 to-transparent group-hover:from-accent/50 transition-colors duration-300"></div>
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 hover:border-cuephoria-lightpurple/60 placeholder:text-muted-foreground/50 focus-within:shadow-sm focus-within:shadow-cuephoria-lightpurple/30 text-sm"
                />
              </div>
            </CardContent>
            
            <CardFooter className="relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 hover:scale-[1.02] transition-all duration-300 btn-hover-effect font-medium text-sm sm:text-base" 
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Accessing...
                    </>
                  ) : (
                    <>
                      {loginType === 'admin' ? <Shield size={16} /> : <Users size={16} />}
                      {loginType === 'admin' ? 'Admin Login' : 'Staff Login'}
                    </>
                  )}
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
