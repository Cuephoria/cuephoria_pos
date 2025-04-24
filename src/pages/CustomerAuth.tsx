
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Gamepad, ZapIcon, User, UserPlus, Mail, Phone, Lock, Eye, EyeOff, KeyRound, ArrowRight, Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { showSuccessToast, showErrorToast } from '@/utils/toast-utils';

const CustomerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { login, signUp, isAuthenticated } = useCustomerAuth();
  const navigate = useNavigate();
  const [animationClass, setAnimationClass] = useState('');
  const isMobile = useIsMobile();
  
  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
  
  // Password reset states
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPinInput, setResetPinInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
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
      showErrorToast("Missing Information", "Please enter both email and password");
      return;
    }
    
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
    
    if (success) {
      showSuccessToast("Welcome back!", "Login successful");
      navigate('/customer/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name || !phone || !resetPin) {
      showErrorToast("Missing Information", "All fields are required for registration");
      return;
    }
    
    if (resetPin.length < 4) {
      showErrorToast("Invalid PIN", "Your reset PIN must be at least 4 digits");
      return;
    }
    
    setIsLoading(true);
    const success = await signUp(email, password, name, phone, resetPin);
    setIsLoading(false);
    
    if (success) {
      showSuccessToast("Account Created", "Welcome to Cuephoria!");
      navigate('/customer/dashboard');
    }
  };

  const handleRedirect = () => {
    window.location.href = 'https://cuephoria.in';
  };
  
  const handleResetPassword = async () => {
    if (resetStep === 1) {
      if (!resetEmail) {
        showErrorToast("Missing Information", "Please enter your email address");
        return;
      }
      setResetStep(2);
    } else if (resetStep === 2) {
      if (!resetPinInput) {
        showErrorToast("Missing Information", "Please enter your reset PIN");
        return;
      }
      
      // In a real app, we would verify the PIN here
      // For now, let's simulate a successful PIN verification
      setResetStep(3);
    } else if (resetStep === 3) {
      if (!newPassword || !confirmPassword) {
        showErrorToast("Missing Information", "Please enter and confirm your new password");
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showErrorToast("Password Mismatch", "The passwords you entered don't match");
        return;
      }
      
      // In a real app, we would call an API to update the password
      // For now, let's simulate a successful password reset
      showSuccessToast("Password Reset", "Your password has been updated successfully");
      setResetDialogOpen(false);
      setAuthMode('login');
      
      // Reset all fields
      setResetStep(1);
      setResetEmail('');
      setResetPinInput('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };
  
  const resetPasswordContent = () => {
    if (resetStep === 1) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-xl text-center flex justify-center items-center gap-2">
              <KeyRound size={18} className="text-cuephoria-orange" />
              Password Reset
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Enter your email address to begin the password reset process
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-sm flex items-center gap-2">
                  <Mail size={14} className="text-cuephoria-lightpurple" />
                  Email Address
                </Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="border-cuephoria-lightpurple/40 focus:border-cuephoria-lightpurple"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              className="w-full border-cuephoria-lightpurple/40 text-cuephoria-lightpurple"
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent"
              onClick={handleResetPassword}
            >
              Next
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </DialogFooter>
        </>
      );
    } else if (resetStep === 2) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-xl text-center flex justify-center items-center gap-2">
              <Shield size={18} className="text-cuephoria-orange" />
              Enter Reset PIN
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Enter the reset PIN you created during registration
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-pin" className="text-sm flex items-center gap-2">
                  <KeyRound size={14} className="text-cuephoria-lightpurple" />
                  Reset PIN
                </Label>
                <Input
                  id="reset-pin"
                  type="password"
                  value={resetPinInput}
                  onChange={(e) => setResetPinInput(e.target.value)}
                  placeholder="Enter your reset PIN"
                  className="border-cuephoria-lightpurple/40 focus:border-cuephoria-lightpurple"
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Forgot your PIN? <span className="text-cuephoria-orange cursor-pointer hover:underline">Contact Shop Administrator</span>
              </p>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetStep(1)}
              className="w-full border-cuephoria-lightpurple/40 text-cuephoria-lightpurple"
            >
              Back
            </Button>
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent"
              onClick={handleResetPassword}
            >
              Verify PIN
            </Button>
          </DialogFooter>
        </>
      );
    } else {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="text-xl text-center flex justify-center items-center gap-2">
              <Lock size={18} className="text-cuephoria-orange" />
              Create New Password
            </DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <p className="text-sm text-muted-foreground text-center mb-4">
              Create a new password for your account
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password" className="text-sm flex items-center gap-2">
                  <Lock size={14} className="text-cuephoria-lightpurple" />
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="border-cuephoria-lightpurple/40 focus:border-cuephoria-lightpurple pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-sm flex items-center gap-2">
                  <Lock size={14} className="text-cuephoria-lightpurple" />
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="border-cuephoria-lightpurple/40 focus:border-cuephoria-lightpurple pr-10"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResetStep(2)}
              className="w-full border-cuephoria-lightpurple/40 text-cuephoria-lightpurple"
            >
              Back
            </Button>
            <Button
              type="button"
              className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent"
              onClick={handleResetPassword}
            >
              Reset Password
            </Button>
          </DialogFooter>
        </>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative px-6 py-12">
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
              className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.3)] animate-pulse-soft"
            />
          </div>
          <p className="mt-2 text-muted-foreground font-bold tracking-wider animate-fade-in bg-gradient-to-r from-cuephoria-lightpurple via-accent to-cuephoria-lightpurple bg-clip-text text-transparent text-sm">
            CUSTOMER PORTAL
          </p>
        </div>
        
        <Card className="bg-cuephoria-darker/80 border border-cuephoria-lightpurple/30 shadow-xl shadow-cuephoria-lightpurple/20 backdrop-blur-lg animate-fade-in delay-100 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cuephoria-lightpurple/5 to-accent/5 opacity-50 rounded-xl"></div>
          <div className="absolute w-full h-full bg-grid-pattern opacity-5"></div>
          
          <CardHeader className="relative z-10 p-6 sm:p-8">
            <CardTitle className="text-2xl sm:text-3xl gradient-text font-bold text-center">Customer Portal</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-sm sm:text-base text-center">
              Sign in to access your game stats and rewards
            </CardDescription>
          </CardHeader>
          
          <CardContent className="relative z-10 p-6 sm:p-8 pt-0 sm:pt-0">
            <Tabs defaultValue="login" value={authMode} onValueChange={setAuthMode} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login" className="flex items-center justify-center gap-2 py-3">
                  <User size={16} />
                  Login
                </TabsTrigger>
                <TabsTrigger value="signup" className="flex items-center justify-center gap-2 py-3">
                  <UserPlus size={16} />
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Mail size={16} className="inline-block" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30 focus:border-cuephoria-lightpurple"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Lock size={16} className="inline-block" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background/50 border-cuephoria-lightpurple/30 focus:border-cuephoria-lightpurple pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto text-xs text-cuephoria-lightpurple hover:text-accent"
                        >
                          Forgot password?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md bg-cuephoria-darker border-cuephoria-lightpurple/40">
                        {resetPasswordContent()}
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 transition-opacity h-12" 
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
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <User size={16} className="inline-block" />
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30 focus:border-cuephoria-lightpurple"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Mail size={16} className="inline-block" />
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30 focus:border-cuephoria-lightpurple"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-phone" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Phone size={16} className="inline-block" />
                      Phone Number
                    </Label>
                    <Input
                      id="signup-phone"
                      type="tel"
                      placeholder="Enter your phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30 focus:border-cuephoria-lightpurple"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <Lock size={16} className="inline-block" />
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-background/50 border-cuephoria-lightpurple/30 focus:border-cuephoria-lightpurple pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reset-pin" className="text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                      <KeyRound size={16} className="inline-block" />
                      Reset PIN <span className="text-xs text-muted-foreground">(For password recovery)</span>
                    </Label>
                    <Input
                      id="reset-pin"
                      type="password"
                      placeholder="Create a 4-digit PIN"
                      value={resetPin}
                      onChange={(e) => setResetPin(e.target.value)}
                      className="bg-background/50 border-cuephoria-lightpurple/30 focus:border-cuephoria-lightpurple"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Remember this PIN. You'll need it if you ever need to reset your password.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 transition-opacity h-12" 
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
          
          <CardFooter className="relative z-10 p-6 sm:p-8 pt-2 flex flex-col space-y-3">
            <Button onClick={handleRedirect} variant="outline" className="w-full border-cuephoria-lightpurple/30 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10">
              Visit Cuephoria Website
            </Button>
            <Button onClick={() => navigate('/login')} variant="link" className="text-xs text-cuephoria-lightpurple/70">
              Admin/Staff Login
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-6 text-center">
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-lg backdrop-blur-sm border border-pink-500/20">
            <p className="text-white text-sm font-medium">
              <span className="font-bold text-pink-300">Special Offer:</span> Get 10% off on online bookings!
            </p>
            <p className="text-xs mt-1 text-white/70">Use code ONLINE10 at checkout</p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-xs text-white/40">
          <p>© {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
          <p className="mt-1">Designed and developed by RK</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerAuth;
