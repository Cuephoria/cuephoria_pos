
import React from 'react';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { POSProvider } from '@/context/POSContext';

const AppLayout: React.FC = () => {
  return (
    <AuthProvider>
      <POSProvider>
        <div className="min-h-screen bg-background">
          <Outlet />
        </div>
      </POSProvider>
    </AuthProvider>
  );
};

export default AppLayout;
