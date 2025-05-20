
import React, { useEffect, useState, useMemo } from 'react';
import StatsCard from './StatsCard';
import { CreditCard, Users, PlayCircle, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { Product } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { useSessionsData } from '@/hooks/stations/useSessionsData';

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
  const [realActiveSessionsCount, setRealActiveSessionsCount] = useState(activeSessionsCount);

  // Determine whether the sales trend is positive or negative - memoize this calculation
  const { isSalesTrendPositive, trendIcon, trendClass } = useMemo(() => {
    const isTrendPositive = salesChange.includes('+');
    
    // Determine color for sales trend
    if (isTrendPositive) {
      return {
        isSalesTrendPositive: true,
        trendIcon: TrendingUp,
        trendClass: 'text-green-500'
      };
    } else if (salesChange.includes('-')) {
      return {
        isSalesTrendPositive: false,
        trendIcon: TrendingDown,
        trendClass: 'text-red-500'
      };
    }
    return {
      isSalesTrendPositive: false,
      trendIcon: null,
      trendClass: ''
    };
  }, [salesChange]);
  
  // Calculate real-time active sessions count
  useEffect(() => {
    // Count sessions that don't have an end time
    const activeSessions = sessions.filter(session => !session.endTime).length;
    setRealActiveSessionsCount(activeSessions);
  }, [sessions]);
  
  // Format low stock items for display - memoize this calculation
  const formattedLowStockItems = useMemo(() => {
    if (lowStockItems.length === 0) return "All inventory levels are good";
    
    if (lowStockItems.length <= 2) {
      return lowStockItems.map(item => `${item.name}: ${item.stock} left`).join(", ");
    }
    
    return `${lowStockItems[0].name}: ${lowStockItems[0].stock} left, ${lowStockItems[1].name}: ${lowStockItems[1].stock} left, +${lowStockItems.length - 2} more`;
  }, [lowStockItems]);
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Total Sales"
        value={<CurrencyDisplay amount={totalSales} />}
        icon={CreditCard}
        subValue={
          <div className="flex items-center space-x-1">
            <span>{salesChange}</span>
            {trendIcon && React.createElement(trendIcon, { className: `h-3 w-3 ${trendClass}` })}
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
        subValue={formattedLowStockItems}
        iconColor="text-[#F97316]"
        iconBgColor="bg-[#F97316]/20"
        className="hover:shadow-red-900/10"
      />
    </div>
  );
};

export default StatCardSection;
