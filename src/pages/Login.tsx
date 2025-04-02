
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Gamepad, ZapIcon } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [animationClass, setAnimationClass] = useState('');

  useEffect(() => {
    // Add animation class after a short delay for entrance effect
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
      const success = await login(username, password);
      if (success) {
        toast({
          title: 'Success',
          description: 'Logged in successfully!',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Invalid username or password',
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent animate-pulse-glow"></div>
        
        {/* Gaming elements */}
        <div className="absolute top-[15%] left-[15%] text-cuephoria-lightpurple opacity-20 animate-float">
          <Gamepad size={48} />
        </div>
        <div className="absolute bottom-[20%] right-[20%] text-accent opacity-20 animate-float delay-300">
          <ZapIcon size={48} />
        </div>
        
        {/* Animated light beams */}
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/50 to-transparent animate-pulse-glow"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent animate-pulse-glow delay-200"></div>
      </div>
      
      <div className={`w-full max-w-md z-10 ${animationClass}`}>
        <div className="mb-8 text-center">
          {/* Use the uploaded logo */}
          <img 
            src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
            alt="Cuephoria 8-Ball Club" 
            className="w-64 h-64 mx-auto animate-float"
          />
          <p className="mt-2 text-muted-foreground font-bold tracking-wider animate-fade-in">ADMINISTRATOR LOGIN</p>
        </div>
        
        <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 shadow-xl shadow-cuephoria-lightpurple/20 backdrop-blur-sm animate-fade-in delay-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl gradient-text">Login</CardTitle>
            <CardDescription className="text-muted-foreground">Enter your credentials to access the admin panel</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2 group">
                <label htmlFor="username" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  Username
                  <div className="h-px flex-grow bg-gradient-to-r from-cuephoria-lightpurple/50 to-transparent"></div>
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 hover:border-cuephoria-lightpurple/60"
                />
              </div>
              <div className="space-y-2 group">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  Password
                  <div className="h-px flex-grow bg-gradient-to-r from-cuephoria-lightpurple/50 to-transparent"></div>
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 hover:border-cuephoria-lightpurple/60"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 hover:scale-[1.02] transition-all duration-300 btn-hover-effect" 
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center text-sm text-muted-foreground p-4 bg-black/30 rounded-lg backdrop-blur-sm border border-white/5 animate-fade-in delay-200">
          <p className="text-cuephoria-lightpurple/80">Demo credentials: username: <span className="text-accent">admin</span>, password: <span className="text-accent">admin123</span></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
