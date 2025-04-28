
import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import CustomerSidebar from './CustomerSidebar';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import LoadingSpinner from '../ui/loading-spinner';

const CustomerLayout: React.FC = () => {
  const { user, isLoading } = useCustomerAuth();
  const location = useLocation();

  // Preload images for better user experience
  useEffect(() => {
    const preloadImages = async () => {
      const imagesToPreload = [
        '/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png'
      ];
      
      imagesToPreload.forEach((src) => {
        const img = new Image();
        img.src = src;
      });
    };
    
    preloadImages();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // If not logged in, redirect to login page while preserving the intended destination
  if (!user) {
    return <Navigate to="/customer/login" state={{ from: location.pathname }} replace />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-cuephoria-dark text-white">
        <CustomerSidebar />
        <div className="flex-1 flex flex-col">
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
        <Toaster />
      </div>
    </SidebarProvider>
  );
};

export default CustomerLayout;
