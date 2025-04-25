
import { Link, useLocation } from 'react-router-dom';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, Home, Calendar, Gift, Percent, User, Users, Trophy } from 'lucide-react';

const CustomerSidebar = () => {
  const { customerUser, logout } = useCustomerAuth();
  const location = useLocation();
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const menuItems = [
    {
      href: '/customer/dashboard',
      label: 'Dashboard',
      icon: <Home className="h-5 w-5" />
    },
    {
      href: '/customer/sessions',
      label: 'My Sessions',
      icon: <Calendar className="h-5 w-5" />
    },
    {
      href: '/customer/loyalty',
      label: 'Loyalty Points',
      icon: <Trophy className="h-5 w-5" />
    },
    {
      href: '/customer/rewards',
      label: 'Rewards',
      icon: <Gift className="h-5 w-5" />
    },
    {
      href: '/customer/promotions',
      label: 'Promotions',
      icon: <Percent className="h-5 w-5" />
    },
    {
      href: '/customer/referrals',
      label: 'Referrals',
      icon: <Users className="h-5 w-5" />
    },
    {
      href: '/customer/profile',
      label: 'Profile',
      icon: <User className="h-5 w-5" />
    }
  ];
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarHeader className="pt-6 pb-2">
        <div className="flex flex-col items-center justify-center">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarFallback className="bg-primary text-lg">
              {customerUser?.name ? getInitials(customerUser.name) : 'CP'}
            </AvatarFallback>
          </Avatar>
          <p className="text-lg font-bold text-center">{customerUser?.name || 'Customer'}</p>
          <p className="text-sm text-muted-foreground">Customer Portal</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild className={isActive(item.href) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : ''}>
                    <Link to={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => logout()}>
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default CustomerSidebar;
