
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Monitor, Gamepad, Trophy, Users, Star, ZapIcon, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Mail, Phone, Clock, MapPin } from 'lucide-react';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [openDialog, setOpenDialog] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-cuephoria-dark flex flex-col relative overflow-hidden">
      {/* Minimalistic animated background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{ 
            backgroundImage: 'linear-gradient(to right, rgb(40, 44, 52) 1px, transparent 1px), linear-gradient(to bottom, rgb(40, 44, 52) 1px, transparent 1px)',
            backgroundSize: '50px 50px' 
          }}>
        </div>
        
        {/* Animated gradients */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cuephoria-purple/10 to-transparent blur-[100px] animate-float opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-cuephoria-blue/10 to-transparent blur-[80px] animate-float opacity-20" style={{animationDelay: '2s'}}></div>
        
        {/* Light streaks */}
        <div className="absolute top-[30%] w-full h-px bg-gradient-to-r from-transparent via-cuephoria-purple/20 to-transparent"></div>
        <div className="absolute top-[60%] w-full h-px bg-gradient-to-r from-transparent via-cuephoria-blue/20 to-transparent"></div>
        
        {/* Floating particles */}
        <div className="absolute w-1 h-1 bg-cuephoria-purple/30 rounded-full top-1/4 left-1/4 animate-float"></div>
        <div className="absolute w-1 h-1 bg-cuephoria-blue/30 rounded-full top-3/4 right-1/4 animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute w-1 h-1 bg-cuephoria-lightpurple/30 rounded-full top-1/2 left-3/4 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute w-1 h-1 bg-cuephoria-orange/30 rounded-full top-1/3 right-1/3 animate-float" style={{animationDelay: '3s'}}></div>
      </div>

      {/* Header */}
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
        
        {/* Stats */}
        <div className="w-full max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          <div className="text-center p-4 bg-cuephoria-darker/50 backdrop-blur-md rounded-lg border border-gray-800">
            <Star className="h-6 w-6 text-cuephoria-purple mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">12+</div>
            <div className="text-sm text-gray-400">Gaming Stations</div>
          </div>
          
          <div className="text-center p-4 bg-cuephoria-darker/50 backdrop-blur-md rounded-lg border border-gray-800">
            <Trophy className="h-6 w-6 text-cuephoria-orange mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">8</div>
            <div className="text-sm text-gray-400">Pool Tables</div>
          </div>
          
          <div className="text-center p-4 bg-cuephoria-darker/50 backdrop-blur-md rounded-lg border border-gray-800">
            <Users className="h-6 w-6 text-cuephoria-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">500+</div>
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
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
          <div className="absolute top-0 right-0 h-64 w-64 bg-cuephoria-purple/10 blur-3xl rounded-full"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-center text-white mb-4">Ready to Experience Cuephoria?</h2>
            <p className="text-center text-gray-300 mb-8 max-w-2xl mx-auto">
              Join our community of gamers and pool enthusiasts. Book a station, participate in tournaments, and connect with fellow players.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90 shadow-md group"
                onClick={() => navigate('/login')}
              >
                <ShieldCheck className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Admin Access
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-white border-gray-700 hover:bg-gray-800 hover:border-cuephoria-lightpurple"
                onClick={() => navigate('/public/stations')}
              >
                <Monitor className="mr-2 h-5 w-5" />
                Public Station View
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-800 relative z-10 mt-auto">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Logo size="sm" />
              <span className="ml-2 text-gray-400">© {new Date().getFullYear()} Cuephoria. All rights reserved.</span>
            </div>
            
            <div className="flex space-x-4">
              <Dialog open={openDialog === 'terms'} onOpenChange={(open) => setOpenDialog(open ? 'terms' : null)}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setOpenDialog('terms')}
                >
                  Terms
                </Button>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-cuephoria-dark border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Terms and Conditions</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-gray-300 mt-4">
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">1. Acceptance of Terms</h2>
                      <p>
                        By accessing and using Cuephoria's services, you agree to be bound by these Terms and Conditions. 
                        If you do not agree to these terms, please do not use our services.
                      </p>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">2. Membership and Gaming Sessions</h2>
                      <p>
                        Cuephoria provides gaming facilities and services on a pre-booking or walk-in basis, subject to availability.
                        Members may receive preferential rates and privileges as communicated in our membership plans.
                      </p>
                      <p>
                        All gaming sessions are charged according to our current rate card. Time extensions may be 
                        subject to availability and additional charges.
                      </p>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">3. Conduct and Responsibilities</h2>
                      <p>
                        Users must maintain appropriate conduct within our premises. Cuephoria reserves the right to refuse service 
                        to anyone engaging in disruptive, abusive, or inappropriate behavior.
                      </p>
                      <p>
                        Users are responsible for any damage caused to equipment, furniture, or fixtures through improper use.
                        Such damage may result in charges equivalent to repair or replacement costs.
                      </p>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">4. Refunds and Cancellations</h2>
                      <p>
                        Bookings may be cancelled or rescheduled at least 2 hours prior to the reserved time without penalty.
                        Late cancellations or no-shows may be charged a fee equivalent to 50% of the booking amount.
                      </p>
                      <p>
                        Refunds for technical issues or service interruptions will be assessed on a case-by-case basis by management.
                      </p>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">5. Modifications to Terms</h2>
                      <p>
                        Cuephoria reserves the right to modify these terms at any time. Changes will be effective immediately 
                        upon posting on our website or premises. Continued use of our services constitutes acceptance of modified terms.
                      </p>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={openDialog === 'privacy'} onOpenChange={(open) => setOpenDialog(open ? 'privacy' : null)}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-gray-400 hover:text-white"
                  onClick={() => setOpenDialog('privacy')}
                >
                  Privacy
                </Button>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-cuephoria-dark border-gray-800 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-white">Privacy Policy</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 text-gray-300 mt-4">
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">1. Information We Collect</h2>
                      <p>
                        Cuephoria may collect personal information including but not limited to name, contact details, 
                        and payment information when you register or book our services.
                      </p>
                      <p>
                        We also collect usage data such as gaming preferences, session duration, and purchase history 
                        to improve our services and customize your experience.
                      </p>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">2. How We Use Your Information</h2>
                      <p>
                        We use collected information to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Process bookings and payments</li>
                        <li>Personalize your gaming experience</li>
                        <li>Communicate regarding services and promotions</li>
                        <li>Improve our facilities and offerings</li>
                        <li>Maintain security and prevent fraud</li>
                      </ul>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">3. Information Sharing</h2>
                      <p>
                        We do not sell or rent your personal information to third parties. We may share information with:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Service providers who assist in our operations</li>
                        <li>Legal authorities when required by law</li>
                        <li>Business partners with your explicit consent</li>
                      </ul>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">4. Your Rights</h2>
                      <p>
                        You have the right to:
                      </p>
                      <ul className="list-disc pl-6 space-y-2">
                        <li>Access your personal information</li>
                        <li>Request correction of inaccurate information</li>
                        <li>Request deletion of your information</li>
                        <li>Opt-out of marketing communications</li>
                        <li>Lodge a complaint with relevant authorities</li>
                      </ul>
                    </section>
                    
                    <section className="space-y-4">
                      <h2 className="text-lg font-semibold text-white">5. Changes to Privacy Policy</h2>
                      <p>
                        Cuephoria reserves the right to update this privacy policy at any time. Changes will be posted on our website, 
                        and your continued use of our services after such modifications constitutes acceptance of the updated policy.
                      </p>
                    </section>
                  </div>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-400 hover:text-white"
                  >
                    Contact
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 bg-cuephoria-dark border-gray-800 text-white p-4">
                  <h3 className="font-semibold text-lg mb-3 text-white">Contact Us</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-cuephoria-purple mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <a href="tel:+918637625155" className="text-gray-300 text-sm hover:text-white transition-colors">
                          +91 86376 25155
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-cuephoria-blue mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <a href="mailto:contact@cuephoria.in" className="text-gray-300 text-sm hover:text-white transition-colors">
                          contact@cuephoria.in
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-cuephoria-orange mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Hours</p>
                        <span className="text-gray-300 text-sm">11:00 AM - 11:00 PM</span>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="h-5 w-5 text-cuephoria-green mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <span className="text-gray-300 text-sm">Cuephoria Gaming Lounge</span>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500">
            <p className="mb-1">Designed and developed by RK<sup>™</sup></p>
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 text-gray-400">
              <div className="flex items-center gap-2">
                <span>Phone: </span>
                <a href="tel:+918637625155" className="hover:text-white transition-colors">+91 86376 25155</a>
              </div>
              <div className="flex items-center gap-2">
                <span>Email: </span>
                <a href="mailto:contact@cuephoria.in" className="hover:text-white transition-colors">contact@cuephoria.in</a>
              </div>
              <div className="flex items-center gap-2">
                <span>Hours: </span>
                <span>11:00 AM - 11:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Animated elements */}
      <div className="fixed top-[10%] left-[10%] text-cuephoria-lightpurple opacity-20 animate-float">
        <Gamepad size={24} className="animate-wiggle" />
      </div>
      <div className="fixed bottom-[15%] right-[15%] text-accent opacity-20 animate-float delay-300">
        <ZapIcon size={24} className="animate-pulse-soft" />
      </div>
      <div className="fixed top-[30%] right-[10%] text-cuephoria-orange opacity-20 animate-float delay-150">
        <Trophy size={20} className="animate-wiggle" />
      </div>
      <div className="fixed bottom-[25%] left-[20%] text-cuephoria-blue opacity-20 animate-float delay-200">
        <Star size={22} className="animate-pulse-soft" />
      </div>
    </div>
  );
};

export default Index;
