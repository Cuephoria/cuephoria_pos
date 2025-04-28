
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CustomerGameStats: React.FC = () => {
  return (
    <div className="container mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          Game Statistics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your performance and progress over time.
        </p>
      </div>
      
      <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Detailed game statistics will be available in a future update. Check back soon!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerGameStats;
