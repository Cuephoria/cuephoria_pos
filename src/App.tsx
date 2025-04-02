
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { POSProvider } from './context/POSContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/AppSidebar';

// Pages
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import Stations from '@/pages/Stations';
import Memberships from '@/pages/Memberships';
import Reports from '@/pages/Reports';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';

import './App.css';

// Create React Query client
const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark">
          <POSProvider>
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <Dashboard />
                    </div>
                  } 
                />
                <Route 
                  path="/pos" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <POS />
                    </div>
                  } 
                />
                <Route 
                  path="/products" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <Products />
                    </div>
                  } 
                />
                <Route 
                  path="/customers" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <Customers />
                    </div>
                  } 
                />
                <Route 
                  path="/stations" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <Stations />
                    </div>
                  } 
                />
                <Route 
                  path="/memberships" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <Memberships />
                    </div>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <Reports />
                    </div>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <div className="flex min-h-screen bg-background">
                      <AppSidebar />
                      <Settings />
                    </div>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
            <Toaster />
          </POSProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
