
import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Logo from "./Logo";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CalendarIcon,
  Home,
  Store,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
  Menu,
  X,
  Calendar,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const AppSidebar = () => {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const LinkItem = ({
    to,
    icon: Icon,
    label,
    count,
  }: {
    to: string;
    icon: React.ElementType;
    label: string;
    count?: number;
  }) => {
    const isActive = location.pathname === to;

    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-cuephoria-purple/20 text-white"
              : "text-gray-400 hover:bg-cuephoria-purple/10 hover:text-white"
          )
        }
        onClick={() => isMobile && setIsExpanded(false)}
      >
        <Icon className="h-[18px] w-[18px]" />
        {isExpanded && (
          <>
            <span className="flex-1">{label}</span>
            {count !== undefined && (
              <span className="rounded-full bg-gray-800 px-2 py-0.5 text-xs">
                {count}
              </span>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div
      className={cn(
        "relative h-full bg-[#1A1F2C] transition-all duration-300 ease-in-out",
        isExpanded ? "w-64" : "w-14"
      )}
    >
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center px-3 py-4">
          {isExpanded ? (
            <div className="flex items-center gap-2">
              <Logo />
              <span className="text-lg font-bold text-white">Cuephoria</span>
            </div>
          ) : (
            <Logo size="sm" />
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-4 top-12 hidden rounded-full border border-gray-800 bg-background text-gray-400 md:flex"
          onClick={toggleSidebar}
        >
          {isExpanded ? (
            <X className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div className="flex-1 overflow-auto py-2">
          <nav className="grid gap-1 px-2">
            <LinkItem to="/dashboard" icon={Home} label="Dashboard" />
            <LinkItem to="/pos" icon={ShoppingCart} label="Point of Sale" />
            <LinkItem to="/products" icon={Package} label="Products" />
            <LinkItem to="/customers" icon={Users} label="Customers" />
            <LinkItem to="/stations" icon={Store} label="Stations" />
            <LinkItem to="/reports" icon={BarChart2} label="Reports" />
            <LinkItem to="/calendly" icon={Calendar} label="Calendly" />
            <LinkItem to="/settings" icon={Settings} label="Settings" />
          </nav>
        </div>
      </div>
    </div>
  );
};

export default AppSidebar;
