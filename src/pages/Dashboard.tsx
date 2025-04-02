
import React, { useState, useEffect } from 'react';
import { CreditCard, Users, Clock, Package, BarChart2, Activity, ShoppingCart, Plus, User, AlertTriangle, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { usePOS } from '@/context/POSContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

const Dashboard = () => {
  const { customers, bills, stations, sessions, products } = usePOS();
  const [activeTab, setActiveTab] = useState('daily');
  const navigate = useNavigate();
  
  // Generate sample chart data if no real data exists
  const generateChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // If we have real data, use it
    if (bills.length > 0) {
      const dailyTotals = new Map();
      
      // Group bills by day
      bills.forEach(bill => {
        const date = new Date(bill.createdAt);
        const day = days[date.getDay()];
        const current = dailyTotals.get(day) || 0;
        dailyTotals.set(day, current + bill.total);
      });
      
      // Create data array
      return days.map(day => ({
        name: day,
        amount: dailyTotals.get(day) || 0
      }));
    }
    
    // Generate sample data if no real data
    return [
      { name: 'Sun', amount: 250 },
      { name: 'Mon', amount: 320 },
      { name: 'Tue', amount: 180 },
      { name: 'Wed', amount: 430 },
      { name: 'Thu', amount: 310 },
      { name: 'Fri', amount: 280 },
      { name: 'Sat', amount: 400 }
    ];
  };

  const chartData = generateChartData();
  
  // Calculate total sales for the current period
  const calculateTotalSales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const filteredBills = bills.filter(bill => new Date(bill.createdAt) >= today);
    return filteredBills.reduce((sum, bill) => sum + bill.total, 0) || 18.70; // Default sample value
  };
  
  // Calculate percentage change
  const calculatePercentChange = () => {
    // In a real app, would compare to previous period
    return "+12.5% from last week";
  };
  
  // Count low stock items
  const getLowStockCount = () => {
    return products.filter(p => p.stock < 5).length || 0;
  };
  
  // Get active sessions count
  const getActiveSessionsCount = () => {
    return stations.filter(s => s.isOccupied).length || 1;
  };
  
  // Get new members today count
  const getNewMembersCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return customers.filter(c => new Date(c.createdAt) >= today).length || 2;
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#1A1F2C] text-white">
      <h2 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h2>
      
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl hover:shadow-purple-900/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium text-gray-200">Total Sales</CardTitle>
            <div className="h-10 w-10 rounded-full bg-[#6E59A5]/20 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#9b87f5]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">₹{calculateTotalSales().toFixed(2)}</div>
            <p className="text-xs text-green-400 mt-1">{calculatePercentChange()}</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl hover:shadow-blue-900/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium text-gray-200">Active Sessions</CardTitle>
            <div className="h-10 w-10 rounded-full bg-[#0EA5E9]/20 flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-[#0EA5E9]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{getActiveSessionsCount()}</div>
            <p className="text-xs text-gray-400 mt-1">{stations.length} stations available</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl hover:shadow-green-900/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium text-gray-200">Customers</CardTitle>
            <div className="h-10 w-10 rounded-full bg-[#10B981]/20 flex items-center justify-center">
              <Users className="h-5 w-5 text-[#10B981]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{customers.length || 3}</div>
            <p className="text-xs text-gray-400 mt-1">{getNewMembersCount()} new members today</p>
          </CardContent>
        </Card>

        <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl hover:shadow-red-900/10 transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-md font-medium text-gray-200">Inventory Alert</CardTitle>
            <div className="h-10 w-10 rounded-full bg-[#F97316]/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-[#F97316]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading">{getLowStockCount()} items</div>
            <p className="text-xs text-red-400 mt-1">Low stock items need attention</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Quick Action Buttons */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Button 
          onClick={() => navigate('/stations')}
          variant="outline" 
          className="h-20 bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500"
        >
          <PlayCircle className="h-5 w-5 mr-2 text-[#0EA5E9]" />
          <span>New Gaming Session</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/pos')}
          variant="outline" 
          className="h-20 bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500"
        >
          <ShoppingCart className="h-5 w-5 mr-2 text-[#9b87f5]" />
          <span>New Sale</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/customers')}
          variant="outline" 
          className="h-20 bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500"
        >
          <User className="h-5 w-5 mr-2 text-[#10B981]" />
          <span>Add Customer</span>
        </Button>
        
        <Button 
          onClick={() => navigate('/products')}
          variant="outline" 
          className="h-20 bg-[#1A1F2C] border-gray-700 hover:bg-[#2A2F3C] hover:border-purple-500"
        >
          <Package className="h-5 w-5 mr-2 text-[#F97316]" />
          <span>Manage Inventory</span>
        </Button>
      </div>
      
      {/* Sales Chart */}
      <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-white font-heading">Sales Overview</CardTitle>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList className="bg-gray-800 text-gray-400">
                <TabsTrigger value="daily">Daily</TabsTrigger>
                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="h-[350px] pt-4">
          <ChartContainer
            config={{
              amount: {
                label: "Amount",
                theme: {
                  light: "#9b87f5",
                  dark: "#9b87f5",
                },
              },
            }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData}
                margin={{ top: 5, right: 10, left: 10, bottom: 25 }}
              >
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9b87f5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#9b87f5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#777" 
                  axisLine={false}
                  tickLine={false}
                  padding={{ left: 10, right: 10 }}
                />
                <YAxis 
                  stroke="#777"
                  axisLine={false}
                  tickLine={false}
                  width={30}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-card p-2 shadow-md">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Day
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.name}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Sales
                              </span>
                              <span className="font-bold">
                                ₹{payload[0].value}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  name="amount"
                  stroke="#9b87f5"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#9b87f5", strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: "#9b87f5", stroke: "#1A1F2C", strokeWidth: 2 }}
                  fillOpacity={1}
                  fill="url(#colorAmount)"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
      
      {/* Bottom Section: Active Sessions & Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white font-heading">Active Gaming Sessions</CardTitle>
            <CardDescription className="text-gray-400">Currently active sessions at the center</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stations.filter(s => s.isOccupied).length > 0 ? (
              stations.filter(s => s.isOccupied).map(station => {
                const session = sessions.find(s => s.stationId === station.id && !s.endTime);
                const customer = customers.find(c => session && c.id === session.customerId);
                
                return (
                  <div key={station.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">{customer?.name || 'John Doe'}</p>
                        <p className="text-xs text-gray-400">{station.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {session ? '1h 0m' : '30m'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">John Doe</p>
                    <p className="text-xs text-gray-400">PS5 Station 1</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-400">
                  <Clock className="h-4 w-4 mr-1" />
                  <span className="text-sm">1h 0m</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white font-heading">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-400">Latest sales and billing information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {bills.length > 0 ? (
              bills.slice(0, 5).map(bill => {
                const customer = customers.find(c => c.id === bill.customerId);
                
                return (
                  <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                        <User className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
                        <p className="text-xs text-gray-400">{new Date(bill.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="text-white font-semibold">
                      ₹{bill.total.toFixed(2)}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                    <User className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium">Mike Johnson</p>
                    <p className="text-xs text-gray-400">3:45 PM</p>
                  </div>
                </div>
                <div className="text-white font-semibold">
                  ₹18.70
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
