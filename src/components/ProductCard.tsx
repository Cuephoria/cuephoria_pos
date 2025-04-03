
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePOS, Product } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { ShoppingCart, Edit, Trash, Tag, Clock, GraduationCap } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isAdmin = false, 
  onEdit, 
  onDelete,
  className = ''
}) => {
  const { addToCart, isStudentDiscount, setIsStudentDiscount } = usePOS();

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food':
        return 'bg-cuephoria-orange';
      case 'drinks':
        return 'bg-cuephoria-blue';
      case 'tobacco':
        return 'bg-red-500';
      case 'challenges':
        return 'bg-green-500';
      case 'membership':
        return 'bg-gradient-to-r from-violet-600 to-indigo-600';
      default:
        return 'bg-gray-500';
    }
  };

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      type: 'product',
      name: product.name,
      price: product.price,
      quantity: 1
    });
    
    // If this is a membership product and it has student price, show student discount option
    if (product.category === 'membership' && product.studentPrice) {
      setIsStudentDiscount(true);
    }
  };

  const getDurationText = () => {
    if (product.category !== 'membership') return '';
    
    if (product.duration === 'weekly') {
      return 'Valid for 7 days';
    } else if (product.duration === 'monthly') {
      return 'Valid for 30 days';
    } else if (product.name.includes('Weekly')) {
      return 'Valid for 7 days';
    } else if (product.name.includes('Monthly')) {
      return 'Valid for 30 days';
    }
    
    return '';
  };

  const getMembershipHours = () => {
    if (product.category !== 'membership') return '';
    
    if (product.membershipHours) {
      return `${product.membershipHours} hours credit`;
    }
    
    return '';
  };

  return (
    <Card className={`flex flex-col h-full ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg text-ellipsis overflow-hidden whitespace-nowrap">{product.name}</CardTitle>
          <Badge className={getCategoryColor(product.category)}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex flex-col space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Price:</span>
            <CurrencyDisplay amount={product.price} />
          </div>
          
          {product.category === 'membership' && (
            <>
              {product.originalPrice && (
                <div className="flex justify-between text-sm">
                  <span>Original Price:</span>
                  <span className="line-through text-gray-500">
                    <CurrencyDisplay amount={product.originalPrice} />
                  </span>
                </div>
              )}
              {product.offerPrice && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Offer Price:</span>
                  <CurrencyDisplay amount={product.offerPrice} />
                </div>
              )}
              {product.studentPrice && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span><GraduationCap className="h-3 w-3 inline mr-1" />Student Price:</span>
                  <CurrencyDisplay amount={product.studentPrice} />
                </div>
              )}
              <div className="text-xs text-gray-500 pt-1 flex items-center">
                <Clock className="h-3 w-3 inline mr-1" />
                {getDurationText()}
              </div>
              {product.membershipHours && (
                <div className="text-xs text-gray-500 pt-1 flex items-center">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {getMembershipHours()}
                </div>
              )}
            </>
          )}
          
          {product.category !== 'membership' && (
            <div className="flex justify-between text-sm">
              <span>Stock:</span>
              <span className={product.stock <= 10 ? 'text-red-500' : ''}>{product.stock}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        {isAdmin ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onEdit && onEdit(product)}
            >
              <Edit className="h-4 w-4 mr-1" /> Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => onDelete && onDelete(product.id)}
            >
              <Trash className="h-4 w-4 mr-1" /> Delete
            </Button>
          </>
        ) : (
          <Button 
            variant="default" 
            className={`w-full ${product.category === 'membership' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700' : ''}`}
            disabled={product.stock <= 0}
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-2" /> Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
