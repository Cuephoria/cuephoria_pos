
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, User, BarChart2, Settings, Package, Clock, Users, Joystick } from 'lucide-react';
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
  SidebarSeparator
} from '@/components/ui/sidebar';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const hideOnPaths = ['/receipt'];
  const shouldHide = hideOnPaths.some(path => location.pathname.includes(path));

  if (!user || shouldHide) return null;

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
    <Sidebar className="border-r-0 bg-[#1A1F2C] text-white w-[240px]">
      <SidebarHeader className="p-6 flex items-center gap-3 justify-start">
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple shadow-lg animate-pulse-glow relative">
          <Joystick className="h-6 w-6 text-white absolute animate-bounce" />
        </div>
        <span className="text-2xl font-bold gradient-text font-heading">Cuephoria</span>
      </SidebarHeader>
      
      <SidebarSeparator className="mx-4 bg-gray-700/50 my-2" />
      
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={item.path} className={`animate-fade-in delay-${index * 100}`}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                    <Link to={item.path} className="flex items-center menu-item px-6 py-3">
                      <item.icon className={`mr-3 h-5 w-5 ${location.pathname === item.path ? 'text-cuephoria-lightpurple animate-pulse-soft' : ''}`} />
                      <span className="font-quicksand text-base">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between bg-cuephoria-dark rounded-lg p-3 animate-scale-in shadow-md mx-2">
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
