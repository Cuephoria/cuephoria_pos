
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { Bill } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';

interface CustomerSpendingCorrelationProps {
  filteredBills?: Bill[];
}

const CustomerSpendingCorrelation: React.FC<CustomerSpendingCorrelationProps> = ({ filteredBills }) => {
  const { customers, bills: allBills } = usePOS();
  
  // Use filtered bills if provided, otherwise use all bills
  const bills = filteredBills || allBills;
  
  // Prepare data for the chart
  const getCustomerSpendingData = () => {
    if (!customers.length || !bills.length) return [];
    
    // Group bills by customer
    const customerBills = new Map();
    bills.forEach(bill => {
      if (!bill.customerId) return;
      
      if (!customerBills.has(bill.customerId)) {
        customerBills.set(bill.customerId, []);
      }
      
      customerBills.get(bill.customerId).push(bill);
    });
    
    // Create data points for the chart
    return Array.from(customerBills.entries()).map(([customerId, customerBillList]) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return null;
      
      // Calculate visit count
      const visitCount = customerBillList.length;
      
      // Calculate total spending
      const totalSpending = customerBillList.reduce((sum, bill) => sum + bill.total, 0);
      
      // Calculate average spending
      const avgSpending = totalSpending / visitCount;
      
      return {
        name: customer.name.split(' ')[0],
        visits: visitCount,
        spending: totalSpending,
        avgSpending: avgSpending,
        // Size represents relative importance (could be membership level or loyalty points)
        size: Math.min(20, Math.max(5, Math.sqrt(totalSpending) / 2)),
      };
    }).filter(Boolean);
  };
  
  const chartData = getCustomerSpendingData();
  
  return (
    <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Customer Value Analysis</CardTitle>
            <CardDescription className="text-gray-400">Correlation between visits and spending</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#9b87f5]/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-[#9b87f5]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="h-[350px] pt-4">
        <ChartContainer
          config={{
            spending: {
              label: "Total Spending",
              theme: {
                light: "#9b87f5",
                dark: "#9b87f5",
              },
            },
          }}
          className="h-full w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="visits" 
                name="Visits" 
                stroke="#777" 
                axisLine={false}
                tickLine={false}
                label={{ value: 'Visits', position: 'insideBottom', offset: -10, fill: '#777' }}
              />
              <YAxis 
                type="number" 
                dataKey="spending" 
                name="Total Spending" 
                stroke="#777"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
                label={{ value: 'Total Spending', angle: -90, position: 'insideLeft', offset: -5, fill: '#777' }}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-gray-800 border-gray-700 p-2 shadow-md">
                        <p className="text-sm font-medium text-white mb-1">{payload[0].payload.name}</p>
                        <div className="grid gap-1 text-xs">
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Visits:</span>
                            <span className="text-white font-medium">{payload[0].payload.visits}</span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Total Spending:</span>
                            <span className="text-white font-medium">
                              <CurrencyDisplay amount={payload[0].payload.spending} />
                            </span>
                          </div>
                          <div className="flex justify-between gap-4">
                            <span className="text-gray-400">Avg per Visit:</span>
                            <span className="text-white font-medium">
                              <CurrencyDisplay amount={payload[0].payload.avgSpending} />
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                }}
              />
              <Scatter name="spending" data={chartData} fill="#9b87f5">
                {chartData.map((entry, index) => (
                  <cell key={`cell-${index}`} fill="#9b87f5" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CustomerSpendingCorrelation;
