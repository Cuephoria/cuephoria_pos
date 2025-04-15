
import { useState } from "react";
import { format } from "date-fns";
import { CalendlyEvent, cancelEvent } from "@/services/calendlyService";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Video, User, Mail, ArrowUpRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BookingCardProps {
  booking: CalendlyEvent;
  onCancel?: () => void;
}

const BookingCard = ({ booking, onCancel }: BookingCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  
  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };
  
  const handleCancel = async () => {
    setIsLoading(true);
    try {
      const eventId = booking.uri.split('/').pop();
      if (!eventId) throw new Error("Invalid event URI");
      
      const success = await cancelEvent(eventId);
      
      if (success) {
        toast({
          title: "Booking cancelled",
          description: "The booking has been successfully cancelled.",
        });
        if (onCancel) onCancel();
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast({
        title: "Error",
        description: "Failed to cancel the booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Determine location type icon
  const getLocationIcon = () => {
    switch (booking.location.type) {
      case 'physical':
        return <MapPin className="h-4 w-4" />;
      case 'google_meet':
      case 'zoom':
      case 'microsoft_teams':
        return <Video className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-lg hover:shadow-purple-900/10 transition-all">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium text-white">
            {booking.name}
          </CardTitle>
          <Badge 
            variant={booking.status === 'active' ? 'default' : 'destructive'}
            className={`${booking.status === 'active' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            {booking.status === 'active' ? 'Confirmed' : 'Cancelled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-gray-300">
            <Calendar className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
            <span>{format(startDate, 'EEEE, MMMM d, yyyy')}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            <Clock className="h-4 w-4 mr-2 text-cuephoria-lightpurple" />
            <span>{formatTime(startDate)} - {formatTime(endDate)}</span>
          </div>
          
          <div className="flex items-center text-gray-300">
            {getLocationIcon()}
            <span className="ml-2">
              {booking.location.location || booking.location.type.replace('_', ' ')}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-1">Attendee</p>
          <div className="flex items-center text-gray-300 mb-1">
            <User className="h-4 w-4 mr-2 text-cuephoria-blue" />
            <span>{booking.invitee.name}</span>
          </div>
          <div className="flex items-center text-gray-300">
            <Mail className="h-4 w-4 mr-2 text-cuephoria-blue" />
            <span className="text-sm">{booking.invitee.email}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2 border-t border-gray-700">
        {booking.status === 'active' && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isLoading}>
                {isLoading ? "Cancelling..." : "Cancel Booking"}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-[#1A1F2C] border-gray-700">
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel the booking. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-gray-700">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleCancel}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        
        {booking.rescheduleUrl && (
          <Button 
            variant="outline" 
            onClick={() => window.open(booking.rescheduleUrl, '_blank')}
            className="border-gray-700"
          >
            Reschedule <ArrowUpRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BookingCard;
