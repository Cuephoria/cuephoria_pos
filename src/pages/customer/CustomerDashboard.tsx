
import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, Award, Trophy, Calendar, Calendar } from 'lucide-react';
import { CustomerStatistics, LoyaltyTransaction, Promotion, Session } from '@/types/customer.types';
import LoadingSpinner from '@/components/ui/loading-spinner';

const CustomerDashboard: React.FC = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<CustomerStatistics | null>(null);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<LoyaltyTransaction[]>([]);
  const [activePromotions, setActivePromotions] = useState<Promotion[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!customerUser?.customerId) {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
        return;
      }
      
      setIsLoading(true);
      try {
        // Fetch customer info for statistics
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('loyalty_points, total_spent, total_play_time, is_member, membership_expiry_date, membership_hours_left')
          .eq('id', customerUser.customerId)
          .single();
          
        if (customerError) {
          throw new Error(`Error fetching customer data: ${customerError.message}`);
        }
        
        // Fetch recent sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('id, station_id, start_time, end_time, duration, stations(name, type)')
          .eq('customer_id', customerUser.customerId)
          .order('start_time', { ascending: false })
          .limit(5);
        
        if (sessionsError) {
          throw new Error(`Error fetching sessions: ${sessionsError.message}`);
        }
        
        // Format sessions data
        const formattedSessions: Session[] = sessionsData.map((session: any) => ({
          id: session.id,
          stationId: session.station_id,
          stationName: session.stations?.name,
          stationType: session.stations?.type,
          startTime: new Date(session.start_time),
          endTime: session.end_time ? new Date(session.end_time) : undefined,
          duration: session.duration
        }));
        
        // Fetch loyalty transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('customer_id', customerUser.customerId)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (transactionsError) {
          throw new Error(`Error fetching transactions: ${transactionsError.message}`);
        }
        
        // Format transactions data
        const formattedTransactions: LoyaltyTransaction[] = transactionsData.map((transaction: any) => ({
          id: transaction.id,
          customerId: transaction.customer_id,
          points: transaction.points,
          source: transaction.source,
          description: transaction.description,
          createdAt: new Date(transaction.created_at)
        }));
        
        // Fetch active promotions
        const { data: promotionsData, error: promotionsError } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (promotionsError) {
          throw new Error(`Error fetching promotions: ${promotionsError.message}`);
        }
        
        // Format promotions data
        const formattedPromotions: Promotion[] = promotionsData?.map((promo: any) => ({
          id: promo.id,
          name: promo.name,
          description: promo.description,
          startDate: promo.start_date ? new Date(promo.start_date) : null,
          endDate: promo.end_date ? new Date(promo.end_date) : null,
          discountType: promo.discount_type,
          discountValue: promo.discount_value,
          isActive: promo.is_active,
          imageUrl: promo.image_url,
          createdAt: new Date(promo.created_at)
        })) || [];
        
        // Count sessions
        const { count: sessionsCount } = await supabase
          .from('sessions')
          .select('id', { count: 'exact' })
          .eq('customer_id', customerUser.customerId);
          
        // Count referrals
        const { count: referralsCount } = await supabase
          .from('referrals')
          .select('id', { count: 'exact' })
          .eq('referrer_id', customerUser.customerId)
          .eq('status', 'completed');
        
        // Set the statistics
        setStatistics({
          totalPlayTime: customerData.total_play_time,
          totalSpent: customerData.total_spent,
          loyaltyPoints: customerData.loyalty_points,
          membershipStatus: customerData.is_member,
          membershipExpiryDate: customerData.membership_expiry_date ? new Date(customerData.membership_expiry_date) : undefined,
          membershipHoursLeft: customerData.membership_hours_left,
          sessionsCount: sessionsCount || 0,
          referralsCount: referralsCount || 0
        });
        
        // Set the fetched data
        setRecentSessions(formattedSessions);
        setRecentTransactions(formattedTransactions);
        setActivePromotions(formattedPromotions);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [customerUser?.customerId, toast]);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Format time for display
  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          Welcome back{customerUser?.customerId ? '!' : ''}
        </h1>
        <p className="text-muted-foreground mt-1">
          Here's an overview of your gaming activity and rewards.
        </p>
      </div>

      {!customerUser?.customerId ? (
        <div className="bg-cuephoria-dark/50 rounded-lg p-8 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Your account setup is still being processed. Please check back soon!
          </p>
        </div>
      ) : statistics ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Total Play Time</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {formatPlayTime(statistics.totalPlayTime)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  From {statistics.sessionsCount} sessions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Loyalty Points</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {statistics.loyaltyPoints}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Available to redeem
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Membership Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {statistics.membershipStatus ? (
                    <span className="text-cuephoria-lightpurple">Active</span>
                  ) : (
                    <span className="text-muted-foreground">Inactive</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {statistics.membershipStatus && statistics.membershipHoursLeft
                    ? `${statistics.membershipHoursLeft} hours remaining`
                    : 'Not a member'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground flex items-center space-x-2">
                  <Trophy className="h-4 w-4" />
                  <span>Referrals</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {statistics.referralsCount}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Successful referrals
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sessions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
              Recent Sessions
            </h2>
            <div className="bg-cuephoria-darker/40 rounded-lg border border-cuephoria-lightpurple/20 overflow-hidden">
              {recentSessions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-cuephoria-lightpurple/10">
                        <th className="px-4 py-3 text-left">Station</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-left">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentSessions.map((session) => (
                        <tr key={session.id} className="border-b border-cuephoria-lightpurple/10 hover:bg-cuephoria-dark/30">
                          <td className="px-4 py-3">
                            <div className="font-medium">{session.stationName || `Station ${session.stationId.slice(0, 8)}`}</div>
                            <div className="text-xs text-muted-foreground">{session.stationType}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{formatDate(session.startTime)}</div>
                          </td>
                          <td className="px-4 py-3">
                            {session.duration ? (
                              <div>{formatPlayTime(session.duration)}</div>
                            ) : session.endTime ? (
                              <div>{formatPlayTime(Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 60000))}</div>
                            ) : (
                              <div className="text-cuephoria-orange">Active</div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No recent sessions found.
                </div>
              )}
            </div>
          </div>

          {/* Recent Point Transactions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Award className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
              Recent Point Activity
            </h2>
            <div className="bg-cuephoria-darker/40 rounded-lg border border-cuephoria-lightpurple/20 overflow-hidden">
              {recentTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-cuephoria-lightpurple/10">
                        <th className="px-4 py-3 text-left">Activity</th>
                        <th className="px-4 py-3 text-left">Date</th>
                        <th className="px-4 py-3 text-right">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-cuephoria-lightpurple/10 hover:bg-cuephoria-dark/30">
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {transaction.source.charAt(0).toUpperCase() + transaction.source.slice(1)}
                            </div>
                            <div className="text-xs text-muted-foreground">{transaction.description}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div>{formatDate(transaction.createdAt)}</div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            <span className={transaction.points > 0 ? 'text-green-500' : 'text-red-500'}>
                              {transaction.points > 0 ? '+' : ''}{transaction.points}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-muted-foreground">
                  No recent point activity found.
                </div>
              )}
            </div>
          </div>

          {/* Active Promotions */}
          {activePromotions.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-cuephoria-lightpurple" />
                Current Promotions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activePromotions.map((promotion) => (
                  <Card key={promotion.id} className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
                    <CardContent className="p-5">
                      <h3 className="font-bold text-lg mb-1 text-cuephoria-lightpurple">{promotion.name}</h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{promotion.description}</p>
                      <div className="flex justify-between items-center">
                        <div className="text-sm">
                          {promotion.discountType === 'percentage' ? (
                            <span className="font-semibold text-cuephoria-orange">{promotion.discountValue}% Off</span>
                          ) : promotion.discountType === 'fixed' ? (
                            <span className="font-semibold text-cuephoria-orange">${promotion.discountValue} Off</span>
                          ) : (
                            <span className="font-semibold text-cuephoria-orange">{promotion.discountValue} Free Hours</span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {promotion.endDate ? `Ends ${formatDate(promotion.endDate)}` : 'Limited time offer'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <Button 
              variant="outline" 
              className="h-16 bg-cuephoria-darker border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple hover:text-white"
            >
              Book a Session
            </Button>
            <Button 
              variant="outline" 
              className="h-16 bg-cuephoria-darker border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple hover:text-white"
            >
              View Membership Plans
            </Button>
            <Button 
              variant="outline" 
              className="h-16 bg-cuephoria-darker border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple hover:text-white"
            >
              Browse Rewards
            </Button>
            <Button 
              variant="outline" 
              className="h-16 bg-cuephoria-darker border-cuephoria-lightpurple/30 hover:bg-cuephoria-lightpurple hover:text-white"
            >
              Share Referral Code
            </Button>
          </div>
        </>
      ) : (
        <div className="bg-cuephoria-dark/50 rounded-lg p-8 text-center">
          <p className="text-lg text-muted-foreground mb-4">
            Unable to load dashboard data. Please try refreshing the page.
          </p>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
