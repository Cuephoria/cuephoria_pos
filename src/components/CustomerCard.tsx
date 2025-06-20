
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePOS, Customer } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { User, Edit, Trash, Clock, CreditCard, Star, Award, CalendarCheck, Calendar } from 'lucide-react';
import { isMembershipActive, getMembershipBadgeText } from '@/utils/membership.utils';

interface CustomerCardProps {
  customer: Customer;
  onEdit?: (customer: Customer) => void;
  onDelete?: (id: string) => void;
  onSelect?: (customer: Customer) => void;
  isSelectable?: boolean;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ 
  customer: initialCustomer, 
  onEdit, 
  onDelete,
  onSelect,
  isSelectable = false
}) => {
  // Keep a local state of the customer to allow for updates
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const { customers } = usePOS();
  
  // Update the customer card whenever the customer data changes in the context
  useEffect(() => {
    const updatedCustomer = customers.find(c => c.id === customer.id);
    if (updatedCustomer) {
      console.log('CustomerCard: Customer data updated for', updatedCustomer.name, {
        oldTotalSpent: customer.totalSpent,
        newTotalSpent: updatedCustomer.totalSpent,
        oldLoyaltyPoints: customer.loyaltyPoints,
        newLoyaltyPoints: updatedCustomer.loyaltyPoints
      });
      
      // Always update with the latest data to ensure real-time updates
      setCustomer(updatedCustomer);
    }
  }, [customers, customer.id]);
  
  // Also update when the initial customer prop changes
  useEffect(() => {
    if (initialCustomer && initialCustomer.id !== customer.id) {
      console.log('CustomerCard: Initial customer prop changed to', initialCustomer.name);
      setCustomer(initialCustomer);
    }
    
    // Also check for data changes even if ID is the same
    else if (initialCustomer && (
      initialCustomer.totalSpent !== customer.totalSpent || 
      initialCustomer.loyaltyPoints !== customer.loyaltyPoints
    )) {
      console.log('CustomerCard: Initial customer data updated', {
        oldTotalSpent: customer.totalSpent,
        newTotalSpent: initialCustomer.totalSpent,
        oldLoyaltyPoints: customer.loyaltyPoints,
        newLoyaltyPoints: initialCustomer.loyaltyPoints
      });
      setCustomer(initialCustomer);
    }
  }, [initialCustomer, customer.id, customer.totalSpent, customer.loyaltyPoints]);

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN');
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-lg">
            <User className="h-5 w-5 mr-2" />
            {customer.name}
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
                  <span>{customer.membershipHoursLeft}</span>
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
