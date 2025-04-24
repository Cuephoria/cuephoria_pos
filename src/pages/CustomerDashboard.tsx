
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Star, Calendar, LogOut, ExternalLink, Clock, Gamepad, Gift } from 'lucide-react';
import { showSuccessToast } from '@/utils/toast-utils';
import CustomerLayout from '@/components/CustomerLayout';

const CustomerDashboard = () => {
  const { user, isLoading, logout } = useCustomerAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/customer');
  };
  
  const handleWebsiteRedirect = () => {
    window.location.href = 'https://cuephoria.in';
  };
  
  const handleBookOnline = () => {
    showSuccessToast('10% Discount Applied!', 'Your online booking discount has been activated.');
    window.open('https://cuephoria.in/booking', '_blank');
  };

  if (isLoading) {
    return (
      <CustomerLayout>
        <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
          <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
        </div>
      </CustomerLayout>
    );
  }
  
  // Format date to readable string
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };
  
  // Calculate membership status percentage
  const calculateMembershipProgress = () => {
    if (!user?.membershipExpiryDate || !user?.isMember) return 0;
    
    const startDate = user.membershipStartDate ? new Date(user.membershipStartDate) : new Date();
    const endDate = new Date(user.membershipExpiryDate);
    const today = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsedDuration = today.getTime() - startDate.getTime();
    
    // Calculate the remaining percentage
    const remainingPercentage = 100 - Math.min(Math.max(Math.round((elapsedDuration / totalDuration) * 100), 0), 100);
    
    return remainingPercentage;
  };

  // Recent activity data
  const recentActivities = [
    {
      type: "Pool Match",
      date: "2 days ago",
      details: "Won against opponent - 45 minutes"
    },
    {
      type: "Practice Session",
      date: "5 days ago",
      details: "Solo practice - 60 minutes"
    },
    {
      type: "Tournament",
      date: "2 weeks ago",
      details: "Quarter-finalist - 120 minutes"
    }
  ];

  return (
    <CustomerLayout>
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-to-r from-cuephoria-darkpurple to-cuephoria-darker border border-cuephoria-lightpurple/30 mb-6">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <span>Welcome back, {user?.name || 'Player'}</span>
              {user?.isMember && (
                <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-yellow-600">
                  Premium Member
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Here's your gameplay overview and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-4 bg-cuephoria-darker/50 rounded-lg p-3 border border-cuephoria-lightpurple/10 hover:border-cuephoria-lightpurple/30 transition-all">
                <div className="bg-cuephoria-lightpurple/20 p-3 rounded-full">
                  <Award size={24} className="text-cuephoria-lightpurple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="text-xl font-bold">{user?.loyaltyPoints || 0}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-cuephoria-darker/50 rounded-lg p-3 border border-cuephoria-lightpurple/10 hover:border-cuephoria-lightpurple/30 transition-all">
                <div className="bg-cuephoria-lightpurple/20 p-3 rounded-full">
                  <Clock size={24} className="text-cuephoria-lightpurple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Playtime</p>
                  <p className="text-xl font-bold">{user?.totalPlayTime || 0} hours</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 bg-cuephoria-darker/50 rounded-lg p-3 border border-cuephoria-lightpurple/10 hover:border-cuephoria-lightpurple/30 transition-all">
                <div className="bg-cuephoria-lightpurple/20 p-3 rounded-full">
                  <Gift size={24} className="text-cuephoria-lightpurple" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming Rewards</p>
                  <p className="text-xl font-bold">{50 - (user?.loyaltyPoints || 0) % 50} pts away</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Main Tabs */}
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="bg-cuephoria-darker border border-cuephoria-lightpurple/20">
            <TabsTrigger value="stats" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
              <TrendingUp size={16} className="mr-2" />
              Game Stats
            </TabsTrigger>
            <TabsTrigger value="membership" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
              <Star size={16} className="mr-2" />
              Membership
            </TabsTrigger>
            <TabsTrigger value="promotions" className="data-[state=active]:bg-cuephoria-lightpurple data-[state=active]:text-black">
              <Award size={16} className="mr-2" />
              Promotions
            </TabsTrigger>
          </TabsList>
          
          {/* Game Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <TrendingUp size={18} className="mr-2 text-cuephoria-lightpurple" />
                    Recent Game Stats
                  </CardTitle>
                  <CardDescription>Your latest gameplay statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.totalPlayTime ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Games Played</span>
                          <span className="text-sm font-medium">12 games</span>
                        </div>
                        <Progress value={60} className="h-2 bg-cuephoria-darker" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Win Rate</span>
                          <span className="text-sm font-medium">65%</span>
                        </div>
                        <Progress value={65} className="h-2 bg-cuephoria-darker" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Hours This Month</span>
                          <span className="text-sm font-medium">8.5 hrs</span>
                        </div>
                        <Progress value={42} className="h-2 bg-cuephoria-darker" />
                      </div>
                      <Button
                        variant="link"
                        className="text-cuephoria-lightpurple p-0 h-auto text-sm"
                        onClick={() => navigate('/customer/stats')}
                      >
                        View detailed stats
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Gamepad size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No game data available yet. Visit us to start playing!</p>
                      <Button
                        variant="link"
                        className="text-cuephoria-lightpurple mt-2"
                        onClick={handleWebsiteRedirect}
                      >
                        Book a session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Calendar size={18} className="mr-2 text-cuephoria-lightpurple" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription>Your latest visits and games</CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.totalPlayTime ? (
                    <div className="space-y-3">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="bg-cuephoria-darkpurple/50 p-3 rounded-md border border-cuephoria-lightpurple/10 hover:border-cuephoria-lightpurple/30 transition-all">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{activity.type}</span>
                            <Badge variant="outline">{activity.date}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{activity.details}</p>
                        </div>
                      ))}
                      <Button
                        variant="link"
                        className="text-cuephoria-lightpurple p-0 h-auto text-sm"
                        onClick={() => navigate('/customer/stats')}
                      >
                        View all activity
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Calendar size={32} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No activity recorded yet. Visit us to start playing!</p>
                      <Button
                        variant="link"
                        className="text-cuephoria-lightpurple mt-2"
                        onClick={handleWebsiteRedirect}
                      >
                        Book your first visit
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Membership Tab */}
          <TabsContent value="membership">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Star size={18} className="mr-2 text-cuephoria-lightpurple" />
                    Membership Status
                  </CardTitle>
                  <CardDescription>Your current membership details</CardDescription>
                </CardHeader>
                <CardContent>
                  {user?.isMember ? (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-blue/20 p-4 rounded-lg border border-cuephoria-lightpurple/20">
                        <h3 className="font-medium text-cuephoria-lightpurple">{user.membershipPlan || 'Premium Membership'}</h3>
                        <div className="mt-2 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium text-green-400">Active</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Expires:</span>
                            <span className="font-medium">{formatDate(user.membershipExpiryDate)}</span>
                          </div>
                          {user.membershipHoursLeft !== undefined && (
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Hours Left:</span>
                              <span className="font-medium">{user.membershipHoursLeft} hours</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3 space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Membership Progress</span>
                            <span>{calculateMembershipProgress()}% remaining</span>
                          </div>
                          <Progress value={calculateMembershipProgress()} className="h-2 bg-cuephoria-darker" />
                        </div>
                        <Button
                          variant="link"
                          className="text-cuephoria-lightpurple p-0 h-auto text-sm mt-3"
                          onClick={() => navigate('/customer/membership')}
                        >
                          View membership details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-cuephoria-darkpurple/50 p-4 rounded-lg border border-cuephoria-lightpurple/10 text-center">
                        <Star size={32} className="mx-auto mb-2 text-cuephoria-lightpurple opacity-60" />
                        <h3 className="font-medium mb-1">No Active Membership</h3>
                        <p className="text-sm text-muted-foreground mb-4">Become a member to enjoy exclusive benefits and discounts.</p>
                        <Button 
                          onClick={() => navigate('/customer/membership')} 
                          className="bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                        >
                          View Membership Plans
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="bg-cuephoria-darker border border-cuephoria-lightpurple/20 hover:border-cuephoria-lightpurple/40 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center">
                    <Award size={18} className="mr-2 text-cuephoria-lightpurple" />
                    Loyalty Program
                  </CardTitle>
                  <CardDescription>Your loyalty rewards and points</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-amber-500/20 to-yellow-600/20 p-4 rounded-lg border border-amber-500/20">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-amber-400">Current Points</h3>
                        <span className="text-xl font-bold text-amber-300">{user?.loyaltyPoints || 0}</span>
                      </div>
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Next Reward</span>
                          <span>{user?.loyaltyPoints ? 50 - (user.loyaltyPoints % 50) : 50} points needed</span>
                        </div>
                        <Progress 
                          value={user?.loyaltyPoints ? (user.loyaltyPoints % 50) * 2 : 0} 
                          className="h-2 bg-cuephoria-darker"
                        />
                      </div>
                      <Button
                        variant="link"
                        className="text-amber-400 p-0 h-auto text-sm mt-2"
                        onClick={() => navigate('/customer/rewards')}
                      >
                        View available rewards
                      </Button>
                    </div>
                    
                    <div className="bg-cuephoria-darkpurple/50 p-3 rounded-md border border-cuephoria-lightpurple/10">
                      <h4 className="font-medium">Popular Rewards</h4>
                      <ul className="mt-2 space-y-2">
                        <li className="flex justify-between items-center text-sm">
                          <span>30-minute free game</span>
                          <Badge className="bg-amber-600">100 points</Badge>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                          <span>Free beverage</span>
                          <Badge className="bg-amber-600">50 points</Badge>
                        </li>
                        <li className="flex justify-between items-center text-sm">
                          <span>₹200 discount voucher</span>
                          <Badge className="bg-amber-600">200 points</Badge>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Promotions Tab */}
          <TabsContent value="promotions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="absolute top-0 right-0 p-2">
                    <Badge className="bg-pink-500 hover:bg-pink-600">Featured</Badge>
                  </div>
                  <CardTitle className="text-lg text-white">Online Booking Discount</CardTitle>
                  <CardDescription className="text-white/70">Limited time offer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-2">
                    <span className="text-3xl font-bold text-white">10% OFF</span>
                    <p className="text-white/70 text-sm">on all online bookings</p>
                  </div>
                  <div className="bg-black/20 p-3 rounded-md text-sm text-white/80">
                    <p>Book any table through our website and get 10% off your total bill. Use code <span className="font-bold text-white">ONLINE10</span> during checkout.</p>
                  </div>
                  <Button 
                    onClick={handleBookOnline}
                    className="w-full bg-white text-pink-600 hover:bg-white/90"
                  >
                    Book Now
                  </Button>
                  <p className="text-xs text-white/60 text-center">Valid until June 30, 2025</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/20 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Weekend Tournament</CardTitle>
                  <CardDescription className="text-white/70">Show your skills, win prizes!</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-black/20 p-3 rounded-md text-sm text-white/80 space-y-2">
                    <p>Join our weekend tournament and compete for exciting prizes including:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>₹5,000 cash prize</li>
                      <li>Custom cue stick</li>
                      <li>Free monthly membership</li>
                    </ul>
                  </div>
                  <div className="flex justify-between text-sm text-white/80">
                    <span>Entry Fee:</span>
                    <span className="font-medium text-white">₹500 (Free for members)</span>
                  </div>
                  <Button 
                    onClick={handleWebsiteRedirect}
                    className="w-full bg-white text-blue-600 hover:bg-white/90"
                  >
                    Register Now
                  </Button>
                  <p className="text-xs text-white/60 text-center">Next tournament: Every Sunday, 2 PM</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/20 overflow-hidden md:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white">Refer A Friend</CardTitle>
                  <CardDescription className="text-white/70">Share the love, get rewards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/20 p-3 rounded-md text-sm text-white/80">
                      <p className="font-medium text-white mb-1">How it works:</p>
                      <ol className="list-decimal pl-5 space-y-1">
                        <li>Invite a friend to Cuephoria</li>
                        <li>Your friend signs up and visits</li>
                        <li>Both of you receive rewards!</li>
                      </ol>
                    </div>
                    <div className="bg-black/20 p-3 rounded-md text-sm text-white/80">
                      <p className="font-medium text-white mb-1">Your rewards:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>100 loyalty points per referral</li>
                        <li>1 hour free play</li>
                        <li>10% off on your next visit</li>
                      </ul>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate('/customer/rewards')}
                    className="w-full bg-white text-orange-600 hover:bg-white/90"
                  >
                    Get Referral Code
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="text-center mt-8 text-sm text-gray-400">
          <p>© {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
          <p className="mt-1 font-light text-xs">Designed and developed by RK</p>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
