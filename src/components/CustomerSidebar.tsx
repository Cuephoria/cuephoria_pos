
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { 
  TrendingUp, 
  Award, 
  Star, 
  Calendar, 
  LogOut, 
  ExternalLink,
  User,
  Home,
  Settings,
  Gift,
  Clock
} from 'lucide-react';

import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

const CustomerSidebar = () => {
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/customer');
  };

  const handleWebsiteRedirect = () => {
    window.location.href = 'https://cuephoria.in';
  };

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/customer/dashboard',
      icon: <Home size={18} />,
    },
    {
      name: 'Game Stats',
      path: '/customer/stats',
      icon: <TrendingUp size={18} />,
    },
    {
      name: 'Membership',
      path: '/customer/membership',
      icon: <Star size={18} />,
    },
    {
      name: 'Rewards',
      path: '/customer/rewards',
      icon: <Gift size={18} />,
    },
    {
      name: 'Promotions',
      path: '/customer/promotions',
      icon: <Calendar size={18} />,
    },
    {
      name: 'Profile',
      path: '/customer/profile',
      icon: <User size={18} />,
    },
    {
      name: 'Settings',
      path: '/customer/settings',
      icon: <Settings size={18} />,
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4 flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 blur-sm"></div>
          <img 
            src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png"
            alt="Cuephoria Logo"
            className="h-9 w-9 relative"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white bg-gradient-to-r from-white to-cuephoria-lightpurple bg-clip-text text-transparent">Cuephoria</span>
          <span className="text-xs text-muted-foreground">Customer Portal</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-2">
            <div className="bg-cuephoria-darker/60 rounded-md p-3 border border-cuephoria-lightpurple/20">
              <div className="flex items-center gap-3">
                <div className="bg-cuephoria-lightpurple/20 w-10 h-10 rounded-full flex items-center justify-center">
                  <User size={18} className="text-cuephoria-lightpurple" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{user?.name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
              </div>
              {user?.isMember && (
                <div className="mt-2 pt-2 border-t border-cuephoria-lightpurple/10">
                  <div className="flex justify-between items-center">
                    <p className="text-xs flex items-center">
                      <Star size={12} className="mr-1 text-amber-400" />
                      <span className="text-amber-400 font-medium">{user.membershipPlan}</span>
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock size={10} className="mr-1" />
                      <span>{user.membershipHoursLeft}h left</span>
                    </div>
                  </div>
                </div>
              )}
              {!user?.isMember && user && (
                <div className="mt-2 pt-2 border-t border-cuephoria-lightpurple/10">
                  <button 
                    onClick={() => navigate('/customer/membership')} 
                    className="text-xs text-center w-full text-cuephoria-lightpurple hover:underline"
                  >
                    Join our membership program →
                  </button>
                </div>
              )}
            </div>
          </div>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    className={location.pathname === item.path ? 'bg-cuephoria-lightpurple/20 text-cuephoria-lightpurple' : ''}
                    onClick={() => navigate(item.path)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <Separator className="my-2 bg-cuephoria-lightpurple/10" />
        
        <SidebarGroup>
          <div className="px-4 py-2">
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-md p-3 border border-pink-500/20">
              <p className="text-sm font-medium text-white">Special Offer</p>
              <p className="text-xs text-white/70 mt-1">10% OFF on online bookings!</p>
              <Button 
                size="sm" 
                className="w-full mt-2 bg-white text-pink-600 hover:bg-white/90"
                onClick={handleWebsiteRedirect}
              >
                Book Now
              </Button>
            </div>
          </div>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 space-y-2">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
          onClick={handleWebsiteRedirect}
        >
          <ExternalLink size={16} className="mr-2" />
          Visit Website
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="w-full justify-start border-cuephoria-lightpurple/30 text-cuephoria-lightpurple"
          onClick={handleLogout}
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
        <div className="text-center pt-2 mt-2 border-t border-cuephoria-lightpurple/10">
          <p className="text-xs text-muted-foreground/60">Designed and developed by RK</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomerSidebar;
