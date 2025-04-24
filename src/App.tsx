
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CustomerAuthProvider } from "@/context/CustomerAuthContext";
import { POSProvider } from "@/context/POSContext";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import CustomerLayout from "@/components/CustomerLayout";

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
import CustomerAuth from "./pages/CustomerAuth";
import CustomerDashboard from "./pages/CustomerDashboard";

// Customer Portal Pages
import Membership from "./pages/customer/Membership";
import Rewards from "./pages/customer/Rewards";

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
                  
                  {/* Admin & Staff Routes */}
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
                  
                  {/* Customer Routes */}
                  <Route path="/customer" element={<CustomerAuth />} />
                  <Route path="/customer/dashboard" element={
                    <CustomerLayout>
                      <CustomerDashboard />
                    </CustomerLayout>
                  } />
                  <Route path="/customer/membership" element={
                    <CustomerLayout>
                      <Membership />
                    </CustomerLayout>
                  } />
                  <Route path="/customer/rewards" element={
                    <CustomerLayout>
                      <Rewards />
                    </CustomerLayout>
                  } />
                  <Route path="/customer/profile" element={
                    <CustomerLayout>
                      <div className="p-4">
                        <h1 className="text-2xl font-bold">Profile</h1>
                        <p className="text-muted-foreground mt-2">Coming soon. Manage your personal details and preferences.</p>
                        <div className="text-center mt-8 text-xs text-muted-foreground">Designed and developed by RK</div>
                      </div>
                    </CustomerLayout>
                  } />
                  <Route path="/customer/settings" element={
                    <CustomerLayout>
                      <div className="p-4">
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-muted-foreground mt-2">Coming soon. Configure your account settings and preferences.</p>
                        <div className="text-center mt-8 text-xs text-muted-foreground">Designed and developed by RK</div>
                      </div>
                    </CustomerLayout>
                  } />
                  <Route path="/customer/stats" element={
                    <CustomerLayout>
                      <div className="p-4">
                        <h1 className="text-2xl font-bold">Game Stats</h1>
                        <p className="text-muted-foreground mt-2">Coming soon. View detailed statistics about your gameplay.</p>
                        <div className="text-center mt-8 text-xs text-muted-foreground">Designed and developed by RK</div>
                      </div>
                    </CustomerLayout>
                  } />
                  <Route path="/customer/promotions" element={
                    <CustomerLayout>
                      <div className="p-4">
                        <h1 className="text-2xl font-bold">Promotions</h1>
                        <p className="text-muted-foreground mt-2">Coming soon. Check out our latest promotions and special offers.</p>
                        <div className="text-center mt-8 text-xs text-muted-foreground">Designed and developed by RK</div>
                      </div>
                    </CustomerLayout>
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
