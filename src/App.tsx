
import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';
import { POSProvider } from '@/context/POSContext';
import { ExpenseProvider } from '@/context/ExpenseContext';
import { TooltipProvider } from '@/components/ui/tooltip';

// Import components
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

// PageTransition wrapper component
const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Apply different animation classes based on the path
  const getAnimationClass = (path: string) => {
    if (path.includes('/products')) return 'animate-fade-in-up';
    if (path.includes('/customers')) return 'animate-fade-in-up';
    if (path.includes('/reports')) return 'animate-fade-in-up';
    if (path.includes('/settings')) return 'animate-fade-in-up';
    return 'animate-fade-in';
  };

  return (
    <div key={location.pathname} className={`h-full w-full ${getAnimationClass(location.pathname)}`}>
      {children}
    </div>
  );
};

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <AuthProvider>
      <POSProvider>
        <ExpenseProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="flex min-h-screen w-full bg-[#1A1F2C] overflow-x-hidden">
                <AppSidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
                <div 
                  className="flex-1 transition-all duration-300 overflow-x-hidden"
                  style={{ 
                    marginLeft: sidebarCollapsed ? '70px' : '230px',
                    width: `calc(100% - ${sidebarCollapsed ? '70px' : '230px'})` 
                  }}
                >
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={
                      <PageTransition>
                        <Dashboard />
                      </PageTransition>
                    } />
                    <Route path="/pos" element={
                      <PageTransition>
                        <POS />
                      </PageTransition>
                    } />
                    <Route path="/products" element={
                      <PageTransition>
                        <Products />
                      </PageTransition>
                    } />
                    <Route path="/customers" element={
                      <PageTransition>
                        <Customers />
                      </PageTransition>
                    } />
                    <Route path="/stations" element={
                      <PageTransition>
                        <Stations />
                      </PageTransition>
                    } />
                    <Route path="/reports" element={
                      <PageTransition>
                        <Products />
                      </PageTransition>
                    } />
                    <Route path="/settings" element={
                      <PageTransition>
                        <Settings />
                      </PageTransition>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <Toaster />
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </ExpenseProvider>
      </POSProvider>
    </AuthProvider>
  );
}

export default App;
