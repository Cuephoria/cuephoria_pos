
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cuephoria-dark p-4">
      <div className="text-center space-y-6 max-w-md">
        <img 
          src="/lovable-uploads/edbcb263-8fde-45a9-b66b-02f664772425.png" 
          alt="Cuephoria" 
          className="mx-auto w-32 h-32 mb-4"
        />
        <h1 className="text-3xl font-bold text-white">Welcome to Cuephoria</h1>
        <p className="text-muted-foreground">Select your portal to continue</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <Button 
            onClick={() => navigate('/login')} 
            className="bg-cuephoria-lightpurple hover:bg-cuephoria-lightpurple/90 text-white px-8 py-6"
            size="lg"
          >
            Admin & Staff
          </Button>
          
          <Button 
            onClick={() => navigate('/customer')} 
            className="bg-cuephoria-orange hover:bg-cuephoria-orange/90 text-white px-8 py-6"
            size="lg"
          >
            Customer Portal
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-10">
          © {new Date().getFullYear()} Cuephoria 8-Ball Club. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Index;
