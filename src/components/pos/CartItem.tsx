
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { CartItem as CartItemType } from '@/context/POSContext';

interface CartItemProps {
  item: CartItemType;
  index: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

const CartItem: React.FC<CartItemProps> = ({ 
  item, 
  index, 
  onUpdateQuantity, 
  onRemoveItem 
}) => {
  return (
    <div 
      className={`flex items-center justify-between border-b pb-3 animate-fade-in`} 
      style={{animationDelay: `${index * 50}ms`}}
    >
      <div className="flex-1">
        <p className="font-medium font-quicksand">{item.name}</p>
        <p className="text-sm text-muted-foreground indian-rupee">
          {item.price.toLocaleString('en-IN')} each
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          -
        </Button>
        <span className="w-8 text-center">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          +
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 text-destructive hover:bg-red-500/10"
          onClick={() => onRemoveItem(item.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="w-20 text-right indian-rupee font-mono">
        {item.total.toLocaleString('en-IN')}
      </div>
    </div>
  );
};

export default CartItem;
