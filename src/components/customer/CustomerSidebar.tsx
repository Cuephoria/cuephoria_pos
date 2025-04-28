
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { 
  Home, 
  User, 
  Award, 
  Gift, 
  Tag, 
  Settings, 
  LogOut, 
  Clock, 
  BarChart2,
  Menu,
  X
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarSeparator,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const CustomerSidebar: React.FC = () => {
  const { customerUser, signOut } = useCustomerAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toggleSidebar, isOpen } = useSidebar();

  const menuItems = [
    { path: '/customer/dashboard', label: 'Dashboard', icon: Home },
    { path: '/customer/game-stats', label: 'Game Stats', icon: BarChart2 },
    { path: '/customer/membership', label: 'Membership', icon: Clock },
    { path: '/customer/rewards', label: 'Rewards', icon: Gift },
    { path: '/customer/promotions', label: 'Promotions', icon: Tag },
    { path: '/customer/profile', label: 'Profile', icon: User },
    { path: '/customer/settings', label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  // Mobile version with sheet
  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 w-full z-30 bg-[#1A1F2C] p-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[80%] max-w-[280px] bg-[#1A1F2C] border-r-0">
                <div className="h-full flex flex-col">
                  <div className="p-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple shadow-lg animate-pulse-glow">
                      <img 
                        src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
                        alt="Cuephoria" 
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                    <span className="text-xl font-bold gradient-text font-heading">Cuephoria</span>
                  </div>
                  <div className="mx-4 h-px bg-cuephoria-purple/30" />
                  <div className="flex-1 overflow-auto py-2">
                    <div className="px-2">
                      {menuItems.map((item) => (
                        <Link 
                          key={item.path}
                          to={item.path} 
                          className={`flex items-center py-3 px-3 rounded-md my-1 ${location.pathname === item.path ? 'bg-cuephoria-dark text-cuephoria-lightpurple' : 'text-white hover:bg-cuephoria-dark/50'}`}
                        >
                          <item.icon className={`mr-3 h-5 w-5 ${location.pathname === item.path ? 'text-cuephoria-lightpurple animate-pulse-soft' : ''}`} />
                          <span className="font-quicksand text-base">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between bg-cuephoria-dark rounded-lg p-3 shadow-md">
                      <div className="flex items-center">
                        <User className="h-5 w-5 text-cuephoria-blue" />
                        <span className="ml-2 text-sm font-medium font-quicksand text-white">
                          {customerUser?.email}
                        </span>
                      </div>
                      <button 
                        onClick={handleSignOut}
                        className="text-xs bg-cuephoria-darker px-3 py-1 rounded-md hover:bg-cuephoria-purple transition-all duration-300 font-heading text-white flex items-center gap-1"
                      >
                        <LogOut className="h-3 w-3" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-xl font-bold gradient-text font-heading">Cuephoria</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/customer/profile')}
              variant="ghost" 
              size="icon" 
              className="text-white"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="pt-16"></div> {/* Space for the fixed header */}
      </>
    );
  }

  // Desktop version with Sidebar
  return (
    <Sidebar className="border-r-0 bg-[#1A1F2C] text-white w-[250px]">
      <SidebarHeader className="p-4 flex items-center gap-3">
        <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple shadow-lg animate-pulse-glow">
          <img 
            src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
            alt="Cuephoria" 
            className="h-10 w-10 object-contain"
          />
        </div>
        <span className="text-2xl font-bold gradient-text font-heading">Cuephoria</span>
      </SidebarHeader>
      <SidebarSeparator className="mx-4 bg-cuephoria-purple/30" />
      <SidebarContent className="mt-2">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item, index) => (
            <SidebarMenuItem key={item.path} className={`animate-fade-in delay-${index * 100} text-base`}>
              <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                <Link to={item.path} className="flex items-center py-2.5">
                  <item.icon className={`mr-3 h-6 w-6 ${location.pathname === item.path ? 'text-cuephoria-lightpurple animate-pulse-soft' : ''}`} />
                  <span className="font-quicksand">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center justify-between bg-cuephoria-dark rounded-lg p-3 animate-scale-in shadow-md">
          <div className="flex items-center">
            <User className="h-6 w-6 text-cuephoria-blue" />
            <span className="ml-2 text-sm font-medium font-quicksand truncate max-w-[120px]">
              {customerUser?.email}
            </span>
          </div>
          <button 
            onClick={handleSignOut}
            className="text-xs bg-cuephoria-darker px-3 py-1 rounded-md hover:bg-cuephoria-purple transition-all duration-300 font-heading flex items-center gap-1"
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomerSidebar;
