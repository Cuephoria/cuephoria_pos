
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Stations from './pages/Stations';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Memberships from './pages/Memberships';
import { POSProvider } from './context/POSContext';
import { Toaster } from './components/ui/toaster';
import { useAuth } from './context/AuthContext';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-cuephoria-lightpurple border-cuephoria-dark rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2 text-white">Loading...</h1>
          <p className="text-muted-foreground">Please wait a moment</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const { user } = useAuth();
  
  return (
    <POSProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="pos" element={<POS />} />
            <Route path="stations" element={<Stations />} />
            <Route path="customers" element={<Customers />} />
            <Route path="products" element={<Products />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
            <Route path="memberships" element={<Memberships />} />
          </Route>
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </POSProvider>
  );
}

export default App;
