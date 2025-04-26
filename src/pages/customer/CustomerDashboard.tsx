
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Clock, CalendarDays, CreditCard, Trophy, Users, User } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerSessions } from '@/services/customerService';
import { CustomerSession } from '@/types/customer.types';

const CustomerDashboard = () => {
  const { customerUser, customerProfile, refreshProfile } = useCustomerAuth();
  const [recentSessions, setRecentSessions] = useState<CustomerSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadData = async () => {
      if (customerUser) {
        try {
          setIsLoading(true);
          
          // Refresh profile data
          await refreshProfile();
          
          // Fetch recent sessions
          const sessions = await getCustomerSessions(customerUser.customer_id);
          setRecentSessions(sessions.slice(0, 3));
        } catch (error) {
          console.error('Error loading dashboard data:', error);
          toast({
            title: 'Error',
            description: 'Failed to load dashboard data',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadData();
  }, [customerUser, refreshProfile, toast]);

  if (!customerProfile) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome, {customerProfile.name}</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Your personalized dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              Loyalty Points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{customerProfile.loyaltyPoints}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/customer/rewards" className="text-primary hover:underline">Redeem rewards</Link>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock size={16} className="text-blue-400" />
              Play Time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{Math.floor(customerProfile.totalPlayTime / 60)} hrs</p>
            <p className="text-xs text-muted-foreground mt-1">Total time at Cuephoria</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CreditCard size={16} className="text-green-400" />
              Total Spent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${customerProfile.totalSpent.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Lifetime spend</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users size={16} className="text-purple-400" />
              Referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold truncate">{customerProfile.referralCode}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <Link to="/customer/referrals" className="text-primary hover:underline">Manage referrals</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Membership Card */}
      <Card className="mb-8 bg-gradient-to-br from-cuephoria-darker to-cuephoria-dark border-cuephoria-orange/30">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <User className="text-cuephoria-orange" />
              Membership Status
            </span>
            {customerProfile.isMember && (
              <Button size="sm" variant="outline" className="bg-cuephoria-orange/10 border-cuephoria-orange/30 text-cuephoria-orange hover:bg-cuephoria-orange/20">
                Active
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customerProfile.isMember ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-medium">{customerProfile.membershipPlan}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium capitalize">{customerProfile.membershipDuration}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {customerProfile.membershipStartDate?.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expiry Date</p>
                  <p className="font-medium">
                    {customerProfile.membershipExpiryDate?.toLocaleDateString()}
                  </p>
                </div>
                {customerProfile.membershipHoursLeft !== undefined && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground">Hours Remaining</p>
                    <p className="font-medium">{customerProfile.membershipHoursLeft} hours</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">You currently don't have an active membership.</p>
              <Button className="bg-cuephoria-orange hover:bg-cuephoria-orange/90">
                Purchase Membership
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Recent Sessions</span>
            <Link to="/customer/sessions">
              <Button size="sm" variant="ghost">View All</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : recentSessions.length > 0 ? (
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex justify-between items-center border-b border-border pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{session.stationName}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays size={14} />
                      <span>{session.startTime.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${session.totalCost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      {session.duration ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m` : 'In progress'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent sessions found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerDashboard;
