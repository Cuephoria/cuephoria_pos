
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface CustomerProtectedRouteProps {
  children: React.ReactNode;
}

const CustomerProtectedRoute: React.FC<CustomerProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useCustomerAuth();
  const location = useLocation();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
        <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
      </div>
    );
  }
  
  if (!user) {
    // Redirect to login page with current location for redirect back after login
    return <Navigate to="/customer/login" state={{ from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

export default CustomerProtectedRoute;
