import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Trash2, Search, Edit2, Plus, X, Save, CreditCard, Wallet } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bill, CartItem, Customer } from '@/types/pos.types';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

const RecentTransactions: React.FC = () => {
  const { bills, customers, deleteBill, products, updateProduct, updateCustomer } = usePOS();
  const { toast } = useToast();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for managing bill items
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [editedItems, setEditedItems] = useState<CartItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  // New item form state
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [newItemQuantity, setNewItemQuantity] = useState<number>(1);
  const [availableStock, setAvailableStock] = useState<number>(0);
  
  // Additional edit states for discount, points, and payment method
  const [editedDiscount, setEditedDiscount] = useState<number>(0);
  const [editedDiscountType, setEditedDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [editedLoyaltyPointsUsed, setEditedLoyaltyPointsUsed] = useState<number>(0);
  const [editedPaymentMethod, setEditedPaymentMethod] = useState<'cash' | 'upi'>('cash');
  
  // State for product search in add item dialog
  const [productSearchQuery, setProductSearchQuery] = useState<string>('');
  
  // Filtered products based on search query
  const filteredProducts = products.filter(product => {
    if (!productSearchQuery.trim()) return true;
    
    const query = productSearchQuery.toLowerCase().trim();
    return (
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query)
    );
  }).filter(product => product.stock > 0);
  
  // Filter bills based on search query (bill ID, customer name, phone or email)
  const filteredBills = bills.filter(bill => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    
    // Match by bill ID
    if (bill.id.toLowerCase().includes(query)) return true;
    
    // Match by customer name, phone or email
    const customer = customers.find(c => c.id === bill.customerId);
    if (customer) {
      const customerName = customer.name.toLowerCase();
      const customerPhone = customer.phone.toLowerCase();
      const customerEmail = customer.email?.toLowerCase() || '';
      
      return customerName.includes(query) || 
             customerPhone.includes(query) || 
             customerEmail.includes(query);
    }
    
    return false;
  });
  
  // Sort bills by date (newest first)
  const sortedBills = [...filteredBills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Add this new state for controlling dropdown visibility
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // State to hold selected product name for display
  const [selectedProductName, setSelectedProductName] = useState<string>('');
  
  // Reset the add item form when dialog opens
  const handleOpenAddItemDialog = () => {
    setSelectedProductId('');
    setSelectedProductName('');
    setNewItemQuantity(1);
    setAvailableStock(0);
    setProductSearchQuery('');
    setIsDropdownOpen(false);
    setIsAddItemDialogOpen(true);
  };
  
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId);
    setIsDropdownOpen(false);
    
    // Auto-fill product information and set the selected product name
    const selectedProduct = products.find(p => p.id === productId);
    if (selectedProduct) {
      setAvailableStock(selectedProduct.stock || 0);
      setSelectedProductName(selectedProduct.name);
      // Reset quantity to 1 when a new product is selected
      setNewItemQuantity(1);
    }
  };
  
  const handleDeleteClick = (bill: Bill) => {
    setBillToDelete(bill);
    setIsConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!billToDelete) return;
    
    setIsDeleting(true);
    try {
      const success = await deleteBill(billToDelete.id, billToDelete.customerId);
      
      if (success) {
        // Reset state after successful deletion
        setBillToDelete(null);
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };
  
  // Function to open edit dialog
  const handleEditClick = (bill: Bill) => {
    setSelectedBill(bill);
    setEditedItems([...bill.items]);
    setEditedDiscount(bill.discount);
    setEditedDiscountType(bill.discountType);
    setEditedLoyaltyPointsUsed(bill.loyaltyPointsUsed);
    setEditedPaymentMethod(bill.paymentMethod);
    setIsEditDialogOpen(true);
  };
  
  // Function to update edited items
  const handleUpdateItem = (index: number, field: keyof CartItem, value: any) => {
    const updatedItems = [...editedItems];
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    };
    
    // Recalculate total if price or quantity changed
    if (field === 'price' || field === 'quantity') {
      updatedItems[index].total = updatedItems[index].price * updatedItems[index].quantity;
    }
    
    setEditedItems(updatedItems);
  };
  
  // Function to remove item from edited items
  const handleRemoveItem = (index: number) => {
    const updatedItems = [...editedItems];
    const removedItem = updatedItems[index];
    
    // If this is a product, we need to restore the stock
    if (removedItem.type === 'product') {
      const product = products.find(p => p.id === removedItem.id);
      if (product) {
        // Find the original item in the bill (if it exists in the original bill)
        const originalBill = bills.find(b => b.id === selectedBill?.id);
        const originalItem = originalBill?.items.find(item => 
          item.id === removedItem.id && item.type === removedItem.type
        );
        
        // Calculate how much stock to restore
        // If it was in the original bill, only restore the difference
        // If it's a new item added during editing, restore the full quantity
        const stockToRestore = originalItem 
          ? removedItem.quantity 
          : removedItem.quantity;
        
        console.log(`Restoring stock for ${product.name}: current ${product.stock} + ${stockToRestore}`);
        
        // Update product stock
        updateProduct({
          ...product,
          stock: product.stock + stockToRestore
        });
        
        toast({
          title: "Stock Updated",
          description: `Added ${stockToRestore} units back to ${product.name} stock`,
        });
      }
    }
    
    updatedItems.splice(index, 1);
    setEditedItems(updatedItems);
  };
  
  // Function to add new item to bill
  const handleAddNewItem = () => {
    if (!selectedProductId) {
      toast({
        title: "Selection Required",
        description: "Please select a product from the list",
        variant: "destructive"
      });
      return;
    }
    
    const selectedProduct = products.find(p => p.id === selectedProductId);
    
    if (!selectedProduct) {
      toast({
        title: "Product Not Found",
        description: "The selected product could not be found",
        variant: "destructive"
      });
      return;
    }
    
    if (newItemQuantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than zero",
        variant: "destructive"
      });
      return;
    }
    
    if (newItemQuantity > selectedProduct.stock) {
      toast({
        title: "Insufficient Stock",
        description: `Only ${selectedProduct.stock} items available in stock`,
        variant: "destructive"
      });
      return;
    }
    
    const itemToAdd: CartItem = {
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: newItemQuantity,
      total: selectedProduct.price * newItemQuantity,
      type: 'product',
      category: selectedProduct.category
    };
    
    setEditedItems([...editedItems, itemToAdd]);
    
    // Update product stock
    updateProduct({
      ...selectedProduct,
      stock: selectedProduct.stock - newItemQuantity
    });
    
    // Reset form
    setSelectedProductId('');
    setNewItemQuantity(1);
    setProductSearchQuery('');
    setIsAddItemDialogOpen(false);
  };
  
  // Calculate updated bill values
  const calculateUpdatedBill = () => {
    if (!selectedBill) return { subtotal: 0, discountValue: 0, total: 0, loyaltyPointsDelta: 0 };
    
    // Calculate new subtotal
    const subtotal = editedItems.reduce((sum, item) => sum + item.total, 0);
    
    // Recalculate discount value based on type
    let discountValue = 0;
    if (editedDiscountType === 'percentage') {
      discountValue = subtotal * (editedDiscount / 100);
    } else {
      discountValue = editedDiscount;
    }
    
    // Calculate new total
    const total = Math.max(0, subtotal - discountValue - editedLoyaltyPointsUsed);
    
    // Calculate loyalty points difference based on the changed total
    // Get the rate based on customer membership status (5 points per 100 for members, 2 for non)
    const customer = customers.find(c => c.id === selectedBill.customerId);
    const pointsRate = customer?.isMember ? 5 : 2;
    
    // Calculate new points earned based on updated total
    const newLoyaltyPointsEarned = Math.floor((total / 100) * pointsRate);
    
    // Original points earned from the bill
    const originalPointsEarned = selectedBill.loyaltyPointsEarned || 0;
    
    // Calculate the delta (may be positive or negative)
    const loyaltyPointsDelta = newLoyaltyPointsEarned - originalPointsEarned;
    
    // Debugging logs
    console.log('Original Bill:', selectedBill);
    console.log('Updated items:', editedItems);
    console.log('New subtotal:', subtotal);
    console.log('New discount value:', discountValue);
    console.log('New total:', total);
    console.log('Original loyalty points earned:', originalPointsEarned);
    console.log('New loyalty points earned:', newLoyaltyPointsEarned);
    console.log('Loyalty points delta:', loyaltyPointsDelta);
    
    return { subtotal, discountValue, total, loyaltyPointsDelta };
  };
  
  // Function to save changes to bill
  const handleSaveChanges = async () => {
    if (!selectedBill) return;
    
    setIsSaving(true);
    try {
      const { subtotal, discountValue, total, loyaltyPointsDelta } = calculateUpdatedBill();
      
      // Points customer will earn from this updated transaction
      const newLoyaltyPointsEarned = selectedBill.loyaltyPointsEarned + loyaltyPointsDelta;
      
      // Calculate total price change for customer total spent tracking
      const totalPriceDelta = total - selectedBill.total;
      
      console.log('Total price delta:', totalPriceDelta);
      console.log('New loyalty points earned:', newLoyaltyPointsEarned);
      
      // Update bill in database
      const { error: billError } = await supabase
        .from('bills')
        .update({
          subtotal,
          discount: editedDiscount,
          discount_type: editedDiscountType,
          discount_value: discountValue,
          loyalty_points_used: editedLoyaltyPointsUsed,
          loyalty_points_earned: newLoyaltyPointsEarned,
          payment_method: editedPaymentMethod,
          total
        })
        .eq('id', selectedBill.id);
        
      if (billError) {
        throw new Error(`Failed to update bill: ${billError.message}`);
      }
      
      // Find the customer to update loyalty points and total spent
      const customer = customers.find(c => c.id === selectedBill.customerId);
      if (customer) {
        // Update customer loyalty points and total spent
        const updatedCustomer: Customer = {
          ...customer,
          loyaltyPoints: customer.loyaltyPoints + loyaltyPointsDelta,
          totalSpent: customer.totalSpent + totalPriceDelta
        };
        
        console.log('Updating customer:', customer.name);
        console.log('Current loyalty points:', customer.loyaltyPoints);
        console.log('Adding loyalty points delta:', loyaltyPointsDelta);
        console.log('New loyalty points:', updatedCustomer.loyaltyPoints);
        console.log('Current total spent:', customer.totalSpent);
        console.log('Adding total spent delta:', totalPriceDelta);
        console.log('New total spent:', updatedCustomer.totalSpent);
        
        // Update customer in database
        const { error: customerError } = await supabase
          .from('customers')
          .update({
            loyalty_points: updatedCustomer.loyaltyPoints,
            total_spent: updatedCustomer.totalSpent
          })
          .eq('id', customer.id);
          
        if (customerError) {
          console.error('Error updating customer:', customerError);
          toast({
            title: "Warning",
            description: `Updated bill but failed to update customer data: ${customerError.message}`,
            variant: "destructive"
          });
        } else {
          console.log('Customer updated successfully');
          // Update the customer in context
          updateCustomer(updatedCustomer);
        }
      }
      
      // Delete existing bill items
      const { error: deleteError } = await supabase
        .from('bill_items')
        .delete()
        .eq('bill_id', selectedBill.id);
        
      if (deleteError) {
        throw new Error(`Failed to update bill items: ${deleteError.message}`);
      }
      
      // Insert updated items
      for (const item of editedItems) {
        const { error: itemError } = await supabase
          .from('bill_items')
          .insert({
            bill_id: selectedBill.id,
            item_id: item.id,
            item_type: item.type,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          });
          
        if (itemError) {
          console.error('Error creating bill item:', itemError);
        }
      }
      
      toast({
        title: "Changes Saved",
        description: "Transaction updated successfully",
      });
      
      // Close dialog and reset state
      setIsEditDialogOpen(false);
      setSelectedBill(null);
      
      // Refresh data WITHOUT reloading the page
      try {
        // Fetch bills again
        const { data: updatedBillsData } = await supabase
          .from('bills')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (updatedBillsData) {
          // Update bills in state or context as needed
          console.log('Bills refreshed:', updatedBillsData.length);
        }
      } catch (refreshError) {
        console.error('Error refreshing data:', refreshError);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Check if loyalty points exceed available
  const isLoyaltyPointsExceeded = (pointsUsed: number, customer: any) => {
    return pointsUsed > (customer?.loyaltyPoints || 0);
  };
  
  // Handle loyalty points change with validation
  const handleLoyaltyPointsChange = (value: number) => {
    if (!selectedBill) return;
    
    const customer = customers.find(c => c.id === selectedBill.customerId);
    if (!customer) return;
    
    // Don't allow more points than available
    if (value > customer.loyaltyPoints) {
      toast({
        title: "Invalid Points",
        description: `Cannot use more than ${customer.loyaltyPoints} available points`,
        variant: "destructive"
      });
      return;
    }
    
    setEditedLoyaltyPointsUsed(value);
  };
  
  return (
    <>
      <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
        <CardHeader className="space-y-4">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Transactions</CardTitle>
            <CardDescription className="text-gray-400">Sales and billing information</CardDescription>
          </div>
          <div className="relative flex w-full items-center">
            <Input
              placeholder="Search by ID, name, phone or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-8 bg-gray-800 border-gray-700 text-white"
            />
            <Search className="absolute right-2 h-4 w-4 text-gray-400" />
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {sortedBills.length > 0 ? (
                sortedBills.map(bill => {
                  const customer = customers.find(c => c.id === bill.customerId);
                  const date = new Date(bill.createdAt);
                  
                  return (
                    <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                          <User className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{customer?.name || 'Unknown Customer'}</p>
                          <div className="flex space-x-2">
                            <p className="text-xs text-gray-400">
                              {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </p>
                            <p className="text-xs text-gray-400">ID: {bill.id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-white font-semibold">
                          <CurrencyDisplay amount={bill.total} />
                        </div>
                        <div className="flex space-x-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-blue-500"
                            onClick={() => handleEditClick(bill)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteClick(bill)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center justify-center p-6 text-gray-400">
                  <p>No transactions found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Are you sure you want to delete this transaction? This will revert the sale, 
              update inventory, and adjust customer loyalty points. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Edit Transaction Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription className="text-gray-400">
              Modify transaction details including products, discount, loyalty points, and payment method.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBill && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Bill ID</h3>
                  <p className="text-white text-xs font-mono">{selectedBill.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Customer</h3>
                  <p className="text-white">
                    {customers.find(c => c.id === selectedBill.customerId)?.name || 'Unknown Customer'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-400">Date</h3>
                  <p className="text-white">
                    {new Date(selectedBill.createdAt).toLocaleDateString()} 
                    {' '}
                    {new Date(selectedBill.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleOpenAddItemDialog}
                >
                  <Plus className="h-4 w-4" /> Add Item
                </Button>
              </div>
              
              <div className="border border-gray-700 rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-900">
                    <TableRow>
                      <TableHead className="text-gray-400">Name</TableHead>
                      <TableHead className="text-gray-400">Type</TableHead>
                      <TableHead className="text-gray-400">Price</TableHead>
                      <TableHead className="text-gray-400">Quantity</TableHead>
                      <TableHead className="text-gray-400">Total</TableHead>
                      <TableHead className="text-gray-400">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {editedItems.map((item, index) => (
                      <TableRow key={index} className="border-gray-700">
                        <TableCell>
                          <Input 
                            value={item.name} 
                            onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </TableCell>
                        <TableCell>
                          <Select 
                            value={item.type} 
                            onValueChange={(value) => handleUpdateItem(index, 'type', value as 'product' | 'session')}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700 text-white">
                              <SelectItem value="product">Product</SelectItem>
                              <SelectItem value="session">Session</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={item.price} 
                            onChange={(e) => handleUpdateItem(index, 'price', parseFloat(e.target.value))}
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => handleUpdateItem(index, 'quantity', parseInt(e.target.value))}
                            className="bg-gray-700 border-gray-600 text-white"
                            min="1"
                          />
                        </TableCell>
                        <TableCell className="text-white">
                          <CurrencyDisplay amount={item.total} />
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Discount, loyalty points, and payment method section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-700 pt-4">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Discount</h3>
                  <div className="flex space-x-2">
                    <Input 
                      type="number" 
                      value={editedDiscount} 
                      onChange={(e) => setEditedDiscount(parseFloat(e.target.value))}
                      className="bg-gray-700 border-gray-600 text-white flex-1"
                      min="0"
                    />
                    <Select
                      value={editedDiscountType}
                      onValueChange={(value) => setEditedDiscountType(value as 'percentage' | 'fixed')}
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white w-24">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700 text-white">
                        <SelectItem value="percentage">%</SelectItem>
                        <SelectItem value="fixed">₹</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {(() => {
                    const customer = customers.find(c => c.id === selectedBill.customerId);
                    const availablePoints = customer?.loyaltyPoints || 0;
                    const isExceeded = isLoyaltyPointsExceeded(editedLoyaltyPointsUsed, customer);
                    
                    return (
                      <>
                        <h3 className="text-sm font-medium text-gray-300">
                          Loyalty Points Used 
                          <span className="text-xs ml-2 text-gray-400">
                            (Available: {availablePoints})
                          </span>
                        </h3>
                        <Input 
                          type="number" 
                          value={editedLoyaltyPointsUsed} 
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value >= 0) {
                              handleLoyaltyPointsChange(value);
                            }
                          }}
                          className={`bg-gray-700 border-gray-600 text-white ${isExceeded ? 'border-red-500' : ''}`}
                          min="0"
                          max={availablePoints}
                        />
                        {isExceeded && (
                          <p className="text-xs text-red-500">
                            Cannot exceed available points
                          </p>
                        )}
                      </>
                    );
                  })()}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-300">Payment Method</h3>
                  <RadioGroup 
                    value={editedPaymentMethod} 
                    onValueChange={(value) => setEditedPaymentMethod(value as 'cash' | 'upi')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" className="text-purple-400" />
                      <Label htmlFor="cash" className="flex items-center gap-1 cursor-pointer">
                        <Wallet className="h-4 w-4" /> Cash
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="upi" className="text-purple-400" />
                      <Label htmlFor="upi" className="flex items-center gap-1 cursor-pointer">
                        <CreditCard className="h-4 w-4" /> UPI
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
              
              <div className="flex justify-between pt-4 border-t border-gray-700 mt-4">
                <div>
                  <p className="text-gray-400 text-sm">
                    Subtotal: <span className="text-white">
                      <CurrencyDisplay amount={calculateUpdatedBill().subtotal} />
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Discount ({editedDiscountType === 'percentage' ? `${editedDiscount}%` : 'fixed'}): 
                    <span className="text-white ml-1">
                      <CurrencyDisplay amount={calculateUpdatedBill().discountValue} />
                    </span>
                  </p>
                  <p className="text-gray-400 text-sm">
                    Points Used: <span className="text-white">{editedLoyaltyPointsUsed}</span>
                  </p>
                </div>
                <div>
                  <p className="text-lg font-semibold">
                    Total: <CurrencyDisplay amount={calculateUpdatedBill().total} />
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-4 border-t border-gray-700 mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-gray-700 text-white hover:bg-gray-600">
              Cancel
            </Button>
            <Button 
              className="bg-cuephoria-purple hover:bg-cuephoria-purple/80 text-white"
              onClick={handleSaveChanges}
              disabled={isSaving || (() => {
                if (!selectedBill) return true;
                const customer = customers.find(c => c.id === selectedBill.customerId);
                return isLoyaltyPointsExceeded(editedLoyaltyPointsUsed, customer);
              })()}
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Item Dialog */}
      <Dialog open={isAddItemDialogOpen} onOpenChange={(open) => {
        setIsAddItemDialogOpen(open);
        if (!open) {
          setIsDropdownOpen(false); // Ensure dropdown closes when dialog closes
        }
      }}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
            <DialogDescription className="text-gray-400">
              Add a product from your inventory to this transaction.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="product-select" className="text-sm font-medium">Select Product</label>
              <div className="relative">
                <Command className="rounded-lg border border-gray-600 overflow-visible bg-gray-700">
                  <CommandInput 
                    placeholder={selectedProductName || "Search products..."}
                    value={productSearchQuery}
                    onValueChange={setProductSearchQuery}
                    className="text-white"
                    onFocus={() => setIsDropdownOpen(true)}
                  />
                  <CommandList open={isDropdownOpen} className="text-white">
                    <CommandEmpty className="py-6 text-center text-sm text-gray-400">
                      No products match your search
                    </CommandEmpty>
                    <CommandGroup>
                      <ScrollArea className="h-72 w-full" type="always">
                        {filteredProducts.map(product => (
                          <CommandItem 
                            key={product.id} 
                            value={product.id}
                            onSelect={() => handleProductSelect(product.id)}
                            className={`py-2 ${selectedProductId === product.id ? 'bg-gray-600' : ''}`}
                          >
                            <div className="flex flex-col">
                              <span>{product.name}</span>
                              <span className="text-xs text-gray-400">
                                Price: <CurrencyDisplay amount={product.price} /> | 
                                Category: {product.category} | 
                                Stock: {product.stock}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </ScrollArea>
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
              {selectedProductName && (
                <p className="text-xs text-green-400 mt-1">
                  Selected: {selectedProductName}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <label htmlFor="item-quantity" className="text-sm font-medium">Quantity</label>
              <Input 
                id="item-quantity"
                type="number" 
                value={newItemQuantity} 
                onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                className="bg-gray-700 border-gray-600 text-white"
                min="1"
                max={availableStock}
              />
              {selectedProductId && (
                <p className="text-xs text-gray-400 mt-1">
                  Available stock: {availableStock}
                </p>
              )}
            </div>
            
            {selectedProductId && (
              <div className="border border-gray-700 rounded p-2 bg-gray-700/30 mt-2">
                <h5 className="text-xs font-medium mb-1">Selected Product</h5>
                {(() => {
                  const product = products.find(p => p.id === selectedProductId);
                  if (!product) return <p className="text-xs text-gray-400">Product not found</p>;
                  
                  return (
                    <div className="space-y-1 text-xs">
                      <p><span className="text-gray-400">Name:</span> {product.name}</p>
                      <p><span className="text-gray-400">Price:</span> <CurrencyDisplay amount={product.price} /></p>
                      <p><span className="text-gray-400">Category:</span> {product.category}</p>
                      <p><span className="text-gray-400">Stock:</span> {product.stock}</p>
                      <p><span className="text-gray-400">Total:</span> <CurrencyDisplay amount={product.price * newItemQuantity} /></p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
          
          <DialogFooter className="pt-4 border-t border-gray-700 mt-4">
            <Button variant="outline" onClick={() => {
              setIsAddItemDialogOpen(false);
              setIsDropdownOpen(false);
            }} className="bg-gray-700 text-white hover:bg-gray-600">
              Cancel
            </Button>
            <Button 
              className="bg-cuephoria-purple hover:bg-cuephoria-purple/80 text-white"
              onClick={handleAddNewItem}
              disabled={!selectedProductId || newItemQuantity < 1 || newItemQuantity > availableStock}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentTransactions;
