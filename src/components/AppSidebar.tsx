
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Gamepad2, 
  Package, 
  Users, 
  BarChart2, 
  Settings, 
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import Logo from '@/components/Logo';

interface AppSidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const hideOnPaths = ['/login', '/'];
  const shouldHide = hideOnPaths.some(path => location.pathname === path);
  const isMobile = useIsMobile();
  
  const isAdmin = user?.isAdmin || false;

  if (!user || shouldHide) return null;

  // Base menu items that both admin and staff can see
  const baseMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: ShoppingCart, label: 'POS', path: '/pos' },
    { icon: Gamepad2, label: 'Gaming Stations', path: '/stations' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Customers', path: '/customers' },
  ];
  
  // Admin-only menu items
  const adminOnlyMenuItems = [
    { icon: BarChart2, label: 'Reports', path: '/reports' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];
  
  // Combine menu items based on user role
  const menuItems = isAdmin ? 
    [...baseMenuItems, ...adminOnlyMenuItems] : 
    baseMenuItems;

  const handleLogout = () => {
    logout();
    navigate('/login');
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[80%] max-w-[280px] bg-[#1A1F2C] border-r-0">
                <div className="h-full flex flex-col">
                  <div className="p-4 flex items-center gap-3">
                    <div className="flex items-center animate-fade-in">
                      <Logo size="sm" />
                    </div>
                    <span className="text-xl font-bold text-[#9b87f5] animate-pulse-soft">Cuephoria</span>
                  </div>
                  <div className="mx-4 h-px bg-gray-700" />
                  <div className="flex-1 overflow-auto py-2">
                    <div className="px-2">
                      {menuItems.map((item) => (
                        <Link 
                          key={item.path}
                          to={item.path} 
                          className={`flex items-center py-3 px-3 rounded-lg my-1 ${location.pathname === item.path ? 'bg-[#252A37] text-[#9b87f5]' : 'text-white hover:bg-[#252A37]/50'}`}
                        >
                          <item.icon className={`mr-3 h-5 w-5 ${location.pathname === item.path ? 'text-[#9b87f5]' : ''}`} />
                          <span className="text-base">{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between bg-[#252A37] rounded-lg p-3 shadow-md">
                      <div className="flex items-center">
                        {isAdmin ? (
                          <Shield className="h-5 w-5 text-[#9b87f5]" />
                        ) : (
                          <Users className="h-5 w-5 text-blue-400" />
                        )}
                        <span className="ml-2 text-sm font-medium text-white">
                          {user.username} {isAdmin ? '(Admin)' : '(Staff)'}
                        </span>
                      </div>
                      <button 
                        onClick={handleLogout}
                        className="text-xs bg-[#1A1F2C] px-3 py-1 rounded-md hover:bg-[#9b87f5] transition-all duration-300 text-white"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <span className="text-xl font-bold text-[#9b87f5] animate-pulse-soft">Cuephoria</span>
          </div>
        </div>
        <div className="pt-16"></div> {/* Space for the fixed header */}
      </>
    );
  }

  // Desktop version with collapsible sidebar
  return (
    <div 
      className={`bg-[#1A1F2C] text-white h-screen flex flex-col border-r border-gray-800 fixed left-0 top-0 z-50 transition-all duration-300 overflow-hidden ${
        collapsed ? 'w-[70px]' : 'w-[230px]'
      }`}
    >
      <div className="p-4 flex flex-col items-center">
        <div className={`flex items-center justify-center ${collapsed ? 'flex-col' : 'w-full gap-3'}`}>
          <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gradient-to-br from-[#9b87f5] to-[#7661d7] shadow-lg animate-pulse-soft">
            <Gamepad2 className="h-7 w-7 text-white animate-scale-in" />
          </div>
          <span className={`text-2xl font-bold text-[#9b87f5] whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 h-0 absolute' : 'opacity-100 animate-fade-in ml-3'}`}>
            Cuephoria
          </span>
        </div>
        
        {/* Properly centered collapse button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={toggleSidebar} 
          className="rounded-full bg-[#252A37] border border-gray-700 h-8 w-8 p-0 flex justify-center items-center text-white hover:bg-[#9b87f5] hover:shadow-[0_0_15px_rgba(155,135,245,0.5)] transition-all duration-300 mt-4 transform hover:scale-110"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </Button>
      </div>
      
      <div className="mx-4 h-px bg-gray-700 mt-2" />
      
      <div className="flex-1 overflow-auto py-4 no-scrollbar">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={`flex items-center py-2.5 px-3 rounded-lg transition-all duration-300 
                ${location.pathname === item.path 
                  ? 'bg-[#252A37] text-[#9b87f5] shadow-[0_0_15px_rgba(155,135,245,0.2)]' 
                  : 'text-white hover:bg-[#252A37]/50 hover:shadow-[0_0_10px_rgba(155,135,245,0.15)]'
                }
                ${collapsed ? 'justify-center' : ''}
                group
                hover:scale-105 
              `}
              title={collapsed ? item.label : ""}
            >
              <item.icon 
                className={`
                  ${location.pathname === item.path ? 'text-[#9b87f5]' : ''} 
                  ${collapsed ? 'mx-auto' : 'mr-3'}
                  h-5 w-5 transition-all duration-300 
                  group-hover:text-[#9b87f5]
                  ${location.pathname === item.path ? 'animate-pulse-soft' : ''}
                `} 
              />
              <span className={`whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 w-0 absolute' : 'opacity-100'}`}>
                {item.label}
              </span>
              {location.pathname === item.path && !collapsed && (
                <span className="absolute h-full w-1 bg-[#9b87f5] right-0 rounded-l-md"></span>
              )}
            </Link>
          ))}
        </div>
      </div>
      
      {/* Improved logout section */}
      <div className="p-4">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-9 w-9 rounded-full flex items-center justify-center bg-[#252A37] shadow-md mb-1">
              {isAdmin ? (
                <Shield className="h-5 w-5 text-[#9b87f5]" />
              ) : (
                <Users className="h-5 w-5 text-blue-400" />
              )}
            </div>
            <Button 
              onClick={handleLogout}
              className="w-full text-xs h-7 bg-[#252A37] hover:bg-[#9b87f5] hover:shadow-[0_0_15px_rgba(155,135,245,0.5)] text-white rounded-lg transition-all duration-300"
            >
              Out
            </Button>
          </div>
        ) : (
          <div className="bg-[#252A37] rounded-lg p-3 shadow-md hover:shadow-[0_0_15px_rgba(155,135,245,0.3)] transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              {isAdmin ? (
                <Shield className="h-5 w-5 text-[#9b87f5]" />
              ) : (
                <Users className="h-5 w-5 text-blue-400" />
              )}
              <span className="text-sm font-medium text-white overflow-hidden text-ellipsis">
                {user.username} {isAdmin ? '(Admin)' : '(Staff)'}
              </span>
            </div>
            <Button 
              onClick={handleLogout}
              className="w-full text-xs bg-[#1A1F2C] hover:bg-[#9b87f5] text-white rounded-lg transition-all duration-300 hover:shadow-[0_0_10px_rgba(155,135,245,0.4)]"
            >
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppSidebar;
