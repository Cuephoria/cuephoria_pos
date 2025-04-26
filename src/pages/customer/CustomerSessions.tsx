
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Clock, DollarSign } from 'lucide-react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getCustomerSessions } from '@/services/customerService';
import { CustomerSession } from '@/types/customer.types';

const CustomerSessions = () => {
  const { customerUser } = useCustomerAuth();
  const [sessions, setSessions] = useState<CustomerSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadSessions = async () => {
      if (customerUser) {
        try {
          setIsLoading(true);
          const sessions = await getCustomerSessions(customerUser.customer_id);
          setSessions(sessions);
        } catch (error) {
          console.error('Error loading sessions:', error);
          toast({
            title: 'Error',
            description: 'Failed to load session history',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadSessions();
  }, [customerUser, toast]);

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Your Sessions</h1>
        <p className="text-muted-foreground text-sm sm:text-base">View your gameplay history</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Session History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : sessions.length > 0 ? (
            <div className="space-y-6">
              {sessions.map((session) => (
                <Card key={session.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-lg">{session.stationName}</h3>
                        <p className="text-sm text-muted-foreground">Station type: {session.stationType}</p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md">
                          <CalendarDays size={16} className="text-primary" />
                          <span>{session.startTime.toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md">
                          <Clock size={16} className="text-primary" />
                          <span>
                            {session.duration 
                              ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`
                              : 'In progress'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-md">
                          <DollarSign size={16} className="text-primary" />
                          <span>${session.totalCost.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Time</p>
                        <p>{session.startTime.toLocaleTimeString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Time</p>
                        <p>{session.endTime ? session.endTime.toLocaleTimeString() : 'Active'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Hourly Rate</p>
                        <p>${session.hourlyRate.toFixed(2)}/hour</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No sessions found.</p>
              <p>Visit Cuephoria to start playing and track your sessions here!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSessions;
