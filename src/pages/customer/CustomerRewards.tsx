
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CustomerRewards: React.FC = () => {
  const { customerUser, isLoading } = useCustomerAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          Rewards
        </h1>
        <p className="text-muted-foreground mt-1">
          Redeem your loyalty points for exciting rewards.
        </p>
      </div>
      
      <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Available Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-3xl font-bold text-cuephoria-lightpurple">
              {customerUser?.loyaltyPoints || 0}
            </div>
            <div className="text-muted-foreground text-sm">
              points available to redeem
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
        <CardHeader>
          <CardTitle>Available Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Rewards will be available in a future update. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerRewards;
