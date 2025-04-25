
import React from 'react';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';

const CustomerSessions = () => {
  const { customerUser } = useCustomerAuth();
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Your Sessions</h1>
      <div className="bg-card p-6 rounded-lg shadow">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No sessions found. Book a session to get started!
          </p>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
            Book a Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerSessions;
