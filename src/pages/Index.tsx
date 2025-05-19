
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Monitor, Gamepad, Trophy, Users, Star, ZapIcon } from 'lucide-react';
import ContentModal from '@/components/modals/ContentModal';
import TermsContent from '@/components/content/TermsContent';
import PrivacyContent from '@/components/content/PrivacyContent';
import ContactContent from '@/components/content/ContactContent';
import { supabase } from '@/integrations/supabase/client';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Modals state
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showContact, setShowContact] = useState(false);
  
  // Real data states
  const [ps5Count, setPs5Count] = useState(6);
  const [poolTableCount, setPoolTableCount] = useState(3);
  const [customerCount, setCustomerCount] = useState(83);

  // Load real station and customer counts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch PS5 stations
        const { data: ps5Stations, error: ps5Error } = await supabase
          .from('stations')
          .select('count')
          .eq('type', 'ps5');
          
        if (!ps5Error && ps5Stations) {
          setPs5Count(ps5Stations.length || 6);
        }
        
        // Fetch pool tables
        const { data: poolTables, error: poolError } = await supabase
          .from('stations')
          .select('count')
          .eq('type', '8ball');
          
        if (!poolError && poolTables) {
          setPoolTableCount(poolTables.length || 3);
        }
        
        // Fetch customers
        const { data: customers, error: customersError } = await supabase
          .from('customers')
          .select('count');
          
        if (!customersError && customers) {
          setCustomerCount(customers.length || 83);
        }
      } catch (error) {
        console.error('Error fetching real data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cuephoria-dark flex flex-col relative overflow-hidden">
      {/* Background effects - modified to center animations and remove lines */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent"></div>
        
        {/* Animated glow spots instead of lines */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-cuephoria-purple/10 blur-3xl animate-pulse-soft"></div>
        <div className="absolute bottom-1/3 left-1/3 h-48 w-48 rounded-full bg-cuephoria-blue/10 blur-3xl animate-pulse-soft delay-200"></div>
        <div className="absolute top-2/3 right-1/4 h-56 w-56 rounded-full bg-cuephoria-orange/10 blur-3xl animate-pulse-soft delay-300"></div>
      </div>

      {/* Header - updated with new buttons */}
      <header className="h-20 flex items-center px-6 border-b border-gray-800 relative z-10 backdrop-blur-sm bg-cuephoria-dark/80">
        <Logo />
        <div className="ml-auto space-x-4">
          <Button
            variant="outline"
            className="text-white border-gray-700 hover:bg-gray-800"
            onClick={() => window.open('https://cuephoria.in', '_blank')}
          >
            Official Website
          </Button>
          <Button
            variant="default"
            className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90"
            onClick={() => window.open('https://cuephoria.in/book', '_blank')}
          >
            Book Now
          </Button>
        </div>
      </header>

      {/* Hero section */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-12 relative z-10">
        <div className="mb-8 animate-float-shadow">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-cuephoria-purple to-cuephoria-blue rounded-full opacity-70 blur-lg animate-pulse-glow"></div>
            <img
              src="/lovable-uploads/61f60a38-12c2-4710-b1c8-0000eb74593c.png"
              alt="Cuephoria Logo" 
              className="h-32 md:h-40 relative z-10 drop-shadow-[0_0_15px_rgba(155,135,245,0.5)]"
            />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-center text-white font-heading leading-tight mb-6">
          Welcome to{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple animate-text-gradient">
            Cuephoria
          </span>
        </h1>
        
        <p className="text-xl text-center text-gray-300 max-w-2xl mb-8">
          A modern gaming lounge with premium PlayStation 5 consoles and professional 8-ball pool tables.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button
            size="lg"
            className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90 shadow-lg shadow-cuephoria-purple/20"
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
        
        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mb-16">
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-purple/40 transition-all duration-300 hover:shadow-lg hover:shadow-cuephoria-purple/20 hover:-translate-y-1 group">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cuephoria-purple/20 to-cuephoria-blue/20 flex items-center justify-center text-cuephoria-purple group-hover:scale-110 transition-transform">
                <Gamepad size={20} />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-white">Premium Gaming</h3>
            </div>
            <p className="text-gray-400">Experience gaming like never before with our high-end PlayStation 5 consoles and 4K displays.</p>
          </div>
          
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-orange/40 transition-all duration-300 hover:shadow-lg hover:shadow-cuephoria-orange/20 hover:-translate-y-1 group">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cuephoria-orange/20 to-cuephoria-red/20 flex items-center justify-center text-cuephoria-orange group-hover:scale-110 transition-transform">
                <Trophy size={20} />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-white">Pool Tables</h3>
            </div>
            <p className="text-gray-400">Professional 8-ball pool tables for casual games or competitive tournaments.</p>
          </div>
          
          <div className="bg-cuephoria-darker p-6 rounded-xl border border-gray-800 hover:border-cuephoria-blue/40 transition-all duration-300 hover:shadow-lg hover:shadow-cuephoria-blue/20 hover:-translate-y-1 group">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cuephoria-blue/20 to-cuephoria-lightpurple/20 flex items-center justify-center text-cuephoria-blue group-hover:scale-110 transition-transform">
                <Users size={20} />
              </div>
              <h3 className="ml-3 text-lg font-semibold text-white">Community Events</h3>
            </div>
            <p className="text-gray-400">Join our regular tournaments and gaming events for prizes and bragging rights.</p>
          </div>
        </div>
        
        {/* Stats - Updated with real data */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="text-center p-4 bg-cuephoria-darker/50 backdrop-blur-md rounded-lg border border-gray-800">
            <Star className="h-6 w-6 text-cuephoria-purple mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{ps5Count}</div>
            <div className="text-sm text-gray-400">Gaming Stations</div>
          </div>
          
          <div className="text-center p-4 bg-cuephoria-darker/50 backdrop-blur-md rounded-lg border border-gray-800">
            <Trophy className="h-6 w-6 text-cuephoria-orange mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{poolTableCount}</div>
            <div className="text-sm text-gray-400">Pool Tables</div>
          </div>
          
          <div className="text-center p-4 bg-cuephoria-darker/50 backdrop-blur-md rounded-lg border border-gray-800">
            <Users className="h-6 w-6 text-cuephoria-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{customerCount}</div>
            <div className="text-sm text-gray-400">Members</div>
          </div>
          
          <div className="text-center p-4 bg-cuephoria-darker/50 backdrop-blur-md rounded-lg border border-gray-800">
            <ZapIcon className="h-6 w-6 text-cuephoria-green mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">24/7</div>
            <div className="text-sm text-gray-400">Support</div>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-cuephoria-darker to-cuephoria-dark border border-gray-800 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-64 w-64 bg-cuephoria-purple/10 blur-3xl rounded-full"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-4">Ready to Experience Cuephoria?</h2>
            <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of gamers and pool enthusiasts. Book a station, participate in tournaments, and connect with fellow players.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90 shadow-md"
                onClick={() => window.open('https://cuephoria.in/book', '_blank')}
              >
                Book a Station Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-gray-700 hover:bg-gray-800 hover:border-cuephoria-lightpurple"
                onClick={() => navigate('/public/stations')}
              >
                <Monitor className="mr-2 h-5 w-5" />
                Check Availability
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Updated with modal triggers */}
      <footer className="py-8 border-t border-gray-800 relative z-10 mt-auto">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Logo size="sm" />
              <span className="ml-2 text-gray-400">© {new Date().getFullYear()} Cuephoria. All rights reserved.</span>
            </div>
            
            <div className="flex flex-wrap justify-center space-x-4">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setShowTerms(true)}>
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setShowPrivacy(true)}>
                Privacy
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" onClick={() => setShowContact(true)}>
                Contact
              </Button>
            </div>
          </div>
          
          {/* RK Branding */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Designed and Developed by RK
          </div>
        </div>
      </footer>
      
      {/* Modals */}
      <ContentModal isOpen={showTerms} onClose={() => setShowTerms(false)} title="Terms and Conditions">
        <TermsContent />
      </ContentModal>
      
      <ContentModal isOpen={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <PrivacyContent />
      </ContentModal>
      
      <ContentModal isOpen={showContact} onClose={() => setShowContact(false)} title="Contact Us">
        <ContactContent />
      </ContentModal>
      
      {/* Animated elements - centered and improved */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cuephoria-lightpurple opacity-20 animate-float">
        <Gamepad size={24} className="animate-wiggle" />
      </div>
      <div className="fixed bottom-1/3 left-1/2 -translate-x-1/2 translate-y-1/2 text-accent opacity-20 animate-float delay-300">
        <ZapIcon size={24} className="animate-pulse-soft" />
      </div>
      <div className="fixed top-1/2 right-1/3 text-cuephoria-orange opacity-20 animate-float delay-150">
        <Trophy size={20} className="animate-wiggle" />
      </div>
      <div className="fixed bottom-1/2 left-1/3 text-cuephoria-blue opacity-20 animate-float delay-200">
        <Star size={22} className="animate-pulse-soft" />
      </div>
    </div>
  );
};

export default Index;
