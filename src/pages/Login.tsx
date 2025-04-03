import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Gamepad, ZapIcon, Stars } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [animationClass, setAnimationClass] = useState('');

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
      const success = await login(username, password);
      if (success) {
        toast({
          title: 'Success',
          description: 'Admin logged in successfully!',
        });
        navigate('/dashboard');
      } else {
        toast({
          title: 'Error',
          description: 'Invalid admin credentials',
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
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent animate-pulse-glow"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent animate-pulse-glow delay-200"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent animate-pulse-glow delay-300"></div>
        
        <div className="absolute top-[10%] left-[10%] text-cuephoria-lightpurple opacity-20 animate-float">
          <Gamepad size={36} />
        </div>
        <div className="absolute bottom-[15%] right-[15%] text-accent opacity-20 animate-float delay-300">
          <ZapIcon size={36} />
        </div>
        <div className="absolute top-[30%] right-[30%] text-cuephoria-lightpurple opacity-20 animate-float delay-150">
          <Stars size={24} />
        </div>
        
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent animate-pulse-glow"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent animate-pulse-glow delay-200"></div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>
      
      <div className={`w-full max-w-md z-10 ${animationClass}`}>
        <div className="mb-8 text-center">
          <div className="relative mx-auto w-64 h-64">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 animate-pulse-glow blur-lg"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria 8-Ball Club" 
              className="relative w-64 h-64 mx-auto animate-float drop-shadow-[0_0_15px_rgba(155,135,245,0.3)]"
            />
          </div>
          <p className="mt-2 text-muted-foreground font-bold tracking-wider animate-fade-in bg-gradient-to-r from-cuephoria-lightpurple via-accent to-cuephoria-lightpurple bg-clip-text text-transparent">ADMINISTRATOR LOGIN</p>
        </div>
        
        <Card className="bg-cuephoria-darker/90 border border-cuephoria-lightpurple/30 shadow-xl shadow-cuephoria-lightpurple/20 backdrop-blur-lg animate-fade-in delay-100 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cuephoria-lightpurple/5 to-accent/5 opacity-50 rounded-xl"></div>
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-2xl gradient-text font-bold">Admin Sign In</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Enter admin credentials to access the system</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 relative z-10">
              <div className="space-y-2 group">
                <label htmlFor="username" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  Username
                  <div className="h-px flex-grow bg-gradient-to-r from-cuephoria-lightpurple/50 to-transparent"></div>
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 hover:border-cuephoria-lightpurple/60 placeholder:text-muted-foreground/50"
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 hover:border-cuephoria-lightpurple/60 placeholder:text-muted-foreground/50"
                />
              </div>
              <div className="text-xs text-accent/80">
                <p>Default credentials: admin / admin123</p>
              </div>
            </CardContent>
            <CardFooter className="relative z-10">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 hover:scale-[1.02] transition-all duration-300 btn-hover-effect font-medium" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
