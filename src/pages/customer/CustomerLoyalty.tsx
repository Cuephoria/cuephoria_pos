
import React, { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { LoyaltyTransaction } from '@/types/customer.types';

const CustomerLoyalty = () => {
  const { customerUser } = useCustomerAuth();
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      if (!customerUser) return;
      
      try {
        // Get customer loyalty points using RPC
        const { data: customerData, error: customerError } = await supabase.rpc(
          'get_customer_loyalty_points',
          { customer_id: customerUser.customerId }
        );
        
        if (!customerError && customerData) {
          setLoyaltyPoints(customerData.loyalty_points || 0);
        }
        
        // Get loyalty transactions using RPC
        const { data: transactionsData, error: transactionsError } = await supabase.rpc(
          'get_loyalty_transactions',
          { customer_id: customerUser.customerId }
        );
        
        if (!transactionsError && transactionsData) {
          setTransactions(transactionsData as LoyaltyTransaction[]);
        }
      } catch (error) {
        console.error('Error fetching loyalty data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoyaltyData();
  }, [customerUser]);

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Loyalty Points</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Loyalty Points</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Current Balance</CardTitle>
          <CardDescription>Earn points with every purchase and session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="text-5xl font-bold">{loyaltyPoints}</div>
            <div className="ml-4 text-muted-foreground">points</div>
          </div>
        </CardContent>
      </Card>
      
      <h2 className="text-2xl font-semibold mb-4">Transaction History</h2>
      
      {transactions.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <p className="text-muted-foreground">No transactions yet</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-right">Points</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="border-b">
                  <td className="px-4 py-3">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">{transaction.description}</td>
                  <td className="px-4 py-3">{transaction.source}</td>
                  <td className={`px-4 py-3 text-right ${transaction.points > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.points > 0 ? '+' : ''}{transaction.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CustomerLoyalty;
