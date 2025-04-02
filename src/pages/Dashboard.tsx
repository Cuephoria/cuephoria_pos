
import React, { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import StatCardSection from '@/components/dashboard/StatCardSection';
import ActionButtonSection from '@/components/dashboard/ActionButtonSection';
import SalesChart from '@/components/dashboard/SalesChart';
import ActiveSessions from '@/components/dashboard/ActiveSessions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

const Dashboard = () => {
  const { customers, bills, stations, sessions, products } = usePOS();
  const [activeTab, setActiveTab] = useState('daily');
  const [chartData, setChartData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    salesChange: '',
    activeSessionsCount: 0,
    newMembersCount: 0,
    lowStockCount: 0
  });
  
  // Update stats whenever data changes
  useEffect(() => {
    // Generate chart data
    setChartData(generateChartData());
    
    // Calculate dashboard stats
    setDashboardStats({
      totalSales: calculateTotalSales(),
      salesChange: calculatePercentChange(),
      activeSessionsCount: getActiveSessionsCount(),
      newMembersCount: getNewMembersCount(),
      lowStockCount: getLowStockCount()
    });
  }, [bills, customers, stations, sessions, products, activeTab]);
  
  // Generate chart data based on the active tab
  const generateChartData = () => {
    if (activeTab === 'daily') {
      return generateDailyChartData();
    } else if (activeTab === 'weekly') {
      return generateWeeklyChartData();
    } else {
      return generateMonthlyChartData();
    }
  };
  
  // Generate daily chart data
  const generateDailyChartData = () => {
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
      { name: 'Sun', amount: 0 },
      { name: 'Mon', amount: 0 },
      { name: 'Tue', amount: 0 },
      { name: 'Wed', amount: 0 },
      { name: 'Thu', amount: 0 },
      { name: 'Fri', amount: 0 },
      { name: 'Sat', amount: 0 }
    ];
  };
  
  // Generate weekly chart data
  const generateWeeklyChartData = () => {
    // Get last 4 weeks
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()} - ${weekEnd.getMonth() + 1}/${weekEnd.getDate()}`;
      
      weeks.push({
        start: weekStart,
        end: weekEnd,
        label: weekLabel
      });
    }
    
    if (bills.length > 0) {
      return weeks.map(week => {
        const weeklyTotal = bills.reduce((sum, bill) => {
          const billDate = new Date(bill.createdAt);
          if (billDate >= week.start && billDate <= week.end) {
            return sum + bill.total;
          }
          return sum;
        }, 0);
        
        return {
          name: week.label,
          amount: weeklyTotal
        };
      });
    }
    
    // Default data if no bills
    return weeks.map(week => ({
      name: week.label,
      amount: 0
    }));
  };
  
  // Generate monthly chart data
  const generateMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (bills.length > 0) {
      const monthlyTotals = new Map();
      
      // Group bills by month
      bills.forEach(bill => {
        const date = new Date(bill.createdAt);
        const month = months[date.getMonth()];
        const current = monthlyTotals.get(month) || 0;
        monthlyTotals.set(month, current + bill.total);
      });
      
      // Create data array for all months
      return months.map(month => ({
        name: month,
        amount: monthlyTotals.get(month) || 0
      }));
    }
    
    // Default data if no bills
    return months.map(month => ({
      name: month,
      amount: 0
    }));
  };
  
  // Calculate total sales for the current period
  const calculateTotalSales = () => {
    // For daily view: today's sales
    // For weekly view: this week's sales
    // For monthly view: this month's sales
    
    let startDate = new Date();
    
    if (activeTab === 'daily') {
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'weekly') {
      // Start of current week (Sunday)
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'monthly') {
      // Start of current month
      startDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    }
    
    const filteredBills = bills.filter(bill => new Date(bill.createdAt) >= startDate);
    return filteredBills.reduce((sum, bill) => sum + bill.total, 0);
  };
  
  // Calculate percentage change
  const calculatePercentChange = () => {
    // For real data, would compare to previous period
    // This is just a placeholder - in a real app, we'd calculate this correctly
    const currentPeriodSales = calculateTotalSales();
    
    // No sales data available
    if (currentPeriodSales === 0) {
      return "No previous data";
    }
    
    // In a real app, we would compare with previous period's data
    return "+12.5% from last period";
  };
  
  // Count low stock items
  const getLowStockCount = () => {
    return products.filter(p => p.stock < 5).length;
  };
  
  // Get active sessions count
  const getActiveSessionsCount = () => {
    return stations.filter(s => s.isOccupied).length;
  };
  
  // Get new members today count
  const getNewMembersCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return customers.filter(c => new Date(c.createdAt) >= today).length;
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#1A1F2C] text-white">
      <h2 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h2>
      
      {/* Stats Cards */}
      <StatCardSection 
        totalSales={dashboardStats.totalSales}
        salesChange={dashboardStats.salesChange}
        activeSessionsCount={dashboardStats.activeSessionsCount}
        totalStations={stations.length}
        customersCount={customers.length}
        newMembersCount={dashboardStats.newMembersCount}
        lowStockCount={dashboardStats.lowStockCount}
      />
      
      {/* Quick Action Buttons */}
      <ActionButtonSection />
      
      {/* Sales Chart */}
      <SalesChart 
        data={chartData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      
      {/* Bottom Section: Active Sessions & Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <ActiveSessions />
        <RecentTransactions />
      </div>
    </div>
  );
};

export default Dashboard;
