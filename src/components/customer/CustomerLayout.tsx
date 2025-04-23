
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { 
  User,
  Award, 
  Calendar, 
  Bell, 
  Settings, 
  LogOut,
  TicketIcon,
  CircleDollarSign,
  Users,
  MessageSquare,
  Mail
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { user, logout } = useCustomerAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/customer/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: <Award className="w-5 h-5" />, path: '/customer/dashboard' },
    { name: 'Profile', icon: <User className="w-5 h-5" />, path: '/customer/profile' },
    { name: 'Booking', icon: <Calendar className="w-5 h-5" />, path: '/customer/booking' },
    { name: 'Rewards', icon: <TicketIcon className="w-5 h-5" />, path: '/customer/rewards' },
    { name: 'Notifications', icon: <Bell className="w-5 h-5" />, path: '/customer/notifications' },
    { name: 'Refer Friends', icon: <Users className="w-5 h-5" />, path: '/customer/referrals' },
    { name: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/customer/settings' },
  ];

  return (
    <div className="flex min-h-[100dvh] flex-col bg-cuephoria-dark">
      {/* Mobile header */}
      <header className="border-b border-border sticky top-0 z-30 flex h-14 items-center gap-4 bg-background px-4 sm:static md:hidden">
        <div className="flex flex-1 items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-semibold">Cuephoria</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Toggle Menu</span>
            {isMobileMenuOpen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 6H20M4 12H20M4 18H20"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar - Desktop */}
        <aside className={cn(
          "fixed inset-y-0 z-40 flex w-64 flex-col border-r border-border bg-card flex-shrink-0",
          "transition-transform duration-300 md:static md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-8">
              <Logo size="sm" />
              <div>
                <span className="text-lg font-semibold">Cuephoria</span>
                <span className="block text-xs text-muted-foreground">Customer Portal</span>
              </div>
            </div>

            <nav className="space-y-1 flex-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground"
                    )
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto space-y-4">
              <div className="border-t border-border pt-4 pb-2">
                <div className="rounded-lg bg-muted p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary w-9 h-9 flex items-center justify-center text-primary-foreground font-semibold">
                      {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default CustomerLayout;
