
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { POSProvider } from "@/context/POSContext";
import { ExpenseProvider } from "@/context/ExpenseContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import { useEffect, useState } from "react";

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

// Check if running in Capacitor (mobile app)
const isCapacitorApp = () => {
  return window.location.href.includes('capacitor://') || 
         window.location.href.includes('https://1a46da40-620c-4f55-9f80-b0b990917809.lovableproject.com');
};

// Enhanced Protected route component that checks for authentication
const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isAppReady, setIsAppReady] = useState<boolean>(false);
  
  useEffect(() => {
    // Check for platform
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('capacitor-app', isCapacitorApp());
      
      const getPlatform = () => {
        const userAgent = navigator.userAgent.toLowerCase();
        if (userAgent.indexOf('android') > -1) return 'android';
        if (userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1) return 'ios';
        return 'web';
      };
      
      const platform = getPlatform();
      
      if (platform === 'ios') {
        document.body.classList.add('ios-status-bar-padding');
      } else if (platform === 'android') {
        document.body.classList.add('android-status-bar-padding');
      }
      
      setIsAppReady(true);
    }
  }, []);
  
  if (isLoading || !isAppReady) {
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
      <POSProvider>
        <ExpenseProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                
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
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ExpenseProvider>
      </POSProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
