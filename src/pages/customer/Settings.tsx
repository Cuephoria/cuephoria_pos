
import React, { useState } from 'react';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Settings,
  Bell,
  Mail,
  Calendar,
  LogOut,
  Trash2,
  Key,
  User,
  Users,
  Smartphone,
} from 'lucide-react';

const CustomerSettings: React.FC = () => {
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [settings, setSettings] = useState({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    calendarSync: true,
    soundEffects: true,
    sharePlayStats: true,
    showReferralCode: true,
  });
  
  const handleSettingChange = (key: keyof typeof settings) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
    
    toast({
      title: "Setting updated",
      description: "Your preferences have been saved",
    });
  };
  
  const handleLogout = async () => {
    await logout();
    navigate('/customer/login');
  };
  
  const handleDeleteAccount = async () => {
    // In production, this would call an API to delete the account
    toast({
      title: "Account deletion requested",
      description: "An administrator will review your request.",
    });
    
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account preferences and settings
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control how and when you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={() => handleSettingChange('emailNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="push-notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                Push Notifications
              </Label>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={() => handleSettingChange('pushNotifications')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                SMS Notifications
              </Label>
              <Switch
                id="sms-notifications"
                checked={settings.smsNotifications}
                onCheckedChange={() => handleSettingChange('smsNotifications')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Application Settings
            </CardTitle>
            <CardDescription>
              Customize your app experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="dark-mode" className="flex flex-col">
                <span>Dark Mode</span>
                <span className="text-sm text-muted-foreground">
                  Use dark theme for the application
                </span>
              </Label>
              <Switch
                id="dark-mode"
                checked={settings.darkMode}
                onCheckedChange={() => handleSettingChange('darkMode')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="calendar-sync" className="flex flex-col">
                <span className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  Calendar Sync
                </span>
                <span className="text-sm text-muted-foreground">
                  Add bookings to your calendar automatically
                </span>
              </Label>
              <Switch
                id="calendar-sync"
                checked={settings.calendarSync}
                onCheckedChange={() => handleSettingChange('calendarSync')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-effects" className="flex flex-col">
                <span>Sound Effects</span>
                <span className="text-sm text-muted-foreground">
                  Play sound when receiving notifications
                </span>
              </Label>
              <Switch
                id="sound-effects"
                checked={settings.soundEffects}
                onCheckedChange={() => handleSettingChange('soundEffects')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control your data and privacy preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="share-play-stats" className="flex flex-col">
                <span className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Share Play Stats
                </span>
                <span className="text-sm text-muted-foreground">
                  Allow your play stats to appear in leaderboards
                </span>
              </Label>
              <Switch
                id="share-play-stats"
                checked={settings.sharePlayStats}
                onCheckedChange={() => handleSettingChange('sharePlayStats')}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="show-referral-code" className="flex flex-col">
                <span>Show Referral Code</span>
                <span className="text-sm text-muted-foreground">
                  Allow friends to see your referral code
                </span>
              </Label>
              <Switch
                id="show-referral-code"
                checked={settings.showReferralCode}
                onCheckedChange={() => handleSettingChange('showReferralCode')}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Key className="h-5 w-5" />
              Account Actions
            </CardTitle>
            <CardDescription>
              Security and account management options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Log out from this device
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
            
            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-destructive">Delete Account</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAccount}>
                        Yes, delete my account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-border text-sm text-muted-foreground">
            <p>
              Need help? Contact support at support@cuephoria.com
            </p>
          </CardFooter>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerSettings;
