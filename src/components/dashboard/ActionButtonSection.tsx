
import React from 'react';
import ActionButton from './ActionButton';
import { PlayCircle, ShoppingCart, User, Package, BarChart3, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const ActionButtonSection: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full mx-auto max-w-7xl">
      <ActionButton
        icon={PlayCircle}
        label={isMobile ? "Game" : "New Gaming Session"}
        path="/stations"
        iconColor="text-[#0EA5E9]"
        description="Start a new gaming session"
      />
      
      <ActionButton
        icon={ShoppingCart}
        label={isMobile ? "Sale" : "New Sale"}
        path="/pos"
        iconColor="text-[#9b87f5]"
        description="Create a new transaction"
      />
      
      <ActionButton
        icon={User}
        label={isMobile ? "Customer" : "Add Customer"}
        path="/customers"
        iconColor="text-[#10B981]"
        description="Manage customer data"
      />
      
      <ActionButton
        icon={Package}
        label={isMobile ? "Inventory" : "Manage Inventory"}
        path="/products"
        iconColor="text-[#F97316]"
        description="Update product stock"
      />
      
      <ActionButton
        icon={BarChart3}
        label={isMobile ? "Reports" : "View Reports"}
        path="/reports"
        iconColor="text-[#EC4899]"
        description="Business analytics"
      />
      
      <ActionButton
        icon={Clock}
        label={isMobile ? "Sessions" : "Active Sessions"}
        path="/stations"
        iconColor="text-[#14B8A6]"
        description="View ongoing sessions"
      />
    </div>
  );
};

export default ActionButtonSection;
