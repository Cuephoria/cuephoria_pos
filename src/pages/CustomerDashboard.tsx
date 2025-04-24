
import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Clock, Star, Trophy, Activity, Calendar, TrendingUp, Gift, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface Session {
  id: string;
  stationId: string;
  stationName?: string;
  stationType?: 'ps5' | '8ball';
  startTime: Date;
  endTime?: Date;
  duration: number; // in minutes
}

interface GameStat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const CustomerDashboard = () => {
  const { user, refreshProfile } = useCustomerAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<GameStat[]>([]);

  useEffect(() => {
    fetchCustomerData();
  }, [user?.id]);

  const fetchCustomerData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      // Fetch customer sessions
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select(`
          *,
          stations:stationId (name, type)
        `)
        .eq('customerId', user.id)
        .order('startTime', { ascending: false })
        .limit(5);
      
      if (sessionError) throw sessionError;
      
      const processedSessions = sessionData.map((session: any) => ({
        id: session.id,
        stationId: session.stationId,
        stationName: session.stations?.name || 'Unknown Station',
        stationType: session.stations?.type || undefined,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
        duration: session.duration || 0
      }));
      
      setSessions(processedSessions);
      
      // Calculate stats
      const totalDuration = processedSessions.reduce((total, session) => total + (session.duration || 0), 0);
      const totalHours = Math.floor(totalDuration / 60);
      const totalGames = processedSessions.length;
      const averageGameTime = totalGames > 0 ? Math.round(totalDuration / totalGames) : 0;
      
      // Set game stats
      setStats([
        { 
          title: 'Total Sessions', 
          value: totalGames,
          icon: <Award className="h-4 w-4 text-cuephoria-lightpurple" />
        },
        { 
          title: 'Total Play Time', 
          value: `${totalHours} hours`,
          icon: <Clock className="h-4 w-4 text-pink-400" /> 
        },
        { 
          title: 'Avg. Session Time', 
          value: `${averageGameTime} mins`,
          icon: <TrendingUp className="h-4 w-4 text-green-400" />
        },
        { 
          title: 'Loyalty Points', 
          value: user?.loyaltyPoints || 0,
          icon: <Star className="h-4 w-4 text-amber-400" />
        }
      ]);
      
