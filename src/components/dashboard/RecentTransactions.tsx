
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { User } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

const RecentTransactions: React.FC = () => {
  const { bills, customers } = usePOS();
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-white font-heading">Recent Transactions</CardTitle>
        <CardDescription className="text-gray-400">Latest sales and billing information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {bills.length > 0 ? (
          bills.slice(0, 5).map(bill => {
            const customer = customers.find(c => c.id === bill.customerId);
            
            return (
              <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
                    <p className="text-xs text-gray-400">{new Date(bill.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
                <div className="text-white font-semibold">
                  ₹{bill.total.toFixed(2)}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                <User className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">Mike Johnson</p>
                <p className="text-xs text-gray-400">3:45 PM</p>
              </div>
            </div>
            <div className="text-white font-semibold">
              ₹18.70
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
