
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { Bill } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';

interface HourlyRevenueDistributionProps {
  filteredBills?: Bill[];
}

const HourlyRevenueDistribution: React.FC<HourlyRevenueDistributionProps> = ({ filteredBills }) => {
  const { bills: allBills } = usePOS();
  
  // Use filtered bills if provided, otherwise use all bills
  const bills = filteredBills || allBills;
  
  // Prepare data for the chart
  const getHourlyDistributionData = () => {
    // Initialize hours array with all 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return {
        hour,
        label: `${hour12}${ampm}`,
        revenue: 0,
        transactions: 0,
      };
    });
    
    // Process bills
    bills.forEach(bill => {
      const date = new Date(bill.createdAt);
      const hour = date.getHours();
      
      hours[hour].revenue += bill.total;
      hours[hour].transactions += 1;
    });
    
    return hours;
  };
  
  const chartData = getHourlyDistributionData();
  
  // Find peak hours (top 3 by revenue)
  const peakHours = [...chartData]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 3)
    .filter(hour => hour.revenue > 0)
    .map(hour => hour.label)
    .join(', ');
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Hourly Revenue Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              {peakHours ? `Peak hours: ${peakHours}` : 'Revenue by hour of day'}
            </CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#F97316]/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-[#F97316]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[350px] pt-4">
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue",
              theme: {
                light: "#F97316",
                dark: "#F97316",
              },
            },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="label" 
                stroke="#777" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="#777"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-gray-800 border-gray-700 p-2 shadow-md">
                        <p className="text-sm font-medium text-white mb-1">{payload[0].payload.label}</p>
                        <div className="grid gap-1 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="text-white font-medium">
                              <CurrencyDisplay amount={payload[0].value as number} />
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Transactions:</span>
                            <span className="text-white font-medium">
                              {payload[0].payload.transactions}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                }}
              />
              <Bar 
                dataKey="revenue" 
                name="revenue" 
                fill="#F97316" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default HourlyRevenueDistribution;
