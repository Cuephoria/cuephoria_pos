
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Cuephoria Management";
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div 
        className="bg-gradient-to-br from-gray-900 to-black text-white py-20 px-6 flex-grow flex flex-col justify-center items-center text-center"
        style={{
          backgroundImage: "url('/lovable-uploads/b266b413-e798-48db-83a6-bdfd46a3bb6e.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay'
        }}
      >
        <div className="max-w-4xl mx-auto bg-black/50 p-8 backdrop-blur-sm rounded-lg border border-cuephoria-purple/20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-heading">
            <span className="gradient-text">Cuephoria</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-300">
            Ultimate Gaming Experience
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => navigate('/login')}
              size="lg"
              variant="outline"
              className="text-white border-cuephoria-purple hover:bg-cuephoria-purple/20"
            >
              Staff Login
            </Button>
            
            <Button
              onClick={() => window.location.href = 'admin.cuephoria.in/booknow'}
              size="lg"
              className="bg-cuephoria-purple text-white hover:bg-cuephoria-purple/90 animate-pulse-soft"
            >
              Book Now
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-4">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Cuephoria. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Index;
