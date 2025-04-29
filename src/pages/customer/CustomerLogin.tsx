import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, UserRound, KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoading: authLoading, user } = useCustomerAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  
  // Check for email_confirmed=true in the URL params which indicates coming from a successful email verification
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailConfirmed = params.get('email_confirmed');
    
    if (emailConfirmed === 'true') {
      navigate('/customer/signup-success');
    }
    
    // Check for 'from' param in location state to set initial email
    if (location.state && location.state.email) {
      setEmail(location.state.email);
      setShowReferralInput(true);
    }
  }, [location, navigate]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from || '/customer/dashboard';
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const success = await signIn(email, password);
      
      if (!success) {
        // The error message will be shown by the signIn function
      } else {
        // Handle referral code if provided
        if (referralCode) {
          try {
            await applyReferralCode(referralCode, email);
          } catch (err) {
            console.error("Error applying referral code:", err);
            // Continue with login even if referral code application fails
          }
        }
          
        // Redirect to dashboard or the page user came from
        const from = location.state?.from || '/customer/dashboard';
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to apply referral code
  const applyReferralCode = async (code: string, userEmail: string) => {
    // Get customer ID for the user who just logged in
    const { data: userData, error: userError } = await supabase
      .from('customer_users')
      .select('customer_id')
      .eq('email', userEmail)
      .single();
      
    if (userError || !userData) {
      console.error("Error finding customer:", userError);
      return;
    }
    
    // Find the referrer using the code
    const { data: referrerData, error: referrerError } = await supabase
      .from('customer_users')
      .select('customer_id')
      .eq('referral_code', code)
      .single();
      
    if (referrerError || !referrerData) {
      console.error("Invalid referral code:", referrerError);
      return;
    }
    
    // Check if this referral has already been applied
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referrer_id', referrerData.customer_id)
      .eq('referred_email', userEmail)
      .maybeSingle();
      
    if (existingReferral) {
      // Referral already exists
      return;
    }
    
    // Create the referral record
    await supabase
      .from('referrals')
      .insert({
        referrer_id: referrerData.customer_id,
        referred_email: userEmail,
        points_awarded: 100,
        status: 'completed'
      });
      
    // Award points to referrer
    try {
      await supabase.rpc('award_referral_points', {
        customer_identifier: referrerData.customer_id,
        points_to_award: 100
      });
    } catch (error) {
      console.error("Error awarding points to referrer:", error);
    }
    
    // Award points to the referred customer
    try {
      await supabase.rpc('award_referral_points', {
        customer_identifier: userData.customer_id,
        points_to_award: 50
      });
    } catch (error) {
      console.error("Error awarding points to referred customer:", error);
    }
    
    toast({
      title: "Referral bonus applied!",
      description: "You've earned 50 loyalty points from the referral.",
    });
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
          Customer Login
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
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Access your Cuephoria account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
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
                    <UserRound className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/customer/reset-password" className="text-xs text-cuephoria-lightpurple hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-cuephoria-dark border-cuephoria-lightpurple/20"
                      disabled={isLoading || authLoading}
                      required
                      autoComplete="current-password"
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
                  {isLoading || authLoading ? "Signing in..." : "Sign In"}
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
                Don't have an account?{" "}
                <Link to="/customer/register" className="text-cuephoria-lightpurple hover:underline">
                  Sign up
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

export default CustomerLogin;
