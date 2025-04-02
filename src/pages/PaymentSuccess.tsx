
import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, CheckCircle, ArrowLeft, Home } from 'lucide-react';
import { Customer, Bill } from '@/context/POSContext';
import { CurrencyDisplay, formatCurrency } from '@/components/ui/currency';
import Receipt from '@/components/Receipt';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const confettiRef = useRef<HTMLDivElement>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  
  // Get bill and customer from location state
  const { bill, customer } = location.state as { 
    bill: Bill; 
    customer: Customer 
  };
  
  useEffect(() => {
    // Trigger confetti animation
    if (confettiRef.current) {
      const rect = confettiRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ['#9b87f5', '#0EA5E9', '#10B981', '#F97316']
      });
      
      // Another confetti burst after a short delay
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.2, y: 0.5 },
          colors: ['#9b87f5', '#0EA5E9']
        });
        
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.8, y: 0.5 },
          colors: ['#10B981', '#F97316']
        });
      }, 700);
    }
    
    // Add a class to animate the content
    const elements = document.querySelectorAll('.animate-on-load');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-fade-in');
      }, index * 150);
    });
  }, []);
  
  const handleViewReceipt = () => {
    setShowReceipt(true);
  };
  
  const handleBackToPos = () => {
    navigate('/pos');
  };
  
  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="flex-1 p-8 pt-6 flex flex-col items-center justify-center">
      <div 
        ref={confettiRef} 
        className="max-w-md w-full mx-auto"
      >
        <Card className="border-2 border-green-500 animate-on-load opacity-0 shadow-lg">
          <CardContent className="pt-6 px-6 pb-6 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-on-load opacity-0">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-center mb-2 animate-on-load opacity-0 bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
              Payment Successful!
            </h1>
            
            <p className="text-center text-muted-foreground mb-4 animate-on-load opacity-0">
              Thank you for your purchase at Cuephoria
            </p>
            
            <div className="bg-muted p-4 rounded-md w-full mb-6 animate-on-load opacity-0">
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Customer:</span>
                <span className="font-medium">{customer.name}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Bill ID:</span>
                <span className="font-medium">{bill.id.substring(0, 8).toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{new Date(bill.createdAt).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Items:</span>
                <span className="font-medium">{bill.items.length}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium capitalize">{bill.paymentMethod}</span>
              </div>
              
              <div className="flex justify-between pt-2 border-t mt-2">
                <span className="font-medium">Total Amount:</span>
                <span className="font-bold text-green-600">
                  <CurrencyDisplay amount={bill.total} />
                </span>
              </div>
              
              {bill.loyaltyPointsEarned > 0 && (
                <div className="flex justify-between mt-2 text-sm text-cuephoria-purple">
                  <span>Points Earned:</span>
                  <span className="font-medium">+{bill.loyaltyPointsEarned} points</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col gap-3 w-full animate-on-load opacity-0">
              <Button
                onClick={handleViewReceipt}
                className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90"
              >
                <Download className="mr-2 h-4 w-4" />
                View & Download Receipt
              </Button>
              
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleBackToPos}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to POS
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGoToDashboard}
                  className="flex-1"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showReceipt && bill && customer && (
        <Receipt 
          bill={bill} 
          customer={customer} 
          onClose={() => setShowReceipt(false)} 
        />
      )}
    </div>
  );
};

export default PaymentSuccess;
