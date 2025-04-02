
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/ui/sidebar';
import Logo from '@/components/Logo';

import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Gamepad2,
  Crown,
  LineChart,
  Settings,
  Menu,
} from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: string | number;
  showMobile?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({
  to,
  icon,
  label,
  badge,
  showMobile = true,
  onClick,
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <li className={cn(showMobile ? '' : 'hidden md:block')}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
            isActive
              ? 'bg-accent text-accent-foreground hover:bg-accent/80'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
          )
        }
        onClick={onClick}
      >
        {icon}
        <span className="ml-3 flex-1">{label}</span>
        {badge && (
          <span className="ml-auto bg-cuephoria-purple/90 text-white px-2.5 py-0.5 rounded-full text-xs font-medium">
            {badge}
          </span>
        )}
      </NavLink>
    </li>
  );
};

const AppSidebar = () => {
  const { isMobile, isSidebarOpen, toggleSidebar } = useMobile();

  return (
    <Sidebar isMobile={isMobile} isOpen={isSidebarOpen}>
      <div className="h-14 flex items-center px-4 border-b sticky top-0 bg-background z-10">
        <Logo />
        <div className="ml-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 space-y-1">
          <SidebarLink
            to="/dashboard"
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Dashboard"
            onClick={toggleSidebar}
          />
          <SidebarLink
            to="/pos"
            icon={<Store className="h-4 w-4" />}
            label="Point of Sale"
            onClick={toggleSidebar}
          />
          <SidebarLink
            to="/products"
            icon={<Package className="h-4 w-4" />}
            label="Products"
            onClick={toggleSidebar}
          />
          <SidebarLink
            to="/customers"
            icon={<Users className="h-4 w-4" />}
            label="Customers"
            onClick={toggleSidebar}
          />
          <SidebarLink
            to="/stations"
            icon={<Gamepad2 className="h-4 w-4" />}
            label="Gaming Stations"
            onClick={toggleSidebar}
          />
          <SidebarLink
            to="/memberships"
            icon={<Crown className="h-4 w-4" />}
            label="Memberships"
            onClick={toggleSidebar}
          />
          <SidebarLink
            to="/reports"
            icon={<LineChart className="h-4 w-4" />}
            label="Reports"
            onClick={toggleSidebar}
          />
          <SidebarLink
            to="/settings"
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            onClick={toggleSidebar}
          />
        </nav>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
