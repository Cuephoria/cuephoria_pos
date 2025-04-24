
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Settings, Bell, Shield, LogOut, Trash, Mail, Lock } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { showSuccessToast } from '@/utils/toast-utils';
import CustomerLayout from '@/components/CustomerLayout';

const CustomerSettings = () => {
  const { logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Setting states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [promotionalEmails, setPromotionalEmails] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [saveSession, setSaveSession] = useState(true);
  
  const handleLogout = async () => {
    await logout();
    navigate('/customer');
  };
  
  const handleSaveSettings = () => {
    showSuccessToast("Settings Saved", "Your settings have been updated successfully");
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-cuephoria-lightpurple to-accent bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="outline"
              className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
              onClick={() => navigate('/customer/dashboard')}
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 p-1">
            <TabsTrigger 
              value="general" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              General
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Notifications
            </TabsTrigger>
            <TabsTrigger 
              value="privacy" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Privacy & Security
            </TabsTrigger>
            <TabsTrigger 
              value="account" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Account
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Settings size={18} className="text-cuephoria-lightpurple" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">Use dark theme for the application</p>
                    </div>
                    <Switch 
                      checked={darkMode} 
                      onCheckedChange={setDarkMode} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <Separator className="bg-cuephoria-lightpurple/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Save Session</Label>
                      <p className="text-sm text-muted-foreground">Remember login session for 30 days</p>
                    </div>
                    <Switch 
                      checked={saveSession} 
                      onCheckedChange={setSaveSession} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <Separator className="bg-cuephoria-lightpurple/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Language</Label>
                      <p className="text-sm text-muted-foreground">Select your preferred language</p>
                    </div>
                    <Badge className="bg-cuephoria-lightpurple">English</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-cuephoria-lightpurple/10 p-4">
                <Button 
                  className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 ml-auto"
                  onClick={handleSaveSettings}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Bell size={18} className="text-cuephoria-lightpurple" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Customize how you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch 
                      checked={emailNotifications} 
                      onCheckedChange={setEmailNotifications} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <Separator className="bg-cuephoria-lightpurple/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                    </div>
                    <Switch 
                      checked={smsNotifications} 
                      onCheckedChange={setSmsNotifications} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <Separator className="bg-cuephoria-lightpurple/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Promotional Emails</Label>
                      <p className="text-sm text-muted-foreground">Receive promotional offers and updates</p>
                    </div>
                    <Switch 
                      checked={promotionalEmails} 
                      onCheckedChange={setPromotionalEmails} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-cuephoria-lightpurple/10 p-4">
                <p className="text-sm text-muted-foreground mr-auto">
                  You can change these settings at any time
                </p>
                <Button 
                  className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                  onClick={handleSaveSettings}
                >
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Mail size={18} className="text-cuephoria-lightpurple" />
                  Email Preferences
                </CardTitle>
                <CardDescription>
                  Choose what types of emails you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Game Session Reminders</Label>
                      <p className="text-sm text-muted-foreground">Reminders about your upcoming sessions</p>
                    </div>
                    <Switch 
                      checked={true} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Loyalty Points Updates</Label>
                      <p className="text-sm text-muted-foreground">Updates about your loyalty points balance</p>
                    </div>
                    <Switch 
                      checked={true} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Newsletter</Label>
                      <p className="text-sm text-muted-foreground">Monthly newsletter with game tips and updates</p>
                    </div>
                    <Switch 
                      checked={false} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield size={18} className="text-cuephoria-lightpurple" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Manage your privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Allow other members to see your profile</p>
                    </div>
                    <Switch 
                      checked={true} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <Separator className="bg-cuephoria-lightpurple/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Game History Visibility</Label>
                      <p className="text-sm text-muted-foreground">Show your game history to other members</p>
                    </div>
                    <Switch 
                      checked={true} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                  
                  <Separator className="bg-cuephoria-lightpurple/20" />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">Allow anonymous data collection to improve services</p>
                    </div>
                    <Switch 
                      checked={true} 
                      className="data-[state=checked]:bg-cuephoria-lightpurple"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-cuephoria-lightpurple/10 p-4">
                <Button 
                  className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 ml-auto"
                  onClick={handleSaveSettings}
                >
                  Save Privacy Settings
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Lock size={18} className="text-cuephoria-lightpurple" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-500">Coming Soon</Badge>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/20 mt-4">
                    <p className="text-sm mb-2">Password Security</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2/3 bg-cuephoria-darker rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-4/5"></div>
                      </div>
                      <span className="text-xs text-green-500">Strong</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your password was last changed 30 days ago
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <LogOut size={18} className="text-cuephoria-lightpurple" />
                  Account Actions
                </CardTitle>
                <CardDescription>
                  Manage your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full border-cuephoria-lightpurple/30 text-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/10"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </Button>
                  
                  <Separator className="bg-cuephoria-lightpurple/20" />
                  
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
                    <h4 className="font-medium text-red-400 flex items-center gap-2">
                      <Trash size={16} />
                      Delete Account
                    </h4>
                    <p className="text-sm text-muted-foreground mt-2">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button 
                      variant="destructive" 
                      className="mt-4"
                      onClick={() => setIsDeleteDialogOpen(true)}
                    >
                      Delete Account
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield size={18} className="text-cuephoria-lightpurple" />
                  Data & Privacy
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/20">
                    <h4 className="font-medium">Download Your Data</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Get a copy of all your personal data stored in our system
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-3 border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                    >
                      Request Data Export
                    </Button>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/20">
                    <h4 className="font-medium">Privacy Policy</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Read our privacy policy to understand how we handle your data
                    </p>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-cuephoria-lightpurple mt-1"
                    >
                      View Privacy Policy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="bg-cuephoria-darker border border-red-500/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-400">Delete Account</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple">Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white">Delete Account</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
          <p className="mt-1 text-xs">Designed and developed by RK</p>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerSettings;
