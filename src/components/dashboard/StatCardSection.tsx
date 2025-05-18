
import React from 'react';
import { ShoppingCart, Users, AlertTriangle, Clock } from 'lucide-react';
import StatCard from '@/components/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCardSectionProps {
  totalSales: number;
  salesChange: string;
  activeSessionsCount: number;
  totalStations: number;
  customersCount: number;
  newMembersCount: number;
  lowStockCount: number;
  lowStockItems: any[];
  isLoading?: boolean;
}

const StatCardSection: React.FC<StatCardSectionProps> = ({
  totalSales,
  salesChange,
  activeSessionsCount,
  totalStations,
  customersCount,
  newMembersCount,
  lowStockCount,
  lowStockItems,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </div>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  // Log the exact value to help with debugging
  console.log('Displaying total sales value:', totalSales);
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Revenue"
        value={totalSales}
        icon={ShoppingCart}
        description={salesChange}
        isCurrency={true}
        color="text-cuephoria-purple"
      />
      
      <StatCard
        title="Active Sessions"
        value={`${activeSessionsCount}/${totalStations}`}
        icon={Clock}
        description={`${Math.round((activeSessionsCount / totalStations) * 100)}% occupancy rate`}
        color="text-green-500"
      />
      
      <StatCard
        title="Total Customers"
        value={customersCount}
        icon={Users}
        description={`${newMembersCount} new today`}
        color="text-cuephoria-blue"
      />
      
      {lowStockCount > 0 ? (
        <StatCard
          title="Low Stock Items"
          value={lowStockCount}
          icon={AlertTriangle}
          description={`${lowStockItems[0]?.name} is lowest (${lowStockItems[0]?.stock})`}
          color="text-orange-500"
        />
      ) : (
        <StatCard
          title="Low Stock Items"
          value={0}
          icon={AlertTriangle}
          description="No items with low stock"
          color="text-green-500"
        />
      )}
    </div>
  );
};

export default StatCardSection;
