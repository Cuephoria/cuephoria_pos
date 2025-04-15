
import React, { useEffect, useState } from "react";
import { usePOS } from "@/context/POSContext";
import { useSessionsData } from "@/hooks/stations/useSessionsData";
import { useCalendlyEvents } from "@/services/calendlyService";
import { useLocalStorage } from "@/hooks/use-local-storage";

import StatCardSection from "@/components/dashboard/StatCardSection";
import BusinessSummarySection from "@/components/dashboard/BusinessSummarySection";
import ActionButtonSection from "@/components/dashboard/ActionButtonSection";
import SalesChart from "@/components/dashboard/SalesChart";
import ActiveSessions from "@/components/dashboard/ActiveSessions";
import ProductPerformance from "@/components/dashboard/ProductPerformance";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import CalendlyBookingSummary from "@/components/dashboard/CalendlyBookingSummary";
import CalendlyStats from "@/components/calendly/CalendlyStats";

const Dashboard = () => {
  const { bills, products, customers } = usePOS();
  const { sessions } = useSessionsData();
  
  // Define state variables for sales data
  const [salesData, setSalesData] = useState<{ name: string; amount: number }[]>([]);
  const [activeTab, setActiveTab] = useState("daily");
  
  const [token] = useLocalStorage<string>('calendly-token', '');
  const [organizationUri] = useLocalStorage<string>('calendly-org-uri', '');
  const { events, stats, loading } = useCalendlyEvents(token, organizationUri);

  const [showCalendly, setShowCalendly] = useState(false);

  // Calculate stats for StatCardSection
  const totalSales = bills.reduce((sum, bill) => sum + bill.total, 0);
  const salesChange = "+12.5%";  // This would normally be calculated
  const activeSessionsCount = sessions.filter(session => !session.endTime).length;
  const totalStations = 8;  // This would normally come from your stations data
  const customersCount = customers.length;
  const newMembersCount = 3;  // This would normally be calculated
  const lowStockItems = products.filter(product => product.stock < 10);
  const lowStockCount = lowStockItems.length;

  // Generate sample sales data for the chart
  useEffect(() => {
    const generateSalesData = () => {
      const data = [];
      if (activeTab === "daily") {
        for (let i = 1; i <= 7; i++) {
          data.push({
            name: `Day ${i}`,
            amount: Math.floor(Math.random() * 5000) + 1000
          });
        }
      } else if (activeTab === "weekly") {
        for (let i = 1; i <= 4; i++) {
          data.push({
            name: `Week ${i}`,
            amount: Math.floor(Math.random() * 20000) + 5000
          });
        }
      } else if (activeTab === "monthly") {
        for (let i = 1; i <= 12; i++) {
          data.push({
            name: `Month ${i}`,
            amount: Math.floor(Math.random() * 50000) + 10000
          });
        }
      } else {
        // Hourly
        for (let i = 9; i <= 20; i++) {
          data.push({
            name: `${i}:00`,
            amount: Math.floor(Math.random() * 1000) + 200
          });
        }
      }
      setSalesData(data);
    };

    generateSalesData();
  }, [activeTab]);

  useEffect(() => {
    // Only show Calendly section if credentials are configured
    setShowCalendly(!!token && !!organizationUri);
  }, [token, organizationUri]);
  
  return (
    <div className="p-6 space-y-6 bg-[#1A1F2C] min-h-screen text-white">
      <div className="flex flex-col gap-2 pb-2">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-400">Welcome back to Cuephoria</p>
      </div>

      <StatCardSection 
        totalSales={totalSales}
        salesChange={salesChange}
        activeSessionsCount={activeSessionsCount}
        totalStations={totalStations}
        customersCount={customersCount}
        newMembersCount={newMembersCount}
        lowStockCount={lowStockCount}
        lowStockItems={lowStockItems}
      />
      
      <BusinessSummarySection />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart data={salesData} activeTab={activeTab} setActiveTab={setActiveTab} />
        <ActiveSessions />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductPerformance />
        </div>
        <RecentTransactions />
      </div>
      
      {showCalendly && (
        <>
          <h2 className="text-xl font-bold pt-4">Calendly Integration</h2>
          <CalendlyStats stats={stats} loading={loading} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CalendlyBookingSummary events={events} loading={loading} />
            <div>
              {/* Additional Calendly related component could go here */}
            </div>
          </div>
        </>
      )}

      <ActionButtonSection />
    </div>
  );
};

export default Dashboard;
