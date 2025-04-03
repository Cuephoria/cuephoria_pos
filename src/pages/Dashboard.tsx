
import React, { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import { useExpenses } from '@/context/ExpenseContext';
import StatCardSection from '@/components/dashboard/StatCardSection';
import ActionButtonSection from '@/components/dashboard/ActionButtonSection';
import SalesChart from '@/components/dashboard/SalesChart';
import BusinessSummarySection from '@/components/dashboard/BusinessSummarySection';
import ActiveSessions from '@/components/dashboard/ActiveSessions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import ProductInventoryChart from '@/components/dashboard/ProductInventoryChart';
import ExpenseList from '@/components/expenses/ExpenseList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { customers, bills, stations, sessions, products } = usePOS();
  const { expenses, businessSummary } = useExpenses();
  
  const [activeTab, setActiveTab] = useState('daily');
  const [chartData, setChartData] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    salesChange: '',
    activeSessionsCount: 0,
    newMembersCount: 0,
    lowStockCount: 0,
    lowStockItems: []
  });
  
  useEffect(() => {
    setChartData(generateChartData());
    
    const lowStockItems = products.filter(p => p.stock < 5)
      .sort((a, b) => a.stock - b.stock);
    
    setDashboardStats({
      totalSales: calculateTotalSales(),
      salesChange: calculatePercentChange(),
      activeSessionsCount: getActiveSessionsCount(),
      newMembersCount: getNewMembersCount(),
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems
    });
  }, [bills, customers, stations, sessions, products, activeTab]);
  
  const generateChartData = () => {
    if (activeTab === 'hourly') {
      return generateHourlyChartData();
    } else if (activeTab === 'daily') {
      return generateDailyChartData();
    } else if (activeTab === 'weekly') {
      return generateWeeklyChartData();
    } else {
      return generateMonthlyChartData();
    }
  };
  
  const generateHourlyChartData = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    if (bills.length > 0) {
      const hourlyTotals = new Map();
      
      bills.forEach(bill => {
        const billDate = new Date(bill.createdAt);
        
        if (billDate >= today) {
          const hour = billDate.getHours();
          const current = hourlyTotals.get(hour) || 0;
          hourlyTotals.set(hour, current + bill.total);
        }
      });
      
      return hours.map(hour => {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        const formattedHour = `${hour12}${ampm}`;
        
        return {
          name: formattedHour,
          amount: hourlyTotals.get(hour) || 0
        };
      });
    }
    
    return hours.map(hour => {
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      const formattedHour = `${hour12}${ampm}`;
      
      return {
        name: formattedHour,
        amount: 0
      };
    });
  };
  
  const generateDailyChartData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    if (bills.length > 0) {
      const dailyTotals = new Map();
      
      bills.forEach(bill => {
        const date = new Date(bill.createdAt);
        const day = days[date.getDay()];
        const current = dailyTotals.get(day) || 0;
        dailyTotals.set(day, current + bill.total);
      });
      
      return days.map(day => ({
        name: day,
        amount: dailyTotals.get(day) || 0
      }));
    }
    
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
  
  const generateWeeklyChartData = () => {
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
    
    return weeks.map(week => ({
      name: week.label,
      amount: 0
    }));
  };
  
  const generateMonthlyChartData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (bills.length > 0) {
      const monthlyTotals = new Map();
      
      bills.forEach(bill => {
        const date = new Date(bill.createdAt);
        const month = months[date.getMonth()];
        const current = monthlyTotals.get(month) || 0;
        monthlyTotals.set(month, current + bill.total);
      });
      
      return months.map(month => ({
        name: month,
        amount: monthlyTotals.get(month) || 0
      }));
    }
    
    return months.map(month => ({
      name: month,
      amount: 0
    }));
  };
  
  const calculateTotalSales = () => {
    // Define the start date based on the active tab
    let startDate = new Date();
    const now = new Date();
    
    if (activeTab === 'hourly') {
      // Start from the beginning of the current day
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'daily') {
      // Start from the beginning of the current week
      const dayOfWeek = startDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
      startDate.setDate(startDate.getDate() - dayOfWeek); // Go back to the start of the week (Sunday)
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'weekly') {
      // Start from 4 weeks ago
      startDate.setDate(startDate.getDate() - 28); // Go back 28 days (4 weeks)
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'monthly') {
      // Start from the beginning of the year
      startDate = new Date(startDate.getFullYear(), 0, 1); // January 1st of current year
    }
    
    // Filter bills that are after the start date
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= startDate && billDate <= now;
    });
    
    // Calculate the total of all filtered bills
    const total = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    
    return total;
  };
  
  const calculatePercentChange = () => {
    const currentPeriodSales = calculateTotalSales();
    
    // Get the previous period
    let previousPeriodStart = new Date();
    let previousPeriodEnd = new Date();
    let currentPeriodStart = new Date();
    
    if (activeTab === 'hourly') {
      // Compare to previous day
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
    } else if (activeTab === 'daily') {
      // Compare to previous week
      const dayOfWeek = currentPeriodStart.getDay();
      currentPeriodStart.setDate(currentPeriodStart.getDate() - dayOfWeek); // Start of current week
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7); // Start of previous week
    } else if (activeTab === 'weekly') {
      // Compare to previous 4 weeks
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 28);
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 28);
    } else if (activeTab === 'monthly') {
      // Compare to previous year
      currentPeriodStart = new Date(currentPeriodStart.getFullYear(), 0, 1);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
    }
    
    // Calculate previous period sales
    const previousPeriodBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= previousPeriodStart && billDate < previousPeriodEnd;
    });
    
    const previousPeriodSales = previousPeriodBills.reduce((sum, bill) => sum + bill.total, 0);
    
    if (previousPeriodSales === 0) {
      return currentPeriodSales > 0 ? "+100% from last period" : "No previous data";
    }
    
    const percentChange = ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100;
    
    // Format to 1 decimal place and add + sign for positive values
    const formattedChange = percentChange.toFixed(1);
    return (percentChange >= 0 ? "+" : "") + formattedChange + "% from last period";
  };
  
  const getLowStockCount = () => {
    return products.filter(p => p.stock < 5).length;
  };
  
  const getActiveSessionsCount = () => {
    return stations.filter(s => s.isOccupied).length;
  };
  
  const getNewMembersCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return customers.filter(c => new Date(c.createdAt) >= today).length;
  };

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#1A1F2C] text-white">
      <h2 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h2>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full max-w-md">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="finances" className="flex-1">Finances</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <StatCardSection 
            totalSales={dashboardStats.totalSales}
            salesChange={dashboardStats.salesChange}
            activeSessionsCount={dashboardStats.activeSessionsCount}
            totalStations={stations.length}
            customersCount={customers.length}
            newMembersCount={dashboardStats.newMembersCount}
            lowStockCount={dashboardStats.lowStockCount}
            lowStockItems={dashboardStats.lowStockItems}
          />
          
          <ActionButtonSection />
          
          <SalesChart 
            data={chartData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <CustomerActivityChart />
            <ProductInventoryChart />
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <ActiveSessions />
            <RecentTransactions />
          </div>
        </TabsContent>
        
        <TabsContent value="finances" className="space-y-6">
          <BusinessSummarySection />
          
          <ExpenseList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
