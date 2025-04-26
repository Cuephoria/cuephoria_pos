
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, Check, Copy, Percent, X } from 'lucide-react';
import { getPromotions, validatePromotionCode } from '@/services/promotionsService';
import { Promotion, PromotionValidationResponse } from '@/types/customer.types';

const CustomerPromotions = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [validationResult, setValidationResult] = useState<PromotionValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadPromotions = async () => {
      try {
        setIsLoading(true);
        const promotions = await getPromotions();
        setPromotions(promotions);
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
    };
    
    loadPromotions();
  }, [toast]);

  const handleValidateCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a promotion code',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsValidating(true);
      const result = await validatePromotionCode(promoCode);
      setValidationResult(result);
      
      if (result.valid) {
        toast({
          title: 'Success',
          description: 'Promotion code is valid',
        });
      } else {
        toast({
          title: 'Invalid Code',
          description: result.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error validating promotion code:', error);
      toast({
        title: 'Error',
        description: 'Failed to validate promotion code',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const copyPromoCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: 'Copied',
      description: 'Promotion code copied to clipboard',
    });
  };

  return (
    <div className="container mx-auto p-4 mb-16">
      <div className="flex flex-col items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Promotions</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Special offers and discounts</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Validate Promotion Code</CardTitle>
          <CardDescription>Enter a promotion code to validate and apply</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-grow">
              <Input
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Enter promotion code"
                className="uppercase"
              />
            </div>
            <Button onClick={handleValidateCode} disabled={isValidating}>
              {isValidating ? (
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
              ) : null}
              Validate
            </Button>
          </div>

          {validationResult && (
            <div className={`mt-4 p-4 rounded-md ${validationResult.valid ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
              <div className="flex items-center gap-2">
                {validationResult.valid ? (
                  <Check className="text-green-500" size={18} />
                ) : (
                  <X className="text-red-500" size={18} />
                )}
                <span className="font-medium">{validationResult.message}</span>
              </div>
              
              {validationResult.valid && validationResult.discount_type && (
                <div className="mt-2 text-sm">
                  <p className="text-muted-foreground">
                    Discount: {validationResult.discount_type === 'percentage' 
                      ? `${validationResult.discount_value}% off` 
                      : `$${validationResult.discount_value?.toFixed(2)} off`
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Active Promotions</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : promotions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {promotions.map((promotion) => (
              <Card key={promotion.id} className="bg-cuephoria-darker/80 border-cuephoria-orange/20 overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <div className="bg-cuephoria-orange/20 px-3 py-1 rounded-full text-cuephoria-orange text-xs font-medium">
                    {promotion.discount_type === 'percentage' 
                      ? `${promotion.discount_value}% OFF` 
                      : `$${promotion.discount_value.toFixed(2)} OFF`
                    }
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle>{promotion.name}</CardTitle>
                  <CardDescription>{promotion.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDays size={14} />
                    <span>
                      Valid until {new Date(promotion.end_date).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between items-center bg-cuephoria-darker">
                  <div className="font-mono bg-black/20 px-3 py-1.5 rounded-md uppercase font-bold tracking-wider">
                    {promotion.code}
                  </div>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => copyPromoCode(promotion.code)}
                    className="flex items-center gap-1"
                  >
                    <Copy size={14} />
                    Copy
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-card/50 p-8">
            <div className="text-center">
              <Percent size={36} className="mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium mb-2">No Active Promotions</h3>
              <p className="text-muted-foreground">
                Check back soon for special offers and discounts!
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerPromotions;
