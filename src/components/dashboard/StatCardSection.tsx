
import React, { useEffect, useState } from 'react';
import StatsCard from './StatsCard';
import { CreditCard, Users, PlayCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Product } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { useSessionsData } from '@/hooks/stations/useSessionsData';
import { usePOS } from '@/context/POSContext';

interface StatCardSectionProps {
  totalSales: number;
  salesChange: string;
  activeSessionsCount: number;
  totalStations: number;
  customersCount: number;
  newMembersCount: number;
  lowStockCount: number;
  lowStockItems: Product[];
}

const StatCardSection: React.FC<StatCardSectionProps> = ({
  totalSales,
  salesChange,
  activeSessionsCount,
  totalStations,
  customersCount,
  newMembersCount,
  lowStockCount,
  lowStockItems
}) => {
  const { sessions } = useSessionsData();
  const { stations, customers } = usePOS();
  const [realActiveSessionsCount, setRealActiveSessionsCount] = useState(activeSessionsCount);

  // Get count of stations by type
  const ps5StationsCount = stations.filter(station => station.type === 'ps5').length;
  const poolTablesCount = stations.filter(station => station.type === '8ball').length;
  
  // Determine whether the sales trend is positive or negative
  const isSalesTrendPositive = salesChange.includes('+');
  
  // Calculate real-time active sessions count
  useEffect(() => {
    // Count sessions that don't have an end time
    const activeSessions = sessions.filter(session => !session.endTime).length;
    setRealActiveSessionsCount(activeSessions);
  }, [sessions]);
  
  // Determine color for sales trend
  const getTrendIconAndClass = () => {
    if (isSalesTrendPositive) {
      return {
        icon: TrendingUp,
        class: 'text-green-500'
      };
    } else if (salesChange.includes('-')) {
      return {
        icon: TrendingDown,
        class: 'text-red-500'
      };
    }
    return {
      icon: null,
      class: ''
    };
  };
  
  const { icon: TrendIcon, class: trendClass } = getTrendIconAndClass();
  
  // Format low stock items for display
  const formatLowStockItems = () => {
    if (lowStockItems.length === 0) return "All inventory levels are good";
    
    if (lowStockItems.length <= 2) {
      return lowStockItems.map(item => `${item.name}: ${item.stock} left`).join(", ");
    }
    
    return `${lowStockItems[0].name}: ${lowStockItems[0].stock} left, ${lowStockItems[1].name}: ${lowStockItems[1].stock} left, +${lowStockItems.length - 2} more`;
  };
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Sales"
        value={<CurrencyDisplay amount={totalSales} />}
        icon={CreditCard}
        subValue={
          <div className="flex items-center space-x-1">
            <span>{salesChange}</span>
            {TrendIcon && <TrendIcon className={`h-3 w-3 ${trendClass}`} />}
          </div>
        }
        iconColor="text-[#9b87f5]"
        iconBgColor="bg-[#6E59A5]/20"
        className="hover:shadow-purple-900/10"
      />

      <StatsCard
        title="Active Sessions"
        value={realActiveSessionsCount}
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
        subValue={formatLowStockItems()}
        iconColor="text-[#F97316]"
        iconBgColor="bg-[#F97316]/20"
        className="hover:shadow-red-900/10"
      />
    </div>
  );
};

export default StatCardSection;
