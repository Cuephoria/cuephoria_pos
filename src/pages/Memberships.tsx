
import React, { useState } from 'react';
import { usePOS, MembershipTier } from '@/context/POSContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Crown, Medal, Star, Plus, UserPlus, Check } from 'lucide-react';
import MembershipCard from '@/components/MembershipCard';
import CustomerCard from '@/components/CustomerCard';
import { formatMembershipDetails } from '@/utils/membership.utils';

const Memberships = () => {
  const { 
    customers, 
    selectedCustomer, 
    selectCustomer, 
    updateCustomer,
    upgradeMembership
  } = usePOS();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier>('basic');
  
  // Filter customers to find those who are members
  const memberCustomers = customers.filter(customer => customer.isMember);
  
  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone.includes(searchQuery)
  );
  
  const handleSelectCustomer = (customerId: string) => {
    selectCustomer(customerId);
    setShowCustomerDialog(false);
  };
  
  const handleUpgradeMembership = () => {
    if (!selectedCustomer) return;
    
    upgradeMembership(selectedCustomer.id, selectedTier);
    
    toast({
      title: 'Membership Upgraded',
      description: `${selectedCustomer.name}'s membership has been upgraded to ${selectedTier}.`,
      className: 'bg-cuephoria-purple/90',
    });
    
    setShowUpgradeDialog(false);
  };
  
  const handleToggleStudentStatus = () => {
    if (!selectedCustomer) return;
    
    updateCustomer({
      ...selectedCustomer,
      isStudent: !selectedCustomer.isStudent
    });
    
    toast({
      title: selectedCustomer.isStudent ? 'Student Status Removed' : 'Student Status Added',
      description: `${selectedCustomer.name} is ${selectedCustomer.isStudent ? 'no longer marked' : 'now marked'} as a student.`,
    });
  };
  
  const membershipTiers: MembershipTier[] = ['basic', 'standard', 'premium', 'combo'];
  
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between animate-slide-down">
        <h2 className="text-3xl font-bold tracking-tight gradient-text font-heading">Memberships</h2>
        
        <div className="flex space-x-2">
          <Button 
            className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
            onClick={() => setShowCustomerDialog(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" /> Select Customer
          </Button>
        </div>
      </div>

      {/* Customer membership info */}
      {selectedCustomer ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4 animate-slide-up">
          <Card className="lg:col-span-1 bg-gradient-to-r from-cuephoria-purple/10 to-transparent">
            <CardHeader>
              <CardTitle className="text-xl font-heading">Selected Customer</CardTitle>
              <CardDescription>Membership and loyalty details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col space-y-2">
                <div className="font-medium text-lg">{selectedCustomer.name}</div>
                <div className="text-sm text-muted-foreground">{selectedCustomer.phone}</div>
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center">
                    <Checkbox 
                      id="student" 
                      checked={selectedCustomer.isStudent} 
                      onCheckedChange={handleToggleStudentStatus}
                    />
                    <Label htmlFor="student" className="ml-2">Student</Label>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Membership Status:</span>
                    <Badge className={`${
                      selectedCustomer.isMember 
                        ? 'bg-green-600' 
                        : 'bg-gray-400'
                    }`}>
                      {selectedCustomer.isMember ? 'Active' : 'None'}
                    </Badge>
                  </div>
                  
                  {selectedCustomer.isMember && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Current Tier:</span>
                        <Badge className="bg-cuephoria-purple">
                          {selectedCustomer.membershipTier.charAt(0).toUpperCase() + 
                           selectedCustomer.membershipTier.slice(1)}
                        </Badge>
                      </div>
                      
                      {selectedCustomer.membershipEndDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Expires on:</span>
                          <span className="text-sm font-medium">
                            {new Date(selectedCustomer.membershipEndDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Loyalty Points:</span>
                    <span className="text-sm font-medium">{selectedCustomer.loyaltyPoints}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Spent:</span>
                    <span className="text-sm font-medium">₹{selectedCustomer.totalSpent.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                
                <Button 
                  className="w-full mt-4 bg-cuephoria-lightpurple hover:bg-cuephoria-purple"
                  onClick={() => setShowUpgradeDialog(true)}
                >
                  <Crown className="mr-2 h-4 w-4" />
                  {selectedCustomer.isMember ? 'Change Membership' : 'Add Membership'}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="text-xl font-heading">
                {selectedCustomer.isMember 
                  ? 'Current Membership Benefits' 
                  : 'Available Membership Plans'
                }
              </CardTitle>
              <CardDescription>
                {selectedCustomer.isMember 
                  ? `Details for ${selectedCustomer.name}'s current membership plan` 
                  : 'Select a membership plan for the customer'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedCustomer.isMember ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Medal className="h-5 w-5 mr-2 text-cuephoria-purple" />
                        Membership Details
                      </h3>
                      <ul className="space-y-2">
                        {formatMembershipDetails(selectedCustomer.membershipTier).map((detail, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-sm">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2 flex items-center">
                        <Star className="h-5 w-5 mr-2 text-cuephoria-orange" />
                        Special Offers
                      </h3>
                      <ul className="space-y-2">
                        {selectedCustomer.membershipTier !== 'none' && 
                          usePOS().getMembershipBenefits(selectedCustomer.membershipTier).specialOffers.map((offer, index) => (
                            <li key={index} className="flex items-start">
                              <Check className="h-4 w-4 mr-2 text-green-500 shrink-0 mt-0.5" />
                              <span className="text-sm">{offer}</span>
                            </li>
                          ))
                        }
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {membershipTiers.map((tier) => (
                    <MembershipCard 
                      key={tier}
                      tier={tier}
                      canPurchase={true}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="animate-slide-up">
          <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
            <div className="rounded-full bg-cuephoria-purple/20 p-4 mb-4">
              <Crown className="h-8 w-8 text-cuephoria-purple" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Customer Selected</h3>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              Select a customer to view their membership details or assign a new membership plan.
            </p>
            <Button 
              className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
              onClick={() => setShowCustomerDialog(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Select Customer
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-4">
        <h3 className="text-xl font-bold tracking-tight font-heading flex items-center">
          <Medal className="h-5 w-5 mr-2 text-cuephoria-purple" />
          Available Membership Plans
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
          {membershipTiers.map((tier, index) => (
            <div 
              key={tier} 
              className="animate-scale-in" 
              style={{animationDelay: `${index * 100}ms`}}
            >
              <MembershipCard 
                tier={tier}
                canPurchase={!!selectedCustomer}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-4">
        <Tabs defaultValue="members" className="w-full animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold tracking-tight font-heading flex items-center">
              <Crown className="h-5 w-5 mr-2 text-cuephoria-purple" />
              Customer Memberships
            </h3>
            <TabsList>
              <TabsTrigger value="members">Members</TabsTrigger>
              <TabsTrigger value="all">All Customers</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="members" className="space-y-4">
            {memberCustomers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {memberCustomers.map((customer, index) => (
                  <div 
                    key={customer.id} 
                    className="animate-scale-in" 
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <CustomerCard 
                      customer={customer} 
                      isSelectable={true}
                      onSelect={() => handleSelectCustomer(customer.id)}
                      showMembershipDetails
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">No members found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="all" className="space-y-4">
            <div className="w-full max-w-sm mb-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search customers..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            {filteredCustomers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCustomers.map((customer, index) => (
                  <div 
                    key={customer.id} 
                    className="animate-scale-in" 
                    style={{animationDelay: `${index * 100}ms`}}
                  >
                    <CustomerCard 
                      customer={customer} 
                      isSelectable={true}
                      onSelect={() => handleSelectCustomer(customer.id)}
                      showMembershipDetails
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="pt-6 flex flex-col items-center justify-center py-10">
                  <p className="text-muted-foreground">No customers found.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select a Customer</DialogTitle>
            <DialogDescription>
              Choose a customer to view or update their membership
            </DialogDescription>
          </DialogHeader>
          
          <div className="w-full max-w-sm mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <CustomerCard 
                key={customer.id} 
                customer={customer} 
                isSelectable={true}
                onSelect={() => handleSelectCustomer(customer.id)}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Upgrade Membership Dialog */}
      <Dialog open={showUpgradeDialog} onOpenChange={setShowUpgradeDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCustomer?.isMember 
                ? 'Update Membership' 
                : 'Add Membership'
              }
            </DialogTitle>
            <DialogDescription>
              {selectedCustomer?.isMember 
                ? 'Change membership tier for this customer' 
                : 'Add a membership plan for this customer'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
            {membershipTiers.map((tier) => (
              <MembershipCard 
                key={tier}
                tier={tier}
                isSelected={selectedTier === tier}
                onSelect={() => setSelectedTier(tier)}
              />
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpgradeDialog(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-cuephoria-purple hover:bg-cuephoria-purple/80"
              onClick={handleUpgradeMembership}
            >
              {selectedCustomer?.isMember 
                ? 'Update Membership' 
                : 'Add Membership'
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Memberships;
