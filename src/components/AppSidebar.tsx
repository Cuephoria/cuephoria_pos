
import React, { useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import {
  Home,
  GamepadIcon,
  ShoppingCart,
  Users,
  Package,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    name: 'Gaming Stations',
    href: '/stations',
    icon: GamepadIcon,
  },
  {
    name: 'Point of Sale',
    href: '/pos',
    icon: ShoppingCart,
    badge: 'New',
  },
  {
    name: 'Customers',
    href: '/customers',
    icon: Users,
  },
  {
    name: 'Products',
    href: '/products',
    icon: Package,
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

const AppSidebar = () => {
  const { isOpen } = useSidebar();
  const location = useLocation();
  const isMobile = useMobile();
  const { logout } = useAuth();
  const logoRef = useRef<HTMLAnchorElement>(null);

  // Determine if we're on the index page (not logged in yet)
  const isIndexPage = location.pathname === '/';

  // Check if the sidebar should be rendered
  if (isIndexPage) return null;

  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-20 flex h-full flex-col border-r bg-sidebar-background transition-all duration-300 ease-in-out',
        isOpen ? 'w-64' : 'w-[70px]',
        isMobile && !isOpen && 'transform -translate-x-full'
      )}
    >
      <div className="flex items-center border-b px-3 py-4 justify-center">
        <Link 
          ref={logoRef} 
          to="/dashboard" 
          className={cn(
            "flex items-center justify-center transition-all duration-300",
            isOpen ? "justify-start" : "justify-center"
          )}
        >
          <Logo 
            className={cn(
              "transition-transform duration-300 ease-in-out",
              isOpen ? "transform scale-110" : "transform scale-90"
            )} 
          />
          {isOpen && (
            <span className="ml-3 text-2xl font-bold tracking-tight gradient-text">
              Cuephoria
            </span>
          )}
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2 flex flex-col">
        <div className="flex flex-col gap-1 mt-4">
          <TooltipProvider>
            {menuItems.map((item, index) => {
              // Add staggered positioning for odd/even items when sidebar is closed
              const transformClass = !isOpen && (index % 2 === 0 ? 'translate-y-1' : '-translate-y-1');
              
              return (
                <Tooltip key={item.href} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        buttonVariants({ variant: 'ghost' }),
                        'menu-item group flex h-12 justify-start px-4 py-2 text-sidebar-foreground',
                        location.pathname === item.href && 
                          'bg-sidebar-accent text-sidebar-primary font-medium',
                        !isOpen && 'justify-center px-0',
                        !isOpen && transformClass,
                        'transition-all duration-300'
                      )}
                    >
                      <item.icon className={cn(
                        'h-5 w-5 transition-all',
                        location.pathname === item.href ? 'text-sidebar-primary' : '',
                        !isOpen ? 'mx-0' : 'mr-2 group-hover:mr-3'
                      )} />
                      {isOpen && (
                        <span
                          className={cn(
                            'flex-1 whitespace-nowrap transition-all duration-200 group-hover:translate-x-1',
                            item.badge && 'flex items-center justify-between'
                          )}
                        >
                          {item.name}
                          {item.badge && (
                            <Badge
                              variant="default"
                              className="ml-2 bg-cuephoria-purple text-white hover:bg-cuephoria-purple"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </span>
                      )}
                    </Link>
                  </TooltipTrigger>
                  {!isOpen && (
                    <TooltipContent side="right" className="flex items-center gap-4">
                      {item.name}
                      {item.badge && (
                        <Badge
                          variant="default"
                          className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </div>

      <div className="p-2 border-t">
        <TooltipProvider>
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={logout}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'menu-item w-full flex h-12 justify-start px-4 py-2 text-sidebar-foreground',
                  !isOpen && 'justify-center px-0',
                  'transition-colors'
                )}
              >
                <LogOut className="h-5 w-5 mr-2" />
                {isOpen && <span>Logout</span>}
              </button>
            </TooltipTrigger>
            {!isOpen && (
              <TooltipContent side="right">Logout</TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
};

export default AppSidebar;
