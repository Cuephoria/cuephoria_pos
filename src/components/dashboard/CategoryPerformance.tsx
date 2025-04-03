
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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
        value: categoryRevenue.food,
        count: categoryCount.food,
        category: 'food'
      },
      {
        name: 'Drinks',
        value: categoryRevenue.drinks,
        count: categoryCount.drinks,
        category: 'drinks'
      },
      {
        name: 'Tobacco',
        value: categoryRevenue.tobacco,
        count: categoryCount.tobacco,
        category: 'tobacco'
      },
      {
        name: 'Challenges',
        value: categoryRevenue.challenges,
        count: categoryCount.challenges,
        category: 'challenges'
      },
      {
        name: 'Membership',
        value: categoryRevenue.membership,
        count: categoryCount.membership,
        category: 'membership'
      },
      {
        name: 'Gaming',
        value: categoryRevenue.session,
        count: categoryCount.session,
        category: 'session'
      }
    ].filter(cat => cat.value > 0 || cat.count > 0);
  };
  
  const getCategoryColor = (category: string) => {
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
      case 'session':
        return '#D946EF'; // Magenta Pink
      default:
        return '#888888'; // Gray
    }
  };
  
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show label if the segment is significant enough (more than 5%)
    if (percent < 0.05) return null;
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  const categoryData = generateCategoryData();
  const totalRevenue = categoryData.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Category Performance</CardTitle>
            <CardDescription className="text-gray-400">Revenue distribution by product category</CardDescription>
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
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getCategoryColor(entry.category)} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    const percentage = ((item.value / totalRevenue) * 100).toFixed(1);
                    
                    return (
                      <div className="rounded-lg border bg-gray-800 border-gray-700 p-2 shadow-md">
                        <p className="font-bold text-white">{item.name}</p>
                        <div className="grid grid-cols-1 gap-2 mt-1">
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Revenue:</span>
                            <span className="font-bold text-white">₹{Number(item.value).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Items Sold:</span>
                            <span className="font-bold text-white">{item.count}</span>
                          </div>
                          <div className="flex justify-between items-center gap-4">
                            <span className="text-gray-400">Percentage:</span>
                            <span className="font-bold text-white">{percentage}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                layout="horizontal"
                verticalAlign="bottom" 
                align="center"
                formatter={(value) => <span style={{ color: '#999', fontSize: '12px', marginLeft: '4px' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryPerformance;
