import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Gamepad, ZapIcon, Stars, Dice1, Dice3, Dice5, Trophy, Joystick, User, Users, Shield, KeyRound, Lock, Eye, EyeOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LocationState {
  from?: string;
}

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('admin');
  const { login, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState;
  const [animationClass, setAnimationClass] = useState('');
  const isMobile = useIsMobile();
  
  const [forgotDialogOpen, setForgotDialogOpen] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [masterKey, setMasterKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [forgotPasswordType, setForgotPasswordType] = useState('admin');
  const [resetLoading, setResetLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
        
        const redirectTo = locationState?.from || '/dashboard';
        navigate(redirectTo);
      } else {
        toast({
          title: 'Error',
          description: `Invalid ${isAdminLogin ? 'admin' : 'staff'} credentials`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordClick = (type: string) => {
    setForgotPasswordType(type);
    setForgotPasswordStep(1);
    setForgotUsername('');
    setMasterKey('');
    setNewPassword('');
    setConfirmPassword('');
    setForgotDialogOpen(true);
  };

  const handleNextStep = () => {
    if (forgotPasswordType === 'staff') {
      toast({
        title: 'Staff Password Reset',
        description: 'Please contact your administrator to reset your password.',
      });
      setForgotDialogOpen(false);
      return;
    }

    if (forgotPasswordStep === 1) {
      if (!forgotUsername) {
        toast({
          title: 'Error',
          description: 'Please enter your username',
          variant: 'destructive',
        });
        return;
      }
      setForgotPasswordStep(2);
    } else if (forgotPasswordStep === 2) {
      if (masterKey === '2580') {
        setForgotPasswordStep(3);
      } else {
        toast({
          title: 'Error',
          description: 'Incorrect master key',
          variant: 'destructive',
        });
      }
    } else if (forgotPasswordStep === 3) {
      handleResetPassword();
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please enter and confirm your new password',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    setResetLoading(true);
    try {
      const success = await resetPassword(forgotUsername, newPassword);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Password has been reset successfully',
        });
        setForgotDialogOpen(false);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to reset password. Username may not exist.',
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
      setResetLoading(false);
    }
  };

  const renderForgotPasswordContent = () => {
    if (forgotPasswordType === 'staff') {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#9b87f5]" />
              Staff Password Reset
            </DialogTitle>
            <DialogDescription>
              Staff members need to contact an administrator to reset their password.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 text-center">
            <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Please contact your administrator for password assistance.
            </p>
          </div>
          <DialogFooter>
            <Button 
              onClick={() => setForgotDialogOpen(false)}
              className="w-full bg-[#9b87f5] hover:bg-[#9b87f5]/80"
            >
              Close
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (forgotPasswordStep === 1) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#9b87f5]" />
              Admin Password Reset
            </DialogTitle>
            <DialogDescription>
              Enter your admin username to begin the password reset process.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="forgotUsername" className="text-sm font-medium">Username</label>
                <Input
                  id="forgotUsername"
                  type="text"
                  placeholder="Enter your username"
                  value={forgotUsername}
                  onChange={(e) => setForgotUsername(e.target.value)}
                  className="bg-background/50 border-[#9b87f5]/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleNextStep} 
              disabled={!forgotUsername}
              className="bg-[#9b87f5] hover:bg-[#9b87f5]/80"
            >
              Next
            </Button>
          </DialogFooter>
        </>
      );
    }

    if (forgotPasswordStep === 2) {
      return (
        <>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield size={16} className="text-[#9b87f5]" />
              Master Key Verification
            </DialogTitle>
            <DialogDescription>
              Enter the master key to verify your identity.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="masterKey" className="text-sm font-medium">Master Key</label>
                <Input
                  id="masterKey"
                  type="password"
                  placeholder="Enter master key"
                  value={masterKey}
                  onChange={(e) => setMasterKey(e.target.value)}
                  className="bg-background/50 border-[#9b87f5]/30"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setForgotDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleNextStep} 
              disabled={!masterKey}
              className="bg-[#9b87f5] hover:bg-[#9b87f5]/80"
            >
              Verify
            </Button>
          </DialogFooter>
        </>
      );
    }

    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock size={16} className="text-[#9b87f5]" />
            Set New Password
          </DialogTitle>
          <DialogDescription>
            Create a new password for your account.
          </DialogDescription>
        </DialogHeader>
        <div className="py-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-background/50 border-[#9b87f5]/30"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-background/50 border-[#9b87f5]/30"
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setForgotDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleResetPassword} 
            disabled={!newPassword || !confirmPassword || resetLoading}
            className="bg-[#9b87f5] hover:bg-[#9b87f5]/80"
          >
            {resetLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center overflow-hidden relative px-4 w-full">
      {/* Enhanced background with deep blue gradient and gaming icons */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Deep blue gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2035] via-[#232a45] to-[#1a2035]"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(155,135,245,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(155,135,245,0.1) 1px, transparent 1px)', 
               backgroundSize: '20px 20px' 
             }}
        ></div>
        
        {/* Subtle gaming icons scattered in the background */}
        <div className="absolute top-[10%] left-[10%] text-[#9b87f5]/10 animate-pulse-soft">
          <Joystick size={40} />
        </div>
        <div className="absolute top-[20%] right-[15%] text-[#33C3F0]/10 animate-pulse-soft" style={{animationDelay: '0.5s'}}>
          <Gamepad size={35} />
        </div>
        <div className="absolute bottom-[30%] left-[20%] text-[#9b87f5]/10 animate-pulse-soft" style={{animationDelay: '1s'}}>
          <Dice1 size={30} />
        </div>
        <div className="absolute bottom-[15%] right-[25%] text-[#33C3F0]/10 animate-pulse-soft" style={{animationDelay: '1.5s'}}>
          <Dice5 size={25} />
        </div>
        <div className="absolute top-[50%] left-[30%] text-[#9b87f5]/10 animate-pulse-soft" style={{animationDelay: '2s'}}>
          <Trophy size={28} />
        </div>
        
        {/* Soft glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-[#9b87f5]/5 blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-1/3 right-1/4 w-40 h-40 rounded-full bg-[#33C3F0]/5 blur-3xl animate-pulse-soft delay-200"></div>
        
        {/* Horizontal light beams */}
        <div className="absolute top-[30%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#9b87f5]/20 to-transparent"></div>
        <div className="absolute top-[70%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#33C3F0]/20 to-transparent"></div>
      </div>
      
      <div className={`w-full max-w-md z-10 ${animationClass}`}>
        <div className="mb-8 text-center">
          <div className="relative mx-auto w-full max-w-[180px] h-auto sm:w-[220px] sm:h-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#9b87f5]/30 to-[#9b87f5]/5 blur-2xl animate-pulse-soft"></div>
            <img 
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
              alt="Cuephoria 8-Ball Club" 
              className="relative w-full h-auto mx-auto logo-float logo-glow"
            />
          </div>
          <h1 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight animate-fade-in text-transparent bg-clip-text bg-gradient-to-r from-[#9b87f5] via-[#D6BCFA] to-[#9b87f5]">
            CUEPHORIA
          </h1>
          <p className="mt-2 text-[#33C3F0] tracking-wider animate-fade-in typing-effect uppercase text-sm sm:text-base">
            ADMINISTRATOR PORTAL
          </p>
        </div>
        
        <Card className="bg-[#1E2538]/90 border border-[#9b87f5]/30 shadow-xl shadow-[#9b87f5]/20 backdrop-blur-lg animate-fade-in delay-100 rounded-xl overflow-hidden neon-glow">
          <CardHeader className="text-center relative z-10 p-4 sm:p-6 pb-0 sm:pb-0">
            <CardTitle className="text-xl sm:text-2xl text-[#9b87f5] font-bold">Game Master Login</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-xs sm:text-sm">Enter your credentials to access the control panel</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 relative z-10 p-4 sm:p-6 pt-4 sm:pt-4">
              <div className="flex justify-center mb-4">
                <Tabs defaultValue="admin" value={loginType} onValueChange={setLoginType} className="w-full max-w-xs">
                  <TabsList className="grid w-full grid-cols-2 bg-[#252A37]/80 border border-[#9b87f5]/20">
                    <TabsTrigger value="admin" className="flex items-center gap-2 rounded-md data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">
                      <Shield size={14} />
                      Admin
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="flex items-center gap-2 rounded-md data-[state=active]:bg-[#9b87f5] data-[state=active]:text-white">
                      <Users size={14} />
                      Staff
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-2 group">
                <label htmlFor="username" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-[#9b87f5]">
                  <User size={14} className="inline-block" />
                  Username
                </label>
                <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-background/30 border-[#9b87f5]/30 focus-visible:ring-[#9b87f5] transition-all duration-300 hover:border-[#9b87f5]/60 placeholder:text-muted-foreground/50 text-sm rounded-lg pl-10"
                  />
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b87f5]/60" />
                </div>
              </div>
              
              <div className="space-y-2 group">
                <label htmlFor="password" className="text-xs sm:text-sm font-medium flex items-center gap-2 text-[#9b87f5]">
                  <ZapIcon size={14} className="inline-block" />
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-background/30 border-[#9b87f5]/30 focus-visible:ring-[#9b87f5] transition-all duration-300 hover:border-[#9b87f5]/60 placeholder:text-muted-foreground/50 text-sm pr-10 pl-10 rounded-lg"
                  />
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b87f5]/60" />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/70 hover:text-[#9b87f5] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Button 
                  type="button" 
                  variant="link" 
                  className="text-[#9b87f5] hover:text-[#9b87f5] p-0 h-auto text-xs"
                  onClick={() => handleForgotPasswordClick(loginType)}
                >
                  Forgot password?
                </Button>
              </div>
            </CardContent>
            
            <CardFooter className="relative z-10 p-4 sm:p-6 pt-0 sm:pt-0">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#6366f1] to-[#9b87f5] text-white font-medium text-sm sm:text-base rounded-lg hover:brightness-110 transition-all" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" variant="futuristic" className="mr-2" />
                    Accessing...
                  </>
                ) : (
                  <>
                    {loginType === 'admin' ? <Shield size={16} /> : <Users size={16} />}
                    <span className="ml-2">{loginType === 'admin' ? 'Admin Login' : 'Staff Login'}</span>
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Footer text - replaced as requested */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 opacity-70">
            <span className="block mb-1 text-[#9b87f5]/60">Designed and Developed by RK</span>
            <span className="block">© 2025 Cuephoria Gaming Systems</span>
          </p>
        </div>
      </div>

      <Dialog open={forgotDialogOpen} onOpenChange={setForgotDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#1E2538]/90 border-[#9b87f5]/40 rounded-xl backdrop-blur-lg neon-glow">
          {renderForgotPasswordContent()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
