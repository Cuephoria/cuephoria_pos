
import React from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

const CustomerDashboard = () => {
  const { customerUser } = useCustomerAuth();
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {customerUser?.name || 'Customer'}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
          <p className="text-muted-foreground mb-4">Manage your personal information</p>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm text-muted-foreground">Email</dt>
              <dd>{customerUser?.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Phone</dt>
              <dd>{customerUser?.phone}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Referral Code</dt>
              <dd className="font-medium">{customerUser?.referralCode}</dd>
            </div>
          </dl>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Quick Actions</h2>
          <p className="text-muted-foreground mb-4">Common tasks you might want to perform</p>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-primary bg-primary/10 rounded-md hover:bg-primary/20">
              Book a new session
            </button>
            <button className="w-full text-left px-4 py-2 text-primary bg-primary/10 rounded-md hover:bg-primary/20">
              View your rewards
            </button>
            <button className="w-full text-left px-4 py-2 text-primary bg-primary/10 rounded-md hover:bg-primary/20">
              Check loyalty points
            </button>
          </div>
        </div>
        
        <div className="bg-card p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <p className="text-muted-foreground mb-4">Your recent sessions and purchases</p>
          <div className="text-sm">
            <p className="text-center py-6 text-muted-foreground">
              No recent activity to display
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
