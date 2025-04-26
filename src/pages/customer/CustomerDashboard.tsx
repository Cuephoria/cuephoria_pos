
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerSessions } from '@/services/customerService';
import { getAvailableRewards } from '@/services/rewardsService';
import { getActivePromotions } from '@/services/promotionsService';
import { CalendarDays, Clock, DollarSign, Gift, Ticket, Award, History, CreditCard } from 'lucide-react';
import { CustomerSession, Promotion, Reward } from '@/types/customer.types';

const CustomerDashboard = () => {
  const { customerUser, customerProfile } = useCustomerAuth();
  const [recentSessions, setRecentSessions] = useState<CustomerSession[]>([]);
  const [featuredRewards, setFeaturedRewards] = useState<Reward[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadDashboardData = async () => {
      if (customerUser) {
        setIsLoading(true);
        try {
          const [sessionsData, rewardsData, promotionsData] = await Promise.all([
            getCustomerSessions(customerUser.customer_id),
            getAvailableRewards(customerUser.customer_id),
            getActivePromotions(customerUser.customer_id)
          ]);
          
          setRecentSessions(sessionsData.slice(0, 2));
          setFeaturedRewards(rewardsData.slice(0, 3));
          setPromotions(promotionsData.slice(0, 2));
        } catch (error) {
          console.error('Error loading dashboard data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadDashboardData();
  }, [customerUser]);

  if (isLoading || !customerProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {customerProfile.name}!</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your Cuephoria experience</p>
      </div>
      
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <Award className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{customerProfile.loyaltyPoints}</div>
            <p className="text-xs text-muted-foreground">Loyalty Points</p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <History className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{Math.floor(customerProfile.totalPlayTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">Total Play Time</p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CreditCard className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">${customerProfile.totalSpent.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/5">
          <CardContent className="p-4 flex flex-col items-center text-center">
            <CalendarDays className="h-8 w-8 mb-2 text-primary" />
            <div className="text-2xl font-bold">{customerProfile.isMember ? 'Active' : 'No'}</div>
            <p className="text-xs text-muted-foreground">Membership Status</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Sessions */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Sessions</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/customer/sessions')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <Card key={session.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{session.stationName}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CalendarDays size={14} />
                          <span>{session.startTime.toLocaleDateString()}</span>
                          <Clock size={14} className="ml-2" />
                          <span>{session.startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 font-bold">
                          <DollarSign size={16} />
                          <span>{session.totalCost.toFixed(2)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {session.duration 
                            ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`
                            : 'In progress'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No recent sessions found.</p>
              <p className="text-sm">Visit Cuephoria to start playing!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Featured Rewards */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Featured Rewards</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/customer/rewards')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredRewards.map((reward) => (
              <Card key={reward.id} className="bg-card/50 overflow-hidden">
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {reward.image ? (
                    <img src={reward.image} alt={reward.name} className="w-full h-full object-cover" />
                  ) : (
                    <Gift className="h-12 w-12 text-muted-foreground/40" />
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold">{reward.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{reward.description}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-bold flex items-center gap-1">
                      <Award size={14} className="text-primary" />
                      {reward.points_required} points
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate('/customer/rewards')}>
            Browse All Rewards
          </Button>
        </CardFooter>
      </Card>
      
      {/* Current Promotions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Current Promotions</CardTitle>
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/customer/promotions')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {promotions.map((promo) => (
              <div key={promo.id} className="p-4 border border-border rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold flex items-center gap-2">
                      <Ticket size={16} className="text-primary" />
                      {promo.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                  </div>
                  <div className="px-2 py-1 bg-primary/10 rounded text-xs font-medium">
                    {promo.discount_type === 'percentage' ? `${promo.discount_value}% OFF` : `$${promo.discount_value} OFF`}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    Code: <span className="font-mono font-bold">{promo.code}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Expires: {new Date(promo.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
            {promotions.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <p>No active promotions at this time.</p>
                <p className="text-sm">Check back soon for new offers!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
