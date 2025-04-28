
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Award, 
  Gift, 
  Gamepad, 
  User, 
  Settings,
  LogOut,
  ChevronLeft,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarTrigger, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  useSidebar
} from '@/components/ui/sidebar';

const CustomerSidebar = () => {
  const { signOut, customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { open: isOpen } = useSidebar();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully logged out.',
      });
      navigate('/customer/login');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sidebar className="border-r border-cuephoria-lightpurple/10 bg-cuephoria-darker">
      <SidebarHeader className="p-4 border-b border-cuephoria-lightpurple/10">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <div className="absolute inset-0 bg-cuephoria-lightpurple/20 rounded-full blur-sm"></div>
            <img
              src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png"
              alt="Cuephoria"
              className="w-8 h-8 relative z-10"
            />
          </div>
          {isOpen && (
            <div className="flex-1 overflow-hidden transition-all duration-300">
              <h2 className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange">
                Cuephoria
              </h2>
              <p className="text-xs text-muted-foreground -mt-1">Member Portal</p>
            </div>
          )}
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="ml-auto">
              {isOpen ? (
                <ChevronLeft size={18} />
              ) : (
                <Menu size={18} />
              )}
            </Button>
          </SidebarTrigger>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4 px-2">
        <div className="flex flex-col space-y-1">
          <NavLink 
            to="/customer/dashboard" 
            className={({isActive}) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-cuephoria-lightpurple/10 hover:text-white",
              isActive ? "bg-cuephoria-lightpurple/15 text-cuephoria-lightpurple" : "text-muted-foreground"
            )}
          >
            <LayoutDashboard size={18} />
            {isOpen && <span>Dashboard</span>}
          </NavLink>
          <NavLink 
            to="/customer/game-stats" 
            className={({isActive}) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-cuephoria-lightpurple/10 hover:text-white",
              isActive ? "bg-cuephoria-lightpurple/15 text-cuephoria-lightpurple" : "text-muted-foreground"
            )}
          >
            <Gamepad size={18} />
            {isOpen && <span>Game Stats</span>}
          </NavLink>
          <NavLink 
            to="/customer/membership" 
            className={({isActive}) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-cuephoria-lightpurple/10 hover:text-white",
              isActive ? "bg-cuephoria-lightpurple/15 text-cuephoria-lightpurple" : "text-muted-foreground"
            )}
          >
            <Award size={18} />
            {isOpen && <span>Membership</span>}
          </NavLink>
          <NavLink 
            to="/customer/rewards" 
            className={({isActive}) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-cuephoria-lightpurple/10 hover:text-white",
              isActive ? "bg-cuephoria-lightpurple/15 text-cuephoria-lightpurple" : "text-muted-foreground"
            )}
          >
            <Award size={18} />
            {isOpen && <span>Rewards</span>}
          </NavLink>
          <NavLink 
            to="/customer/promotions" 
            className={({isActive}) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-cuephoria-lightpurple/10 hover:text-white",
              isActive ? "bg-cuephoria-lightpurple/15 text-cuephoria-lightpurple" : "text-muted-foreground"
            )}
          >
            <Gift size={18} />
            {isOpen && <span>Promotions</span>}
          </NavLink>
          <NavLink 
            to="/customer/profile" 
            className={({isActive}) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-cuephoria-lightpurple/10 hover:text-white",
              isActive ? "bg-cuephoria-lightpurple/15 text-cuephoria-lightpurple" : "text-muted-foreground"
            )}
          >
            <User size={18} />
            {isOpen && <span>Profile</span>}
          </NavLink>
          <NavLink 
            to="/customer/settings" 
            className={({isActive}) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              "hover:bg-cuephoria-lightpurple/10 hover:text-white",
              isActive ? "bg-cuephoria-lightpurple/15 text-cuephoria-lightpurple" : "text-muted-foreground"
            )}
          >
            <Settings size={18} />
            {isOpen && <span>Settings</span>}
          </NavLink>
        </div>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-cuephoria-lightpurple/10 mt-auto">
        {isOpen && customerUser ? (
          <div className="flex flex-col space-y-3">
            <div>
              <p className="text-sm font-medium truncate">{customerUser.email}</p>
              <p className="text-xs text-muted-foreground">{customerUser.referralCode || 'Member'}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="justify-start text-muted-foreground hover:text-white hover:bg-red-900/20"
            >
              <LogOut size={16} className="mr-2" />
              Sign Out
            </Button>
          </div>
        ) : (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="w-full justify-center text-muted-foreground hover:text-white hover:bg-red-900/20"
          >
            <LogOut size={16} />
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomerSidebar;
