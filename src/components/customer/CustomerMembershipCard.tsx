
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

export interface MembershipPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  duration: 'weekly' | 'monthly';
  type: 'ps5' | '8ball' | 'combo';
  tier: 'silver' | 'gold' | 'platinum';
  hours: number;
  benefits: string[];
}

interface CustomerMembershipCardProps {
  plan: MembershipPlan;
  isPurchased?: boolean;
  onClick?: () => void;
  onDetailsClick?: () => void;
}

const CustomerMembershipCard: React.FC<CustomerMembershipCardProps> = ({
  plan,
  isPurchased = false,
  onClick,
  onDetailsClick
}) => {
  // Helper function to get colors based on tier
  const getTierColors = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return {
          badge: 'bg-gradient-to-r from-indigo-500 to-violet-500',
          border: 'border-violet-500/30',
          bg: 'from-indigo-950/40 to-violet-950/40',
          icon: 'text-violet-400'
        };
      case 'gold':
        return {
          badge: 'bg-gradient-to-r from-amber-500 to-yellow-500',
          border: 'border-amber-500/30',
          bg: 'from-amber-950/40 to-yellow-950/40',
          icon: 'text-amber-400'
        };
      default: // silver
        return {
          badge: 'bg-gradient-to-r from-gray-400 to-slate-400',
          border: 'border-slate-400/30',
          bg: 'from-slate-800/40 to-slate-700/40',
          icon: 'text-slate-400'
        };
    }
  };

  const colors = getTierColors(plan.tier);
  
  const typeLabel = plan.type === 'ps5' ? 'PS5' : plan.type === '8ball' ? '8-Ball' : 'PS5 + 8-Ball';
  const durationLabel = plan.duration === 'weekly' ? 'Weekly' : 'Monthly';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className={`bg-gradient-to-br ${colors.bg} h-full border ${colors.border} hover:shadow-lg hover:shadow-${plan.tier}-500/10 transition-all relative`}>
        {isPurchased && (
          <div className="absolute -top-3 -right-3 z-10">
            <Badge className="bg-gradient-to-r from-emerald-500 to-green-500">
              Current Plan
            </Badge>
          </div>
        )}
        
        <CardHeader className="pb-2">
          <Badge className={`${colors.badge} self-start`}>{plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}</Badge>
          <CardTitle className="text-xl flex items-center justify-between mt-2">
            <span>{typeLabel} Pass</span>
          </CardTitle>
          <CardDescription className="flex items-center">
            <CalendarDays className={`mr-1.5 h-4 w-4 ${colors.icon}`} />
            {durationLabel} Membership
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pb-0">
          <div className="flex items-end mb-4">
            <span className="text-3xl font-bold">₹{plan.price}</span>
            {plan.originalPrice && (
              <span className="text-muted-foreground line-through ml-2">₹{plan.originalPrice}</span>
            )}
          </div>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-center">
              <Clock className={`mr-2 h-4 w-4 ${colors.icon}`} />
              <span className="text-sm">{plan.hours} hours of gameplay</span>
            </div>
            
            <ul className="space-y-2">
              {plan.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start text-sm">
                  <Check className="mr-2 h-4 w-4 mt-0.5 text-green-500" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex-col gap-2 mt-auto pt-4">
          <Button
            onClick={onClick}
            className={`w-full ${isPurchased ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple hover:opacity-90'}`}
            disabled={isPurchased}
          >
            {isPurchased ? 'Current Plan' : 'Select Plan'}
          </Button>
          
          {onDetailsClick && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm text-cuephoria-lightpurple"
              onClick={onDetailsClick}
            >
              View Details
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default CustomerMembershipCard;
