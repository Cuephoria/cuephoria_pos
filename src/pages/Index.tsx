import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
const Index = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "Cuephoria Management";
  }, []);
  return <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div style={{
      backgroundImage: "url('/lovable-uploads/b266b413-e798-48db-83a6-bdfd46a3bb6e.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundBlendMode: 'overlay'
    }} className="bg-gradient-to-br from-gray-900 to-black text-white py-20 px-6 flex-grow flex flex-col justify-center items-center text-center bg-slate-600">
        <div className="max-w-4xl mx-auto bg-black/50 p-8 backdrop-blur-sm rounded-lg border border-cuephoria-purple/20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading bg-clip-text text-transparent bg-gradient-to-r from-cuephoria-purple via-cuephoria-lightpurple to-cuephoria-blue">
            Cuephoria
          </h1>
          <p className="text-2xl md:text-3xl mb-3 text-white font-light">
            Ultimate Gaming Experience
          </p>
          <p className="text-md md:text-lg mb-8 text-gray-300 max-w-2xl mx-auto">
            A modern gaming paradise featuring the latest PlayStation 5 consoles and 
            professional pool tables. Book your session today!
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button onClick={() => navigate('/login')} size="lg" variant="outline" className="text-white border-cuephoria-purple hover:bg-cuephoria-purple/20">
              Staff Login
            </Button>
            
            <Button onClick={() => window.location.href = 'https://admin.cuephoria.in/booknow'} size="lg" className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90 animate-pulse-soft">
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cuephoria-purple/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cuephoria-lightpurple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l3-2.94m0 0l3 2.94M12 14.06V9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Modern Gaming</h3>
            <p className="text-gray-400">Experience gaming on the latest PlayStation 5 consoles with a wide selection of popular games.</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cuephoria-purple/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cuephoria-lightpurple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Easy Booking</h3>
            <p className="text-gray-400">Reserve your gaming session or pool table in advance with our simple online booking system.</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-cuephoria-purple/20 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-cuephoria-lightpurple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Premium Experience</h3>
            <p className="text-gray-400">Enjoy a comfortable environment with premium gaming setups and professional pool tables.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Cuephoria. All rights reserved.
        </p>
      </footer>
    </div>;
};
export default Index;