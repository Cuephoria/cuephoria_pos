
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/AppSidebar';

const Index = () => {
  return (
    <div className="flex h-screen bg-cuephoria-dark text-white">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Index;
