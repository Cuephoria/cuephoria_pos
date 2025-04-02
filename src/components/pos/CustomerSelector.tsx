
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, User } from 'lucide-react';
import { Customer } from '@/context/POSContext';
import CustomerCard from '@/components/CustomerCard';

interface CustomerSelectorProps {
  customers: Customer[];
  onSelectCustomer: (customer: Customer) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const CustomerSelector: React.FC<CustomerSelectorProps> = ({
  customers,
  onSelectCustomer,
  isOpen,
  onOpenChange
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = searchQuery.trim() === ''
    ? customers
    : customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl animate-scale-in">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Select Customer</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            className="pl-8 font-quicksand"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="max-h-[60vh] overflow-auto">
          {filteredCustomers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer, index) => (
                <div 
                  key={customer.id} 
                  className={`animate-scale-in delay-${index % 6}`} 
                  style={{animationDelay: `${(index % 6) * 100}ms`}}
                >
                  <CustomerCard
                    customer={customer}
                    isSelectable={true}
                    onSelect={onSelectCustomer}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium font-heading">No Customers Found</h3>
              <p className="text-muted-foreground mt-2">
                Try a different search or add a new customer
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerSelector;
