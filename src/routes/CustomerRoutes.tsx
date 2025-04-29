
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '@/components/customer/CustomerLayout';
import CustomerLogin from '@/pages/customer/CustomerLogin';
import CustomerRegister from '@/pages/customer/CustomerRegister';
import CustomerDashboard from '@/pages/customer/CustomerDashboard';
import CustomerMembership from '@/pages/customer/CustomerMembership';
import CustomerRewards from '@/pages/customer/CustomerRewards';
import CustomerPromotions from '@/pages/customer/CustomerPromotions';
import CustomerProfile from '@/pages/customer/CustomerProfile';
import CustomerSettings from '@/pages/customer/CustomerSettings';
import CustomerGameStats from '@/pages/customer/CustomerGameStats';
import CustomerResetPassword from '@/pages/customer/CustomerResetPassword';
import CustomerSignupSuccess from '@/pages/customer/CustomerSignupSuccess';

const CustomerRoutes = () => {
  return (
    <Routes>
      <Route path="login" element={<CustomerLogin />} />
      <Route path="register" element={<CustomerRegister />} />
      <Route path="reset-password" element={<CustomerResetPassword />} />
      <Route path="signup-success" element={<CustomerSignupSuccess />} />
      <Route path="/" element={<CustomerLayout />}>
        <Route path="" element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<CustomerDashboard />} />
        <Route path="membership" element={<CustomerMembership />} />
        <Route path="rewards" element={<CustomerRewards />} />
        <Route path="promotions" element={<CustomerPromotions />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="settings" element={<CustomerSettings />} />
        <Route path="game-stats" element={<CustomerGameStats />} />
      </Route>
    </Routes>
  );
};

export default CustomerRoutes;
