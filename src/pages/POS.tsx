
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShoppingCart, X, User, Plus, Search, ArrowRight, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { usePOS, Customer, Product } from '@/context/POSContext';
import { CurrencyDisplay, formatCurrency } from '@/components/ui/currency';
import CustomerCard from '@/components/CustomerCard';
import ProductCard from '@/components/ProductCard';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const POS = () => {
  const {
    products,
    customers,
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

  const [activeTab, setActiveTab] = useState('all');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false);
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi'>('cash');
  const [customDiscountAmount, setCustomDiscountAmount] = useState(discount.toString());
  const [customDiscountType, setCustomDiscountType] = useState<'percentage' | 'fixed'>(discountType);
  const [customLoyaltyPoints, setCustomLoyaltyPoints] = useState(loyaltyPointsUsed.toString());

  // Update the form values when the context values change
  useEffect(() => {
    setCustomDiscountAmount(discount.toString());
    setCustomDiscountType(discountType);
    setCustomLoyaltyPoints(loyaltyPointsUsed.toString());
  }, [discount, discountType, loyaltyPointsUsed]);

  // Apply the discount and loyalty points when the dialog is opened
  useEffect(() => {
    if (isCheckoutDialogOpen) {
      handleApplyDiscount();
      handleApplyLoyaltyPoints();
    }
  }, [isCheckoutDialogOpen]);

  const filteredProducts = activeTab === 'all'
    ? products
    : products.filter(product => product.category === activeTab);

  const searchedProducts = productSearchQuery.trim() === ''
    ? filteredProducts
    : filteredProducts.filter(product =>
        product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
      );

  const filteredCustomers = customerSearchQuery.trim() === ''
    ? customers
    : customers.filter(customer =>
        customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
        customer.phone.includes(customerSearchQuery)
      );

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
    });
  };

  const handleApplyDiscount = () => {
    const amount = Number(customDiscountAmount);
    if (isNaN(amount) || amount < 0) {
      toast({
        title: 'Invalid Discount',
        description: 'Please enter a valid discount amount',
        variant: 'destructive',
      });
      return;
    }
    setDiscount(amount, customDiscountType);
  };

  const handleApplyLoyaltyPoints = () => {
    const points = Number(customLoyaltyPoints);
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

  const handleCompleteSale = () => {
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
      toast({
        title: 'Sale Completed',
        description: `Total: ${formatCurrency(bill.total)}`,
      });
    }
  };

  // Calculate subtotal, discount value and total
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold tracking-tight">Point of Sale</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cart Section */}
        <Card className="lg:col-span-1 h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">
                <ShoppingCart className="h-5 w-5 inline-block mr-2" />
                Cart
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={clearCart}>
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
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-3">
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground indian-rupee">
                        {item.price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-destructive"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="w-20 text-right indian-rupee">
                      {item.total.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">Cart Empty</h3>
                <p className="text-muted-foreground mt-2">
                  Add products to the cart to begin
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4 flex flex-col">
            <div className="w-full">
              <div className="flex justify-between py-1">
                <span>Subtotal</span>
                <span className="indian-rupee">{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 text-cuephoria-purple">
                  <span>
                    Discount {discountType === 'percentage' ? `(${discount}%)` : ''}
                  </span>
                  <span className="indian-rupee">-{discountValue.toLocaleString('en-IN')}</span>
                </div>
              )}
              {loyaltyPointsUsed > 0 && (
                <div className="flex justify-between py-1 text-cuephoria-orange">
                  <span>Loyalty Points Used</span>
                  <span className="indian-rupee">-{loyaltyPointsUsed.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between py-1 text-lg font-bold border-t mt-2 pt-2">
                <span>Total</span>
                <span className="indian-rupee">{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-3 w-full mt-4">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsCustomerDialogOpen(true)}
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
                className="w-full"
                disabled={cart.length === 0 || !selectedCustomer}
                onClick={() => setIsCheckoutDialogOpen(true)}
              >
                Checkout
              </Button>
            </div>
          </CardFooter>
        </Card>

        {/* Products Section */}
        <Card className="lg:col-span-2 h-[calc(100vh-12rem)] flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Products</CardTitle>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="px-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="gaming">Gaming</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
              <TabsTrigger value="drinks">Drinks</TabsTrigger>
              <TabsTrigger value="tobacco">Tobacco</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="flex-grow overflow-auto px-6 mt-4">
              {searchedProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchedProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <h3 className="text-xl font-medium">No Products Found</h3>
                  <p className="text-muted-foreground mt-2">
                    Try a different search or category
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Customer Selection Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
          </DialogHeader>
          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-8"
              value={customerSearchQuery}
              onChange={(e) => setCustomerSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="max-h-[60vh] overflow-auto">
            {filteredCustomers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    isSelectable={true}
                    onSelect={handleSelectCustomer}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No Customers Found</h3>
                <p className="text-muted-foreground mt-2">
                  Try a different search or add a new customer
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Transaction</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            {selectedCustomer && (
              <div className="border rounded-md p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" /> {selectedCustomer.name}
                    </div>
                    <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                  </div>
                  {selectedCustomer.isMember && (
                    <div className="bg-cuephoria-purple text-white text-xs px-2 py-1 rounded">
                      Member
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm">
                  Available Points: {selectedCustomer.loyaltyPoints}
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              <h4 className="font-medium">Apply Discount</h4>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={customDiscountAmount}
                    onChange={(e) => setCustomDiscountAmount(e.target.value)}
                    placeholder="Discount amount"
                  />
                </div>
                <select
                  className="px-3 py-2 rounded-md border border-input bg-background"
                  value={customDiscountType}
                  onChange={(e) => setCustomDiscountType(e.target.value as 'percentage' | 'fixed')}
                >
                  <option value="percentage">%</option>
                  <option value="fixed">₹</option>
                </select>
                <Button onClick={handleApplyDiscount}>Apply</Button>
              </div>
            </div>
            
            {selectedCustomer && selectedCustomer.loyaltyPoints > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium">Use Loyalty Points</h4>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={customLoyaltyPoints}
                    onChange={(e) => setCustomLoyaltyPoints(e.target.value)}
                    placeholder="Points to use"
                  />
                  <Button onClick={handleApplyLoyaltyPoints}>Apply</Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Customer has {selectedCustomer.loyaltyPoints} points (₹1 per point)
                </p>
              </div>
            )}
            
            <div className="border-t pt-4 mt-2">
              <div className="flex justify-between py-1">
                <span>Subtotal</span>
                <CurrencyDisplay amount={subtotal} />
              </div>
              {discount > 0 && (
                <div className="flex justify-between py-1 text-cuephoria-purple">
                  <span>
                    Discount {discountType === 'percentage' ? `(${discount}%)` : ''}
                  </span>
                  <span>-<CurrencyDisplay amount={discountValue} /></span>
                </div>
              )}
              {loyaltyPointsUsed > 0 && (
                <div className="flex justify-between py-1 text-cuephoria-orange">
                  <span>Loyalty Points Used</span>
                  <span>-<CurrencyDisplay amount={loyaltyPointsUsed} /></span>
                </div>
              )}
              <div className="flex justify-between py-1 text-lg font-bold border-t mt-2 pt-2">
                <span>Total</span>
                <CurrencyDisplay amount={total} />
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Payment Method</h4>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as 'cash' | 'upi')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="upi" id="upi" />
                  <Label htmlFor="upi">UPI</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteSale}>
              Complete Sale (<CurrencyDisplay amount={total} />)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
