
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import Index from './pages/Index';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Stations from './pages/Stations';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import { Suspense } from 'react';
import { POSProvider } from './context/POSContext';
import AppSidebar from './components/AppSidebar';
import { CustomerAuthProvider } from './context/CustomerAuthContext';
import { useEffect, useState } from 'react';
import { useToast } from './hooks/use-toast';
import { ExpenseProvider } from './context/ExpenseContext';

// Customer Portal Pages
import CustomerLogin from './pages/customer/CustomerLogin';
import CustomerRegister from './pages/customer/CustomerRegister';
import CustomerDashboard from './pages/customer/CustomerDashboard'; 
import CustomerSessions from './pages/customer/CustomerSessions';
import CustomerLoyalty from './pages/customer/CustomerLoyalty';
import CustomerRewards from './pages/customer/CustomerRewards';
import CustomerPromotions from './pages/customer/CustomerPromotions';
import CustomerReferrals from './pages/customer/CustomerReferrals';
import CustomerProfile from './pages/customer/CustomerProfile';
import CustomerResetPassword from './pages/customer/CustomerResetPassword';
import CustomerPortalManagement from './pages/CustomerPortalManagement';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Admin layout component
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
};

// Admin route guard
const ProtectedAdminRoute = ({ children }: { children: React.ReactNode }) => {
  // In a real app, this would check for admin authentication
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

// Customer route guard
const ProtectedCustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { customerUser, isLoading } = useCustomerAuth();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!customerUser) {
    return <Navigate to="/customer/login" />;
  }

  return <>{children}</>;
};

function App() {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsInitializing(false);
      // Prepare sample data for the demo
      if (!localStorage.getItem('initialized')) {
        toast({
          title: 'Demo initialized',
          description: 'Sample data has been loaded for demonstration purposes.',
        });
        localStorage.setItem('initialized', 'true');
      }
    }, 1000);
  }, [toast]);

  if (isInitializing) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="color-theme">
        <LoadingSpinner />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="color-theme">
      <CustomerAuthProvider>
        <POSProvider>
          <ExpenseProvider>
            <Router>
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Customer portal routes */}
                  <Route path="/customer/login" element={<CustomerLogin />} />
                  <Route path="/customer/register" element={<CustomerRegister />} />
                  <Route path="/customer/reset-password" element={<CustomerResetPassword />} />
                  <Route path="/customer/dashboard" element={
                    <ProtectedCustomerRoute>
                      <CustomerDashboard />
                    </ProtectedCustomerRoute>
                  } />
                  <Route path="/customer/sessions" element={
                    <ProtectedCustomerRoute>
                      <CustomerSessions />
                    </ProtectedCustomerRoute>
                  } />
                  <Route path="/customer/loyalty" element={
                    <ProtectedCustomerRoute>
                      <CustomerLoyalty />
                    </ProtectedCustomerRoute>
                  } />
                  <Route path="/customer/rewards" element={
                    <ProtectedCustomerRoute>
                      <CustomerRewards />
                    </ProtectedCustomerRoute>
                  } />
                  <Route path="/customer/promotions" element={
                    <ProtectedCustomerRoute>
                      <CustomerPromotions />
                    </ProtectedCustomerRoute>
                  } />
                  <Route path="/customer/referrals" element={
                    <ProtectedCustomerRoute>
                      <CustomerReferrals />
                    </ProtectedCustomerRoute>
                  } />
                  <Route path="/customer/profile" element={
                    <ProtectedCustomerRoute>
                      <CustomerProfile />
                    </ProtectedCustomerRoute>
                  } />
                  
                  {/* Admin routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedAdminRoute>
                        <Dashboard />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/pos"
                    element={
                      <ProtectedAdminRoute>
                        <POS />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/products"
                    element={
                      <ProtectedAdminRoute>
                        <Products />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/customers"
                    element={
                      <ProtectedAdminRoute>
                        <Customers />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/stations"
                    element={
                      <ProtectedAdminRoute>
                        <Stations />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedAdminRoute>
                        <Reports />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedAdminRoute>
                        <Settings />
                      </ProtectedAdminRoute>
                    }
                  />
                  <Route
                    path="/customer-portal"
                    element={
                      <ProtectedAdminRoute>
                        <CustomerPortalManagement />
                      </ProtectedAdminRoute>
                    }
                  />
                  
                  {/* Not found route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Router>
            <Toaster />
          </ExpenseProvider>
        </POSProvider>
      </CustomerAuthProvider>
    </ThemeProvider>
  );
}

export default App;
