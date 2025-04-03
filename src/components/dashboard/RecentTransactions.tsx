
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { User } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

const RecentTransactions: React.FC = () => {
  const { bills, customers } = usePOS();
  
  // Sort bills by date (newest first)
  const sortedBills = [...bills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get the 5 most recent transactions
  const recentBills = sortedBills.slice(0, 5);
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white font-heading">Recent Transactions</CardTitle>
        <CardDescription className="text-gray-400">Latest sales and billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentBills.length > 0 ? (
          recentBills.map(bill => {
            const customer = customers.find(c => c.id === bill.customerId);
            const date = new Date(bill.createdAt);
            
            return (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
                    <p className="text-xs text-gray-400">
                      {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
                <div className="text-white font-semibold">
                  ₹{bill.total.toFixed(2)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center p-6 text-gray-400">
            <p>No transactions recorded yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
