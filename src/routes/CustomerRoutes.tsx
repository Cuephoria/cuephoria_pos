
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { CustomerAuthProvider } from '@/context/CustomerAuthContext';

// Customer pages
import CustomerLogin from '@/pages/customer/CustomerLogin';
import CustomerRegister from '@/pages/customer/CustomerRegister';
import CustomerResetPassword from '@/pages/customer/CustomerResetPassword';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import CustomerGameStats from '@/pages/customer/CustomerGameStats';
import CustomerMembership from '@/pages/customer/CustomerMembership';
import CustomerRewards from '@/pages/customer/CustomerRewards';
import CustomerPromotions from '@/pages/customer/CustomerPromotions';
import CustomerProfile from '@/pages/customer/CustomerProfile';
import CustomerSettings from '@/pages/customer/CustomerSettings';

// Customer layout wrapper with authentication check
import CustomerLayout from '@/components/customer/CustomerLayout';

const CustomerRoutes: React.FC = () => {
  return (
    <CustomerAuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/register" element={<CustomerRegister />} />
        <Route path="/reset-password" element={<CustomerResetPassword />} />
        
        {/* Protected routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/customer/dashboard" replace />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="game-stats" element={<CustomerGameStats />} />
          <Route path="membership" element={<CustomerMembership />} />
          <Route path="rewards" element={<CustomerRewards />} />
          <Route path="promotions" element={<CustomerPromotions />} />
          <Route path="profile" element={<CustomerProfile />} />
          <Route path="settings" element={<CustomerSettings />} />
        </Route>
        
        {/* Fallback - redirect to login */}
        <Route path="*" element={<Navigate to="/customer/login" replace />} />
      </Routes>
    </CustomerAuthProvider>
  );
};

export default CustomerRoutes;
