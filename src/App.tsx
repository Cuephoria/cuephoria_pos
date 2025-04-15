
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import AppSidebar from "@/components/AppSidebar";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import Customers from "@/pages/Customers";
import POS from "@/pages/POS";
import Stations from "@/pages/Stations";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";
import CalendlyBookingsPage from "@/pages/CalendlyBookings";

import "./App.css";

function App() {
  return (
    <div className="app">
      <div className="flex h-screen bg-background">
        <AppSidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pos" element={<POS />} />
              <Route path="/products" element={<Products />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/stations" element={<Stations />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/calendly" element={<CalendlyBookingsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </div>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
