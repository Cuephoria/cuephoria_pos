
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Users } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const [showOptions, setShowOptions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowOptions(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const goToAdminLogin = () => {
    navigate('/login');
  };
  
  const goToCustomerPortal = () => {
    navigate('/customer/login');
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-cuephoria-dark px-4 py-6">
      <div className="text-center w-full max-w-sm mx-auto">
        {!showOptions ? (
          <>
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-cuephoria-lightpurple border-cuephoria-dark rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-white">Welcome to Cuephoria</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Loading portal options...</p>
          </>
        ) : (
          <>
            <div className="relative mx-auto w-full max-w-[180px] h-auto sm:w-48 sm:h-48 mb-6">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-cuephoria-lightpurple/20 to-accent/10 blur-lg"></div>
              <img 
                src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
                alt="Cuephoria 8-Ball Club" 
                className="relative w-full h-auto mx-auto drop-shadow-[0_0_15px_rgba(155,135,245,0.3)]"
              />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-white">Welcome to Cuephoria</h1>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">Choose your portal to continue</p>
            
            <div className="space-y-4">
              <Button 
                onClick={goToAdminLogin} 
                className="w-full bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90 shadow-lg flex items-center justify-center gap-2 py-6"
              >
                <Shield className="mr-2" size={20} />
                Staff & Admin Portal
              </Button>
              
              <Button 
                onClick={goToCustomerPortal} 
                className="w-full bg-cuephoria-orange hover:bg-cuephoria-orange/90 shadow-lg flex items-center justify-center gap-2 py-6"
              >
                <Users className="mr-2" size={20} />
                Customer Portal
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
