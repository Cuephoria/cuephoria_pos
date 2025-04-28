
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CustomerSettings: React.FC = () => {
  const { isLoading } = useCustomerAuth();

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
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Customize your account preferences.
        </p>
      </div>
      
      <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Notification Preferences</h3>
                <p className="text-muted-foreground">
                  Notification settings will be available in a future update.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-2">Privacy Settings</h3>
                <p className="text-muted-foreground">
                  Privacy settings will be available in a future update.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerSettings;
