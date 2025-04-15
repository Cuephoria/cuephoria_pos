
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Receipt, User, ShoppingBag } from 'lucide-react';
import { usePOS } from '@/context/POSContext'; 
import { CurrencyDisplay } from '@/components/ui/currency';
import { format } from 'date-fns';

const RecentTransactions = () => {
  const { bills, customers } = usePOS();
  
  // Sort bills by date (most recent first) and take the 5 most recent
  const recentBills = React.useMemo(() => {
    return [...bills]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [bills]);
  
  // Function to get customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer ? customer.name : 'Walk-in Customer';
  };
  
  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, h:mm a');
    } catch (e) {
      return dateString;
    }
  };
  
  // Function to get transaction icon based on type
  const getTransactionIcon = (bill: any) => {
    // This can be expanded to have different icons for different transaction types
    if (bill.items.length > 3) {
      return <ShoppingBag className="h-8 w-8 p-1.5 rounded-full bg-purple-500/20 text-purple-500" />;
    }
    return <Receipt className="h-8 w-8 p-1.5 rounded-full bg-blue-500/20 text-blue-500" />;
  };
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white font-heading">Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentBills.length > 0 ? (
            recentBills.map(bill => (
              <div key={bill.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/50">
                {getTransactionIcon(bill)}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {bill.items.length} item{bill.items.length !== 1 ? 's' : ''}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <User className="h-3 w-3" />
                    <span className="truncate">{getCustomerName(bill.customerId)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    <CurrencyDisplay amount={bill.total} />
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(bill.date)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center p-6 text-gray-400">
              <p>No transactions yet</p>
            </div>
          )}
        </div>
        
        {recentBills.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <button className="w-full text-center text-sm text-cuephoria-purple hover:text-purple-400">
              View all transactions
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
