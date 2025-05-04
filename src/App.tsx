
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { POSProvider } from '@/context/POSContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';

// Import all pages
import Dashboard from '@/pages/Dashboard';
import POS from '@/pages/POS';
import Products from '@/pages/Products';
import Customers from '@/pages/Customers';
import Stations from '@/pages/Stations';
import Reports from '@/pages/Reports';
import Login from '@/pages/Login';
import NotFound from '@/pages/NotFound';
import Settings from '@/pages/Settings';
import Index from '@/pages/Index';

// Import CSS
import '@/App.css';

function App() {
  return (
    <SidebarProvider>
      <AuthProvider>
        <POSProvider>
          <ExpenseProvider>
            <BrowserRouter>
              <div className="flex min-h-screen w-full overflow-x-hidden">
                <AppSidebar />
                <div className="flex-1 flex flex-col overflow-x-hidden">
                  <div className="hidden md:block">
                    <SidebarTrigger />
                  </div>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/pos" element={<POS />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/stations" element={<Stations />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
              <Toaster />
            </BrowserRouter>
          </ExpenseProvider>
        </POSProvider>
      </AuthProvider>
    </SidebarProvider>
  );
}

export default App;
