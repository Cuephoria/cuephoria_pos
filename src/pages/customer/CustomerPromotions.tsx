
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types/customer.types';

const CustomerPromotions = () => {
  const { customerUser } = useCustomerAuth();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const { data, error } = await supabase.rpc(
          'get_active_promotions',
          { membership_required_filter: false }
        );
        
        if (!error && data) {
          setPromotions(data as Promotion[]);
        }
      } catch (error) {
        console.error('Error fetching promotions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Promotions</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Promotions</h1>
      
      {promotions.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg">
          <p className="text-muted-foreground">No active promotions at this time</p>
          <p className="text-sm mt-2">Check back soon for special offers!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => (
            <Card key={promo.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{promo.title}</CardTitle>
                <CardDescription>
                  Valid until {new Date(promo.end_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p>{promo.description}</p>
                
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <div className="text-sm text-muted-foreground mb-1">Discount:</div>
                  <div className="font-semibold">
                    {promo.discount_type === 'percentage' 
                      ? `${promo.discount_value}% off` 
                      : `$${promo.discount_value.toFixed(2)} off`}
                  </div>
                </div>
                
                {promo.promotion_code && (
                  <div className="mt-4">
                    <div className="text-sm text-muted-foreground mb-1">Promo Code:</div>
                    <div className="p-2 bg-primary/10 text-primary rounded text-center font-mono">
                      {promo.promotion_code}
                    </div>
                  </div>
                )}
                
                {promo.minimum_purchase_amount > 0 && (
                  <p className="text-sm text-muted-foreground mt-4">
                    *Minimum purchase: ${promo.minimum_purchase_amount.toFixed(2)}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">Use Promotion</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerPromotions;
