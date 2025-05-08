
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Bill } from '@/types/pos.types';

interface ProductCategoryTrendsChartProps {
  data: {
    category: string;
    sales: number;
    quantity: number;
  }[];
  filteredBills?: Bill[]; // Add the filteredBills prop
}

const ProductCategoryTrendsChart: React.FC<ProductCategoryTrendsChartProps> = ({ data }) => {
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Product Category Analysis</CardTitle>
            <CardDescription className="text-gray-400">Sales and quantity by category</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-[#0EA5E9]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[350px]">
        {data.length > 0 ? (
          <ChartContainer
            config={{
              sales: {
                label: "Sales",
                theme: {
                  light: "#0EA5E9",
                  dark: "#0EA5E9",
                },
              },
              quantity: {
                label: "Quantity",
                theme: {
                  light: "#10B981",
                  dark: "#10B981",
                },
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="category" 
                  stroke="#777" 
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis 
                  stroke="#777"
                  axisLine={false}
                  tickLine={false}
                  yAxisId="left"
                  orientation="left"
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  stroke="#777"
                  axisLine={false}
                  tickLine={false}
                  yAxisId="right"
                  orientation="right"
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-gray-800 border-gray-700 p-3 shadow-md">
                          <p className="text-sm font-medium text-gray-300 mb-2">{payload[0].payload.category}</p>
                          <div className="grid gap-2">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-[#0EA5E9] rounded-full"></div>
                              <span className="text-xs text-gray-400">Sales:</span>
                              <span className="text-xs font-medium text-white">
                                <CurrencyDisplay amount={payload[0].value as number} />
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-[#10B981] rounded-full"></div>
                              <span className="text-xs text-gray-400">Quantity:</span>
                              <span className="text-xs font-medium text-white">
                                {payload[1].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend 
                  formatter={(value) => <span style={{ color: '#e5e7eb' }}>{value}</span>} 
                />
                <Bar 
                  dataKey="sales" 
                  name="sales" 
                  fill="#0EA5E9" 
                  radius={[4, 4, 0, 0]} 
                  yAxisId="left"
                />
                <Bar 
                  dataKey="quantity" 
                  name="quantity" 
                  fill="#10B981" 
                  radius={[4, 4, 0, 0]} 
                  yAxisId="right"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No product data available for the selected period
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCategoryTrendsChart;
