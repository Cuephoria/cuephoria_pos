
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-cuephoria-dark px-4 py-6">
      <div className="text-center w-full max-w-sm mx-auto">
        <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-t-cuephoria-lightpurple border-cuephoria-dark rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-white">Redirecting to login...</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Please wait a moment</p>
      </div>
    </div>
  );
};

export default Index;
