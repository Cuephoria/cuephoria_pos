
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
    
    // Reset scroll position when navigating to a new page
    window.scrollTo(0, 0);
  }, [isAuthenticated, isLoading, navigate, requireAuth, location.pathname]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
        <div className="animate-spin h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
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
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <div className="sticky top-0 z-40 bg-cuephoria-dark/80 backdrop-blur-sm px-4 py-2 md:py-3 flex items-center justify-between border-b border-cuephoria-lightpurple/10">
            <SidebarTrigger className="md:hidden" />
            <div className="ml-auto"></div>
          </div>
          <main className="flex-1 overflow-auto p-4">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default CustomerLayout;
