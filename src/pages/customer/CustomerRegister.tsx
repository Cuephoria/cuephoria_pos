import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserRound, KeyRound, Mail, User } from 'lucide-react';
import { motion } from 'framer-motion';

const CustomerRegister = () => {
  const navigate = useNavigate();
  const { signUp, isLoading: authLoading } = useCustomerAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showReferralInput, setShowReferralInput] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !confirmPassword) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords match.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signUp(email, password, name, '', '1234', referralCode);
      
      if (!success) {
        // Error will be shown by the signUp function
      } else {
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
        });
        // Direct to login with email pre-filled
        navigate('/customer/login', { state: { email } });
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-cuephoria-darker to-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(93,107,255,0.15)_0%,_transparent_70%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col items-center"
      >
        <Link to="/" className="mb-2">
          <img 
            src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
            alt="Cuephoria" 
            className="w-16 h-16"
          />
        </Link>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          Create Account
        </h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md"
      >
        <Card className="border-cuephoria-lightpurple/20 bg-gradient-to-br from-cuephoria-darker/90 to-cuephoria-darker/70">
          <CardHeader>
            <CardTitle>Sign Up</CardTitle>
            <CardDescription>Create your Cuephoria customer account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 bg-cuephoria-dark border-cuephoria-lightpurple/20"
                      disabled={isLoading || authLoading}
                      required
                      autoComplete="name"
                    />
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-cuephoria-dark border-cuephoria-lightpurple/20"
                      disabled={isLoading || authLoading}
                      required
                      autoComplete="email"
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-cuephoria-dark border-cuephoria-lightpurple/20"
                      disabled={isLoading || authLoading}
                      required
                      autoComplete="new-password"
                    />
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-10 pr-10 bg-cuephoria-dark border-cuephoria-lightpurple/20"
                      disabled={isLoading || authLoading}
                      required
                      autoComplete="new-password"
                    />
                    <KeyRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-300"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                
                {showReferralInput && (
                  <div className="grid gap-2">
                    <Label htmlFor="referral">Referral Code (Optional)</Label>
                    <Input
                      id="referral"
                      placeholder="Enter referral code if you have one"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value)}
                      className="bg-cuephoria-dark border-cuephoria-lightpurple/20"
                      disabled={isLoading || authLoading}
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90"
                  disabled={isLoading || authLoading}
                >
                  {isLoading || authLoading ? "Creating account..." : "Create Account"}
                </Button>
                
                {!showReferralInput && (
                  <Button 
                    type="button" 
                    variant="link" 
                    className="text-cuephoria-lightpurple w-full"
                    onClick={() => setShowReferralInput(true)}
                  >
                    Have a referral code?
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col">
            <Separator className="mb-4 bg-gray-700" />
            <div className="text-center w-full">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/customer/login" className="text-cuephoria-lightpurple hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Link to="/" className="text-sm text-gray-400 hover:text-white flex items-center">
          ← Back to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default CustomerRegister;
