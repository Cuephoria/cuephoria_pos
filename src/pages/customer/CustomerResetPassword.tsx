
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Mail, ArrowLeft, Key, Eye, EyeOff, HelpCircle, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CustomerResetPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  const { resetPassword, verifyResetPin, setNewPassword } = useCustomerAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await resetPassword(email);
      if (success) {
        setStep(2);
        toast({
          title: 'PIN Sent',
          description: 'A reset PIN has been sent to your email',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send reset PIN. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pin) {
      toast({
        title: 'Error',
        description: 'Please enter the PIN sent to your email',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await verifyResetPin(email, pin);
      if (success) {
        setStep(3);
        toast({
          title: 'PIN Verified',
          description: 'You can now set a new password',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid or expired PIN. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please enter and confirm your new password',
        variant: 'destructive',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const success = await setNewPassword(email, password, pin);
      if (success) {
        toast({
          title: 'Password Reset',
          description: 'Your password has been updated successfully',
        });
        navigate('/customer/login');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <motion.form 
            onSubmit={handleRequestReset}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <CardContent className="space-y-4 relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 group">
                <label htmlFor="email" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <Mail size={14} className="inline-block" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 text-sm"
                />
              </div>

              <Alert className="bg-cuephoria-darker border-cuephoria-orange/30 mt-4">
                <AlertCircle className="h-4 w-4 text-cuephoria-orange" />
                <AlertTitle className="text-white text-sm">Important</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  You'll receive a PIN code to verify your identity. If you don't receive the PIN, 
                  you can contact our staff for assistance.
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="relative z-10 p-4 sm:p-6 pt-0 sm:pt-0 flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 transition-all duration-300 font-medium text-sm sm:text-base" 
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? 'Sending PIN...' : 'Send Reset PIN'}
                </span>
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Remember your password?</span>{' '}
                <Link to="/customer/login" className="text-cuephoria-lightpurple hover:text-accent hover:underline transition-colors">
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </motion.form>
        );
        
      case 2:
        return (
          <motion.form 
            onSubmit={handleVerifyPin}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <CardContent className="space-y-4 relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="text-sm text-center mb-2 text-muted-foreground">
                A 6-digit PIN has been sent to your email. Please enter it below.
              </div>
              <div className="space-y-2 group">
                <label htmlFor="pin" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <Key size={14} className="inline-block" />
                  Reset PIN
                </label>
                <Input
                  id="pin"
                  type="text"
                  placeholder="Enter 6-digit PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.slice(0, 6))}
                  maxLength={6}
                  className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 text-sm text-center tracking-widest"
                />
              </div>

              <Alert className="bg-cuephoria-darker border-cuephoria-orange/30 mt-4">
                <HelpCircle className="h-4 w-4 text-cuephoria-orange" />
                <AlertTitle className="text-white text-sm">Need help?</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  If you didn't receive the PIN or need assistance, please contact our staff who can help you reset your password.
                </AlertDescription>
              </Alert>
            </CardContent>
            
            <CardFooter className="relative z-10 p-4 sm:p-6 pt-0 sm:pt-0 flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 transition-all duration-300 font-medium text-sm sm:text-base" 
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? 'Verifying...' : 'Verify PIN'}
                </span>
              </Button>
              
              <Button 
                type="button"
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-white"
                onClick={() => setStep(1)}
              >
                Back to Email
              </Button>
            </CardFooter>
          </motion.form>
        );
        
      case 3:
        return (
          <motion.form 
            onSubmit={handleResetPassword}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <CardContent className="space-y-4 relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-2 group">
                <label htmlFor="newPassword" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <Key size={14} className="inline-block" />
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 group">
                <label htmlFor="confirmPassword" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-cuephoria-lightpurple">
                  <Key size={14} className="inline-block" />
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple transition-all duration-300 text-sm pr-10"
                  />
                  <button
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="text-xs text-muted-foreground mt-2">
                <p>Password must be at least 6 characters long.</p>
              </div>
            </CardContent>
            
            <CardFooter className="relative z-10 p-4 sm:p-6 pt-0 sm:pt-0 flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full relative overflow-hidden bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:shadow-lg hover:shadow-cuephoria-lightpurple/20 transition-all duration-300 font-medium text-sm sm:text-base" 
                disabled={isLoading}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? 'Updating Password...' : 'Update Password'}
                </span>
              </Button>

              <Button 
                type="button"
                variant="ghost"
                className="text-sm text-muted-foreground hover:text-white"
                onClick={() => setStep(2)}
              >
                Back to PIN Entry
              </Button>
            </CardFooter>
          </motion.form>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative px-4">
      {/* Animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      </div>

      <div className="w-full max-w-md z-10 animate-scale-in">
        <div className="mb-6 text-center">
          <motion.div 
            className="relative mx-auto w-full max-w-[120px] h-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 blur-lg"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria 8-Ball Club" 
              className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.3)]"
            />
          </motion.div>
        </div>
        
        <Card className="bg-cuephoria-darker/90 border border-cuephoria-lightpurple/30 shadow-xl shadow-cuephoria-lightpurple/20 backdrop-blur-lg animate-fade-in delay-100 rounded-xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cuephoria-lightpurple/5 to-accent/5 opacity-50 rounded-xl"></div>
          
          <CardHeader className="text-center relative z-10 p-4 sm:p-6">
            <div className="absolute top-4 left-4">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1 text-muted-foreground hover:text-white"
                onClick={() => navigate('/customer/login')}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Button>
            </div>
            <CardTitle className="text-xl sm:text-2xl gradient-text font-bold">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm">
              {step === 1 && "Enter your email to reset your password"}
              {step === 2 && "Enter the PIN sent to your email"}
              {step === 3 && "Create a new password"}
            </CardDescription>
          </CardHeader>
          
          {renderStepContent()}
        </Card>
      </div>
    </div>
  );
};

export default CustomerResetPassword;
