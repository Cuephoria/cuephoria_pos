import React, { useState, useEffect, useMemo } from 'react';
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
import CustomerSpendingCorrelation from '@/components/dashboard/CustomerSpendingCorrelation';
import HourlyRevenueDistribution from '@/components/dashboard/HourlyRevenueDistribution';
import ProductPerformance from '@/components/dashboard/ProductPerformance';
import ExpenseList from '@/components/expenses/ExpenseList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSessionsData } from '@/hooks/stations/useSessionsData';
import { useDashboardData } from '@/hooks/useDashboardData';

const Dashboard = () => {
  const { customers, stations, products } = usePOS();
  const { expenses, businessSummary } = useExpenses();
  const { sessions } = useSessionsData();
  const { 
    dashboardBills, 
    isLoading, 
    recentTransactions, 
    calculateTotalSales,
    generateChartData 
  } = useDashboardData();
  
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
  
  // Memoize low stock items calculation
  const lowStockItems = useMemo(() => {
    return products.filter(p => p.stock < 5)
      .sort((a, b) => a.stock - b.stock);
  }, [products]);
  
  // Update dashboard stats based on selected period
  useEffect(() => {
    if (isLoading) return;
    
    // Generate chart data based on active tab
    const generatedChartData = generateChartData(activeTab as any);
    setChartData(generatedChartData || []);
    
    // Calculate total sales for the period
    const totalSales = calculateTotalSales(activeTab as any);
    
    // Calculate percent change
    const percentChange = calculatePercentChange(activeTab, dashboardBills);
    
    setDashboardStats({
      totalSales: totalSales,
      salesChange: percentChange,
      activeSessionsCount: getActiveSessionsCount(),
      newMembersCount: getNewMembersCount(),
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems
    });
  }, [dashboardBills, customers, stations, sessions, lowStockItems, activeTab, isLoading, generateChartData, calculateTotalSales]);
  
  // Helper function to calculate percent change
  const calculatePercentChange = (activeTab, bills) => {
    const currentPeriodSales = calculateTotalSales(activeTab as any);
    
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
      const billDate = bill.createdAt;
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
  
  const getActiveSessionsCount = () => {
    // Count active sessions more efficiently
    return sessions.filter(s => !s.endTime).length;
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
            isLoading={isLoading}
          />
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <ActiveSessions />
            <RecentTransactions bills={recentTransactions} customers={customers} />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <CustomerSpendingCorrelation />
            <HourlyRevenueDistribution />
          </div>
          
          <ProductPerformance />
          
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            <CustomerActivityChart />
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
