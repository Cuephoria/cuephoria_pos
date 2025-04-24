
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
  Gift
} from 'lucide-react';

import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { useEffect } from 'react';

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

  useEffect(() => {
    // Reset to top of the page whenever location changes
    window.scrollTo(0, 0);
  }, [location.pathname]);

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
      icon: <Award size={18} />,
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
      <SidebarHeader className="p-4 flex items-center gap-2">
        <div className="h-8 w-8 overflow-hidden rounded-md">
          <img 
            src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png"
            alt="Cuephoria Logo"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-white">Cuephoria</span>
          <span className="text-xs text-muted-foreground">Customer Portal</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <div className="px-4 py-2">
            <div className="bg-cuephoria-darker/60 rounded-md p-3 border border-cuephoria-lightpurple/20 group hover:border-cuephoria-lightpurple/40 transition-all">
              <div className="flex items-center gap-3">
                <div className="bg-cuephoria-lightpurple/20 w-10 h-10 rounded-full flex items-center justify-center group-hover:bg-cuephoria-lightpurple/30 transition-all">
                  <User size={18} className="text-cuephoria-lightpurple" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{user?.name || 'Customer'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email || ''}</p>
                </div>
              </div>
              {user?.isMember && (
                <div className="mt-2 pt-2 border-t border-cuephoria-lightpurple/10">
                  <p className="text-xs flex items-center">
                    <Star size={12} className="mr-1 text-amber-400" />
                    <span className="text-amber-400 font-medium">{user.membershipPlan}</span>
                  </p>
                  {user.membershipHoursLeft !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {user.membershipHoursLeft} hours remaining
                    </p>
                  )}
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
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-md p-3 border border-pink-500/20 hover:shadow-lg hover:shadow-pink-500/10 transition-all">
              <div className="flex items-center gap-2 mb-2">
                <Gift size={16} className="text-pink-400" />
                <p className="text-sm font-medium text-white">Special Offer</p>
              </div>
              <p className="text-xs text-white/70 mb-3">10% OFF on online bookings!</p>
              <Button 
                size="sm" 
                className="w-full text-xs py-1 h-8 bg-white text-pink-600 hover:bg-white/90"
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
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomerSidebar;
