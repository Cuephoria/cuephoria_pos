
import React from 'react';
import ActionButton from './ActionButton';
import { PlayCircle, ShoppingCart, User, Package } from 'lucide-react';
import { useScreenSize } from '@/hooks/use-mobile';

const ActionButtonSection: React.FC = () => {
  const { isMobile, isTablet } = useScreenSize();
  
  const buttonSize = isMobile ? 'compact' : 'normal';
  
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4">
      <ActionButton
        icon={PlayCircle}
        label={isMobile ? "Game" : "New Gaming Session"}
        path="/stations"
        iconColor="text-[#0EA5E9]"
        size={buttonSize}
      />
      
      <ActionButton
        icon={ShoppingCart}
        label={isMobile ? "Sale" : "New Sale"}
        path="/pos"
        iconColor="text-[#9b87f5]"
        size={buttonSize}
      />
      
      <ActionButton
        icon={User}
        label={isMobile ? "Customer" : "Add Customer"}
        path="/customers"
        iconColor="text-[#10B981]"
        size={buttonSize}
      />
      
      <ActionButton
        icon={Package}
        label={isMobile ? "Inventory" : "Manage Inventory"}
        path="/products"
        iconColor="text-[#F97316]"
        size={buttonSize}
      />
    </div>
  );
};

export default ActionButtonSection;
