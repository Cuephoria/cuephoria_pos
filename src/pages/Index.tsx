
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const Index = () => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-cuephoria-dark text-white">
        <AppSidebar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
