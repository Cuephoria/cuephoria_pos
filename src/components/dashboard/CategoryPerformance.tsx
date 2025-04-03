
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ShoppingBag } from 'lucide-react';
import { usePOS } from '@/context/POSContext';

const CategoryPerformance: React.FC = () => {
  const { bills } = usePOS();
  
  // Generate category performance data
  const generateCategoryData = () => {
    const categoryRevenue = {
      food: 0,
      drinks: 0,
      tobacco: 0,
      challenges: 0,
      membership: 0,
      session: 0
    };
    
    const categoryCount = {
      food: 0,
      drinks: 0,
      tobacco: 0,
      challenges: 0,
      membership: 0,
      session: 0
    };
    
    // Analyze bills and categorize
    bills.forEach(bill => {
      bill.items.forEach(item => {
        if (item.type === 'product' && item.category) {
          categoryRevenue[item.category] = (categoryRevenue[item.category] || 0) + item.total;
          categoryCount[item.category] = (categoryCount[item.category] || 0) + item.quantity;
        } else if (item.type === 'session') {
          categoryRevenue.session = (categoryRevenue.session || 0) + item.total;
          categoryCount.session = (categoryCount.session || 0) + 1;
        }
      });
    });
    
    // Format for chart
    return [
      {
        name: 'Food',
        revenue: categoryRevenue.food,
        count: categoryCount.food,
        category: 'food'
      },
      {
        name: 'Drinks',
        revenue: categoryRevenue.drinks,
        count: categoryCount.drinks,
        category: 'drinks'
      },
      {
        name: 'Tobacco',
        revenue: categoryRevenue.tobacco,
        count: categoryCount.tobacco,
        category: 'tobacco'
      },
      {
        name: 'Challenges',
        revenue: categoryRevenue.challenges,
        count: categoryCount.challenges,
        category: 'challenges'
      },
      {
        name: 'Membership',
        revenue: categoryRevenue.membership,
        count: categoryCount.membership,
        category: 'membership'
      },
      {
        name: 'Gaming',
        revenue: categoryRevenue.session,
        count: categoryCount.session,
        category: 'session'
      }
    ].filter(cat => cat.revenue > 0 || cat.count > 0);
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return 'hsl(var(--secondary))'; // Orange
      case 'drinks':
        return 'hsl(var(--accent))'; // Blue
      case 'tobacco':
        return 'hsl(var(--destructive))'; // Red
      case 'challenges':
        return 'hsl(var(--primary))'; // Green/Purple
      case 'membership':
        return 'hsl(var(--ring))'; // Purple
      case 'session':
        return 'hsl(var(--muted))'; // Muted color
      default:
        return 'hsl(var(--muted-foreground))';
    }
  };
  
  const categoryData = generateCategoryData();
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Category Performance</CardTitle>
            <CardDescription className="text-gray-400">Revenue by product category</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <ShoppingBag className="h-5 w-5 text-green-500" />
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
              data={categoryData}
              margin={{ top: 5, right: 30, left: 20, bottom: 30 }}
              barGap={0}
              barCategoryGap="15%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="#777" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                stroke="#777"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${Number(value).toFixed(0)}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#777"
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const category = payload[0]?.payload?.category;
                    return (
                      <div className="rounded-lg border bg-gray-800 border-gray-700 p-2 shadow-md">
                        <p className="font-bold text-white">{label}</p>
                        <div className="grid grid-cols-1 gap-2 mt-1">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="font-bold text-white">₹{Number(payload[0].value).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Items Sold:</span>
                            <span className="font-bold text-white">{payload[1].value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span style={{ color: '#999' }}>{value}</span>}
              />
              <Bar 
                yAxisId="left" 
                dataKey="revenue" 
                name="Revenue" 
                radius={[4, 4, 0, 0]}
                fill="#0EA5E9"
                stroke="none"
                fillOpacity={0.9}
              />
              <Bar 
                yAxisId="right" 
                dataKey="count" 
                name="Items Sold" 
                radius={[4, 4, 0, 0]}
                fill="#D946EF"
                stroke="none"
                fillOpacity={0.7}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformance;
