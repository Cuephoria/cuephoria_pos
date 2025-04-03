
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { BarChartHorizontal } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

const ProductPerformance: React.FC = () => {
  const { bills, products } = usePOS();
  
  // Generate product performance data
  const generateProductData = () => {
    // Create a map to store product sales
    const productSales = new Map();
    
    // Analyze bills and count product sales
    bills.forEach(bill => {
      bill.items.forEach(item => {
        if (item.type === 'product') {
          const current = productSales.get(item.name) || { sales: 0, count: 0 };
          productSales.set(item.name, {
            sales: current.sales + item.total,
            count: current.count + item.quantity
          });
        }
      });
    });
    
    // Convert map to array and sort by sales (highest first)
    return Array.from(productSales, ([name, data]) => ({
      name,
      sales: data.sales,
      count: data.count
    }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10); // Only show top 10 products
  };
  
  const getProductColor = (productName: string) => {
    // Find the product by name to get its category
    const product = products.find(p => p.name === productName);
    const category = product?.category || 'food';
    
    // Use the category color
    switch (category) {
      case 'food':
        return '#F97316'; // Bright Orange
      case 'drinks':
        return '#0EA5E9'; // Ocean Blue
      case 'tobacco':
        return '#EF4444'; // Red
      case 'challenges':
        return '#10B981'; // Green
      case 'membership':
        return '#8B5CF6'; // Vivid Purple
      default:
        return '#888888'; // Gray
    }
  };
  
  const formatCurrency = (value: number) => {
    return `₹${value.toFixed(2)}`;
  };
  
  const productData = generateProductData();
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Product Performance</CardTitle>
            <CardDescription className="text-gray-400">Top selling products by revenue</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center">
            <BarChartHorizontal className="h-5 w-5 text-blue-500" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[300px] pt-4">
        <ChartContainer
          config={{}}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={productData}
              margin={{
                top: 5,
                right: 30,
                left: 100,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" horizontal={false} />
              <XAxis 
                type="number" 
                tick={{ fill: '#999' }} 
                tickFormatter={formatCurrency}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: '#999' }} 
                width={100}
                tickFormatter={(value) => {
                  // Truncate long product names
                  return value.length > 13 ? value.substring(0, 13) + '...' : value;
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    
                    return (
                      <div className="rounded-lg border bg-gray-800 border-gray-700 p-2 shadow-md">
                        <p className="font-bold text-white">{item.name}</p>
                        <div className="grid grid-cols-1 gap-2 mt-1">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="font-bold text-white">₹{Number(item.sales).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Items Sold:</span>
                            <span className="font-bold text-white">{item.count}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar 
                dataKey="sales" 
                name="Revenue"
                fill="#F97316"
                fillOpacity={0.9}
                radius={[0, 4, 4, 0]}
              >
                {productData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getProductColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default ProductPerformance;
