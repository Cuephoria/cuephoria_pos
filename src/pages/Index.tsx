
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Monitor } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cuephoria-dark flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-gray-800">
        <Logo />
        <div className="ml-auto space-x-4">
          <Button
            variant="outline"
            className="text-white border-gray-700 hover:bg-gray-800"
            onClick={() => navigate('/login')}
          >
            Log In
          </Button>
          <Button
            variant="default"
            className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="mb-8 animate-float-shadow">
          <img
            src="/lovable-uploads/62dc79be-ba7d-428a-8991-5923d411093c.png"
            alt="Cuephoria Logo" 
            className="h-32 md:h-40 animate-glow"
          />
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white font-heading leading-tight">
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple animate-text-gradient">
            Cuephoria
          </span>
        </h1>
        <p className="mt-6 text-xl text-center text-gray-300 max-w-2xl">
          A modern gaming lounge with premium PlayStation 5 consoles and professional 8-ball pool tables.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90"
            onClick={() => navigate('/login')}
          >
            Login to Dashboard
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-gray-700 hover:bg-gray-800 group relative overflow-hidden"
            onClick={() => navigate('/public/stations')}
          >
            <div className="absolute inset-0 w-full bg-gradient-to-r from-cuephoria-purple/0 via-cuephoria-lightpurple/20 to-cuephoria-purple/0 animate-shimmer pointer-events-none"></div>
            <Monitor className="mr-2 h-5 w-5 animate-pulse-soft" />
            <span>View Station Availability</span>
          </Button>
        </div>
      </div>
      <footer className="py-6 border-t border-gray-800">
        <div className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Cuephoria. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
