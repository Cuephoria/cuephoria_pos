
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const CustomerProfile: React.FC = () => {
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
          Profile
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information.
        </p>
      </div>
      
      <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 mb-6">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent>
          {customerUser ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="font-medium">{customerUser.email}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Referral Code</label>
                  <p className="font-medium">{customerUser.referralCode || 'Not available'}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Unable to load profile information.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerProfile;
