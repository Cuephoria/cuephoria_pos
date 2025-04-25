
import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CustomerSession } from '@/types/customer.types';
import { Calendar, Clock } from 'lucide-react';

const CustomerSessions = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  
  useEffect(() => {
    const fetchSessions = async () => {
      if (!customerUser) return;
      
      try {
        setIsLoading(true);
        
        // Fetch all sessions for this customer
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('sessions')
          .select('id, station_id, start_time, end_time, duration')
          .eq('customer_id', customerUser.customerId)
          .order('start_time', { ascending: false });
          
        if (sessionsError) throw sessionsError;
        
        // Get station details for each session
        const sessionsWithDetails: CustomerSession[] = [];
        
        for (const session of sessionsData) {
          const { data: stationData, error: stationError } = await supabase
            .from('stations')
            .select('name, type, hourly_rate')
            .eq('id', session.station_id)
            .single();
            
          if (!stationError && stationData) {
            // Calculate cost if session has ended
            let cost = 0;
            if (session.end_time && session.duration) {
              // Convert duration from minutes to hours and multiply by hourly rate
              cost = (session.duration / 60) * stationData.hourly_rate;
            }
            
            sessionsWithDetails.push({
              id: session.id,
              station_name: stationData.name,
              station_type: stationData.type,
              start_time: session.start_time,
              end_time: session.end_time || undefined,
              duration: session.duration || 0,
              cost
            });
          }
        }
        
        setSessions(sessionsWithDetails);
      } catch (error: any) {
        console.error('Error fetching sessions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load session history',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSessions();
  }, [customerUser, toast]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes > 0 ? `${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}` : ''}`;
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Sessions</h1>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Sessions</TabsTrigger>
          <TabsTrigger value="active">Active Sessions</TabsTrigger>
          <TabsTrigger value="completed">Completed Sessions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : sessions.length > 0 ? (
            sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>{session.station_name} ({session.station_type})</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateTime(session.start_time)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(session.duration)}
                      </p>
                    </div>
                    {session.end_time && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cost</p>
                        <p className="font-medium">${session.cost.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No sessions found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : sessions.filter(s => !s.end_time).length > 0 ? (
            sessions.filter(s => !s.end_time).map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>{session.station_name} ({session.station_type})</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateTime(session.start_time)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="font-medium text-green-500">Active</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No active sessions</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
            </div>
          ) : sessions.filter(s => s.end_time).length > 0 ? (
            sessions.filter(s => s.end_time).map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle>{session.station_name} ({session.station_type})</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{formatDateTime(session.start_time)}</span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDuration(session.duration)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Cost</p>
                      <p className="font-medium">${session.cost.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10">
              <p className="text-xl text-muted-foreground">No completed sessions</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerSessions;
