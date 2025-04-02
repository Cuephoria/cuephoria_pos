
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Clock, ArrowRight, Check, Calendar } from 'lucide-react';
import { MembershipTier, MembershipBenefits } from '@/types/pos.types';
import { usePOS } from '@/context/POSContext';
import { formatCurrency } from '@/components/ui/currency';
import { isMembershipExpiring } from '@/utils/membership.utils';

interface MembershipCardProps {
  tier: MembershipTier;
  isSelected?: boolean;
  canPurchase?: boolean;
  onSelect?: () => void;
}

const MembershipCard: React.FC<MembershipCardProps> = ({
  tier,
  isSelected = false,
  canPurchase = false,
  onSelect
}) => {
  const { getMembershipBenefits, addMembershipToCart, selectedCustomer } = usePOS();
  const benefits = getMembershipBenefits(tier);
  
  // Don't render for 'none' tier unless explicitly told to do so
  if (tier === 'none' && !isSelected) return null;
  
  const handleAddToCart = () => {
    addMembershipToCart(tier);
  };
  
  const isStudentEligible = benefits.studentDiscount;
  
  // Get discount amount
  const discountAmount = benefits.originalPrice - benefits.price;
  const discountPercentage = Math.round((discountAmount / benefits.originalPrice) * 100);
  
  return (
    <Card className={`h-full border-2 transition-all ${
      isSelected 
        ? 'border-cuephoria-purple shadow-lg scale-105 bg-cuephoria-purple/5' 
        : 'hover:border-cuephoria-purple/50 hover:shadow-md'
    }`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-heading flex items-center">
            {tier !== 'none' && <Crown className="h-5 w-5 mr-2 text-cuephoria-purple" />}
            {benefits.name}
          </CardTitle>
          {tier !== 'none' && (
            <Badge className="bg-cuephoria-purple">
              {formatCurrency(benefits.price)}
            </Badge>
          )}
        </div>
        {tier !== 'none' && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>
              {benefits.weeklyPlayTime} hours weekly / {benefits.maxHoursPerDay} hr{benefits.maxHoursPerDay > 1 ? 's' : ''} daily
            </span>
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        {tier !== 'none' ? (
          <>
            <div className="text-xs mb-3 flex items-center text-cuephoria-purple">
              <span className="line-through mr-2">{formatCurrency(benefits.originalPrice)}</span>
              <Badge variant="outline" className="text-cuephoria-purple border-cuephoria-purple">
                Save {discountPercentage}%
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm mb-4">
              {benefits.specialOffers.map((offer, index) => (
                <div key={index} className="flex items-start">
                  <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                  <span>{offer}</span>
                </div>
              ))}
            </div>
            
            {isStudentEligible && (
              <div className="bg-cuephoria-purple/10 p-2 rounded-md text-xs text-cuephoria-purple font-medium mb-3">
                <span className="font-bold">Student Offer:</span> Extra ₹100 OFF
              </div>
            )}
            
            {selectedCustomer?.membershipTier === tier && selectedCustomer?.membershipEndDate && (
              <div className={`p-2 rounded-md text-xs font-medium mb-3 ${
                isMembershipExpiring(selectedCustomer.membershipEndDate)
                  ? 'bg-orange-100 text-orange-600'
                  : 'bg-green-100 text-green-600'
              }`}>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>
                    {isMembershipExpiring(selectedCustomer.membershipEndDate)
                      ? 'Membership expiring soon!'
                      : 'Active Membership'
                    }
                  </span>
                </div>
                <div className="mt-1">
                  Expires: {new Date(selectedCustomer.membershipEndDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-muted-foreground text-sm">
            No active membership plan
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0">
        {tier !== 'none' && canPurchase && (
          <Button 
            className="w-full bg-cuephoria-lightpurple hover:bg-cuephoria-purple"
            onClick={handleAddToCart}
          >
            Add to Cart
          </Button>
        )}
        
        {onSelect && (
          <Button 
            variant={isSelected ? "default" : "outline"} 
            className={`w-full ${isSelected ? 'bg-cuephoria-purple hover:bg-cuephoria-purple/90' : ''}`}
            onClick={onSelect}
          >
            {isSelected ? 'Selected' : 'Select'}
            {!isSelected && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default MembershipCard;
