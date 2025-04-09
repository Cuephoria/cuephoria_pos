
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePOS, Customer } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { User, Edit, Trash, Clock, CreditCard, Star, Award, CalendarCheck, Calendar } from 'lucide-react';
import { isMembershipActive, getMembershipBadgeText, getHoursLeftColor, formatHoursAsDuration } from '@/utils/membership.utils';

interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
  onSelect?: (customer: Customer) => void;
  isSelectable?: boolean;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ 
  customer, 
  onEdit, 
  onDelete,
  onSelect,
  isSelectable = false
}) => {
  // Find if this customer has any active sessions
  const { stations } = usePOS();
  const activeSession = stations.find(s => 
    s.isOccupied && 
    s.currentSession && 
    s.currentSession.customerId === customer.id
  );

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Highlight card if customer has an active session
  const hasActiveSession = !!activeSession;

  return (
    <Card className={hasActiveSession ? "border-2 border-cuephoria-orange" : ""}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <User className="h-5 w-5 mr-2" />
            {customer.name}
            {hasActiveSession && (
              <Badge className="ml-2 bg-cuephoria-orange">Active</Badge>
            )}
          </CardTitle>
          <Badge className={isMembershipActive(customer) ? 'bg-cuephoria-purple' : 'bg-gray-500'}>
            {getMembershipBadgeText(customer)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm">
            <span>Phone:</span>
            <span>{customer.phone}</span>
          </div>
          {customer.email && (
            <div className="flex justify-between text-sm">
              <span>Email:</span>
              <span className="truncate max-w-[150px]">{customer.email}</span>
            </div>
          )}
          
          {customer.isMember && (
            <>
              {customer.membershipPlan && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Award className="h-4 w-4 mr-1" /> Plan:
                  </span>
                  <span>{customer.membershipPlan}</span>
                </div>
              )}
              
              {customer.membershipStartDate && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" /> Start:
                  </span>
                  <span>{formatDate(customer.membershipStartDate)}</span>
                </div>
              )}
              
              {customer.membershipExpiryDate && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <CalendarCheck className="h-4 w-4 mr-1" /> End:
                  </span>
                  <span>{formatDate(customer.membershipExpiryDate)}</span>
                </div>
              )}
              
              {customer.membershipHoursLeft !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" /> Hours Left:
                  </span>
                  <span className={getHoursLeftColor(customer.membershipHoursLeft)}>
                    {formatHoursAsDuration(customer.membershipHoursLeft)}
                    {customer.membershipHoursLeft <= 2 && customer.membershipHoursLeft > 0 && 
                      <span className="ml-1 text-amber-500">⚠️</span>}
                    {customer.membershipHoursLeft <= 0 && 
                      <span className="ml-1 text-red-500">⛔</span>}
                  </span>
                </div>
              )}
            </>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Star className="h-4 w-4 mr-1" /> Loyalty:
            </span>
            <span>{customer.loyaltyPoints} points</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <CreditCard className="h-4 w-4 mr-1" /> Total Spent:
            </span>
            <CurrencyDisplay amount={customer.totalSpent} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-1" /> Play Time:
            </span>
            <span>{formatTime(customer.totalPlayTime)}</span>
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Joined:</span>
            <span>{formatDate(customer.createdAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {isSelectable ? (
          <Button 
            variant="default" 
            className="w-full"
            onClick={() => onSelect && onSelect(customer)}
          >
            Select Customer
          </Button>
        ) : (
          <>
            {onEdit && (
              <Dialog>
                <DialogContent className="bg-background">
                  <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit && onEdit(customer)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete && onDelete(customer.id)}
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default CustomerCard;
