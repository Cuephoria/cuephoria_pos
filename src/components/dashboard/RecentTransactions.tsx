
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bill, Customer } from '@/types/pos.types';
import { formatCurrency } from '@/components/ui/currency';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

interface RecentTransactionsProps {
  bills: Bill[];
  customers: Customer[];
  isLoading?: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ bills, customers, isLoading = false }) => {
  // Get recent bills
  const recentBills = [...bills]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);
  
  const getCustomerName = (customerId: string | undefined): string => {
    if (!customerId) return 'Unknown';
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Unknown';
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest sales transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
              <div>
                <Skeleton className="h-5 w-32 mb-1" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }
  
  if (recentBills.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest sales transactions</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-8">
          <p className="text-muted-foreground">No recent transactions</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Latest sales transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {recentBills.map(bill => (
          <div key={bill.id} className="flex items-center justify-between py-2 border-b last:border-0">
            <div>
              <p className="font-semibold">{getCustomerName(bill.customerId)}</p>
              <p className="text-sm text-muted-foreground">
                {format(bill.createdAt, 'MMM d, h:mm a')} · {bill.paymentMethod.toUpperCase()}
              </p>
            </div>
            <p className="font-bold indian-rupee">
              {formatCurrency(bill.total)}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
