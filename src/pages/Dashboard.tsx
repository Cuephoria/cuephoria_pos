import React, { useState, useEffect } from 'react';
import { usePOS } from '@/context/POSContext';
import { useExpenses } from '@/context/ExpenseContext';
import { DateRange } from 'react-day-picker';
import { format, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import StatCardSection from '@/components/dashboard/StatCardSection';
import ActionButtonSection from '@/components/dashboard/ActionButtonSection';
import SalesChart from '@/components/dashboard/SalesChart';
import BusinessSummarySection from '@/components/dashboard/BusinessSummarySection';
import ActiveSessions from '@/components/dashboard/ActiveSessions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import ProductInventoryChart from '@/components/dashboard/ProductInventoryChart';
import CustomerSpendingCorrelation from '@/components/dashboard/CustomerSpendingCorrelation';
import HourlyRevenueDistribution from '@/components/dashboard/HourlyRevenueDistribution';
import ProductPerformance from '@/components/dashboard/ProductPerformance';
import ExpenseList from '@/components/expenses/ExpenseList';
import DateRangeFilter from '@/components/dashboard/DateRangeFilter';
import RevenueBreakdownChart from '@/components/dashboard/RevenueBreakdownChart';
import ProductCategoryTrendsChart from '@/components/dashboard/ProductCategoryTrendsChart';
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
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filteredBills, setFilteredBills] = useState(bills);
  const [filteredExpenses, setFilteredExpenses] = useState(expenses);

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
    let startDate = new Date();
    const now = new Date();
    
    if (activeTab === 'hourly') {
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'daily') {
      const dayOfWeek = startDate.getDay();
      startDate.setDate(startDate.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'weekly') {
      startDate.setDate(startDate.getDate() - 28);
      startDate.setHours(0, 0, 0, 0);
    } else if (activeTab === 'monthly') {
      startDate = new Date(startDate.getFullYear(), 0, 1);
    }
    
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= startDate && billDate <= now;
    });
    
    const total = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    
    return total;
  };
  
  const calculatePercentChange = () => {
    const currentPeriodSales = calculateTotalSales();
    
    let previousPeriodStart = new Date();
    let previousPeriodEnd = new Date();
    let currentPeriodStart = new Date();
    
    if (activeTab === 'hourly') {
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 1);
    } else if (activeTab === 'daily') {
      const dayOfWeek = currentPeriodStart.getDay();
      currentPeriodStart.setDate(currentPeriodStart.getDate() - dayOfWeek);
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
    } else if (activeTab === 'weekly') {
      currentPeriodStart.setDate(currentPeriodStart.getDate() - 28);
      currentPeriodStart.setHours(0, 0, 0, 0);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - 28);
    } else if (activeTab === 'monthly') {
      currentPeriodStart = new Date(currentPeriodStart.getFullYear(), 0, 1);
      previousPeriodEnd = new Date(currentPeriodStart);
      previousPeriodStart = new Date(previousPeriodEnd);
      previousPeriodStart.setFullYear(previousPeriodStart.getFullYear() - 1);
    }
    
    const previousPeriodBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= previousPeriodStart && billDate < previousPeriodEnd;
    });
    
    const previousPeriodSales = previousPeriodBills.reduce((sum, bill) => sum + bill.total, 0);
    
    if (previousPeriodSales === 0) {
      return currentPeriodSales > 0 ? "+100% from last period" : "No previous data";
    }
    
    const percentChange = ((currentPeriodSales - previousPeriodSales) / previousPeriodSales) * 100;
    
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

  const applyDateFilter = () => {
    if (!dateRange?.from) {
      setFilteredBills(bills);
      setFilteredExpenses(expenses);
      return;
    }

    const from = startOfDay(dateRange.from);
    const to = dateRange.to ? endOfDay(dateRange.to) : endOfDay(dateRange.from);

    // Filter bills
    const newFilteredBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return isWithinInterval(billDate, { start: from, end: to });
    });
    setFilteredBills(newFilteredBills);

    // Filter expenses
    const newFilteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return isWithinInterval(expenseDate, { start: from, end: to });
    });
    setFilteredExpenses(newFilteredExpenses);
  };

  const resetDateFilter = () => {
    setDateRange(undefined);
    setFilteredBills(bills);
    setFilteredExpenses(expenses);
  };

  const getRevenueBreakdownData = () => {
    const data = [
      { name: 'PS5 Gaming', value: 0, color: '#9b87f5' },
      { name: 'Pool Tables', value: 0, color: '#0EA5E9' },
      { name: 'Metashot', value: 0, color: '#10B981' },
      { name: 'Food', value: 0, color: '#F59E0B' },
      { name: 'Beverages', value: 0, color: '#EC4899' },
      { name: 'Tobacco', value: 0, color: '#8B5CF6' }
    ];

    filteredBills.forEach(bill => {
      // Apply proportional discount to each item
      const discountRatio = bill.subtotal > 0 ? bill.total / bill.subtotal : 1;
      
      bill.items.forEach(item => {
        const discountedItemTotal = item.total * discountRatio;
        
        if (item.type === 'session') {
          const itemName = item.name.toLowerCase();
          if (itemName.includes('ps5') || itemName.includes('playstation')) {
            data[0].value += discountedItemTotal;
          } else if (itemName.includes('pool') || itemName.includes('8-ball')) {
            data[1].value += discountedItemTotal;
          }
        } else if (item.type === 'product') {
          const product = products.find(p => p.id === item.id);
          if (product) {
            const category = product.category.toLowerCase();
            const name = product.name.toLowerCase();
            
            if (name.includes('metashot') || category === 'challenges') {
              data[2].value += discountedItemTotal;
            } else if (category === 'food' || category === 'snacks') {
              data[3].value += discountedItemTotal;
            } else if (category === 'beverage' || category === 'drinks') {
              data[4].value += discountedItemTotal;
            } else if (category === 'tobacco') {
              data[5].value += discountedItemTotal;
            }
          }
        }
      });
    });
    
    return {
      data,
      totalRevenue: data.reduce((sum, item) => sum + item.value, 0)
    };
  };
  
  const getProductCategoryTrendsData = () => {
    const categoryData = new Map();
    
    filteredBills.forEach(bill => {
      bill.items
        .filter(item => item.type === 'product')
        .forEach(item => {
          const product = products.find(p => p.id === item.id);
          if (product) {
            const category = product.category;
            
            if (!categoryData.has(category)) {
              categoryData.set(category, { sales: 0, quantity: 0 });
            }
            
            const data = categoryData.get(category);
            data.sales += item.total;
            data.quantity += item.quantity;
          }
        });
    });
    
    return Array.from(categoryData.entries())
      .map(([category, data]) => ({
        category,
        ...data
      }))
      .sort((a, b) => b.sales - a.sales); // Sort by sales descending
  };
  
  const { data: revenueBreakdownData, totalRevenue } = getRevenueBreakdownData();
  const productCategoryTrendsData = getProductCategoryTrendsData();

  return (
    <div className="flex-1 space-y-6 p-6 bg-[#1A1F2C] text-white">
      <h2 className="text-3xl font-bold tracking-tight font-heading">Dashboard</h2>
      
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4 w-full max-w-md">
          <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">Analytics</TabsTrigger>
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
            <ActiveSessions />
            <RecentTransactions />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <DateRangeFilter 
            dateRange={dateRange}
            setDateRange={setDateRange}
            onApplyFilter={applyDateFilter}
            onResetFilter={resetDateFilter}
          />
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <RevenueBreakdownChart 
              data={revenueBreakdownData}
              totalRevenue={totalRevenue}
            />
            <ProductCategoryTrendsChart
              data={productCategoryTrendsData}
              filteredBills={filteredBills}
            />
          </div>
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <CustomerSpendingCorrelation 
              filteredBills={filteredBills}
            />
            <HourlyRevenueDistribution 
              filteredBills={filteredBills}
            />
          </div>
          
          <ProductPerformance 
            filteredBills={filteredBills}
          />
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <CustomerActivityChart 
              filteredBills={filteredBills}
            />
            <ProductInventoryChart />
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
