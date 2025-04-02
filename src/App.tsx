
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { POSProvider } from './context/POSContext';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

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
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <Dashboard />
                      </div>
                    </SidebarProvider>
                  } 
                />
                <Route 
                  path="/pos" 
                  element={
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <POS />
                      </div>
                    </SidebarProvider>
                  } 
                />
                <Route 
                  path="/products" 
                  element={
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <Products />
                      </div>
                    </SidebarProvider>
                  } 
                />
                <Route 
                  path="/customers" 
                  element={
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <Customers />
                      </div>
                    </SidebarProvider>
                  } 
                />
                <Route 
                  path="/stations" 
                  element={
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <Stations />
                      </div>
                    </SidebarProvider>
                  } 
                />
                <Route 
                  path="/memberships" 
                  element={
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <Memberships />
                      </div>
                    </SidebarProvider>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <Reports />
                      </div>
                    </SidebarProvider>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <SidebarProvider>
                      <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <Settings />
                      </div>
                    </SidebarProvider>
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
