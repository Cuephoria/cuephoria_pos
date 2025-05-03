import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { motion } from 'framer-motion';
import { Bell, Moon, Key, Lock, LogOut, Shield, Eye, EyeOff } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

const CustomerSettings: React.FC = () => {
  const { customerUser, signOut, updatePassword } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean>(false);
  
  // Password change states
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  
  useEffect(() => {
    // Simulating loading settings
    setTimeout(() => {
      setIsLoading(false);
    }, 600);
  }, []);

  const handleToggleNotifications = (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    toast({
      title: enabled ? "Notifications enabled" : "Notifications disabled",
      description: enabled ? "You will now receive notifications" : "You have disabled notifications",
    });
  };

  const handleToggleDarkMode = (enabled: boolean) => {
    setDarkModeEnabled(enabled);
    toast({
      title: enabled ? "Dark mode enabled" : "Dark mode disabled",
      description: enabled ? "Dark mode applied" : "Light mode applied",
    });
  };

  const handleToggleTwoFactor = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    
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
  };

  const handleLogout = async () => {
    await signOut();
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Error',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'New password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }
    
    setIsChangingPassword(true);
    
    try {
      const success = await updatePassword(currentPassword, newPassword);
      
      if (success) {
        setIsPasswordDialogOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setIsChangingPassword(false);
    }
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
          <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 overflow-hidden">
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
                  checked={notificationsEnabled}
                  onCheckedChange={handleToggleNotifications}
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
                  checked={false}
                  disabled={!notificationsEnabled}
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
                  disabled={!notificationsEnabled}
                />
              </div>
            </CardContent>
          </Card>
          
          <motion.div variants={itemVariants}>
            <Card className="bg-gradient-to-br from-cuephoria-darker/70 to-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 overflow-hidden">
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
                    checked={darkModeEnabled}
                    onCheckedChange={handleToggleDarkMode}
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
                    checked={twoFactorEnabled}
                    onCheckedChange={handleToggleTwoFactor}
                  />
                </div>

                <Separator className="my-4 bg-gray-800" />
                
                <div className="space-y-4">
                  <div>
                    <Button 
                      variant="outline" 
                      className="border-cuephoria-blue/30 hover:border-cuephoria-blue/50 text-cuephoria-blue hover:bg-cuephoria-blue/10 w-full flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <Key className="h-4 w-4 mr-2" /> 
                        <span>Change Security PIN</span>
                      </div>
                      <span className="text-xs text-gray-500">Last changed: Never</span>
                    </Button>
                  </div>
                  
                  <div>
                    <Button 
                      variant="outline" 
                      className="border-cuephoria-lightpurple/30 hover:border-cuephoria-lightpurple/50 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10 w-full flex justify-between items-center"
                      onClick={() => setIsPasswordDialogOpen(true)}
                    >
                      <div className="flex items-center">
                        <Lock className="h-4 w-4 mr-2" /> 
                        <span>Change Password</span>
                      </div>
                      <span className="text-xs text-gray-500">Secure your account</span>
                    </Button>
                  </div>
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
      
      {/* Password Change Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-cuephoria-lightpurple" /> Change Password
            </DialogTitle>
            <DialogDescription>
              Update your password to keep your account secure
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-cuephoria-dark/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-cuephoria-dark/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-cuephoria-dark/50 border-cuephoria-lightpurple/30 focus-visible:ring-cuephoria-lightpurple"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePassword}
              className="bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange hover:from-cuephoria-lightpurple/90 hover:to-cuephoria-orange/90"
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <><LoadingSpinner size="sm" /> Updating...</>
              ) : (
                'Update Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CustomerSettings;
