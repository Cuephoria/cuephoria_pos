
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Gamepad, ZapIcon, User, UserPlus, Mail, Phone, Lock, Eye, EyeOff, KeyRound, Shield } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

const CustomerAuth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [resetPin, setResetPin] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const { login, signUp, isAuthenticated } = useCustomerAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [animationClass, setAnimationClass] = useState('');
  const isMobile = useIsMobile();
  
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPin, setForgotPin] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetLoading, setResetLoading] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationClass('animate-scale-in');
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/customer/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive'
      });
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
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive'
      });
      return;
    }
    
    if (resetPin.length < 4) {
      toast({
        title: 'Error',
        description: 'Please set a 4-digit PIN for password recovery',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await signUp(email, password, name, phone);
      
      if (success) {
        // Use type assertion to add the custom fields that aren't in the type definition
        const updateData = {
          reset_pin: resetPin,
          referred_by: referralCode || null
        } as any;
        
        const { error: updateError } = await supabase.from('customers').update(updateData).eq('email', email);
        
        if (updateError) {
          console.error("Error updating customer with PIN:", updateError);
        }
        
        toast({
          title: 'Account created',
          description: 'Welcome to Cuephoria!',
        });
        
        navigate('/customer/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Sign up failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setForgotDialogOpen(true);
    setResetStep(1);
    setForgotEmail('');
    setForgotPin('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleResetPassword = async () => {
    if (resetStep === 1) {
      if (!forgotEmail) {
        toast({
          title: 'Error',
          description: 'Please enter your email address',
          variant: 'destructive'
        });
        return;
      }
      setResetStep(2);
      return;
    }
    
    if (resetStep === 2) {
      if (!forgotPin) {
        toast({
          title: 'Error',
          description: 'Please enter your reset PIN',
          variant: 'destructive'
        });
        return;
      }
      
      try {
        setResetLoading(true);
        
        const { data: customer, error } = await supabase
          .from('customers')
          .select('id, reset_pin')
          .eq('email', forgotEmail)
          .single();
        
        if (error || !customer) {
          toast({
            title: 'Error',
            description: 'No account found with that email address',
            variant: 'destructive'
          });
          setResetLoading(false);
          return;
        }
        
        const typedCustomer = customer as any;
        if (!typedCustomer.reset_pin || typedCustomer.reset_pin !== forgotPin) {
          toast({
            title: 'Error',
            description: 'Incorrect reset PIN',
            variant: 'destructive'
          });
          setResetLoading(false);
          return;
        }
        
        setResetStep(3);
        setResetLoading(false);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to verify PIN',
          variant: 'destructive'
        });
        setResetLoading(false);
      }
      return;
    }
    
    if (resetStep === 3) {
      if (!newPassword || !confirmPassword) {
        toast({
          title: 'Error',
          description: 'Please enter and confirm your new password',
          variant: 'destructive'
        });
        return;
      }
      
      if (newPassword !== confirmPassword) {
        toast({
          title: 'Error',
          description: 'Passwords do not match',
          variant: 'destructive'
        });
        return;
      }
      
      try {
        setResetLoading(true);
        
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail);
        
        if (error) {
          toast({
            title: 'Error',
            description: 'Failed to reset password: ' + error.message,
            variant: 'destructive'
          });
          setResetLoading(false);
          return;
        }
        
        toast({
          title: 'Success',
          description: 'Password reset link sent to your email',
        });
        
        setForgotDialogOpen(false);
        setResetLoading(false);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to reset password',
          variant: 'destructive'
        });
        setResetLoading(false);
      }
    }
  };

  const handleRedirect = () => {
    window.location.href = 'https://cuephoria.in';
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderResetPasswordContent = () => {
    if (resetStep === 1) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={16} className="text-cuephoria-orange" />
              Password Recovery
            </DialogTitle>
            <DialogDescription>
              Enter your email address to begin the password recovery process
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotEmail" className="text-sm font-medium">Email Address</Label>
                <Input
                  id="forgotEmail"
                  type="email"
                  placeholder="Enter your email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={!forgotEmail || resetLoading}
              className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
            >
              {resetLoading ? "Verifying..." : "Next"}
            </Button>
          </DialogFooter>
        </>
      );
    }
    
    if (resetStep === 2) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={16} className="text-cuephoria-orange" />
              Enter Recovery PIN
            </DialogTitle>
            <DialogDescription>
              Enter the 4-digit PIN you set during registration
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgotPin" className="text-sm font-medium">Recovery PIN</Label>
                <Input
                  id="forgotPin"
                  type="text"
                  placeholder="Enter 4-digit PIN"
                  value={forgotPin}
                  onChange={(e) => setForgotPin(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30"
                  maxLength={4}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p>If you don't remember your PIN, please contact our support staff at the Cuephoria location.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleResetPassword} 
              disabled={!forgotPin || resetLoading}
              className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
            >
              {resetLoading ? "Verifying..." : "Verify PIN"}
            </Button>
          </DialogFooter>
        </>
      );
    }
    
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock size={16} className="text-cuephoria-orange" />
            Set New Password
          </DialogTitle>
          <DialogDescription>
            Create a new password for your account
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 pr-10"
                />
                <button 
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background/50 border-cuephoria-lightpurple/30"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setForgotDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleResetPassword} 
            disabled={!newPassword || !confirmPassword || resetLoading}
            className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
          >
            {resetLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </>
    );
  };

  const renderSignupForm = () => (
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
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-background/50 border-cuephoria-lightpurple/30 pr-10"
            required
          />
          <button 
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reset-pin" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
          <KeyRound size={14} className="inline-block" />
          Recovery PIN (4 digits)
        </Label>
        <Input
          id="reset-pin"
          type="text"
          placeholder="Set a 4-digit PIN"
          value={resetPin}
          onChange={(e) => setResetPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
          className="bg-background/50 border-cuephoria-lightpurple/30"
          required
          maxLength={4}
        />
        <p className="text-xs text-muted-foreground mt-1">You'll need this PIN if you ever need to reset your password</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referral-code" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
          <User size={14} className="inline-block" />
          Referral Code (Optional)
        </Label>
        <Input
          id="referral-code"
          type="text"
          placeholder="Enter referral code (if any)"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          className="bg-background/50 border-cuephoria-lightpurple/30"
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 transition-opacity py-6" 
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
  );

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative px-8 py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        
        <div className="absolute top-1/3 right-1/4 w-48 h-64 bg-[radial-gradient(circle,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent rounded-tr-[50%]"></div>
        
        <div className="absolute top-1/2 left-0 h-px w-full bg-gradient-to-r from-transparent via-cuephoria-lightpurple/30 to-transparent"></div>
        <div className="absolute top-0 left-1/2 h-full w-px bg-gradient-to-b from-transparent via-accent/30 to-transparent"></div>
        
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>
      
      <motion.div 
        className="w-full max-w-md z-10"
        variants={itemVariants}
      >
        <div className="mb-6 text-center">
          <div className="relative mx-auto w-full max-w-[180px] h-auto sm:w-56 sm:h-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/20 blur-lg"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria 8-Ball Club" 
              className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.3)]"
            />
          </div>
          <motion.p 
            className="mt-2 text-muted-foreground font-bold tracking-wider animate-fade-in bg-gradient-to-r from-cuephoria-lightpurple via-accent to-cuephoria-lightpurple bg-clip-text text-transparent text-sm"
            variants={itemVariants}
          >
            CUSTOMER PORTAL
          </motion.p>
        </div>
        
        <motion.div variants={itemVariants}>
          <Card className="bg-cuephoria-darker/90 border border-cuephoria-lightpurple/30 shadow-xl shadow-cuephoria-lightpurple/20 backdrop-blur-lg rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cuephoria-lightpurple/5 to-accent/5 opacity-50 rounded-xl"></div>
            <div className="absolute w-full h-full bg-grid-pattern opacity-5"></div>
            
            <CardHeader className="relative z-10 p-6 sm:p-8">
              <CardTitle className="text-xl sm:text-2xl gradient-text font-bold text-center">Customer Portal</CardTitle>
              <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm text-center">Sign in to access your game stats and rewards</CardDescription>
            </CardHeader>
            
            <CardContent className="relative z-10 p-6 sm:p-8 pt-0 sm:pt-0">
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
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-background/50 border-cuephoria-lightpurple/30 pr-10"
                          required
                        />
                        <button 
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <Button 
                        type="button" 
                        variant="link" 
                        onClick={handleForgotPassword}
                        className="text-cuephoria-lightpurple hover:text-accent p-0 h-auto text-xs"
                      >
                        Forgot password?
                      </Button>
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 transition-opacity py-6" 
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
                  {renderSignupForm()}
                </TabsContent>
              </Tabs>
            </CardContent>
            
            <CardFooter className="relative z-10 p-6 sm:p-8 pt-2 flex flex-col space-y-3">
              <Button onClick={handleRedirect} variant="outline" className="w-full justify-start border-cuephoria-lightpurple/30 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10">
                Visit Cuephoria Website
              </Button>
              <Button onClick={() => navigate('/login')} variant="link" className="text-xs text-cuephoria-lightpurple/70">
                Admin/Staff Login
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
        
        <motion.div variants={itemVariants} className="mt-8 text-center">
          <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-4 rounded-lg backdrop-blur-sm border border-pink-500/20">
            <p className="text-white text-sm">
              <span className="font-bold text-pink-300">Special Offer:</span> Get 10% off on online bookings!
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="mt-6 text-center text-muted-foreground/60 text-xs"
          variants={itemVariants}
        >
          <p>Designed and developed by RK</p>
        </motion.div>
      </motion.div>

      <Dialog open={forgotDialogOpen} onOpenChange={setForgotDialogOpen}>
        <DialogContent className="sm:max-w-md bg-background border-cuephoria-purple">
          {renderResetPasswordContent()}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CustomerAuth;
