
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Monitor, Shield, Users, ChevronRight, Calendar, BarChart4, Gamepad2, Trophy, ClipboardList, Coffee } from 'lucide-react';

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
      {/* Header with navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-cuephoria-dark/80 backdrop-blur-md">
        <div className="container flex h-16 items-center px-4 sm:px-6">
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
      </header>

      {/* Hero Section */}
      <section className="container px-4 pt-20 pb-16 md:pt-28 md:pb-24 flex flex-col items-center justify-center text-center">
        <div className="mb-8 animate-float-shadow">
          <img
            src="/lovable-uploads/3172ae80-de25-4aea-9917-39912d0d3d0c.png"
            alt="Cuephoria Logo" 
            className="h-32 md:h-48 animate-glow"
          />
        </div>

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-center text-white font-heading leading-tight mx-auto max-w-4xl">
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple animate-text-gradient">
            Cuephoria Management
          </span>
        </h1>

        <p className="mt-6 text-lg md:text-xl text-center text-gray-300 max-w-2xl mx-auto">
          A complete management system for your premium gaming lounge with PlayStation 5 consoles and professional 8-ball pool tables.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button
            size="lg"
            className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90 px-8"
            onClick={() => navigate('/login')}
          >
            <Shield className="mr-2 h-5 w-5" />
            Admin Login
          </Button>
          <Button
            size="lg"
            className="bg-cuephoria-blue text-white hover:bg-cuephoria-blue/90 px-8"
            onClick={() => navigate('/login')}
          >
            <Users className="mr-2 h-5 w-5" />
            Staff Login
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-gray-700 hover:bg-gray-800 group relative overflow-hidden"
            onClick={() => navigate('/public/stations')}
          >
            <div className="absolute inset-0 w-full bg-gradient-to-r from-cuephoria-purple/0 via-cuephoria-lightpurple/20 to-cuephoria-purple/0 animate-shimmer pointer-events-none"></div>
            <Monitor className="mr-2 h-5 w-5 animate-pulse-soft" />
            <span>Station Availability</span>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12">
          Complete Management <span className="text-cuephoria-lightpurple">Solution</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-purple/50 transition-all hover:shadow-lg hover:shadow-cuephoria-purple/10">
            <div className="h-12 w-12 rounded-lg bg-cuephoria-purple/20 flex items-center justify-center mb-4">
              <Gamepad2 className="h-6 w-6 text-cuephoria-purple" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Station Management</h3>
            <p className="text-gray-400 mb-4">Easily manage all your gaming stations and pool tables. Track usage, maintenance schedules, and availability.</p>
            <Button variant="link" className="text-cuephoria-lightpurple p-0 flex items-center" onClick={() => navigate('/login')}>
              Learn more <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Feature 2 */}
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-orange/50 transition-all hover:shadow-lg hover:shadow-cuephoria-orange/10">
            <div className="h-12 w-12 rounded-lg bg-cuephoria-orange/20 flex items-center justify-center mb-4">
              <Coffee className="h-6 w-6 text-cuephoria-orange" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Inventory Control</h3>
            <p className="text-gray-400 mb-4">Monitor stock levels for food, beverages, and merchandise. Set low stock alerts and manage suppliers.</p>
            <Button variant="link" className="text-cuephoria-orange p-0 flex items-center" onClick={() => navigate('/login')}>
              Learn more <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Feature 3 */}
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-green/50 transition-all hover:shadow-lg hover:shadow-cuephoria-green/10">
            <div className="h-12 w-12 rounded-lg bg-cuephoria-green/20 flex items-center justify-center mb-4">
              <ClipboardList className="h-6 w-6 text-cuephoria-green" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Point of Sale</h3>
            <p className="text-gray-400 mb-4">Fast and efficient POS system designed specifically for gaming lounges. Process payments and track sales.</p>
            <Button variant="link" className="text-cuephoria-green p-0 flex items-center" onClick={() => navigate('/login')}>
              Learn more <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Feature 4 */}
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-blue/50 transition-all hover:shadow-lg hover:shadow-cuephoria-blue/10">
            <div className="h-12 w-12 rounded-lg bg-cuephoria-blue/20 flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-cuephoria-blue" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Tournament Hosting</h3>
            <p className="text-gray-400 mb-4">Organize and manage gaming tournaments and pool competitions with full bracket management.</p>
            <Button variant="link" className="text-cuephoria-blue p-0 flex items-center" onClick={() => navigate('/login')}>
              Learn more <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Feature 5 */}
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-lightpurple/50 transition-all hover:shadow-lg hover:shadow-cuephoria-lightpurple/10">
            <div className="h-12 w-12 rounded-lg bg-cuephoria-lightpurple/20 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-cuephoria-lightpurple" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Booking System</h3>
            <p className="text-gray-400 mb-4">Allow customers to reserve stations in advance. Manage bookings and prevent scheduling conflicts.</p>
            <Button variant="link" className="text-cuephoria-lightpurple p-0 flex items-center" onClick={() => navigate('/login')}>
              Learn more <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Feature 6 */}
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-orange/50 transition-all hover:shadow-lg hover:shadow-cuephoria-orange/10">
            <div className="h-12 w-12 rounded-lg bg-cuephoria-orange/20 flex items-center justify-center mb-4">
              <BarChart4 className="h-6 w-6 text-cuephoria-orange" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Advanced Analytics</h3>
            <p className="text-gray-400 mb-4">Gain insights into your business with detailed reports on sales, customer preferences, and station usage.</p>
            <Button variant="link" className="text-cuephoria-orange p-0 flex items-center" onClick={() => navigate('/login')}>
              Learn more <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container px-4 py-16">
        <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-blue/20 rounded-2xl p-8 md:p-12 border border-cuephoria-lightpurple/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))]  from-cuephoria-lightpurple/20 via-transparent to-transparent"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to streamline your gaming lounge operations?</h2>
            <p className="text-gray-300 mb-8 max-w-2xl">Get started with Cuephoria Management System today and take your business to the next level.</p>
            
            <Button 
              onClick={() => navigate('/login')}
              size="lg"
              className="bg-white text-cuephoria-dark hover:bg-gray-200 transition-all"
            >
              Access Management Portal
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-800 bg-cuephoria-darker">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <img
                src="/lovable-uploads/3172ae80-de25-4aea-9917-39912d0d3d0c.png"
                alt="Cuephoria Logo" 
                className="h-10"
              />
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Secure Management Portal | Gaming Lounge Solution
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
