
import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CustomerSession } from '@/types/customer.types';

const CustomerDashboard = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [recentSessions, setRecentSessions] = useState<CustomerSession[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!customerUser) return;
      
      try {
        setIsLoading(true);
        
        // Fetch customer data
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('loyalty_points, is_member, membership_expiry_date')
          .eq('id', customerUser.customerId)
          .single();
          
        if (customerError) throw customerError;
        
        setLoyaltyPoints(customerData.loyalty_points || 0);
        
        // Fetch recent sessions
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('id, station_id, start_time, end_time, duration')
          .eq('customer_id', customerUser.customerId)
          .order('start_time', { ascending: false })
          .limit(5);
          
        if (sessionsError) throw sessionsError;
        
        // Get station details for each session
        const sessionsWithDetails: CustomerSession[] = [];
        
        for (const session of sessionsData) {
          const { data: stationData, error: stationError } = await supabase
            .from('stations')
            .select('name, type')
            .eq('id', session.station_id)
            .single();
            
          if (!stationError && stationData) {
            sessionsWithDetails.push({
              id: session.id,
              station_name: stationData.name,
              station_type: stationData.type,
              start_time: session.start_time,
              end_time: session.end_time || undefined,
              duration: session.duration || 0,
              cost: 0 // Could calculate this if hourly_rate is available
            });
          }
        }
        
        setRecentSessions(sessionsWithDetails);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [customerUser, toast]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Welcome, {customerUser?.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Loyalty Points</CardTitle>
            <CardDescription>Your current points balance</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-12 w-24" />
            ) : (
              <p className="text-3xl font-bold">{loyaltyPoints}</p>
            )}
          </CardContent>
        </Card>
        
        {/* Add more stat cards here */}
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest play sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="space-y-4">
                {recentSessions.map(session => (
                  <div key={session.id} className="flex justify-between items-center p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{session.station_name} ({session.station_type})</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.start_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{session.duration} mins</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent sessions found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CustomerDashboard;
