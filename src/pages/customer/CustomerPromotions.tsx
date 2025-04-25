
import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { Copy } from 'lucide-react';
import { promotionsService } from '@/services/promotionsService';
import { Promotion } from '@/types/customer.types';
import { format } from 'date-fns';

const CustomerPromotions = () => {
  const { customerUser } = useCustomerAuth();
  const { toast } = useToast();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const allPromotions = await promotionsService.getPromotions();
        setPromotions(allPromotions);
      } catch (error) {
        console.error('Error fetching promotions:', error);
        toast({
          title: 'Error',
          description: 'Failed to load promotions',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, [toast]);
  
  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(
      () => {
        toast({
          title: 'Copied!',
          description: 'Promotion code copied to clipboard'
        });
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'Error',
          description: 'Failed to copy code to clipboard',
          variant: 'destructive'
        });
      }
    );
  };
  
  if (loading) {
    return (
      <div className="container py-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin-slow h-10 w-10 rounded-full border-4 border-cuephoria-lightpurple border-t-transparent"></div>
        <p className="mt-4">Loading promotions...</p>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Current Promotions</h1>
        <p className="text-muted-foreground">
          Check out our latest offers and special promotions
        </p>
      </div>
      
      {promotions.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promotion) => (
            <Card key={promotion.id} className="overflow-hidden card-hover">
              {promotion.image_url && (
                <div className="aspect-video w-full overflow-hidden">
                  <img 
                    src={promotion.image_url} 
                    alt={promotion.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <CardTitle>{promotion.title}</CardTitle>
                <CardDescription>
                  Valid until {format(new Date(promotion.end_date), 'PPP')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <p className="mb-4">{promotion.description}</p>
                
                <div className="bg-muted p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-1">Discount:</p>
                      <p className="text-xl font-bold">
                        {promotion.discount_type === 'percentage' 
                          ? `${promotion.discount_value}% OFF` 
                          : `₹${promotion.discount_value} OFF`}
                      </p>
                    </div>
                    
                    {promotion.minimum_purchase_amount && (
                      <div className="text-right">
                        <p className="text-sm font-semibold mb-1">Min. Purchase:</p>
                        <p className="font-medium">₹{promotion.minimum_purchase_amount}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {promotion.terms_conditions && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-1">Terms & Conditions:</p>
                    <p className="text-xs text-muted-foreground">{promotion.terms_conditions}</p>
                  </div>
                )}
              </CardContent>
              
              {promotion.promotion_code && (
                <CardFooter className="flex flex-col border-t pt-4">
                  <div className="flex items-center justify-between w-full">
                    <p className="font-semibold">Promo Code:</p>
                    <div className="flex items-center gap-2">
                      <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold">
                        {promotion.promotion_code}
                      </code>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => copyToClipboard(promotion.promotion_code!)}
                              className="h-7 w-7"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy code</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <h3 className="text-xl font-medium mb-2">No Active Promotions</h3>
          <p className="text-muted-foreground">
            There are no active promotions at the moment. Check back soon!
          </p>
        </div>
      )}
    </div>
  );
};

export default CustomerPromotions;
