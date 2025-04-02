
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, BarChart2, Settings, Package, Clock, Users } from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { openMobile, setOpenMobile } = useSidebar();
  const isMobile = useIsMobile();

  if (!user) return null;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'POS', path: '/pos' },
    { icon: Clock, label: 'Gaming Stations', path: '/stations' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: BarChart2, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <Sidebar className="border-r-0 bg-[#1A1F2C] text-white">
      <SidebarHeader className="p-4 flex items-center justify-center mb-4">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] shadow-lg animate-pulse-glow">
          <span className="text-white font-bold font-heading">CQ</span>
        </div>
        <span className="text-2xl font-bold gradient-text font-heading ml-2">Cuephoria</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="px-4">
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.path} 
                  className={`animate-fade-in delay-${index * 100} mb-2`}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path} className="flex items-center menu-item">
                      <item.icon className={`mr-3 h-5 w-5 ${location.pathname === item.path ? 'text-cuephoria-lightpurple animate-pulse-soft' : ''}`} />
                      <span className="font-quicksand">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between bg-cuephoria-dark rounded-lg p-3 animate-scale-in shadow-md">
          <div className="flex items-center">
            <User className="h-6 w-6 text-cuephoria-lightpurple" />
            <span className="ml-2 text-sm font-medium font-quicksand">{user.username}</span>
          </div>
          <button 
            onClick={logout}
            className="text-xs bg-cuephoria-darker px-3 py-1 rounded-md hover:bg-cuephoria-purple transition-all duration-300 font-heading"
          >
            Logout
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
