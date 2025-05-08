
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Wallet } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency';

interface RevenueBreakdownChartProps {
  data: {
    name: string;
    value: number;
    color: string;
  }[];
  totalRevenue: number;
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="#fff" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={12}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const RevenueBreakdownChart: React.FC<RevenueBreakdownChartProps> = ({ data, totalRevenue }) => {
  // Filter out zero values to avoid empty sections
  const filteredData = data.filter(item => item.value > 0);

  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Revenue Breakdown</CardTitle>
            <CardDescription className="text-gray-400">
              Total: <CurrencyDisplay amount={totalRevenue} />
            </CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#F97316]/20 flex items-center justify-center">
            <Wallet className="h-5 w-5 text-[#F97316]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[350px]">
        {filteredData.length > 0 ? (
          <ChartContainer config={{}} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {filteredData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => <CurrencyDisplay amount={value as number} />} 
                  contentStyle={{ 
                    backgroundColor: '#252a37',
                    borderColor: '#374151',
                    borderRadius: '0.375rem',
                  }}
                  itemStyle={{ color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Legend 
                  formatter={(value, entry) => <span style={{ color: '#e5e7eb' }}>{value}</span>} 
                  layout="vertical" 
                  verticalAlign="middle" 
                  align="right"
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No revenue data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueBreakdownChart;
