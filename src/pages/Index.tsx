
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-cuephoria-dark px-4 py-6">
      <div className="text-center w-full max-w-lg mx-auto animate-fade-in">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Welcome to Cuephoria</h1>
        <p className="text-lg text-muted-foreground mb-8">Choose where you want to go:</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg" 
            className="w-full sm:w-auto px-8 py-6 text-lg"
            onClick={() => navigate('/login')}
          >
            Staff Login
          </Button>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="w-full sm:w-auto px-8 py-6 text-lg"
            onClick={() => navigate('/customer/login')}
          >
            Customer Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
