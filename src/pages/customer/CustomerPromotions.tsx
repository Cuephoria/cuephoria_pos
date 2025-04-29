
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Promotion } from '@/types/customer.types';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Calendar, Clock, Tag, Percent, Star, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const CustomerPromotions: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const now = new Date().toISOString();
        const { data, error } = await supabase
          .from('promotions')
          .select('*')
          .eq('is_active', true)
          .or(`start_date.is.null,start_date.lte.${now}`)
          .or(`end_date.is.null,end_date.gte.${now}`)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching promotions:', error);
          return;
        }

        const formattedPromotions = data.map(promo => ({
          id: promo.id,
          name: promo.name,
          description: promo.description,
          startDate: promo.start_date ? new Date(promo.start_date) : null,
          endDate: promo.end_date ? new Date(promo.end_date) : null,
          discountType: promo.discount_type as "percentage" | "fixed" | "free_hours",
          discountValue: promo.discount_value,
          isActive: promo.is_active,
          imageUrl: promo.image_url,
          createdAt: new Date(promo.created_at)
        }));

        setPromotions(formattedPromotions);
      } catch (err) {
        console.error('Error in fetchPromotions:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromotions();
  }, []);

  const formatDiscountValue = (promotion: Promotion) => {
    switch (promotion.discountType) {
      case 'percentage':
        return `${promotion.discountValue}% off`;
      case 'fixed':
        return `₹${promotion.discountValue} off`;
      case 'free_hours':
        return `${promotion.discountValue} free hour${promotion.discountValue !== 1 ? 's' : ''}`;
      default:
        return `${promotion.discountValue}`;
    }
  };

  const getDiscountTypeIcon = (type: string) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-5 w-5 text-green-400" />;
      case 'fixed':
        return <Tag className="h-5 w-5 text-blue-400" />;
      case 'free_hours':
        return <Clock className="h-5 w-5 text-amber-400" />;
      default:
        return <Tag className="h-5 w-5 text-gray-400" />;
    }
  };

  const getValidityText = (promotion: Promotion) => {
    if (promotion.startDate && promotion.endDate) {
      return `Valid from ${promotion.startDate.toLocaleDateString()} to ${promotion.endDate.toLocaleDateString()}`;
    } else if (promotion.endDate) {
      return `Valid until ${promotion.endDate.toLocaleDateString()}`;
    } else if (promotion.startDate) {
      return `Valid from ${promotion.startDate.toLocaleDateString()}`;
    } else {
      return 'No expiration date';
    }
  };

  const handlePromotionClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion);
    setIsDialogOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  return (
    <motion.div 
      className="container mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="mb-6" variants={itemVariants}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cuephoria-lightpurple to-cuephoria-orange bg-clip-text text-transparent">
          Current Promotions
        </h1>
        <p className="text-muted-foreground mt-1">
          Check out our latest special offers and exclusive deals
        </p>
      </motion.div>
      
      {promotions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promotion) => (
            <motion.div key={promotion.id} variants={itemVariants}>
              <Card 
                className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5 h-full flex flex-col overflow-hidden group hover:border-cuephoria-lightpurple/40 transition-all duration-300 cursor-pointer"
                onClick={() => handlePromotionClick(promotion)}
              >
                {promotion.imageUrl ? (
                  <div className="relative h-52 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-cuephoria-darker via-transparent to-transparent z-10" />
                    <img 
                      src={promotion.imageUrl} 
                      alt={promotion.name} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute top-3 left-3 z-20">
                      <Badge 
                        className={`
                          ${promotion.discountType === 'percentage' ? 'bg-green-600 hover:bg-green-700' : ''}
                          ${promotion.discountType === 'fixed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          ${promotion.discountType === 'free_hours' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                          text-sm font-medium px-2.5 py-1.5
                        `}
                      >
                        {formatDiscountValue(promotion)}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="h-52 bg-gradient-to-br from-cuephoria-lightpurple/10 to-cuephoria-orange/5 flex items-center justify-center">
                    <div className="text-cuephoria-lightpurple/30 text-7xl">
                      {getDiscountTypeIcon(promotion.discountType)}
                    </div>
                    <div className="absolute top-3 left-3">
                      <Badge 
                        className={`
                          ${promotion.discountType === 'percentage' ? 'bg-green-600 hover:bg-green-700' : ''}
                          ${promotion.discountType === 'fixed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          ${promotion.discountType === 'free_hours' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                          text-sm font-medium px-2.5 py-1.5
                        `}
                      >
                        {formatDiscountValue(promotion)}
                      </Badge>
                    </div>
                  </div>
                )}
                
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white group-hover:text-cuephoria-lightpurple transition-colors duration-300">
                      {promotion.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2 h-10">
                    {promotion.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 mt-auto">
                  {(promotion.startDate || promotion.endDate) && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
                      <Calendar className="h-3 w-3" />
                      <span>{getValidityText(promotion)}</span>
                    </div>
                  )}
                </CardContent>
                <div className="h-1 bg-gradient-to-r from-cuephoria-lightpurple/30 to-cuephoria-orange/30 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="bg-cuephoria-darker/40 border-cuephoria-lightpurple/20 shadow-inner shadow-cuephoria-lightpurple/5">
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No active promotions at the moment. Check back soon!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Promotion Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-cuephoria-darker border-cuephoria-lightpurple/30 sm:max-w-md">
          {selectedPromotion && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  {getDiscountTypeIcon(selectedPromotion.discountType)}
                  <span>{selectedPromotion.name}</span>
                </DialogTitle>
                <DialogDescription>
                  <Badge 
                    className={`
                      ${selectedPromotion.discountType === 'percentage' ? 'bg-green-600 hover:bg-green-700' : ''}
                      ${selectedPromotion.discountType === 'fixed' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      ${selectedPromotion.discountType === 'free_hours' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                      mt-2
                    `}
                  >
                    {formatDiscountValue(selectedPromotion)}
                  </Badge>
                </DialogDescription>
              </DialogHeader>
              
              {selectedPromotion.imageUrl && (
                <div className="w-full h-48 overflow-hidden rounded-md mb-4">
                  <img 
                    src={selectedPromotion.imageUrl} 
                    alt={selectedPromotion.name} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Description</h3>
                  <p className="text-white">{selectedPromotion.description}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Validity Period</h3>
                  <p className="flex items-center gap-2 text-white">
                    <Calendar className="h-4 w-4 text-cuephoria-orange" />
                    {getValidityText(selectedPromotion)}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 p-3 bg-cuephoria-orange/10 rounded-md border border-cuephoria-orange/20">
                  <Info className="h-5 w-5 text-cuephoria-orange" />
                  <p className="text-sm text-gray-300">
                    Show this promotion to our staff when making a purchase to avail this offer.
                  </p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default CustomerPromotions;
