
import React from 'react';
import StatsCard from './StatsCard';
import { CreditCard, Users, Clock, AlertTriangle, PlayCircle } from 'lucide-react';

interface StatCardSectionProps {
  totalSales: number;
  salesChange: string;
  activeSessionsCount: number;
  totalStations: number;
  customersCount: number;
  newMembersCount: number;
  lowStockCount: number;
}

const StatCardSection: React.FC<StatCardSectionProps> = ({
  totalSales,
  salesChange,
  activeSessionsCount,
  totalStations,
  customersCount,
  newMembersCount,
  lowStockCount
}) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Sales"
        value={`₹${totalSales.toFixed(2)}`}
        icon={CreditCard}
        subValue={salesChange}
        iconColor="text-[#9b87f5]"
        iconBgColor="bg-[#6E59A5]/20"
        className="hover:shadow-purple-900/10"
      />

      <StatsCard
        title="Active Sessions"
        value={activeSessionsCount}
        icon={PlayCircle}
        subValue={`${totalStations} stations available`}
        iconColor="text-[#0EA5E9]"
        iconBgColor="bg-[#0EA5E9]/20"
        className="hover:shadow-blue-900/10"
      />

      <StatsCard
        title="Customers"
        value={customersCount}
        icon={Users}
        subValue={`${newMembersCount || 'No'} new member${newMembersCount !== 1 ? 's' : ''} today`}
        iconColor="text-[#10B981]"
        iconBgColor="bg-[#10B981]/20"
        className="hover:shadow-green-900/10"
      />

      <StatsCard
        title="Inventory Alert"
        value={`${lowStockCount} item${lowStockCount !== 1 ? 's' : ''}`}
        icon={AlertTriangle}
        subValue={lowStockCount > 0 ? "Low stock items need attention" : "All inventory levels are good"}
        iconColor="text-[#F97316]"
        iconBgColor="bg-[#F97316]/20"
        className="hover:shadow-red-900/10"
      />
    </div>
  );
};

export default StatCardSection;
