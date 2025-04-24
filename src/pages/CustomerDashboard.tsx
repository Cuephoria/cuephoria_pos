import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Calendar, TrendingUp, Clock, Shield, GamepadIcon, Trophy, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecentSession {
  id: string;
  stationName: string;
  stationType: string;
  date: Date;
  duration: number;
}

interface GameStat {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const CustomerDashboard = () => {
  const { user } = useCustomerAuth();
  const navigate = useNavigate();
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<GameStat[]>([]);

  // Fetch recent sessions
  useEffect(() => {
    const fetchSessions = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('sessions')
          .select('id, start_time, end_time, stations(name, type)')
          .eq('customer_id', user.id)
          .order('start_time', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        if (data) {
          const formattedSessions = data.map(session => {
            const station: any = session.stations || { name: 'Unknown Station', type: 'unknown' };
            
            return {
              id: session.id,
              stationName: station.name,
              stationType: station.type,
              date: new Date(session.start_time),
              duration: session.end_time 
                ? (new Date(session.end_time).getTime() - new Date(session.start_time).getTime()) / (1000 * 60 * 60)
                : 0
            };
          });
          
          setRecentSessions(formattedSessions);
        }
      } catch (error) {
        console.error('Error fetching sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [user?.id]);

  // Generate game stats
  useEffect(() => {
    if (user) {
      setStats([
        {
          icon: <Clock className="h-5 w-5 text-blue-400" />,
          label: 'Total Play Time',
          value: `${user.totalPlayTime.toFixed(1)} hours`
        },
        {
          icon: <GamepadIcon className="h-5 w-5 text-pink-400" />,
          label: 'Sessions Played',
          value: recentSessions.length
        },
        {
          icon: <Trophy className="h-5 w-5 text-amber-400" />,
          label: 'Loyalty Points',
          value: user.loyaltyPoints || 0
        },
        {
          icon: <Activity className="h-5 w-5 text-green-400" />,
          label: 'Last Played',
          value: recentSessions.length > 0 
            ? new Date(recentSessions[0].date).toLocaleDateString() 
            : 'Never'
        }
      ]);
    }
  }, [user, recentSessions]);

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

  const handleMembershipClick = () => {
    navigate('/customer/membership');
  };

  const handleRewardsClick = () => {
    navigate('/customer/rewards');
  };

  
  return (
    <motion.div 
      className="container p-4 sm:p-6 space-y-6 max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome, {user?.name || 'Customer'}!</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Here's an overview of your account</p>
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-purple-900/30 to-cuephoria-lightpurple/20 border-cuephoria-lightpurple/30">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-cuephoria-lightpurple/20 p-3 rounded-full">
                  <Shield className="h-7 w-7 text-cuephoria-lightpurple" />
                </div>
                <div>
                  <p className="text-lg font-medium text-white">Account Status</p>
                  <p className="text-3xl font-bold text-white">{user?.isMember ? 'Member' : 'Guest'}</p>
                </div>
              </div>
              <div className="text-sm text-muted-foreground max-w-xs">
                {user?.isMember ? (
                  <>
                    Enjoy exclusive benefits and priority access as a valued member.
                    <Button variant="link" className="mt-2 p-0 text-sm underline-offset-2 hover:underline" onClick={handleMembershipClick}>
                      View Membership Details <ArrowRight className="inline-block ml-1 h-4 w-4 align-baseline" />
                    </Button>
                  </>
                ) : (
                  <>
                    Become a member to unlock exclusive perks and rewards.
                    <Button variant="link" className="mt-2 p-0 text-sm underline-offset-2 hover:underline" onClick={handleMembershipClick}>
                      Explore Membership Options <ArrowRight className="inline-block ml-1 h-4 w-4 align-baseline" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cuephoria-lightpurple" />
          Game Stats
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  {stat.icon}
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-cuephoria-lightpurple" />
            Recent Sessions
          </h2>
          <Button variant="link" className="text-sm text-cuephoria-lightpurple hover:text-accent">
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading recent sessions...</div>
        ) : recentSessions.length === 0 ? (
          <div className="text-center text-muted-foreground">No recent sessions found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSessions.map((session) => (
              <Card key={session.id} className="bg-cuephoria-darker/60 border-cuephoria-lightpurple/20">
                <CardHeader>
                  <CardTitle className="text-lg">{session.stationName}</CardTitle>
                  <CardDescription>{session.stationType}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-white">
                    {session.date.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {session.duration.toFixed(1)} hours
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-white">Loyalty Rewards</p>
              <p className="text-sm text-muted-foreground">Redeem your points for exclusive rewards</p>
            </div>
            <Button onClick={handleRewardsClick}>
              View Rewards
            </Button>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Footer with credit */}
      <motion.div variants={itemVariants} className="text-center pt-4 border-t border-cuephoria-lightpurple/10 mt-8">
        <p className="text-xs text-muted-foreground/60">Designed and developed by RK</p>
      </motion.div>
    </motion.div>
  );
};

export default CustomerDashboard;
