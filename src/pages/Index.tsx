
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Use a small timeout to ensure React is fully initialized
    const timeout = setTimeout(() => {
      navigate('/login');
    }, 100);
    
    return () => clearTimeout(timeout);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cuephoria-dark">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-cuephoria-lightpurple border-cuephoria-dark rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold mb-2 text-white">Redirecting to login...</h1>
        <p className="text-muted-foreground">Please wait a moment</p>
      </div>
    </div>
  );
};

export default Index;
