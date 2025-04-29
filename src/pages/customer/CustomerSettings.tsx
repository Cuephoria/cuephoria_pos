import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { Bell, Moon, Key, Lock, LogOut, Shield, User, Check, ArrowRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Type definitions
interface CustomerSettingsData {
  darkMode: boolean;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  twoFactorEnabled: boolean;
  lastPasswordChange: Date | null;
  lastPinChange: Date | null;
}

const pinSchema = z.object({
  pin: z
    .string()
    .length(4, { message: "PIN must be 4 digits" })
    .regex(/^\d+$/, { message: "PIN must contain only numbers" }),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const CustomerSettings: React.FC = () => {
  const { customerUser, signOut } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [pinDialogOpen, setPinDialogOpen] = useState<boolean>(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState<boolean>(false);
  
  const [settings, setSettings] = useState<CustomerSettingsData>({
    notificationsEnabled: false,
    darkMode: true,
    emailNotifications: false,
    twoFactorEnabled: false,
    lastPasswordChange: null,
    lastPinChange: null
  });

  // Pin form
  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: "",
    },
  });
  
  // Password form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    },
  });

  useEffect(() => {
    // Load settings from local storage or API
    const loadSettings = async () => {
      try {
        // For demo purposes, we're simulating loading from localStorage
        // In a real app, this would be loaded from the database
        const settingsStr = localStorage.getItem('customerSettings');
        const savedSettings = settingsStr ? JSON.parse(settingsStr) : null;
        
        if (savedSettings) {
          setSettings({
            ...settings,
            ...savedSettings,
          });
        }
        
        // Load security data
        if (customerUser?.customerId) {
          const { data, error } = await supabase
            .from('customer_users')
            .select('pin')
            .eq('customer_id', customerUser.customerId)
            .single();
            
          if (!error && data) {
            const hasTwoFactor = localStorage.getItem('twoFactorEnabled') === 'true';
            const lastPasswordChangeStr = localStorage.getItem('lastPasswordChange');
            const lastPinChangeStr = localStorage.getItem('lastPinChange');
            
            setSettings(prev => ({
              ...prev,
              twoFactorEnabled: hasTwoFactor || false,
              lastPasswordChange: lastPasswordChangeStr ? new Date(lastPasswordChangeStr) : null,
              lastPinChange: lastPinChangeStr ? new Date(lastPinChangeStr) : null
            }));
          }
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [customerUser?.customerId]);

  const handleToggleNotifications = async (enabled: boolean) => {
    try {
      setSaveLoading(true);
      
      // In a real app, this would be saved to the database
      setSettings(prev => ({...prev, notificationsEnabled: enabled}));
      
      // Save to localStorage for demo
      localStorage.setItem('customerSettings', JSON.stringify({
        ...settings,
        notificationsEnabled: enabled
      }));
      
      toast({
        title: enabled ? "Notifications enabled" : "Notifications disabled",
        description: enabled ? "You will now receive notifications" : "You have disabled notifications",
      });
    } catch (err) {
      toast({
        title: "Error saving setting",
        description: "Could not save notification preferences",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleDarkMode = async (enabled: boolean) => {
    try {
      setSaveLoading(true);
      
      // In a real app, this would be saved to the database
      setSettings(prev => ({...prev, darkMode: enabled}));
      
      // Save to localStorage for demo
      localStorage.setItem('customerSettings', JSON.stringify({
        ...settings,
        darkMode: enabled
      }));
      
      toast({
        title: enabled ? "Dark mode enabled" : "Dark mode disabled",
        description: enabled ? "Dark mode applied" : "Light mode applied",
      });
    } catch (err) {
      toast({
        title: "Error saving setting",
        description: "Could not save display preferences",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleTwoFactor = async (enabled: boolean) => {
    try {
      setSaveLoading(true);
      
      // In a real app, this would update the database
      setSettings(prev => ({...prev, twoFactorEnabled: enabled}));
      
      // For demo, just save to localStorage
      localStorage.setItem('customerSettings', JSON.stringify({
        ...settings,
        twoFactorEnabled: enabled
      }));
      
      // Store 2FA status separately for the security data loading
      localStorage.setItem('twoFactorEnabled', enabled.toString());
      
      if (enabled) {
        toast({
          title: "Two-factor authentication enabled",
          description: "Your account is now more secure",
        });
      } else {
        toast({
          title: "Two-factor authentication disabled",
          description: "Consider enabling for better security",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error saving setting",
        description: "Could not update two-factor authentication",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleToggleEmailNotifications = async (enabled: boolean) => {
    try {
      setSaveLoading(true);
      
      // In a real app, this would be saved to the database
      setSettings(prev => ({...prev, emailNotifications: enabled}));
      
      // Save to localStorage for demo
      localStorage.setItem('customerSettings', JSON.stringify({
        ...settings,
        emailNotifications: enabled
      }));
      
      toast({
        title: enabled ? "Email notifications enabled" : "Email notifications disabled",
        description: enabled ? "You will now receive email notifications" : "You have disabled email notifications",
      });
    } catch (err) {
      toast({
        title: "Error saving setting",
        description: "Could not save notification preferences",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
  };
  
  const onPinSubmit = async (data: z.infer<typeof pinSchema>) => {
    try {
      setSaveLoading(true);
      
      // In a real app, this would be saved to the database with proper hashing
      // For demo, we'll just save that the user has set a PIN
      
      if (customerUser?.customerId) {
        const now = new Date().toISOString();
        
        try {
          const { error } = await supabase
            .from('customer_users')
            .update({
              pin: data.pin // In a real app, this should be hashed!
            })
            .eq('customer_id', customerUser.customerId);
          
          if (error) {
            throw new Error(error.message);
          }
          
          // Save the pin change timestamp in localStorage
          localStorage.setItem('lastPinChange', now);
          
          // Update local state
          setSettings(prev => ({
            ...prev,
            lastPinChange: new Date()
          }));
        } catch (e) {
          console.error("Error updating PIN:", e);
          throw e;
        }
      }
      
      toast({
        title: "PIN updated",
        description: "Your security PIN has been successfully updated",
      });
      
      setPinDialogOpen(false);
      pinForm.reset();
    } catch (err) {
      console.error("Error updating PIN:", err);
      toast({
        title: "Error updating PIN",
        description: "Could not update your security PIN",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };
  
  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      setSaveLoading(true);
      
      // In a real app, we'd use Supabase Auth to change the password
      // For demo purposes, we'll simulate success
      
      if (customerUser?.customerId) {
        try {
          const { error } = await supabase.auth.updateUser({
            password: data.newPassword
          });
          
          if (error) throw error;
          
          // Store password change timestamp
          const now = new Date();
          localStorage.setItem('lastPasswordChange', now.toISOString());
          
          // Update local state
          setSettings(prev => ({
            ...prev,
            lastPasswordChange: now
          }));
        } catch (error) {
          console.error("Password update error:", error);
          throw new Error("Failed to update password");
        }
      }
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully changed",
      });
      
      setPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (err) {
      console.error("Error updating password:", err);
      toast({
        title: "Error updating password",
        description: "Could not update your password. Please ensure your current password is correct.",
        variant: "destructive"
      });
    } finally {
      setSaveLoading(false);
    }
  };
  
  // Format date nicely
  const formatDate = (date: Date | null): string => {
    if (!date) return "Never";
    
    return new Date(date).toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="mb-6" variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your preferences and account settings
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div className="md:col-span-2" variants={itemVariants}>
          <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 overflow-hidden mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-cuephoria-lightpurple" />
                Notification Settings
              </CardTitle>
              <CardDescription>Control how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="enable-notifications" className="font-medium">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified about important events</p>
                </div>
                <Switch 
                  id="enable-notifications"
                  checked={settings.notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
                  disabled={saveLoading}
                />
              </div>

              <Separator className="my-4 bg-gray-800" />
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="promotional-emails" className="font-medium">Promotional Emails</Label>
                  <p className="text-sm text-muted-foreground">Receive emails about promotions and events</p>
                </div>
                <Switch 
                  id="promotional-emails"
                  checked={settings.emailNotifications}
                  onCheckedChange={handleToggleEmailNotifications}
                  disabled={!settings.notificationsEnabled || saveLoading}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="point-notifications" className="font-medium">Points Updates</Label>
                  <p className="text-sm text-muted-foreground">Get notified when you earn or spend points</p>
                </div>
                <Switch 
                  id="point-notifications"
                  checked={true}
                  disabled={!settings.notificationsEnabled || saveLoading}
                />
              </div>
            </CardContent>
          </Card>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 overflow-hidden mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-cuephoria-orange" />
                  Display Settings
                </CardTitle>
                <CardDescription>Customize how the app looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable-dark-mode" className="font-medium">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle between dark and light theme</p>
                  </div>
                  <Switch 
                    id="enable-dark-mode"
                    checked={settings.darkMode}
                    onCheckedChange={handleToggleDarkMode}
                    disabled={saveLoading}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-cuephoria-blue" />
                  Security Settings
                </CardTitle>
                <CardDescription>Manage account security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="enable-2fa" className="font-medium">Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch 
                    id="enable-2fa"
                    checked={settings.twoFactorEnabled}
                    onCheckedChange={handleToggleTwoFactor}
                    disabled={saveLoading}
                  />
                </div>

                <Separator className="my-4 bg-gray-800" />
                
                <div className="space-y-4">
                  <Dialog open={pinDialogOpen} onOpenChange={setPinDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-cuephoria-blue/30 hover:border-cuephoria-blue/50 text-cuephoria-blue hover:bg-cuephoria-blue/10 w-full flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <Key className="h-4 w-4 mr-2" /> 
                          <span>Change Security PIN</span>
                        </div>
                        <span className="text-xs text-gray-500">Last changed: {formatDate(settings.lastPinChange)}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-cuephoria-darker border-cuephoria-blue/30">
                      <DialogHeader>
                        <DialogTitle>Set Security PIN</DialogTitle>
                        <DialogDescription>
                          Create a 4-digit security PIN for additional account protection
                        </DialogDescription>
                      </DialogHeader>
                      
                      <Form {...pinForm}>
                        <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-6">
                          <FormField
                            control={pinForm.control}
                            name="pin"
                            render={({ field }) => (
                              <FormItem className="mx-auto flex flex-col items-center">
                                <FormLabel>Enter 4-digit PIN</FormLabel>
                                <FormControl>
                                  <InputOTP maxLength={4} {...field}>
                                    <InputOTPGroup>
                                      <InputOTPSlot index={0} />
                                      <InputOTPSlot index={1} />
                                      <InputOTPSlot index={2} />
                                      <InputOTPSlot index={3} />
                                    </InputOTPGroup>
                                  </InputOTP>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setPinDialogOpen(false)}
                              className="border-gray-600"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-cuephoria-blue hover:bg-cuephoria-blue/90"
                              disabled={saveLoading}
                            >
                              {saveLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                              Save PIN
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="border-cuephoria-lightpurple/30 hover:border-cuephoria-lightpurple/50 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10 w-full flex justify-between items-center"
                      >
                        <div className="flex items-center">
                          <Lock className="h-4 w-4 mr-2" /> 
                          <span>Change Password</span>
                        </div>
                        <span className="text-xs text-gray-500">Last changed: {formatDate(settings.lastPasswordChange)}</span>
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogDescription>
                          Update your account password
                        </DialogDescription>
                      </DialogHeader>
                      
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
                                    type="password" 
                                    placeholder="Enter current password" 
                                    {...field} 
                                    className="bg-cuephoria-dark border-gray-700"
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
                                    type="password" 
                                    placeholder="Enter new password" 
                                    {...field} 
                                    className="bg-cuephoria-dark border-gray-700"
                                  />
                                </FormControl>
                                <FormDescription className="text-gray-400 text-xs">
                                  Password must be at least 8 characters
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
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="password" 
                                    placeholder="Confirm new password" 
                                    {...field} 
                                    className="bg-cuephoria-dark border-gray-700"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <DialogFooter>
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setPasswordDialogOpen(false)}
                              className="border-gray-600"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              className="bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90"
                              disabled={saveLoading}
                            >
                              {saveLoading ? <LoadingSpinner size="sm" className="mr-2" /> : <Check className="mr-2 h-4 w-4" />}
                              Update Password
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        <motion.div className="md:col-span-1" variants={itemVariants}>
          <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-orange/20 shadow-inner shadow-cuephoria-orange/5 overflow-hidden sticky top-6">
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Manage your account preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-cuephoria-dark/50 to-cuephoria-darker rounded-lg border border-cuephoria-lightpurple/20">
                <p className="text-sm text-muted-foreground mb-2">Signed in as:</p>
                <p className="font-medium text-white">{customerUser?.email}</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <Button 
                  variant="outline" 
                  className="border-cuephoria-orange/30 hover:border-cuephoria-orange/50 text-cuephoria-orange hover:bg-cuephoria-orange/10 flex justify-between items-center"
                  onClick={() => window.location.href = "/customer/profile"}
                >
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" /> 
                    <span>Edit Profile</span>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="border-cuephoria-orange/30 hover:border-cuephoria-orange/50 text-cuephoria-orange hover:bg-cuephoria-orange/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> 
                  <span>Sign Out</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CustomerSettings;
