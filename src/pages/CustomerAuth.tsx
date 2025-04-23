
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Logo from '@/components/Logo';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2 } from 'lucide-react';

// Form schemas
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Confirm password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;

const CustomerAuth = () => {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/customer/dashboard';
  
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      setIsLoading(true);
      
      // First try to sign in with Supabase Auth
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      
      if (authError) {
        throw authError;
      }
      
      // Check if user exists in customers table
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('email', data.email.toLowerCase())
        .single();
        
      if (customerError || !customerData) {
        // Log out from auth since this isn't a valid customer
        await supabase.auth.signOut();
        throw new Error("No customer account found with this email");
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in",
      });
      
      navigate(from);
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onSignupSubmit = async (data: SignupFormValues) => {
    try {
      setIsLoading(true);
      
      // Check if customer already exists with this email or phone
      const { data: existingCustomer, error: lookupError } = await supabase
        .from('customers')
        .select('id, email, phone')
        .or(`email.eq.${data.email.toLowerCase()},phone.eq.${data.phone}`);
      
      if (lookupError) {
        throw lookupError;
      }
      
      if (existingCustomer && existingCustomer.length > 0) {
        const duplicateField = existingCustomer[0].email?.toLowerCase() === data.email.toLowerCase() 
          ? 'email' 
          : 'phone number';
          
        throw new Error(`A customer with this ${duplicateField} already exists`);
      }
      
      // Create auth account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("Failed to create account");
      }
      
      // Create customer record
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
          auth_user_id: authData.user.id,
          is_member: false,
          loyalty_points: 0,
          total_play_time: 0,
          total_spent: 0
        })
        .select()
        .single();
      
      if (customerError) {
        // Clean up auth user if customer creation fails
        await supabase.auth.signOut();
        throw customerError;
      }
      
      toast({
        title: "Account created!",
        description: "Your account has been successfully created",
      });
      
      navigate('/customer/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        variant: "destructive",
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-cuephoria-dark px-4 py-16">
      <div className="w-full max-w-md mx-auto mb-8 flex flex-col items-center">
        <Logo size="lg" className="mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-center gradient-text mb-2">
          Cuephoria Customer Portal
        </h1>
        <p className="text-muted-foreground text-center max-w-sm">
          Sign in to track your loyalty points, manage bookings, and unlock exclusive rewards
        </p>
      </div>
      
      <Tabs
        defaultValue="login"
        value={authMode}
        onValueChange={(value) => setAuthMode(value as "login" | "signup")}
        className="w-full max-w-md"
      >
        <TabsList className="grid grid-cols-2 w-full mb-6">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        
        <TabsContent value="login">
          <Card className="border-muted">
            <CardHeader>
              <CardTitle>Welcome back</CardTitle>
              <CardDescription>
                Login to access your membership benefits and loyalty rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your.email@example.com"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="••••••••"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        Login
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-muted-foreground text-center w-full">
                Don't have an account yet?{" "}
                <button 
                  className="text-primary hover:underline font-medium"
                  onClick={() => setAuthMode("signup")}
                >
                  Sign up now
                </button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="signup">
          <Card className="border-muted">
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                Join Cuephoria to track your games, earn rewards, and book sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="John Smith" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="your.email@example.com" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="10-digit number" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Create a password" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Confirm your password" 
                            {...field} 
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    className="w-full bg-secondary hover:bg-secondary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <div className="text-sm text-muted-foreground text-center w-full">
                Already have an account?{" "}
                <button 
                  className="text-primary hover:underline font-medium"
                  onClick={() => setAuthMode("login")}
                >
                  Login instead
                </button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerAuth;
