
import React, { useState } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 characters' }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: 'Current password is required' }),
  newPassword: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password is required' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const CustomerProfile: React.FC = () => {
  const { user, refreshUser } = useCustomerAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user?.id) return;
    
    setIsUpdating(true);
    try {
      // Check for duplicate email/phone
      const { data: existingCustomers, error: lookupError } = await supabase
        .from('customers')
        .select('id, email, phone')
        .or(`email.eq.${data.email.toLowerCase()},phone.eq.${data.phone}`)
        .neq('id', user.id);
        
      if (lookupError) throw lookupError;
      
      if (existingCustomers && existingCustomers.length > 0) {
        const duplicate = existingCustomers[0];
        const duplicateField = duplicate.email?.toLowerCase() === data.email.toLowerCase() 
          ? 'email' 
          : 'phone number';
          
        throw new Error(`Another account already exists with this ${duplicateField}`);
      }
      
      // Update customer record
      const { error } = await supabase
        .from('customers')
        .update({
          name: data.name,
          email: data.email.toLowerCase(),
          phone: data.phone,
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update auth record if email changed
      if (user.email !== data.email && user.authUserId) {
        const { error: authUpdateError } = await supabase.auth.updateUser({
          email: data.email,
        });
        
        if (authUpdateError) throw authUpdateError;
      }
      
      await refreshUser();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully",
      });
      
      passwordForm.reset({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password update error:', error);
      toast({
        variant: "destructive",
        title: "Password update failed",
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account security
          </p>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Profile Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="text-2xl">
                    {user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap gap-2 justify-center">
                  {user?.isMember && (
                    <Badge variant="default">
                      Member
                    </Badge>
                  )}
                  <Badge variant="outline" className="indian-rupee">
                    {user?.totalSpent?.toFixed(2) || '0.00'} spent
                  </Badge>
                  <Badge variant="secondary">
                    {user?.loyaltyPoints || 0} points
                  </Badge>
                </div>
                
                <div className="mt-6 border-t border-border pt-4 w-full">
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Member since</dt>
                      <dd>{user?.createdAt?.toLocaleDateString('en-IN') || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Phone</dt>
                      <dd>{user?.phone || 'N/A'}</dd>
                    </div>
                    {user?.isMember && user?.membershipExpiryDate && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Membership expires</dt>
                        <dd>{user.membershipExpiryDate.toLocaleDateString('en-IN')}</dd>
                      </div>
                    )}
                    {user?.referralCode && (
                      <div className="flex justify-between">
                        <dt className="text-muted-foreground">Referral code</dt>
                        <dd className="font-mono">{user.referralCode}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex-1">
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="info">Personal Info</TabsTrigger>
                <TabsTrigger value="security">Password & Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info">
                <Card>
                  <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>
                      Update your personal details
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your name"
                                  {...field}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Email address"
                                  type="email"
                                  {...field}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                              <FormDescription>
                                This will be used for login and communications
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your phone number"
                                  {...field}
                                  disabled={isUpdating}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="submit"
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating
                            </>
                          ) : "Save Changes"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                    <CardDescription>
                      Change your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter current password"
                                  type="password"
                                  {...field}
                                  disabled={isUpdatingPassword}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter new password"
                                  type="password"
                                  {...field}
                                  disabled={isUpdatingPassword}
                                />
                              </FormControl>
                              <FormDescription>
                                Password must be at least 6 characters
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Confirm new password"
                                  type="password"
                                  {...field}
                                  disabled={isUpdatingPassword}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="submit"
                          disabled={isUpdatingPassword}
                          variant="default"
                        >
                          {isUpdatingPassword ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating Password
                            </>
                          ) : "Change Password"}
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfile;