      // Refresh user profile to get latest data
      await refreshProfile();
      
    } catch (error) {
      console.error('Error fetching customer data:', error);
      toast({
        title: 'Failed to load data',
        description: 'Could not fetch your activity and stats',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

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
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="container p-4 sm:p-6 space-y-6 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" variants={itemVariants}>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome, {user?.name || 'Player'}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Here's an overview of your gaming activity</p>
        </div>
        
        {user?.isMember && (
          <Card className="bg-gradient-to-r from-amber-950/40 to-amber-900/40 border-amber-800/60 w-full md:w-auto">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="bg-amber-400/20 p-2 rounded-full">
                <Star className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-amber-200 font-medium text-sm">{user.membershipPlan}</p>
                <p className="text-amber-200/70 text-xs">
                  {user.membershipHoursLeft} hours remaining
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
      
      {/* Stats Overview */}
      <motion.div variants={itemVariants}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20 overflow-hidden">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1 text-white">{stat.value}</p>
                  </div>
                  <div className="bg-cuephoria-darker/60 p-2 rounded-full">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
      
      {/* Recent Activity Section */}
      <motion.div variants={itemVariants}>
        <Card className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cuephoria-lightpurple" />
              Recent Activity
            </CardTitle>
            <CardDescription>Your recent gaming sessions at Cuephoria</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin h-8 w-8 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
              </div>
            ) : sessions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-cuephoria-darker/50">
                    <tr>
                      <th className="text-left p-4 text-sm">Station</th>
                      <th className="text-left p-4 text-sm">Date & Time</th>
                      <th className="text-left p-4 text-sm">Duration</th>
                      <th className="text-left p-4 text-sm hidden md:table-cell">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cuephoria-lightpurple/10">
                    {sessions.map((session) => (
                      <tr key={session.id} className="hover:bg-cuephoria-lightpurple/5 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-white">{session.stationName}</div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-white">
                            {format(session.startTime, 'dd MMM yyyy')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(session.startTime, 'hh:mm a')}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-white">
                            {session.duration} mins
                          </div>
                        </td>
                        <td className="p-4 hidden md:table-cell">
                          <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cuephoria-lightpurple/10 text-cuephoria-lightpurple">
                            {session.stationType === 'ps5' ? 'PlayStation 5' : '8-Ball Pool'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <Calendar className="h-10 w-10 mx-auto mb-2 opacity-40" />
                <p>No activity records found</p>
                <p className="text-sm">Visit us to start playing and tracking your game stats!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Membership & Loyalty Section */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="membership" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="membership" className="flex items-center gap-1">
              <Trophy className="h-4 w-4" />
              Membership
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-1">
              <Gift className="h-4 w-4" />
              Loyalty Program
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="membership" className="mt-4">
            <Card className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
              <CardHeader>
                <CardTitle>Membership Benefits</CardTitle>
                <CardDescription>
                  {user?.isMember 
                    ? `Your current membership: ${user.membershipPlan}`
                    : 'Join our membership program for exclusive benefits'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {user?.isMember ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Hours Remaining</span>
                        <span className="font-medium">{user.membershipHoursLeft} hours</span>
                      </div>
                      <Progress value={(user.membershipHoursLeft / 20) * 100} className="h-2" />
                    </div>
                    
                    <div className="border border-cuephoria-lightpurple/20 rounded-lg p-4 space-y-3">
                      <h4 className="text-sm font-medium text-cuephoria-lightpurple">Your Membership Includes:</h4>
                      <ul className="space-y-2">
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>Priority access to all stations</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>{user.membershipPlan?.includes('Weekly') ? '10' : '20'} hours of gameplay each {user.membershipPlan?.includes('Weekly') ? 'week' : 'month'}</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>15% discount on food and beverages</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>Exclusive access to member tournaments</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="border border-cuephoria-lightpurple/20 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-cuephoria-lightpurple mb-2">Weekly Membership - ₹500</h4>
                      <ul className="space-y-2">
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>10 hours of gameplay per week</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>10% discount on food and beverages</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="border border-cuephoria-lightpurple/20 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-cuephoria-lightpurple mb-2">Monthly Membership - ₹1500</h4>
                      <ul className="space-y-2">
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>20 hours of gameplay per month</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>15% discount on food and beverages</span>
                        </li>
                        <li className="text-sm flex items-start gap-2">
                          <Star className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
                          <span>Priority booking & access to exclusive events</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">Visit Cuephoria to purchase a membership package</p>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                  onClick={() => navigate('/customer/membership')}
                >
                  {user?.isMember ? 'Manage Membership' : 'Get Membership'}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="loyalty" className="mt-4">
            <Card className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
              <CardHeader>
                <CardTitle>Loyalty Program</CardTitle>
                <CardDescription>Earn points with every purchase and redeem for rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between bg-cuephoria-darker p-4 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Your Points Balance</p>
                    <p className="text-3xl font-bold text-white">{user?.loyaltyPoints || 0}</p>
                  </div>
                  <div className="bg-cuephoria-lightpurple/20 p-3 rounded-full">
                    <Gift className="h-6 w-6 text-cuephoria-lightpurple" />
                  </div>
                </div>
                
                <div className="border border-cuephoria-lightpurple/20 rounded-lg divide-y divide-cuephoria-lightpurple/20">
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-white mb-1">Free Drink</h4>
                    <p className="text-xs text-muted-foreground mb-2">Redeem 50 points for a complimentary beverage</p>
                    <Button variant="outline" size="sm" className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple">
                      50 Points
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-white mb-1">1 Hour Free Play</h4>
                    <p className="text-xs text-muted-foreground mb-2">Redeem 100 points for 1 hour of gameplay</p>
                    <Button variant="outline" size="sm" className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple">
                      100 Points
                    </Button>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-sm font-medium text-white mb-1">Food Combo</h4>
                    <p className="text-xs text-muted-foreground mb-2">Redeem 75 points for any food combo</p>
                    <Button variant="outline" size="sm" className="border-cuephoria-lightpurple/30 text-cuephoria-lightpurple">
                      75 Points
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground italic">
                  Note: You earn 1 point for every ₹10 spent at Cuephoria
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-gradient-to-r from-cuephoria-lightpurple to-accent hover:opacity-90"
                  onClick={() => navigate('/customer/rewards')}
                >
                  View All Rewards
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
      
      {/* Footer with credit */}
      <motion.div variants={itemVariants} className="text-center pt-4 border-t border-cuephoria-lightpurple/10 mt-8">
        <p className="text-xs text-muted-foreground/60">Designed and developed by RK</p>
      </motion.div>
    </motion.div>
  );
};

export default CustomerDashboard;
