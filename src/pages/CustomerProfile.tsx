
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Phone, Key, Eye, EyeOff, Save, Shield, AlertTriangle } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { showSuccessToast, showErrorToast } from '@/utils/toast-utils';
import CustomerLayout from '@/components/CustomerLayout';

const CustomerProfile = () => {
  const { user, isLoading, refreshProfile } = useCustomerAuth();
  const navigate = useNavigate();

  // Profile form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('••••••••');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
        </div>
      </CustomerLayout>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsUpdating(true);
    
    // Simulate API call to update profile
    setTimeout(() => {
      showSuccessToast("Profile Updated", "Your profile information has been updated successfully");
      setIsUpdating(false);
    }, 1500);
  };

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-cuephoria-lightpurple to-accent bg-clip-text text-transparent">
              Your Profile
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and account settings
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

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 p-1">
            <TabsTrigger 
              value="personal" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Personal Information
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Security
            </TabsTrigger>
            <TabsTrigger 
              value="preferences" 
              className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black"
            >
              Preferences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User size={18} className="text-cuephoria-lightpurple" />
                  Personal Information
                </CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm flex items-center gap-2">
                        <User size={14} className="text-cuephoria-lightpurple" /> 
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-background/50 border-cuephoria-lightpurple/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm flex items-center gap-2">
                        <Mail size={14} className="text-cuephoria-lightpurple" /> 
                        Email
                      </Label>
                      <Input
                        id="email"
                        placeholder="Your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-background/50 border-cuephoria-lightpurple/30"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm flex items-center gap-2">
                        <Phone size={14} className="text-cuephoria-lightpurple" /> 
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        placeholder="Your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-background/50 border-cuephoria-lightpurple/30"
                      />
                    </div>
                    
                    <div className="space-y-2 sm:col-span-2">
                      <Button 
                        type="submit"
                        className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90 w-full sm:w-auto"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield size={18} className="text-cuephoria-lightpurple" />
                  Account Status
                </CardTitle>
                <CardDescription>
                  Information about your account status and membership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <p className="text-sm text-muted-foreground">Member Since</p>
                      <p className="font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <p className="text-sm text-muted-foreground">Membership Status</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {user?.isMember ? user.membershipPlan || 'Active' : 'None'}
                        </p>
                        {user?.isMember ? (
                          <Badge className="bg-green-600">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-500">Inactive</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <p className="text-sm text-muted-foreground">Total Sessions</p>
                      <p className="font-medium">12 Sessions</p>
                    </div>
                    
                    <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                      <p className="text-sm text-muted-foreground">Loyalty Points</p>
                      <p className="font-medium">{user?.loyaltyPoints || 0} Points</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Key size={18} className="text-cuephoria-lightpurple" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  View and update your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="current-password" className="text-sm">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      value={currentPassword}
                      type={showPassword ? "text" : "password"}
                      readOnly
                      className="bg-background/50 border-cuephoria-lightpurple/30 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </div>
                </div>
                
                <Separator className="bg-cuephoria-lightpurple/20" />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Password Reset</h4>
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex items-start gap-3">
                      <AlertTriangle size={18} className="text-amber-400 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-sm">Need to Change Your Password?</h5>
                        <p className="text-sm text-muted-foreground mt-1">
                          If you need to reset your password, logout and use the "Forgot Password" 
                          option on the login screen. You'll need your reset PIN.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                    onClick={() => navigate('/customer')}
                  >
                    Go to Login Page
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Shield size={18} className="text-cuephoria-lightpurple" />
                  Login History
                </CardTitle>
                <CardDescription>
                  Recent login activity on your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Today at {new Date().toLocaleTimeString()}</p>
                        <p className="text-sm text-muted-foreground">Current session</p>
                      </div>
                      <Badge className="bg-green-600">Current</Badge>
                    </div>
                  </div>
                  
                  <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">Yesterday at 2:45 PM</p>
                        <p className="text-sm text-muted-foreground">Mobile device</p>
                      </div>
                      <Badge variant="outline">Success</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="preferences" className="space-y-6">
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <User size={18} className="text-cuephoria-lightpurple" />
                  Game Preferences
                </CardTitle>
                <CardDescription>
                  Your preferred game settings and interests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Preferred Games</Label>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-cuephoria-lightpurple">Pool</Badge>
                      <Badge className="bg-accent">Snooker</Badge>
                      <Badge className="bg-cuephoria-orange">8-Ball</Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 text-xs border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
                      >
                        Add More
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Skill Level</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600">Intermediate</Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm">Interested in Tournaments</Label>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">Yes</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-cuephoria-lightpurple/10 p-4">
                <Button 
                  className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                >
                  Update Preferences
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/30 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Mail size={18} className="text-cuephoria-lightpurple" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Manage how you receive updates and promotions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Email Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive updates about promotions and events</p>
                    </div>
                    <Badge className="bg-green-600">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm">SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">Receive text messages for important updates</p>
                    </div>
                    <Badge variant="outline" className="border-amber-500 text-amber-500">Disabled</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t border-cuephoria-lightpurple/10 p-4">
                <Button 
                  className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                >
                  Save Preferences
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfile;
