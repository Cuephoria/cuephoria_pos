
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Package } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

const ProductPerformance = () => {
  const { bills, products } = usePOS();
  const [showCount, setShowCount] = useState(5);

  // Calculate product performance from bills
  const productPerformance = React.useMemo(() => {
    const performanceMap = new Map();
    
    // Process all items in all bills
    bills.forEach(bill => {
      bill.items.forEach(item => {
        // Use item.id instead of item.productId
        const productId = item.id;
        if (!performanceMap.has(productId)) {
          performanceMap.set(productId, {
            id: productId,
            quantity: 0,
            revenue: 0,
            product: products.find(p => p.id === productId)
          });
        }
        
        const currentStats = performanceMap.get(productId);
        currentStats.quantity += item.quantity;
        currentStats.revenue += item.price * item.quantity;
      });
    });
    
    // Convert map to array and sort by revenue (highest first)
    return Array.from(performanceMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .map(item => ({
        ...item,
        name: item.product?.name || 'Unknown Product'
      }));
  }, [bills, products]);
  
  // Get top products based on showCount
  const topProducts = productPerformance.slice(0, showCount);
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Product Performance</CardTitle>
            <span className="text-sm text-gray-400">Top selling products by revenue</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#F97316]/20 flex items-center justify-center">
            <Package className="h-5 w-5 text-[#F97316]" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {topProducts.length > 0 ? (
          <div className="h-[350px]">
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
                  data={topProducts}
                  margin={{ top: 5, right: 10, left: 10, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#777"
                    tick={{ fill: '#ccc' }}
                    axisLine={false}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#777"
                    axisLine={false}
                    tickLine={false}
                    width={80}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        
                        return (
                          <div className="rounded-lg border bg-card p-2 shadow-md">
                            <div className="flex flex-col space-y-1.5 px-1">
                              <div className="text-sm font-semibold">{data.name}</div>
                              <div className="flex flex-col space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Revenue:</span>
                                  <span className="text-xs font-medium">
                                    <CurrencyDisplay amount={data.revenue} />
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">Quantity:</span>
                                  <span className="text-xs font-medium">{data.quantity}</span>
                                </div>
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
                    fill="#F97316" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40} 
                    name="revenue"
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px] text-gray-400">
            <p>No product data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductPerformance;
