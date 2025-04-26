
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, Mail, ArrowRight, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

enum ResetStep {
  EnterEmail,
  EnterPin,
  SetNewPassword
}

const CustomerResetPassword = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(ResetStep.EnterEmail);
  const [animationClass, setAnimationClass] = useState('');
  const { verifyPin, resetPassword } = useCustomerAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleVerifyPin = async () => {
    if (!pin || !email) {
      toast({
        title: 'Error',
        description: 'Please enter your email and security PIN',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await verifyPin(email, pin);
      
      if (success) {
        toast({
          title: 'PIN Verified',
          description: 'PIN verification successful',
        });
        setCurrentStep(ResetStep.SetNewPassword);
      }
    } catch (error) {
      console.error('Error verifying PIN:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResetPassword = async () => {
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
    
    setIsLoading(true);
    
    try {
      const success = await resetPassword(email, pin, password);
      
      if (success) {
        toast({
          title: 'Password Reset',
          description: 'Your password has been successfully reset',
        });
        navigate('/customer/login');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const renderStepContent = () => {
    switch (currentStep) {
      case ResetStep.EnterEmail:
        return (
          <>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium flex items-center gap-2 text-cuephoria-orange">
                  <Mail size={14} className="inline-block" />
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-cuephoria-orange/30 focus-visible:ring-cuephoria-orange"
                />
              </div>
              
              <div className="bg-amber-500/10 p-3 rounded-md">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                  <AlertTriangle size={16} />
                  <span className="font-medium">Security PIN Required</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll need to enter the security PIN you created during registration to reset your password.
                </p>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-4">
              <Button 
                onClick={() => setCurrentStep(ResetStep.EnterPin)} 
                className="w-full bg-cuephoria-orange hover:bg-cuephoria-orange/90" 
              >
                Continue
              </Button>
            </CardFooter>
          </>
        );
      
      case ResetStep.EnterPin:
        return (
          <>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="pin" className="text-sm font-medium flex items-center gap-2 text-cuephoria-orange">
                  <KeyRound size={14} className="inline-block" />
                  Security PIN
                </label>
                <Input
                  id="pin"
                  placeholder="Enter your security PIN"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="bg-background/50 border-cuephoria-orange/30 focus-visible:ring-cuephoria-orange text-center tracking-widest"
                />
              </div>
              
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setCurrentStep(ResetStep.EnterEmail)}
                  className="text-cuephoria-orange hover:underline text-sm"
                >
                  Change email
                </button>
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-4">
              <Button 
                onClick={handleVerifyPin} 
                className="w-full bg-cuephoria-orange hover:bg-cuephoria-orange/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Verifying...
                  </>
                ) : 'Verify PIN'}
              </Button>
            </CardFooter>
          </>
        );
      
      case ResetStep.SetNewPassword:
        return (
          <>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2 text-cuephoria-orange">
                  <KeyRound size={14} className="inline-block" />
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/50 border-cuephoria-orange/30 focus-visible:ring-cuephoria-orange pr-10"
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
              
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2 text-cuephoria-orange">
                  <KeyRound size={14} className="inline-block" />
                  Confirm Password
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-background/50 border-cuephoria-orange/30 focus-visible:ring-cuephoria-orange"
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex-col space-y-4">
              <Button 
                onClick={handleResetPassword} 
                className="w-full bg-cuephoria-orange hover:bg-cuephoria-orange/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Resetting Password...
                  </>
                ) : 'Reset Password'}
              </Button>
            </CardFooter>
          </>
        );
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark overflow-hidden relative px-4">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent"></div>
      </div>
      
      <div className={`w-full max-w-md z-10 ${animationClass}`}>
        <div className="mb-8 text-center">
          <div className="relative mx-auto w-full max-w-[180px] h-auto">
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
          
          <CardHeader className="text-center relative z-10">
            <CardTitle className="text-xl sm:text-2xl gradient-text font-bold">Reset Password</CardTitle>
            <CardDescription className="text-muted-foreground">
              {currentStep === ResetStep.EnterEmail && "Enter your email and security PIN to reset your password"}
              {currentStep === ResetStep.EnterPin && "Enter your security PIN"}
              {currentStep === ResetStep.SetNewPassword && "Create a new password for your account"}
            </CardDescription>
          </CardHeader>
          
          {renderStepContent()}
        </Card>
        
        <div className="mt-4 text-center">
          <Link to="/customer/login" className="text-muted-foreground hover:text-white text-xs hover:underline flex items-center justify-center gap-1">
            Back to Login <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerResetPassword;
