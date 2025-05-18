
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Monitor, TrendingUp, ShieldCheck, Users, Clock, Database, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      title: "Real-time Station Monitoring",
      description: "Monitor all gaming stations and pool tables in real-time, track usage metrics and optimize availability.",
      icon: Monitor,
      color: "text-cuephoria-purple"
    },
    {
      title: "Advanced Sales Analytics",
      description: "Comprehensive reports and insights to track revenue streams and identify growth opportunities.",
      icon: TrendingUp,
      color: "text-cuephoria-blue"
    },
    {
      title: "Secure Administration",
      description: "Role-based access control ensures that staff members have appropriate system permissions.",
      icon: ShieldCheck,
      color: "text-cuephoria-green"
    },
    {
      title: "Customer Relationship Management",
      description: "Track customer preferences, manage membership programs and boost retention.",
      icon: Users,
      color: "text-cuephoria-orange"
    },
    {
      title: "Session Management",
      description: "Efficiently manage gaming and pool table sessions with automated timing and billing.",
      icon: Clock,
      color: "text-accent"
    },
    {
      title: "Inventory Management",
      description: "Keep track of stock levels, get alerts for low inventory, and manage product categories.",
      icon: Database,
      color: "text-cuephoria-lightpurple"
    }
  ];

  return (
    <div className="min-h-screen bg-cuephoria-dark flex flex-col">
      {/* Header section with navigation */}
      <header className="h-20 flex items-center px-6 border-b border-gray-800">
        <div className="flex items-center">
          <Logo />
          <h1 className="ml-4 text-xl font-bold text-white hidden md:block">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple">
              Management System
            </span>
          </h1>
        </div>
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
            Access Portal
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <div className="relative px-6 py-16 md:py-24 flex flex-col items-center justify-center bg-gradient-to-b from-cuephoria-dark to-cuephoria-darker">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <div className="mb-8 animate-float-shadow">
            <img
              src="/lovable-uploads/53af0330-cafd-49f9-b4c6-a08c55940cc3.png"
              alt="Cuephoria Logo" 
              className="h-40 md:h-48 mx-auto animate-glow"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-center text-white font-heading leading-tight mb-6">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple animate-text-gradient">
              Cuephoria Management
            </span>
          </h1>
          
          <p className="mt-6 text-xl text-center text-gray-300 max-w-3xl mx-auto px-4">
            Comprehensive administration system for Cuephoria 8-Ball Club & Gaming Lounge. 
            Manage stations, monitor revenue, and enhance customer experience all in one place.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90"
              onClick={() => navigate('/login')}
            >
              Administrator Login
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
      </div>

      {/* Features section */}
      <div className="bg-cuephoria-darker py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-white">
            Management System <span className="bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple">Features</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-cuephoria-dark border-gray-800 hover:border-cuephoria-purple/50 hover:shadow-lg hover:shadow-cuephoria-purple/10 transition-all duration-300">
                <CardContent className="pt-6">
                  <div className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-gray-800 ${feature.color}`}>
                    <feature.icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cuephoria-purple/20 to-cuephoria-lightpurple/20 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <Award className="h-16 w-16 mx-auto text-cuephoria-purple mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Ready to elevate your gaming lounge management?</h2>
          <p className="text-gray-300 mb-8">
            Access the comprehensive suite of tools designed specifically for gaming and pool lounge operations.
          </p>
          <Button
            size="lg"
            className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90"
            onClick={() => navigate('/login')}
          >
            Access Management Portal
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-800 mt-auto">
        <div className="text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
