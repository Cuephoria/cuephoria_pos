
import React from 'react';
import { CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, ReceiptIcon } from 'lucide-react';
import { Customer, CartItem as CartItemType } from '@/context/POSContext';
import CartItem from './CartItem';

interface CartProps {
  cart: CartItemType[];
  selectedCustomer: Customer | null;
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  loyaltyPointsUsed: number;
  total: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onSelectCustomer: () => void;
  onCheckout: () => void;
}

const Cart: React.FC<CartProps> = ({
  cart,
  selectedCustomer,
  subtotal,
  discount,
  discountType,
  discountValue,
  loyaltyPointsUsed,
  total,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onSelectCustomer,
  onCheckout
}) => {
  return (
    <>
      <CardHeader className="pb-3 bg-gradient-to-r from-cuephoria-purple/20 to-transparent">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-heading">
            <ShoppingCart className="h-5 w-5 inline-block mr-2 text-cuephoria-lightpurple" />
            Cart
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearCart}
            className="hover:text-red-500 transition-colors"
          >
            Clear
          </Button>
        </div>
        <CardDescription>
          {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-auto px-6">
        {cart.length > 0 ? (
          <div className="space-y-4">
            {cart.map((item, index) => (
              <CartItem 
                key={item.id}
                item={item}
                index={index}
                onUpdateQuantity={onUpdateQuantity}
                onRemoveItem={onRemoveItem}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full animate-fade-in">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4 animate-pulse-soft" />
            <h3 className="text-xl font-medium font-heading">Cart Empty</h3>
            <p className="text-muted-foreground mt-2 text-center">
              Add products to the cart to begin
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-4 flex flex-col bg-gradient-to-r from-transparent to-cuephoria-purple/10">
        <div className="w-full">
          <div className="flex justify-between py-1">
            <span>Subtotal</span>
            <span className="indian-rupee font-mono">{subtotal.toLocaleString('en-IN')}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between py-1 text-cuephoria-purple">
              <span>
                Discount {discountType === 'percentage' ? `(${discount}%)` : ''}
              </span>
              <span className="indian-rupee font-mono">-{discountValue.toLocaleString('en-IN')}</span>
            </div>
          )}
          {loyaltyPointsUsed > 0 && (
            <div className="flex justify-between py-1 text-cuephoria-orange">
              <span>Loyalty Points Used</span>
              <span className="indian-rupee font-mono">-{loyaltyPointsUsed.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="flex justify-between py-1 text-lg font-bold border-t mt-2 pt-2">
            <span>Total</span>
            <span className="indian-rupee font-mono text-cuephoria-lightpurple">{total.toLocaleString('en-IN')}</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3 w-full mt-4">
          <div className="flex space-x-2">
            <Button
              variant={selectedCustomer ? "outline" : "default"}
              className={`flex-1 btn-hover-effect ${selectedCustomer ? "" : "bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple"}`}
              onClick={onSelectCustomer}
            >
              {selectedCustomer ? (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  {selectedCustomer.name}
                </div>
              ) : (
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" />
                  Select Customer
                </div>
              )}
            </Button>
          </div>
          <Button 
            variant="default" 
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 animate-pulse-soft"
            disabled={cart.length === 0 || !selectedCustomer}
            onClick={onCheckout}
          >
            <ReceiptIcon className="mr-2 h-4 w-4" />
            Checkout
          </Button>
        </div>
      </CardFooter>
    </>
  );
};

export default Cart;
