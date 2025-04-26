
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { getActivePromotions, validatePromoCode } from '@/services/promotionsService';
import { Ticket, CalendarRange, CheckCircle, XCircle } from 'lucide-react';
import { Promotion } from '@/types/customer.types';

const CustomerPromotions = () => {
  const { customerUser } = useCustomerAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [validationMessage, setValidationMessage] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPromotions = async () => {
      if (customerUser) {
        try {
          setIsLoading(true);
          const promos = await getActivePromotions(customerUser.customer_id);
          setPromotions(promos);
        } catch (error) {
          console.error('Error loading promotions:', error);
          toast({
            title: 'Error',
            description: 'Failed to load promotions',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadPromotions();
  }, [customerUser, toast]);

  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a promotion code',
        variant: 'destructive',
      });
      return;
    }
    
    setIsValidating(true);
    setIsValid(null);
    setValidationMessage('');
    
    try {
      if (customerUser) {
        const result = await validatePromoCode(promoCode, customerUser.customer_id);
        setIsValid(result.valid);
        setValidationMessage(result.message);
        
        if (result.valid) {
          toast({
            title: 'Valid Promotion',
            description: result.message,
          });
        } else {
          toast({
            title: 'Invalid Promotion',
            description: result.message,
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      console.error('Error validating promotion:', error);
      toast({
        title: 'Validation Error',
        description: 'Failed to validate promotion code',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Promotions</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Discover special offers and deals</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Validate Promotion Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input
              placeholder="Enter promotion code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button 
              onClick={handleValidatePromo} 
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Validating...
                </>
              ) : 'Validate Code'}
            </Button>
          </div>
          
          {isValid !== null && (
            <div className={`mt-4 p-3 rounded-md ${isValid ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} flex items-center gap-2`}>
              {isValid ? <CheckCircle size={16} /> : <XCircle size={16} />}
              <span>{validationMessage}</span>
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            <p>For demo purposes, try these codes:</p>
            <ul className="mt-1 list-disc pl-5">
              <li>WEEKEND10 - 10% off weekend sessions</li>
              <li>COMBO5 - $5 off food and beverage combo</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Promotions</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : promotions.length > 0 ? (
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <Card key={promotion.id} className="bg-card/50">
                  <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="font-bold flex items-center gap-2">
                          <Ticket size={18} className="text-primary" />
                          {promotion.name}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{promotion.description}</p>
                      </div>
                      <div className="md:text-right">
                        <div className="inline-block px-3 py-1 bg-primary/10 text-primary font-medium rounded-md text-sm">
                          {promotion.discount_type === 'percentage' ? `${promotion.discount_value}% OFF` : `$${promotion.discount_value} OFF`}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground flex items-center gap-1 md:justify-end">
                          <CalendarRange size={14} />
                          <span>Expires: {new Date(promotion.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-border">
                      <div className="font-mono text-center p-2 bg-muted rounded-md tracking-wider text-sm">
                        {promotion.code}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-2">No active promotions found.</p>
              <p>Check back soon for new offers!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerPromotions;
