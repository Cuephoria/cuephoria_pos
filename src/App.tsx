
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import POS from './pages/POS';
import Stations from './pages/Stations';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import BookNow from './pages/BookNow';
import Index from './pages/Index';
import PublicStations from './pages/PublicStations';
import { Toaster as SonnerToaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { POSProvider } from './context/POSContext';
import { ExpenseProvider } from './context/ExpenseContext';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Bookings from './pages/Bookings';
import CheckBooking from './pages/CheckBooking';
import { useUpdateBookingStatuses } from './hooks/stations';
import AuthenticatedLayout from './components/layouts/AuthenticatedLayout';

// Initialize React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Create a separate component for using the hook
const BookingStatusUpdater = () => {
  useUpdateBookingStatuses();
  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <POSProvider>
          <ExpenseProvider>
            {/* Use the component to properly use the hook */}
            <BookingStatusUpdater />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/booknow" element={<BookNow />} />
              <Route path="/public/stations" element={<PublicStations />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/bookings/check" element={<CheckBooking />} />
              
              {/* Authenticated routes */}
              <Route element={<AuthenticatedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/pos" element={<POS />} />
                <Route path="/stations" element={<Stations />} />
                <Route path="/products" element={<Products />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/bookings" element={<Bookings />} />
              </Route>
              
              {/* Fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <SonnerToaster position="top-right" expand={false} richColors />
            <Toaster />
          </ExpenseProvider>
        </POSProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
