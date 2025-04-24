
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Eye, EyeOff, AlertCircle, Info, CheckCircle, Gift } from 'lucide-react';
import { showErrorToast, showInfoToast } from '@/utils/toast-utils';
import { motion } from 'framer-motion';

interface CustomerSignupProps {
  onSuccessfulSignup: () => void;
  onBackToLogin: () => void;
}

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  resetPin: z.string().length(4, { message: 'PIN must be exactly 4 digits' }).regex(/^\d+$/, { message: 'PIN must contain only digits' }),
  referralCode: z.string().optional(),
});

type SignupFormValues = z.infer<typeof signupSchema>;

const CustomerSignup: React.FC<CustomerSignupProps> = ({ onSuccessfulSignup, onBackToLogin }) => {
  const { signUp, isLoading } = useCustomerAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showReferralField, setShowReferralField] = useState(false);
  
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      resetPin: '',
      referralCode: '',
    },
  });

  const onSubmit = async (values: SignupFormValues) => {
    try {
      const success = await signUp(
        values.email,
        values.password,
        values.name,
        values.phone,
        values.resetPin,
        values.referralCode || undefined
      );

      if (success) {
        onSuccessfulSignup();
      }
    } catch (error) {
      showErrorToast('Signup Failed', 'An error occurred during signup. Please try again.');
      console.error('Signup error:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        ease: [0.43, 0.13, 0.23, 0.96] 
      } 
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.5,
        ease: [0.43, 0.13, 0.23, 0.96] 
      } 
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full"
    >
      <div className="space-y-2 mb-6">
        <h1 className="text-2xl font-bold text-center gradient-text">Create Your Account</h1>
        <p className="text-muted-foreground text-center">Join Cuephoria to track your game stats and earn rewards</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your full name" {...field} className="bg-cuephoria-darker border-cuephoria-lightpurple/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="your.email@example.com" {...field} className="bg-cuephoria-darker border-cuephoria-lightpurple/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="Your phone number" {...field} className="bg-cuephoria-darker border-cuephoria-lightpurple/20" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      {...field}
                      className="bg-cuephoria-darker border-cuephoria-lightpurple/20 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="resetPin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Reset PIN (4 digits)</span>
                  <Info 
                    size={14} 
                    className="text-muted-foreground cursor-help"
                    onClick={() => showInfoToast('Recovery PIN', 'This 4-digit PIN will be used if you need to reset your password.')}
                  />
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="4-digit PIN"
                    maxLength={4}
                    {...field}
                    className="bg-cuephoria-darker border-cuephoria-lightpurple/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showReferralField ? (
            <FormField
              control={form.control}
              name="referralCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center">
                    <Gift size={14} className="mr-1 text-cuephoria-lightpurple" />
                    <span>Referral Code</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter a referral code (optional)"
                      {...field}
                      className="bg-cuephoria-darker border-cuephoria-lightpurple/20"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">Enter a friend's referral code to earn 50 bonus points on your first purchase</p>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : (
            <div className="text-center">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="text-cuephoria-lightpurple hover:text-cuephoria-lightpurple text-sm"
                onClick={() => setShowReferralField(true)}
              >
                <Gift size={14} className="mr-1.5" />
                Have a referral code?
              </Button>
            </div>
          )}

          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Signing Up...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </div>

          <div className="text-center">
            <Button 
              type="button" 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground text-sm"
              onClick={onBackToLogin}
            >
              Already have an account? Sign In
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  );
};

export default CustomerSignup;
