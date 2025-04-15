
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
  const { bills, products } = usePOS();
  const { activeSessions } = useSessionsData();
  
  const [token] = useLocalStorage<string>('calendly-token', '');
  const [organizationUri] = useLocalStorage<string>('calendly-org-uri', '');
  const { events, stats, loading } = useCalendlyEvents(token, organizationUri);

  const [showCalendly, setShowCalendly] = useState(false);

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

      <StatCardSection />
      <BusinessSummarySection />
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SalesChart bills={bills} />
        <ActiveSessions sessions={activeSessions} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProductPerformance bills={bills} products={products} />
        </div>
        <RecentTransactions bills={bills} />
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
