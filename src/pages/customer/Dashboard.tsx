
import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import CustomerLayout from '@/components/customer/CustomerLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CircleDollarSign,
  Award,
  Clock,
  Calendar,
  CalendarDays
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface RecentActivity {
  id: string;
  type: 'booking' | 'purchase' | 'reward' | 'membership';
  description: string;
  date: Date;
}

const CustomerDashboard: React.FC = () => {
  const { user } = useCustomerAuth();
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock activity data - would be replaced with actual data from backend
  useEffect(() => {
    const fetchRecentActivity = async () => {
      setIsLoading(true);
      
      try {
        if (!user?.id) return;
        
        // Fetch recent bills for this customer
        const { data: bills, error: billsError } = await supabase
          .from('bills')
          .select('*')
          .eq('customer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (billsError) throw billsError;
        
        // Fetch recent sessions for this customer
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('*')
          .eq('customer_id', user.id)
          .order('start_time', { ascending: false })
          .limit(5);
          
        if (sessionsError) throw sessionsError;
        
        // Combine and transform the data
        const combinedActivity = [
          ...(bills || []).map((bill: any) => ({
            id: `bill-${bill.id}`,
            type: 'purchase' as const,
            description: `Purchase: ₹${bill.total.toFixed(2)}`,
            date: new Date(bill.created_at)
          })),
          ...(sessions || []).map((session: any) => ({
            id: `session-${session.id}`,
            type: 'booking' as const,
            description: `Game session${session.duration ? ` (${session.duration} minutes)` : ''}`,
            date: new Date(session.start_time)
          }))
        ];
        
        // Sort by date, most recent first
        combinedActivity.sort((a, b) => b.date.getTime() - a.date.getTime());
        
        setRecentActivity(combinedActivity.slice(0, 5));
      } catch (error) {
        console.error('Error fetching recent activity:', error);
        setRecentActivity([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentActivity();
  }, [user?.id]);
  
  // Format membership status
  const membershipStatus = () => {
    if (!user?.isMember) return "Not a member";
    
    if (user.membershipExpiryDate) {
      const daysLeft = Math.ceil((user.membershipExpiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return `${user.membershipPlan} - ${daysLeft} days left`;
    }
    
    return user.membershipPlan || "Active";
  };
  
  // Calculate progress for next reward
  const loyaltyProgress = user?.loyaltyPoints ? user.loyaltyPoints % 100 : 0;
  const pointsToNextReward = 100 - loyaltyProgress;

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.name}!</h1>
            <p className="text-muted-foreground">
              Here's an overview of your rewards, bookings, and membership details.
            </p>
          </div>
          
          <Badge 
            className="text-sm px-3 py-1" 
            variant={user?.isMember ? "default" : "outline"}
          >
            <Award className="w-3.5 h-3.5 mr-1.5" />
            {membershipStatus()}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Loyalty points card */}
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <CircleDollarSign className="w-4 h-4 mr-2 text-primary" />
                Loyalty Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user?.loyaltyPoints || 0}</div>
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Progress to next reward</span>
                  <span>{loyaltyProgress}/100 points</span>
                </div>
                <Progress value={loyaltyProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Earn {pointsToNextReward} more points for a free reward
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Total play time */}
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                Total Play Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user?.totalPlayTime 
                  ? `${Math.floor(user.totalPlayTime / 60)} hrs ${user.totalPlayTime % 60} mins` 
                  : '0 hrs'}
              </div>
              {user?.isMember && user.membershipHoursLeft !== undefined && (
                <div className="mt-3">
                  <div className="text-sm font-medium">
                    Membership Hours Left
                  </div>
                  <div className="text-xl mt-1">
                    {user.membershipHoursLeft} hrs
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Visit statistics */}
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center">
                <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                Visits & Spending
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Visits</span>
                <Badge variant="outline">
                  {recentActivity.filter(a => a.type === 'booking').length || 0}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Total Spent</span>
                <Badge variant="secondary" className="indian-rupee">
                  {user?.totalSpent?.toFixed(2) || '0.00'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest visits, purchases, and rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div 
                    key={activity.id} 
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      {activity.type === 'booking' && (
                        <div className="bg-blue-500/20 p-2 rounded-full">
                          <Calendar className="h-4 w-4 text-blue-500" />
                        </div>
                      )}
                      {activity.type === 'purchase' && (
                        <div className="bg-green-500/20 p-2 rounded-full">
                          <CircleDollarSign className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {(activity.type === 'reward' || activity.type === 'membership') && (
                        <div className="bg-purple-500/20 p-2 rounded-full">
                          <Award className="h-4 w-4 text-purple-500" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.date.toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        activity.type === 'booking' ? 'outline' :
                        activity.type === 'purchase' ? 'secondary' : 
                        'default'
                      }
                      className="text-xs"
                    >
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No recent activity found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
