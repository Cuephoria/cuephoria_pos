
import { useEffect, useState } from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoyaltyTransaction } from '@/types/customer.types';
import { Badge } from '@/components/ui/badge';
import { Trophy } from 'lucide-react';

const CustomerLoyalty = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [transactions, setTransactions] = useState<LoyaltyTransaction[]>([]);
  
  useEffect(() => {
    const fetchLoyaltyData = async () => {
      if (!customerUser) return;
      
      try {
        setIsLoading(true);
        
        // Fetch customer loyalty points
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('loyalty_points')
          .eq('id', customerUser.customerId)
          .single();
          
        if (customerError) throw customerError;
        
        setLoyaltyPoints(customerData.loyalty_points || 0);
        
        // Fetch loyalty transactions
        const { data: transactionsData, error: transactionsError } = await supabase
          .from('loyalty_transactions')
          .select('*')
          .eq('customer_id', customerUser.customerId)
          .order('created_at', { ascending: false });
          
        if (transactionsError) throw transactionsError;
        
        setTransactions(transactionsData as LoyaltyTransaction[]);
      } catch (error: any) {
        console.error('Error fetching loyalty data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load loyalty data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLoyaltyData();
  }, [customerUser, toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Loyalty Program</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-400" />
              Your Loyalty Points
            </CardTitle>
            <CardDescription>Earn points for every dollar spent and redeem for rewards</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <p className="text-5xl font-bold mb-2">{isLoading ? '...' : loyaltyPoints}</p>
                <p className="text-sm text-muted-foreground">Available Points</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Points History</CardTitle>
            <CardDescription>Track your points earned and spent</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center border-b last:border-0 pb-3 mb-3 last:pb-0 last:mb-0">
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                      <Badge variant={getSourceBadgeVariant(transaction.source)} className="mt-1">
                        {getFormattedSource(transaction.source)}
                      </Badge>
                    </div>
                    <div className={`text-lg font-bold ${transaction.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {transaction.points >= 0 ? '+' : ''}{transaction.points} pts
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">No point transactions yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>How to Earn Points</CardTitle>
            <CardDescription>Ways to increase your loyalty points</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2">
              <li>1 point for every $1 spent on play sessions</li>
              <li>5 points for every $1 spent on food and drinks</li>
              <li>50 points for each friend you refer who signs up</li>
              <li>Additional 100 points when a referred friend makes their first purchase</li>
              <li>20 points on your birthday</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper functions
const getSourceBadgeVariant = (source: string) => {
  switch (source) {
    case 'purchase':
      return 'default';
    case 'referral':
      return 'secondary';
    case 'reward_redemption':
      return 'destructive';
    case 'admin_adjustment':
      return 'outline';
    case 'welcome_bonus':
      return 'success';
    default:
      return 'default';
  }
};

const getFormattedSource = (source: string) => {
  switch (source) {
    case 'purchase':
      return 'Purchase';
    case 'referral':
      return 'Referral';
    case 'reward_redemption':
      return 'Reward Redemption';
    case 'admin_adjustment':
      return 'Adjustment';
    case 'welcome_bonus':
      return 'Welcome Bonus';
    default:
      return source.charAt(0).toUpperCase() + source.slice(1).replace('_', ' ');
  }
};

export default CustomerLoyalty;
