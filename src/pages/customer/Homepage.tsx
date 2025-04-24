
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarDays, ChevronRight, Clock, CreditCard, GanttChart, Gift, Star, TrendingUp, Trophy, User } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

const Homepage = () => {
  const navigate = useNavigate();
  const { user } = useCustomerAuth();
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.4 }
    }
  };

  // Sample recent activity data - this would come from the database in a real implementation
  const recentActivity = [
    { id: 1, type: 'Pool Game', station: 'Table 3', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), duration: 75 },
    { id: 2, type: 'PS5 Session', station: 'Gaming Station 2', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), duration: 120 },
    { id: 3, type: 'Pool Game', station: 'Table 1', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), duration: 60 }
  ];

  // Sample game stats - this would come from the database in a real implementation
  const gameStats = {
    totalSessions: 12,
    favoriteGame: 'Pool',
    avgSessionTime: 85,
    highScore: 147
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Welcome Hero */}
        <motion.div 
          variants={itemVariants}
          className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cuephoria-lightpurple/80 to-accent/80 p-6 shadow-lg"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-40"></div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold text-white md:text-3xl mb-2">Welcome back, {user?.name || 'Player'}!</h1>
            <p className="text-white/80 max-w-md">Ready for another exciting session? Check out your stats and rewards below.</p>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <Button 
                onClick={() => navigate('/customer/membership')}
                className="bg-white text-cuephoria-purple hover:bg-white/90"
              >
                View Membership
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.href = 'https://cuephoria.in'}
                className="bg-transparent border-white text-white hover:bg-white/10"
              >
                Book a Session
              </Button>
            </div>
          </div>
        </motion.div>
        
        {/* Overview Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Star className="mr-2 h-4 w-4 text-amber-400" />
                  Loyalty Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.loyaltyPoints || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Next reward at {Math.ceil((user?.loyaltyPoints || 0) / 50) * 50}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <GanttChart className="mr-2 h-4 w-4 text-cuephoria-lightpurple" />
                  Total Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameStats.totalSessions}</div>
                <p className="text-xs text-muted-foreground mt-1">Last played {formatDate(recentActivity[0]?.date)}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-cuephoria-green" />
                  Avg. Session Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameStats.avgSessionTime} min</div>
                <p className="text-xs text-muted-foreground mt-1">Across all game sessions</p>
              </CardContent>
            </Card>
            
            <Card className="bg-cuephoria-darker border-cuephoria-lightpurple/30">
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <Trophy className="mr-2 h-4 w-4 text-cuephoria-orange" />
                  High Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{gameStats.highScore}</div>
                <p className="text-xs text-muted-foreground mt-1">In 8-ball pool</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
        
        {/* Membership Status */}
        {user?.isMember ? (
          <motion.div variants={itemVariants}>
            <Card className="bg-cuephoria-darker border-cuephoria-lightpurple/30 overflow-hidden">
              <div className="absolute h-full w-1 bg-gradient-to-b from-cuephoria-lightpurple to-accent left-0 top-0"></div>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Star className="text-cuephoria-lightpurple mr-2" size={20} />
                    Active Membership
                  </div>
                  <Button variant="link" className="text-cuephoria-lightpurple p-0 h-auto" onClick={() => navigate('/customer/membership')}>
                    View Details <ChevronRight size={16} />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Your premium membership benefits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row justify-between gap-6">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Plan</h4>
                    <div className="flex items-center">
                      <div className="bg-cuephoria-lightpurple/20 rounded-full p-2 mr-3">
                        <Star className="text-cuephoria-lightpurple h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold">{user.membershipPlan}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.membershipDuration === 'weekly' ? '7 days' : '30 days'} membership
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Time Remaining</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{user.membershipHoursLeft} hours left</span>
                        <span>{user.membershipHoursLeft} / {user.membershipPlan?.includes('10') ? '10' : '30'}</span>
                      </div>
                      <Progress 
                        value={(user.membershipHoursLeft || 0) / (user.membershipPlan?.includes('10') ? 10 : 30) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Expires</h4>
                    <div className="flex items-center">
                      <div className="bg-cuephoria-lightpurple/20 rounded-full p-2 mr-3">
                        <CalendarDays className="text-cuephoria-lightpurple h-5 w-5" />
                      </div>
                      <p className="font-medium">
                        {user.membershipExpiryDate ? new Date(user.membershipExpiryDate).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={itemVariants}>
            <Card className="border-dashed border-2 border-cuephoria-lightpurple/30 bg-cuephoria-darker/50">
              <CardHeader>
                <CardTitle>No Active Membership</CardTitle>
                <CardDescription>
                  Get unlimited access with our membership plans
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center py-6">
                <Star className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                <p className="text-center text-muted-foreground mb-6 max-w-md">
                  Enjoy exclusive benefits including reserved tables, priority booking, and discounted rates with our membership plans.
                </p>
                <Button 
                  onClick={() => navigate('/customer/membership')}
                  className="bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90"
                >
                  View Membership Plans
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Two Column Layout - Recent Activity and Game Stats */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {/* Recent Activity */}
          <motion.div variants={itemVariants}>
            <Card className="bg-cuephoria-darker border-cuephoria-lightpurple/30 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="mr-2 text-cuephoria-lightpurple" size={18} />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest game sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-4 border-b border-cuephoria-lightpurple/10 pb-4 last:border-0">
                        <div className="bg-cuephoria-lightpurple/10 rounded-full p-2">
                          {activity.type.includes('Pool') ? (
                            <GanttChart className="h-5 w-5 text-cuephoria-lightpurple" />
                          ) : (
                            <Star className="h-5 w-5 text-cuephoria-orange" />
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-medium">{activity.type}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">{activity.station}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(activity.date)}</p>
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock size={12} className="mr-1" />
                            {activity.duration} min
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground opacity-50 mb-3" />
                    <p className="text-muted-foreground text-center">No recent activity to display.</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="link" className="text-cuephoria-lightpurple w-full" onClick={() => navigate('/customer/stats')}>
                  View All Activity <ChevronRight size={16} className="ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
          
          {/* Game Stats */}
          <motion.div variants={itemVariants}>
            <Card className="bg-cuephoria-darker border-cuephoria-lightpurple/30 h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="mr-2 text-cuephoria-green" size={18} />
                  Game Stats
                </CardTitle>
                <CardDescription>
                  Your performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-cuephoria-green/10 rounded-full p-2 mr-3">
                        <Trophy className="h-5 w-5 text-cuephoria-green" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Favorite Game</p>
                        <p className="text-xl font-bold">{gameStats.favoriteGame}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground text-right">Played</p>
                      <p className="text-xl font-bold text-right">{Math.round(gameStats.totalSessions * 0.7)} times</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-cuephoria-darker/80 rounded-lg p-4 border border-cuephoria-lightpurple/10">
                      <div className="flex items-center mb-2">
                        <GanttChart className="h-4 w-4 text-cuephoria-lightpurple mr-2" />
                        <p className="text-sm font-medium">Win Rate</p>
                      </div>
                      <p className="text-2xl font-bold">68%</p>
                    </div>
                    <div className="bg-cuephoria-darker/80 rounded-lg p-4 border border-cuephoria-lightpurple/10">
                      <div className="flex items-center mb-2">
                        <CreditCard className="h-4 w-4 text-cuephoria-orange mr-2" />
                        <p className="text-sm font-medium">Longest Streak</p>
                      </div>
                      <p className="text-2xl font-bold">4 wins</p>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm font-medium mb-2">Game Breakdown</p>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Pool</span>
                          <span>70%</span>
                        </div>
                        <div className="w-full bg-cuephoria-darkest rounded-full h-2">
                          <div className="bg-cuephoria-lightpurple h-2 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Console Games</span>
                          <span>30%</span>
                        </div>
                        <div className="w-full bg-cuephoria-darkest rounded-full h-2">
                          <div className="bg-cuephoria-orange h-2 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="link" className="text-cuephoria-lightpurple w-full" onClick={() => navigate('/customer/stats')}>
                  View Detailed Stats <ChevronRight size={16} className="ml-1" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
        
        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
            <Button
              variant="outline"
              className="h-auto py-6 flex-col border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple/10"
              onClick={() => navigate('/customer/rewards')}
            >
              <Gift className="h-6 w-6 mb-2 text-cuephoria-lightpurple" />
              <span>Redeem Rewards</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex-col border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple/10"
              onClick={() => navigate('/customer/membership')}
            >
              <Star className="h-6 w-6 mb-2 text-amber-400" />
              <span>Membership</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex-col border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple/10"
              onClick={() => navigate('/customer/profile')}
            >
              <User className="h-6 w-6 mb-2 text-cuephoria-green" />
              <span>Profile</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex-col border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple/10"
              onClick={() => window.location.href = 'https://cuephoria.in'}
            >
              <CalendarDays className="h-6 w-6 mb-2 text-cuephoria-orange" />
              <span>Book Now</span>
            </Button>
          </div>
        </motion.div>
        
        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-10 pt-4 border-t border-cuephoria-lightpurple/10">
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-muted-foreground/60">© {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.</p>
            <p className="text-xs text-cuephoria-lightpurple/70 mt-1">Designed and developed by RK</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Homepage;
