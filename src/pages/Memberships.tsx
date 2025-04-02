
import React, { useState } from 'react';
import { usePOS, Customer, MembershipType } from '@/context/POSContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User, Plus, Calendar, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import CustomerCard from '@/components/CustomerCard';
import { CurrencyDisplay } from '@/components/ui/currency';

const Memberships = () => {
  const {
    customers,
    addMembership,
    getMembershipDetails,
    isMembershipExpired,
    selectCustomer,
    selectedCustomer,
    addToCart,
    clearCart
  } = usePOS();
  
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembershipType, setSelectedMembershipType] = useState<MembershipType>('8ball_2pax');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStudentPrice, setIsStudentPrice] = useState(false);

  const filteredCustomers = searchQuery.trim() === ''
    ? customers
    : customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );
  
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    // Sort by membership status
    if (a.isMember && !b.isMember) return -1;
    if (!a.isMember && b.isMember) return 1;
    
    // Then by expiry date (most recent first)
    if (a.membership && b.membership) {
      return new Date(b.membership.expiryDate).getTime() - new Date(a.membership.expiryDate).getTime();
    }
    
    // Then by name
    return a.name.localeCompare(b.name);
  });
  
  const membershipCustomers = sortedCustomers.filter(customer => customer.isMember);
  const nonMemberCustomers = sortedCustomers.filter(customer => !customer.isMember);
  
  const membershipDetails = getMembershipDetails ? getMembershipDetails(selectedMembershipType) : null;
  
  const handleSelectCustomer = (customer: Customer) => {
    selectCustomer(customer.id);
  };
  
  const handleAddToCart = () => {
    if (!selectedCustomer) {
      toast({
        title: 'No Customer Selected',
        description: 'Please select a customer first',
        variant: 'destructive',
      });
      return;
    }
    
    if (!membershipDetails) {
      toast({
        title: 'Invalid Membership',
        description: 'Please select a valid membership type',
        variant: 'destructive',
      });
      return;
    }
    
    // Clear cart to avoid mixing with other items
    clearCart();
    
    // Add membership to cart
    addToCart({
      id: `membership_${selectedMembershipType}`,
      type: 'membership',
      name: membershipDetails.name,
      price: isStudentPrice ? membershipDetails.studentPrice : membershipDetails.price,
      quantity: 1,
      membershipType: selectedMembershipType
    });
    
    toast({
      title: 'Added to Cart',
      description: `${membershipDetails.name} has been added to the cart.`,
      className: 'bg-cuephoria-purple/90',
    });
    
    // Close dialog
    setIsDialogOpen(false);
    
    // Redirect to POS page for checkout
    window.location.href = '/pos';
  };
  
  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd MMM yyyy');
  };
  
  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between mb-6 animate-slide-down">
        <h2 className="text-3xl font-bold tracking-tight gradient-text font-heading">Memberships</h2>
      </div>
      
      <div className="flex mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8 font-quicksand"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="ml-4 bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple btn-hover-effect">
              <Plus className="mr-2 h-4 w-4" /> Add Membership
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Membership</DialogTitle>
              <DialogDescription>
                Select a membership plan and assign it to a customer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {selectedCustomer ? (
                <div className="flex items-center p-3 border rounded-md">
                  <User className="h-5 w-5 mr-2 text-cuephoria-lightpurple" />
                  <div>
                    <div className="font-medium">{selectedCustomer.name}</div>
                    <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto"
                    onClick={() => selectCustomer(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed rounded-md">
                  <User className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="mb-2">No customer selected</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.location.href = '/customers'}
                  >
                    Select Customer
                  </Button>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="font-medium">Select Membership Type</div>
                <Tabs 
                  defaultValue="8ball_2pax" 
                  value={selectedMembershipType}
                  onValueChange={(value) => setSelectedMembershipType(value as MembershipType)}
                >
                  <TabsList className="grid grid-cols-2 md:grid-cols-4">
                    <TabsTrigger value="8ball_2pax">8 Ball (2 Pax)</TabsTrigger>
                    <TabsTrigger value="8ball_4pax">8 Ball (4 Pax)</TabsTrigger>
                    <TabsTrigger value="ps5">PS5 Gaming</TabsTrigger>
                    <TabsTrigger value="combo">Combo</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              {membershipDetails && (
                <div className="border rounded-md p-4 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{membershipDetails.name}</h3>
                      <p className="text-sm text-muted-foreground">{membershipDetails.creditHours} credit hours</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm line-through text-muted-foreground indian-rupee">
                        {membershipDetails.regularPrice}
                      </div>
                      <div className="text-lg font-bold indian-rupee">
                        {isStudentPrice ? membershipDetails.studentPrice : membershipDetails.price}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <label className="flex items-center cursor-pointer space-x-2">
                      <input 
                        type="checkbox" 
                        className="rounded-sm border-gray-300 h-4 w-4 text-cuephoria-purple"
                        checked={isStudentPrice}
                        onChange={() => setIsStudentPrice(!isStudentPrice)}
                      />
                      <span>Apply Student Discount</span>
                    </label>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Benefits:</div>
                    <ul className="text-sm space-y-1">
                      {membershipDetails.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="font-medium">Perks:</div>
                    <ul className="text-sm space-y-1">
                      {membershipDetails.perks.map((perk, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-4 w-4 mr-2 mt-0.5 text-cuephoria-purple" />
                          <span>{perk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddToCart}
                disabled={!selectedCustomer}
                className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple"
              >
                Add to Cart
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Active Memberships</CardTitle>
            <CardDescription>
              {membershipCustomers.length} active membership{membershipCustomers.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membershipCustomers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {membershipCustomers.map((customer) => (
                  <div key={customer.id} className="relative">
                    <CustomerCard
                      customer={customer}
                      isSelectable={true}
                      onSelect={handleSelectCustomer}
                    />
                    {customer.membership && (
                      <div className="absolute top-2 right-2">
                        {isMembershipExpired(customer) ? (
                          <div className="bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center">
                            <AlertCircle className="h-3 w-3 mr-1" /> Expired
                          </div>
                        ) : (
                          <div className="bg-green-500 text-white text-xs px-2 py-1 rounded flex items-center">
                            <Calendar className="h-3 w-3 mr-1" /> 
                            Expires {formatDate(customer.membership.expiryDate)}
                          </div>
                        )}
                      </div>
                    )}
                    {customer.membership && (
                      <div className="mt-2 text-sm">
                        <div className="flex justify-between">
                          <span>Membership:</span>
                          <span className="font-medium">
                            {getMembershipName(customer.membership.type)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Credit Hours:</span>
                          <span className="font-medium">
                            {customer.membership.creditHoursRemaining}/{customer.membership.originalCreditHours}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Active Memberships</h3>
                <p className="text-muted-foreground mb-4">
                  Add a membership to a customer to get started
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple"
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Membership
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Membership Plans</CardTitle>
            <CardDescription>
              Available membership plans for customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['8ball_2pax', '8ball_4pax', 'ps5', 'combo'].map((type) => {
                const plan = getMembershipDetails(type as MembershipType);
                if (!plan) return null;
                
                return (
                  <Card key={type} className="border-2 hover:border-cuephoria-purple/50 transition-colors cursor-pointer">
                    <CardHeader className="bg-gradient-to-r from-cuephoria-purple/10 to-transparent pb-3">
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <div className="flex justify-between items-center">
                        <CardDescription>
                          {plan.creditHours} credit hours
                        </CardDescription>
                        <div className="flex flex-col items-end">
                          <div className="text-xs line-through text-muted-foreground">
                            <CurrencyDisplay amount={plan.regularPrice} />
                          </div>
                          <div className="text-xl font-bold text-cuephoria-lightpurple">
                            <CurrencyDisplay amount={plan.price} />
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Student: <CurrencyDisplay amount={plan.studentPrice} />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-3">
                      <div className="text-sm mb-2 font-medium">Benefits:</div>
                      <ul className="text-xs space-y-1 mb-4">
                        {plan.benefits.slice(0, 3).map((benefit, i) => (
                          <li key={i} className="flex items-start">
                            <Check className="h-3 w-3 mr-1 mt-0.5 text-green-500 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full bg-gradient-to-r from-cuephoria-purple to-cuephoria-lightpurple btn-hover-effect text-sm py-1 h-auto"
                        onClick={() => {
                          setSelectedMembershipType(type as MembershipType);
                          setIsDialogOpen(true);
                        }}
                      >
                        Select Plan
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get the friendly name of a membership type
const getMembershipName = (type: string): string => {
  switch (type) {
    case '8ball_2pax':
      return 'Weekly Pass - 8 Ball (2 Pax)';
    case '8ball_4pax':
      return 'Weekly Pass - 8 Ball (4 Pax)';
    case 'ps5':
      return 'Weekly Pass - PS5 Gaming';
    case 'combo':
      return 'Weekly Pass - Combo';
    default:
      return 'Unknown';
  }
};

export default Memberships;
