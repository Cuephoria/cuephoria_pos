
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { POSProvider } from "@/context/POSContext";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { useCustomerAuth } from "@/hooks/useCustomerAuth";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import CustomerSidebar from "@/components/customer/CustomerSidebar";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Stations from "./pages/Stations";
import Products from "./pages/Products";
import POS from "./pages/POS";
import Customers from "./pages/Customers";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// Customer Portal Pages
import CustomerLogin from "./pages/customer/CustomerLogin";
import CustomerRegister from "./pages/customer/CustomerRegister";
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerSessions from "./pages/customer/CustomerSessions";
import CustomerLoyalty from "./pages/customer/CustomerLoyalty";
import CustomerRewards from "./pages/customer/CustomerRewards";
import CustomerPromotions from "./pages/customer/CustomerPromotions";
import CustomerProfile from "./pages/customer/CustomerProfile";
import CustomerResetPassword from "./pages/customer/CustomerResetPassword";
import CustomerReferrals from "./pages/customer/CustomerReferrals";

// Create a new QueryClient instance outside of the component
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

// Enhanced Protected route component that checks for authentication
const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
      <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
    </div>;
  }
  
  if (!user) {
    // Redirect to login page while preserving the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // If route requires admin access and user is not admin, redirect to dashboard
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

// Customer protected route that checks for customer authentication
const CustomerProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { customerUser, isLoading } = useCustomerAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
      <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
    </div>;
  }
  
  if (!customerUser) {
    return <Navigate to="/customer/login" state={{ from: location.pathname }} replace />;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <CustomerSidebar />
        <div className="flex-1 flex flex-col">
          <div className="hidden md:block">
            <SidebarTrigger />
          </div>
          {children}
        </div>
      </div>
    </SidebarProvider>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CustomerAuthProvider>
        <POSProvider>
          <ExpenseProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  
                  {/* Admin/Staff Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/pos" element={
                    <ProtectedRoute>
                      <POS />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/stations" element={
                    <ProtectedRoute>
                      <Stations />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/products" element={
                    <ProtectedRoute>
                      <Products />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/customers" element={
                    <ProtectedRoute>
                      <Customers />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/settings" element={
                    <ProtectedRoute requireAdmin={true}>
                      <Settings />
                    </ProtectedRoute>
                  } />
                  
                  {/* Customer Portal Routes */}
                  <Route path="/customer/login" element={<CustomerLogin />} />
                  <Route path="/customer/register" element={<CustomerRegister />} />
                  <Route path="/customer/reset-password" element={<CustomerResetPassword />} />
                  
                  <Route path="/customer/dashboard" element={
                    <CustomerProtectedRoute>
                      <CustomerDashboard />
                    </CustomerProtectedRoute>
                  } />
                  
                  <Route path="/customer/sessions" element={
                    <CustomerProtectedRoute>
                      <CustomerSessions />
                    </CustomerProtectedRoute>
                  } />
                  
                  <Route path="/customer/loyalty" element={
                    <CustomerProtectedRoute>
                      <CustomerLoyalty />
                    </CustomerProtectedRoute>
                  } />
                  
                  <Route path="/customer/rewards" element={
                    <CustomerProtectedRoute>
                      <CustomerRewards />
                    </CustomerProtectedRoute>
                  } />
                  
                  <Route path="/customer/promotions" element={
                    <CustomerProtectedRoute>
                      <CustomerPromotions />
                    </CustomerProtectedRoute>
                  } />
                  
                  <Route path="/customer/profile" element={
                    <CustomerProtectedRoute>
                      <CustomerProfile />
                    </CustomerProtectedRoute>
                  } />
                  
                  <Route path="/customer/referrals" element={
                    <CustomerProtectedRoute>
                      <CustomerReferrals />
                    </CustomerProtectedRoute>
                  } />
                  
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ExpenseProvider>
        </POSProvider>
      </CustomerAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
