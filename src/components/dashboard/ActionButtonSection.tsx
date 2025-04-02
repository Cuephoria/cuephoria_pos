
import React from 'react';
import ActionButton from './ActionButton';
import { PlayCircle, ShoppingCart, User, Package, Award } from 'lucide-react';

const ActionButtonSection: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
      <ActionButton
        icon={PlayCircle}
        label="New Gaming Session"
        path="/stations"
        iconColor="text-[#0EA5E9]"
      />
      
      <ActionButton
        icon={ShoppingCart}
        label="New Sale"
        path="/pos"
        iconColor="text-[#9b87f5]"
      />
      
      <ActionButton
        icon={Award}
        label="Memberships"
        path="/memberships"
        iconColor="text-[#F59E0B]"
      />
      
      <ActionButton
        icon={User}
        label="Add Customer"
        path="/customers"
        iconColor="text-[#10B981]"
      />
      
      <ActionButton
        icon={Package}
        label="Manage Inventory"
        path="/products"
        iconColor="text-[#F97316]"
      />
    </div>
  );
};

export default ActionButtonSection;
