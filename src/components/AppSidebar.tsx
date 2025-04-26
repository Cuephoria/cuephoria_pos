
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Store,
  Package,
  Users,
  Monitor,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Receipt,
  UserRoundCog,
} from 'lucide-react';
import Logo from './Logo';
import { cn } from '@/lib/utils';

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'POS', path: '/pos', icon: <Store className="w-5 h-5" /> },
    { name: 'Products', path: '/products', icon: <Package className="w-5 h-5" /> },
    { name: 'Customers', path: '/customers', icon: <Users className="w-5 h-5" /> },
    { name: 'Stations', path: '/stations', icon: <Monitor className="w-5 h-5" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5" /> },
    { name: 'Customer Portal', path: '/customer-portal', icon: <UserRoundCog className="w-5 h-5" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login';
  };

  return (
    <div
      className={cn(
        'h-screen flex flex-col border-r bg-card text-card-foreground transition-all duration-300',
        collapsed ? 'w-[70px]' : 'w-[240px]'
      )}
    >
      <div className={cn("p-4 flex items-center", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && <Logo size="small" />}
        <Button
          variant="ghost"
          size="icon"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className="flex-1">
        <ul className="px-2 py-2 space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  'flex items-center py-2 px-3 rounded-md',
                  pathname === item.path
                    ? 'bg-accent text-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground',
                  collapsed ? 'justify-center' : 'justify-start'
                )}
              >
                {item.icon}
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4">
        <Button
          variant="ghost"
          className={cn(
            'w-full flex items-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10',
            collapsed ? 'justify-center px-0' : 'justify-start px-3'
          )}
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};

export default AppSidebar;
