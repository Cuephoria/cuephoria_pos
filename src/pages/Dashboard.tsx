
import React, { useState, useEffect } from 'react';
import { CreditCard, Users, Clock, ShoppingCart, BarChart2, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePOS, Customer, Bill } from '@/context/POSContext';
import StatCard from '@/components/StatCard';

const Dashboard = () => {
  const { customers, bills, stations, sessions } = usePOS();
  const [activeTab, setActiveTab] = useState('today');
  const [todayStats, setTodayStats] = useState({
    sales: 0,
    customers: 0,
    avgPlayTime: 0,
    topProducts: [] as { name: string; qty: number }[],
  });
  const [weekStats, setWeekStats] = useState({
    sales: 0,
    customers: 0,
    avgPlayTime: 0,
    topProducts: [] as { name: string; qty: number }[],
  });
  const [monthStats, setMonthStats] = useState({
    sales: 0,
    customers: 0,
    avgPlayTime: 0,
    topProducts: [] as { name: string; qty: number }[],
  });

  // Calculate stats based on time period
  useEffect(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Filter bills by time period
    const todayBills = bills.filter(bill => new Date(bill.createdAt) >= todayStart);
    const weekBills = bills.filter(bill => new Date(bill.createdAt) >= weekStart);
    const monthBills = bills.filter(bill => new Date(bill.createdAt) >= monthStart);

    // Calculate stats for today
    const todaySales = todayBills.reduce((sum, bill) => sum + bill.total, 0);
    const todayCustomerCount = new Set(todayBills.map(bill => bill.customerId)).size;
    
    // Today's top products
    const todayProductMap = new Map<string, number>();
    todayBills.forEach(bill => {
      bill.items.forEach(item => {
        const current = todayProductMap.get(item.name) || 0;
        todayProductMap.set(item.name, current + item.quantity);
      });
    });
    const todayTopProducts = Array.from(todayProductMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Calculate average play time for today's sessions
    const todaySessions = sessions.filter(
      session => new Date(session.startTime) >= todayStart && session.duration
    );
    const todayTotalPlayTime = todaySessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const todayAvgPlayTime = todaySessions.length ? Math.round(todayTotalPlayTime / todaySessions.length) : 0;

    setTodayStats({
      sales: todaySales,
      customers: todayCustomerCount,
      avgPlayTime: todayAvgPlayTime,
      topProducts: todayTopProducts,
    });

    // Calculate stats for week
    const weekSales = weekBills.reduce((sum, bill) => sum + bill.total, 0);
    const weekCustomerCount = new Set(weekBills.map(bill => bill.customerId)).size;
    
    // Week's top products
    const weekProductMap = new Map<string, number>();
    weekBills.forEach(bill => {
      bill.items.forEach(item => {
        const current = weekProductMap.get(item.name) || 0;
        weekProductMap.set(item.name, current + item.quantity);
      });
    });
    const weekTopProducts = Array.from(weekProductMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Calculate average play time for week's sessions
    const weekSessions = sessions.filter(
      session => new Date(session.startTime) >= weekStart && session.duration
    );
    const weekTotalPlayTime = weekSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const weekAvgPlayTime = weekSessions.length ? Math.round(weekTotalPlayTime / weekSessions.length) : 0;

    setWeekStats({
      sales: weekSales,
      customers: weekCustomerCount,
      avgPlayTime: weekAvgPlayTime,
      topProducts: weekTopProducts,
    });

    // Calculate stats for month
    const monthSales = monthBills.reduce((sum, bill) => sum + bill.total, 0);
    const monthCustomerCount = new Set(monthBills.map(bill => bill.customerId)).size;
    
    // Month's top products
    const monthProductMap = new Map<string, number>();
    monthBills.forEach(bill => {
      bill.items.forEach(item => {
        const current = monthProductMap.get(item.name) || 0;
        monthProductMap.set(item.name, current + item.quantity);
      });
    });
    const monthTopProducts = Array.from(monthProductMap.entries())
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    // Calculate average play time for month's sessions
    const monthSessions = sessions.filter(
      session => new Date(session.startTime) >= monthStart && session.duration
    );
    const monthTotalPlayTime = monthSessions.reduce((sum, session) => sum + (session.duration || 0), 0);
    const monthAvgPlayTime = monthSessions.length ? Math.round(monthTotalPlayTime / monthSessions.length) : 0;

    setMonthStats({
      sales: monthSales,
      customers: monthCustomerCount,
      avgPlayTime: monthAvgPlayTime,
      topProducts: monthTopProducts,
    });
  }, [bills, sessions]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getActiveStats = () => {
    switch (activeTab) {
      case 'week':
        return weekStats;
      case 'month':
        return monthStats;
      default:
        return todayStats;
    }
  };

  const stats = getActiveStats();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
      
      <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
        </TabsList>
        <TabsContent value="today" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={stats.sales}
              icon={CreditCard}
              isCurrency={true}
              description="Total sales for today"
            />
            <StatCard
              title="Active Customers"
              value={stats.customers}
              icon={Users}
              description="Unique customers today"
            />
            <StatCard
              title="Average Play Time"
              value={formatTime(stats.avgPlayTime)}
              icon={Clock}
              description="Per gaming session"
            />
            <StatCard
              title="Occupied Stations"
              value={`${stations.filter(s => s.isOccupied).length} / ${stations.length}`}
              icon={BarChart2}
              description="Currently in use"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Popular Products</CardTitle>
                <CardDescription>Top selling items for the period</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-8">
                    {stats.topProducts.map((product, i) => (
                      <div className="flex items-center" key={product.name}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.qty} {product.qty === 1 ? 'unit' : 'units'} sold
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No products sold in this period</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {bills.slice(0, 5).map((bill) => {
                    const customer = customers.find(c => c.id === bill.customerId);
                    return (
                      <div className="flex items-center" key={bill.id}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {customer?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.createdAt).toLocaleTimeString('en-IN')}
                          </p>
                        </div>
                        <div className="ml-auto font-medium indian-rupee">
                          {bill.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                  
                  {bills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="week" className="space-y-4">
          {/* Week content - identical structure as today */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={stats.sales}
              icon={CreditCard}
              isCurrency={true}
              description="Total sales this week"
            />
            <StatCard
              title="Active Customers"
              value={stats.customers}
              icon={Users}
              description="Unique customers this week"
            />
            <StatCard
              title="Average Play Time"
              value={formatTime(stats.avgPlayTime)}
              icon={Clock}
              description="Per gaming session"
            />
            <StatCard
              title="Occupied Stations"
              value={`${stations.filter(s => s.isOccupied).length} / ${stations.length}`}
              icon={BarChart2}
              description="Currently in use"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Popular Products</CardTitle>
                <CardDescription>Top selling items for the period</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-8">
                    {stats.topProducts.map((product, i) => (
                      <div className="flex items-center" key={product.name}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.qty} {product.qty === 1 ? 'unit' : 'units'} sold
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No products sold in this period</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {bills.slice(0, 5).map((bill) => {
                    const customer = customers.find(c => c.id === bill.customerId);
                    return (
                      <div className="flex items-center" key={bill.id}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {customer?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.createdAt).toLocaleTimeString('en-IN')}
                          </p>
                        </div>
                        <div className="ml-auto font-medium indian-rupee">
                          {bill.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                  
                  {bills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="month" className="space-y-4">
          {/* Month content - identical structure as today */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value={stats.sales}
              icon={CreditCard}
              isCurrency={true}
              description="Total sales this month"
            />
            <StatCard
              title="Active Customers"
              value={stats.customers}
              icon={Users}
              description="Unique customers this month"
            />
            <StatCard
              title="Average Play Time"
              value={formatTime(stats.avgPlayTime)}
              icon={Clock}
              description="Per gaming session"
            />
            <StatCard
              title="Occupied Stations"
              value={`${stations.filter(s => s.isOccupied).length} / ${stations.length}`}
              icon={BarChart2}
              description="Currently in use"
            />
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Popular Products</CardTitle>
                <CardDescription>Top selling items for the period</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-8">
                    {stats.topProducts.map((product, i) => (
                      <div className="flex items-center" key={product.name}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {product.qty} {product.qty === 1 ? 'unit' : 'units'} sold
                          </p>
                        </div>
                        <div className="ml-auto font-medium">{i + 1}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No products sold in this period</p>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {bills.slice(0, 5).map((bill) => {
                    const customer = customers.find(c => c.id === bill.customerId);
                    return (
                      <div className="flex items-center" key={bill.id}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {customer?.name || 'Unknown Customer'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(bill.createdAt).toLocaleTimeString('en-IN')}
                          </p>
                        </div>
                        <div className="ml-auto font-medium indian-rupee">
                          {bill.total.toLocaleString('en-IN')}
                        </div>
                      </div>
                    );
                  })}
                  
                  {bills.length === 0 && (
                    <p className="text-sm text-muted-foreground">No recent transactions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
