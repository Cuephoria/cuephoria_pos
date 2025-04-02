
import React, { useState, useEffect } from 'react';
import { Plus, User, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePOS, Customer } from '@/context/POSContext';
import CustomerCard from '@/components/CustomerCard';
import { useToast } from '@/hooks/use-toast';

const Customers = () => {
  console.log('Customers component rendering');
  
  // Local state to handle errors
  const [error, setError] = useState<string | null>(null);
  const [customersData, setCustomersData] = useState<Customer[]>([]);
  const [isContextLoaded, setIsContextLoaded] = useState(false);
  
  // Use a try-catch when getting the context
  let posContext;
  try {
    posContext = usePOS();
    setIsContextLoaded(true);
  } catch (e) {
    console.error('Error using POS context:', e);
    setError(e instanceof Error ? e.message : 'Unknown error');
  }
  
  const { toast } = useToast();
  
  // If we have the context, extract what we need
  const { 
    customers = [], 
    addCustomer = () => {}, 
    updateCustomer = () => {}, 
    deleteCustomer = () => {}, 
    exportCustomers = () => {} 
  } = isContextLoaded && posContext ? posContext : {};
  
  useEffect(() => {
    // Update local state when context data changes
    if (isContextLoaded && customers) {
      setCustomersData(customers);
    }
  }, [isContextLoaded, customers]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
  const [formState, setFormState] = useState({
    name: '',
    phone: '',
    email: '',
    isMember: false,
  });

  const resetForm = () => {
    setFormState({
      name: '',
      phone: '',
      email: '',
      isMember: false,
    });
    setIsEditMode(false);
    setSelectedCustomer(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setIsEditMode(true);
    setSelectedCustomer(customer);
    setFormState({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      isMember: customer.isMember,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCustomer = (id: string) => {
    deleteCustomer(id);
    toast({
      title: 'Customer Deleted',
      description: 'The customer has been removed successfully.',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const { name, phone, email, isMember } = formState;
    
    if (!name || !phone) {
      toast({
        title: 'Error',
        description: 'Name and phone are required',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate Indian phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 10-digit Indian phone number',
        variant: 'destructive',
      });
      return;
    }
    
    const customerData = {
      name,
      phone,
      email: email || undefined,
      isMember,
      loyaltyPoints: isEditMode && selectedCustomer ? selectedCustomer.loyaltyPoints : 0,
      totalSpent: isEditMode && selectedCustomer ? selectedCustomer.totalSpent : 0,
      totalPlayTime: isEditMode && selectedCustomer ? selectedCustomer.totalPlayTime : 0,
    };
    
    if (isEditMode && selectedCustomer) {
      updateCustomer({ 
        ...customerData, 
        id: selectedCustomer.id,
        createdAt: selectedCustomer.createdAt
      });
      toast({
        title: 'Customer Updated',
        description: 'The customer has been updated successfully.',
      });
    } else {
      addCustomer(customerData);
      toast({
        title: 'Customer Added',
        description: 'The customer has been added successfully.',
      });
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormState(prev => ({ ...prev, isMember: checked }));
  };

  // Filter customers based on search query
  const filteredCustomers = searchQuery.trim() === ''
    ? customersData
    : customersData.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery) ||
        (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // If we have an error, display it
  if (error) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        </div>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <p className="mt-2">Please try refreshing the page or contact support if the issue persists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportCustomers}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      </div>

      {/* Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formState.name}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formState.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formState.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="member"
                  checked={formState.isMember}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="member">Is Member</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditMode ? 'Update Customer' : 'Add Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Search and filter */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers by name, phone or email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Customer list */}
      {filteredCustomers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCustomers.map((customer) => (
            <CustomerCard
              key={customer.id}
              customer={customer}
              onEdit={handleEditCustomer}
              onDelete={handleDeleteCustomer}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <User className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium">No Customers Found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery
              ? "No customers match your search criteria."
              : "You haven't added any customers yet."}
          </p>
          <Button className="mt-4" onClick={handleOpenDialog}>
            <Plus className="h-4 w-4 mr-2" /> Add Customer
          </Button>
        </div>
      )}
    </div>
  );
};

export default Customers;
