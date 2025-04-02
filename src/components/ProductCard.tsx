
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePOS, Product } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { ShoppingCart, Edit, Trash, Tag } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isAdmin?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (id: string) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isAdmin = false, 
  onEdit, 
  onDelete 
}) => {
  const { addToCart } = usePOS();

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
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <Badge className={getCategoryColor(product.category)}>
            {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
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
                  <span>Student Price:</span>
                  <CurrencyDisplay amount={product.studentPrice} />
                </div>
              )}
              <div className="text-xs text-gray-500 pt-1">
                <Tag className="h-3 w-3 inline mr-1" />
                {product.name.includes('Weekly') ? 'Valid for 7 days' : 'Valid for 30 days'}
              </div>
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
      <CardFooter className="flex justify-between">
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
