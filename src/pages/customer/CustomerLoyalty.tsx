
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getLoyaltyTransactions } from '@/services/customerService';
import { ArrowUp, ArrowDown, Clock } from 'lucide-react';
import { LoyaltyTransaction } from '@/types/customer.types';

const CustomerLoyalty = () => {
  const { customerUser, customerProfile } = useCustomerAuth();
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTransactions = async () => {
      if (customerUser) {
        try {
          setIsLoading(true);
          const transactions = await getLoyaltyTransactions(customerUser.customer_id);
          setTransactions(transactions);
        } catch (error) {
          console.error('Error loading loyalty transactions:', error);
          toast({
            title: 'Error',
            description: 'Failed to load loyalty points history',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadTransactions();
  }, [customerUser, toast]);

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Loyalty Points</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Track and manage your loyalty rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-1 bg-cuephoria-dark">
          <CardHeader>
            <CardTitle>Available Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center p-6">
              <div className="text-5xl font-bold mb-2">
                {customerProfile?.loyaltyPoints ?? 0}
              </div>
              <p className="text-muted-foreground">Loyalty Points</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>How to Earn Points</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-primary/5 rounded-md">
                <h3 className="font-bold mb-2">Purchases</h3>
                <p className="text-sm text-muted-foreground">Earn 1 point for every $1 spent on food, drinks, and merchandise.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-md">
                <h3 className="font-bold mb-2">Game Sessions</h3>
                <p className="text-sm text-muted-foreground">Earn 5 points for every hour of gameplay at our stations.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-md">
                <h3 className="font-bold mb-2">Referrals</h3>
                <p className="text-sm text-muted-foreground">Earn 100 points when a friend signs up using your referral code.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-md">
                <h3 className="font-bold mb-2">Promotions</h3>
                <p className="text-sm text-muted-foreground">Participate in special events to earn bonus points.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Points History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center border-b border-border pb-4 last:border-0">
                  <div>
                    <p className="font-medium capitalize">{transaction.source}</p>
                    <p className="text-sm text-muted-foreground">{transaction.description}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock size={12} />
                      <span>{new Date(transaction.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 ${transaction.points > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.points > 0 ? (
                      <>
                        <ArrowUp size={16} />
                        <span className="font-bold">+{transaction.points}</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown size={16} />
                        <span className="font-bold">{transaction.points}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No points history found.</p>
              <p>Start making purchases or play games to earn loyalty points!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerLoyalty;
