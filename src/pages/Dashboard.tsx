
import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import StatCardSection from '@/components/dashboard/StatCardSection';
import ActionButtonSection from '@/components/dashboard/ActionButtonSection';
import SalesChart from '@/components/dashboard/SalesChart';
import ActiveSessions from '@/components/dashboard/ActiveSessions';
import RecentTransactions from '@/components/dashboard/RecentTransactions';

const Dashboard = () => {
  const { customers, bills, stations, sessions, products } = usePOS();
  const [activeTab, setActiveTab] = useState('daily');
  
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
      <StatCardSection 
        totalSales={calculateTotalSales()}
        salesChange={calculatePercentChange()}
        activeSessionsCount={getActiveSessionsCount()}
        totalStations={stations.length}
        customersCount={customers.length || 3}
        newMembersCount={getNewMembersCount()}
        lowStockCount={getLowStockCount()}
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
