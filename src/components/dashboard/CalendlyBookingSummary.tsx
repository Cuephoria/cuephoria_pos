
import React from 'react';
import { format } from 'date-fns';
import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CalendlyEvent } from '@/services/calendlyService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CalendlyBookingSummaryProps {
  events: CalendlyEvent[];
  loading: boolean;
}

const CalendlyBookingSummary: React.FC<CalendlyBookingSummaryProps> = ({ events, loading }) => {
  // Filter to show only upcoming events
  const now = new Date();
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) > now && !event.canceled)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);

  if (loading) {
    return (
      <Card className="border-gray-800 bg-[#1A1F2C] shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-cuephoria-purple" />
            Upcoming Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-800 rounded-md animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-800 rounded animate-pulse" />
                  <div className="h-3 bg-gray-800 rounded animate-pulse w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If there are no API credentials set, show a prompt to configure
  if (!events || events.length === 0) {
    return (
      <Card className="border-gray-800 bg-[#1A1F2C] shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-cuephoria-purple" />
            Upcoming Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Calendar className="mx-auto h-12 w-12 text-gray-500 mb-3" />
          <h3 className="text-lg font-medium">No bookings found</h3>
          <p className="text-sm text-gray-400 mt-1">
            Connect your Calendly account to see your bookings
          </p>
        </CardContent>
        <CardFooter className="justify-center pb-6">
          <Button asChild>
            <Link to="/calendly">Configure Calendly</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800 bg-[#1A1F2C] shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-cuephoria-purple" />
          Upcoming Bookings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingEvents.length > 0 ? (
            upcomingEvents.map((event) => {
              const eventDate = new Date(event.startTime);
              
              return (
                <div key={event.uri} className="flex items-center space-x-3">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-md bg-gray-800 text-white">
                    <span className="text-xs font-medium">{format(eventDate, 'MMM')}</span>
                    <span className="text-lg font-bold leading-none">{format(eventDate, 'd')}</span>
                  </div>
                  <div>
                    <p className="font-medium text-white">{event.name}</p>
                    <div className="flex items-center text-sm text-gray-400">
                      <span>{format(eventDate, 'h:mm a')}</span>
                      {event.inviteeName && (
                        <>
                          <span className="mx-1">•</span>
                          <span>{event.inviteeName}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400">No upcoming bookings</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link to="/calendly" className="flex items-center justify-center">
            View All Bookings 
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CalendlyBookingSummary;
