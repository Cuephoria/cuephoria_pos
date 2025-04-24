
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import CustomerSidebar from '@/components/CustomerSidebar';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface CustomerLayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const CustomerLayout = ({ children, requireAuth = true }: CustomerLayoutProps) => {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/customer');
    }
  }, [isAuthenticated, isLoading, navigate, requireAuth]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
        <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
      </div>
    );
  }
  
  if (requireAuth && !isAuthenticated) {
    return null;
  }
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-cuephoria-dark text-white">
        <CustomerSidebar />
        <div className="flex-1 flex flex-col">
          <div className="hidden md:block p-4">
            <SidebarTrigger />
          </div>
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerLayout;
