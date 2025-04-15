
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, Clock, User, MapPin, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { CalendlyEvent } from '@/services/calendlyService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendlyBookingsProps {
  events: CalendlyEvent[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const CalendlyBookings: React.FC<CalendlyBookingsProps> = ({ 
  events, 
  loading, 
  error, 
  onRefresh 
}) => {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  
  const now = new Date();
  const filteredEvents = events.filter(event => {
    if (activeTab === 'upcoming') return new Date(event.startTime) > now && !event.canceled;
    if (activeTab === 'past') return new Date(event.startTime) <= now && !event.canceled;
    return true;
  });

  if (loading) {
    return (
      <Card className="border-gray-800 bg-[#1A1F2C] shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Loading Calendly Bookings...</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cuephoria-purple"></div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-gray-800 bg-[#1A1F2C] shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Calendly Bookings</span>
            <Button onClick={onRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 mx-auto text-red-500 mb-2" />
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-gray-400 mt-2">
              Please check your Calendly API token and organization URI
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-800 bg-[#1A1F2C] shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Calendly Bookings</span>
          <Button onClick={onRefresh} variant="outline" size="icon" className="h-8 w-8">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
        <Tabs
          defaultValue="upcoming"
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'upcoming' | 'past' | 'all')}
          className="mt-3"
        >
          <TabsList className="bg-gray-800/60 w-full">
            <TabsTrigger value="upcoming" className="flex-1">
              Upcoming ({events.filter(e => new Date(e.startTime) > now && !e.canceled).length})
            </TabsTrigger>
            <TabsTrigger value="past" className="flex-1">
              Past ({events.filter(e => new Date(e.startTime) <= now && !e.canceled).length})
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1">
              All ({events.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 mx-auto text-gray-500 mb-2" />
            <p className="text-lg font-medium">No bookings found</p>
            <p className="text-sm text-gray-400">
              {activeTab === 'upcoming' ? "You don't have any upcoming bookings" : 
               activeTab === 'past' ? "You don't have any past bookings" : 
               "No bookings found in your Calendly account"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEvents.map((event) => {
                  const eventDate = new Date(event.startTime);
                  const endDate = new Date(event.endTime);
                  
                  // Calculate event duration in minutes
                  const durationMinutes = Math.round((endDate.getTime() - eventDate.getTime()) / (1000 * 60));
                  const hours = Math.floor(durationMinutes / 60);
                  const minutes = durationMinutes % 60;
                  
                  return (
                    <TableRow key={event.uri}>
                      <TableCell className="font-medium">
                        <div className="font-medium text-white">{event.name}</div>
                        <div className="text-xs text-gray-400">
                          {event.eventType?.split('/').pop()?.replace(/-/g, ' ')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="flex items-center text-white">
                            <CalendarIcon className="h-3 w-3 mr-2" />
                            {format(eventDate, 'd MMM yyyy')}
                          </div>
                          <div className="flex items-center text-gray-400 text-xs mt-1">
                            <Clock className="h-3 w-3 mr-2" />
                            {format(eventDate, 'h:mm a')} - {format(endDate, 'h:mm a')}
                            <span className="ml-1">({hours}h{minutes > 0 ? ` ${minutes}m` : ''})</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            event.canceled
                              ? "bg-red-900/30 text-red-400 border-red-800"
                              : new Date(event.startTime) > now
                              ? "bg-green-900/30 text-green-400 border-green-800"
                              : "bg-gray-700 text-gray-300"
                          }
                        >
                          {event.canceled
                            ? "Canceled"
                            : new Date(event.startTime) > now
                            ? "Upcoming"
                            : "Completed"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.inviteeName && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center cursor-pointer">
                                    <User className="h-4 w-4 text-cuephoria-purple" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{event.inviteeName}</p>
                                  {event.inviteeEmail && <p className="text-xs">{event.inviteeEmail}</p>}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          
                          {event.location && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center cursor-pointer">
                                    <MapPin className="h-4 w-4 text-blue-400" />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{event.location}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendlyBookings;
