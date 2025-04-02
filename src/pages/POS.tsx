import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePOS, Customer, Bill } from '@/context/POSContext';

import CustomerSelector from '@/components/pos/CustomerSelector';
import Cart from '@/components/pos/Cart';
import ProductGrid from '@/components/pos/ProductGrid';
import CheckoutDialog from '@/components/pos/CheckoutDialog';
import PaymentSuccess from '@/components/payment/PaymentSuccess';

const POS = () => {
  const {
    products,
    customers,
    stations,
    cart,
    selectedCustomer,
    discount,
    discountType,
    loyaltyPointsUsed,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    selectCustomer,
    setDiscount,
    setLoyaltyPointsUsed,
    calculateTotal,
    completeSale,
  } = usePOS();
  const { toast } = useToast();

  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [lastCompletedBill, setLastCompletedBill] = useState<Bill | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isCheckoutDialogOpen) {
      handleApplyDiscount();
      handleApplyLoyaltyPoints();
    }
  }, [isCheckoutDialogOpen]);

  useEffect(() => {
    if (selectedCustomer) {
      const newCart = cart.filter(item => item.type !== 'session');
      if (newCart.length !== cart.length) {
        clearCart();
        newCart.forEach(item => {
          addToCart(item);
        });
      }
      
      const activeStations = stations.filter(
        station => station.isOccupied && 
        station.currentSession && 
        station.currentSession.customerId === selectedCustomer.id
      );
      
      activeStations.forEach(station => {
        const sessionStart = station.currentSession ? new Date(station.currentSession.startTime) : new Date();
        const now = new Date();
        const durationMs = now.getTime() - sessionStart.getTime();
        const durationMinutes = Math.ceil(durationMs / (1000 * 60));
        const hoursPlayed = durationMinutes / 60;
        const sessionCost = Math.ceil(hoursPlayed * station.hourlyRate);
        
        addToCart({
          id: station.id,
          type: 'session',
          name: `${station.name} (${durationMinutes} mins)`,
          price: sessionCost,
          quantity: 1
        });
      });
      
      if (activeStations.length > 0) {
        toast({
          title: 'Gaming Sessions Added',
          description: `${activeStations.length} active gaming sessions have been added to the cart.`,
        });
      }
    }
  }, [selectedCustomer]);

  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItem(id, newQuantity);
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleSelectCustomer = (customer: Customer) => {
    selectCustomer(customer.id);
    setIsCustomerDialogOpen(false);
    toast({
      title: 'Customer Selected',
      description: `${customer.name} has been selected for this transaction.`,
      className: 'bg-cuephoria-purple/90',
    });
  };

  const handleApplyDiscount = () => {
    const amount = Number(discount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: 'Invalid Discount',
        description: 'Please enter a valid discount amount',
        variant: 'destructive',
      });
      return;
    }
    setDiscount(amount, discountType);
  };

  const handleApplyLoyaltyPoints = () => {
    const points = Number(loyaltyPointsUsed);
    if (isNaN(points) || points < 0) {
      toast({
        title: 'Invalid Points',
        description: 'Please enter a valid number of loyalty points',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedCustomer && points > selectedCustomer.loyaltyPoints) {
      toast({
        title: 'Too Many Points',
        description: `Customer only has ${selectedCustomer.loyaltyPoints} points available`,
        variant: 'destructive',
      });
      return;
    }
    
    setLoyaltyPointsUsed(points);
  };

  const handleCompleteSale = (paymentMethod: 'cash' | 'upi') => {
    if (!selectedCustomer) {
      toast({
        title: 'No Customer Selected',
        description: 'Please select a customer before completing the sale',
        variant: 'destructive',
      });
      return;
    }
    
    if (cart.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Please add items to the cart before completing the sale',
        variant: 'destructive',
      });
      return;
    }
    
    const bill = completeSale(paymentMethod);
    if (bill) {
      setIsCheckoutDialogOpen(false);
      setLastCompletedBill(bill);
      setShowPaymentSuccess(true);
    }
  };

  const handleBackToPos = () => {
    setShowPaymentSuccess(false);
    setLastCompletedBill(null);
  };

  const handleApplyCustomDiscount = (amount: number, type: 'percentage' | 'fixed') => {
    setDiscount(amount, type);
  };

  const handleApplyCustomLoyaltyPoints = (points: number) => {
    setLoyaltyPointsUsed(points);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  let discountValue = 0;
  if (discountType === 'percentage') {
    discountValue = subtotal * (discount / 100);
  } else {
    discountValue = discount;
  }
  const total = calculateTotal();

  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between mb-6 animate-slide-down">
        <h2 className="text-3xl font-bold tracking-tight gradient-text font-heading">Point of Sale</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 h-[calc(100vh-12rem)] flex flex-col animate-slide-up">
          <Cart 
            cart={cart}
            selectedCustomer={selectedCustomer}
            subtotal={subtotal}
            discount={discount}
            discountType={discountType}
            discountValue={discountValue}
            loyaltyPointsUsed={loyaltyPointsUsed}
            total={total}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={clearCart}
            onSelectCustomer={() => setIsCustomerDialogOpen(true)}
            onCheckout={() => setIsCheckoutDialogOpen(true)}
          />
        </Card>

        <Card className="lg:col-span-2 h-[calc(100vh-12rem)] flex flex-col animate-slide-up delay-200">
          <ProductGrid products={products} />
        </Card>
      </div>

      <CustomerSelector 
        customers={customers}
        onSelectCustomer={handleSelectCustomer}
        isOpen={isCustomerDialogOpen}
        onOpenChange={setIsCustomerDialogOpen}
      />

      <CheckoutDialog 
        isOpen={isCheckoutDialogOpen}
        onOpenChange={setIsCheckoutDialogOpen}
        selectedCustomer={selectedCustomer}
        subtotal={subtotal}
        discount={discount}
        discountType={discountType}
        discountValue={discountValue}
        loyaltyPointsUsed={loyaltyPointsUsed}
        total={total}
        onApplyDiscount={handleApplyCustomDiscount}
        onApplyLoyaltyPoints={handleApplyCustomLoyaltyPoints}
        onCompleteSale={handleCompleteSale}
      />

      {lastCompletedBill && selectedCustomer && (
        <PaymentSuccess 
          bill={lastCompletedBill} 
          customer={selectedCustomer} 
          isOpen={showPaymentSuccess}
          onClose={() => handleBackToPos()}
          onBackToPos={handleBackToPos}
        />
      )}
    </div>
  );
};

export default POS;
