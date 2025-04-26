
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Users, KeyRound, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface LocationState {
  from?: string;
}

const CustomerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const { login, customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  
  useEffect(() => {
    if (customerUser) {
      navigate('/customer/dashboard');
    }
    
    const timer = setTimeout(() => {
      setAnimationClass('animate-scale-in');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [customerUser, navigate]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        const redirectTo = locationState?.from || '/customer/dashboard';
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative px-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      </div>
      
      <div className={`w-full max-w-md z-10 ${animationClass}`}>
        <div className="mb-8 text-center">
          <div className="relative mx-auto w-full max-w-[220px] h-auto sm:w-64 sm:h-64">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-orange/20 to-accent/10 blur-lg"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria 8-Ball Club" 
              className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.3)]"
            />
          </div>
          <p className="mt-2 text-muted-foreground font-bold tracking-wider animate-fade-in bg-gradient-to-r from-cuephoria-orange via-accent to-cuephoria-orange bg-clip-text text-transparent text-sm sm:text-base">
            CUSTOMER PORTAL
          </p>
        </div>
        
        <Card className="bg-cuephoria-darker/90 border border-cuephoria-orange/30 shadow-xl shadow-cuephoria-orange/20 backdrop-blur-lg animate-fade-in delay-100 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cuephoria-orange/5 to-accent/5 opacity-50 rounded-xl"></div>
          
          <CardHeader className="text-center relative z-10 p-4 sm:p-6">
            <CardTitle className="text-xl sm:text-2xl gradient-text font-bold">Customer Login</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm">Enter your credentials to access your account</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 group">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-orange group-hover:text-accent transition-colors duration-300">
                  <Mail size={14} className="inline-block" />
                  Email
                  <div className="h-px flex-grow bg-gradient-to-r from-cuephoria-orange/50 to-transparent group-hover:from-accent/50 transition-colors duration-300"></div>
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-cuephoria-orange/30 focus-visible:ring-cuephoria-orange transition-all duration-300 hover:border-cuephoria-orange/60 placeholder:text-muted-foreground/50 focus-within:shadow-sm focus-within:shadow-cuephoria-orange/30 text-sm"
                />
              </div>
              
              <div className="space-y-2 group">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-orange group-hover:text-accent transition-colors duration-300">
                  <KeyRound size={14} className="inline-block" />
                  Password
                  <div className="h-px flex-grow bg-gradient-to-r from-cuephoria-orange/50 to-transparent group-hover:from-accent/50 transition-colors duration-300"></div>
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-cuephoria-orange/30 focus-visible:ring-cuephoria-orange transition-all duration-300 hover:border-cuephoria-orange/60 placeholder:text-muted-foreground/50 focus-within:shadow-sm focus-within:shadow-cuephoria-orange/30 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link 
                  to="/customer/reset-password"
                  className="text-cuephoria-orange hover:text-accent text-xs hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </CardContent>
            
            <CardFooter className="relative z-10 p-4 sm:p-6 pt-0 sm:pt-0 flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden bg-gradient-to-r from-cuephoria-orange to-accent hover:shadow-lg hover:shadow-cuephoria-orange/20 hover:scale-[1.02] transition-all duration-300 btn-hover-effect font-medium text-sm sm:text-base" 
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Users size={16} />
                      Sign In
                    </>
                  )}
                </span>
              </Button>
              
              <div className="text-center">
                <p className="text-muted-foreground text-sm">
                  Don't have an account?{' '}
                  <Link to="/customer/register" className="text-cuephoria-orange hover:text-accent hover:underline">
                    Register <ArrowRight size={14} className="inline" />
                  </Link>
                </p>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-4 text-center">
          <Link to="/" className="text-muted-foreground hover:text-white text-xs hover:underline">
            Back to Portal Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
