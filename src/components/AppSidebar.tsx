
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
  SidebarMenuItem 
} from '@/components/ui/sidebar';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    { icon: Clock, label: 'Gaming Stations', path: '/stations' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: ShoppingCart, label: 'POS', path: '/pos' },
    { icon: Users, label: 'Customers', path: '/customers' },
    { icon: BarChart2, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <Sidebar className="border-r-0 bg-[#1A1F2C] text-white">
      <SidebarHeader className="p-4 flex items-center gap-2">
        <div className="h-9 w-9 rounded-full flex items-center justify-center bg-[#6E59A5]">
          <span className="text-white font-bold">CQ</span>
        </div>
        <span className="text-xl font-bold text-[#9b87f5] font-heading">Cuephoria</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path} className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <User className="h-6 w-6 text-muted-foreground" />
            <span className="ml-2 text-sm font-medium">{user.username}</span>
          </div>
          <button 
            onClick={logout}
            className="text-xs text-muted-foreground hover:text-[#9b87f5]"
          >
            Logout
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
