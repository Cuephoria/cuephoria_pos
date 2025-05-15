import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Bill, Customer, CartItem } from '@/types/pos.types';
import { MoreHorizontal, Receipt, ReceiptIndianRupee, Split } from 'lucide-react';
import { usePOS } from '@/context/POSContext';
import { toast } from '@/hooks/use-toast';
import ReceiptContent from '@/components/receipt/ReceiptContent';
import ReceiptSummary from '@/components/receipt/ReceiptSummary';

interface TransactionsProps {
  bills: Bill[];
  customers?: Customer[];
}

export const RecentTransactions: React.FC<TransactionsProps> = ({
  bills,
  customers = []
}) => {
  const { updateBill, deleteBill } = usePOS();
  const [viewingBill, setViewingBill] = useState<Bill | null>(null);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [editingItems, setEditingItems] = useState<CartItem[]>([]);
  const [deleteConfirmBill, setDeleteConfirmBill] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(0);
  const [editingDiscountType, setEditingDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [editingLoyaltyPoints, setEditingLoyaltyPoints] = useState(0);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<'cash' | 'upi' | 'split'>('cash');
  const [editingIsSplitPayment, setEditingIsSplitPayment] = useState(false);
  const [editingCashAmount, setEditingCashAmount] = useState(0);
  const [editingUpiAmount, setEditingUpiAmount] = useState(0);
  
  // Get customer information for a bill
  const getCustomer = (bill: Bill): Customer | undefined => {
    return customers.find(c => c.id === bill.customerId);
  };
  
  // Create a complete customer default object for when no customer is found
  const defaultCustomer: Customer = {
    id: "",
    name: "Unknown Customer",
    phone: "",
    email: undefined,
    isMember: false,
    loyaltyPoints: 0,
    totalSpent: 0,
    totalPlayTime: 0,
    createdAt: new Date()
  };
  
  // View receipt
  const handleViewReceipt = (bill: Bill) => {
    setViewingBill(bill);
  };
  
  // Edit receipt
  const handleEditBill = (bill: Bill) => {
    setEditingBill(bill);
    setEditingItems([...bill.items]);
    setEditingDiscount(bill.discount);
    setEditingDiscountType(bill.discountType);
    setEditingLoyaltyPoints(bill.loyaltyPointsUsed);
    setEditingPaymentMethod(bill.paymentMethod);
    setEditingIsSplitPayment(bill.isSplitPayment || false);
    setEditingCashAmount(bill.cashAmount || 0);
    setEditingUpiAmount(bill.upiAmount || 0);
  };
  
  // Delete receipt
  const handleDeleteClick = (bill: Bill) => {
    setDeleteConfirmBill(bill);
  };
  
  const handleConfirmDelete = async () => {
    if (!deleteConfirmBill) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteBill(deleteConfirmBill.id, deleteConfirmBill.customerId);
      if (result) {
        toast({
          title: 'Success',
          description: 'Transaction deleted successfully',
        });
        setDeleteConfirmBill(null);
      }
    } catch (error) {
      console.error('Error deleting bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete transaction',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Handle quantity changes in edit mode
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setEditingItems(prev => 
      prev.map(item => {
        if (item.id === itemId) {
          const newTotal = item.price * newQuantity;
          return { ...item, quantity: newQuantity, total: newTotal };
        }
        return item;
      })
    );
  };
  
  // Handle item removal in edit mode
  const handleRemoveItem = (itemId: string) => {
    setEditingItems(prev => prev.filter(item => item.id !== itemId));
  };
  
  // Calculate subtotal during editing
  const calculateSubtotal = () => {
    return editingItems.reduce((sum, item) => sum + item.total, 0);
  };
  
  // Calculate discount value during editing
  const calculateDiscountValue = () => {
    const subtotal = calculateSubtotal();
    if (editingDiscountType === 'percentage') {
      return subtotal * (editingDiscount / 100);
    }
    return editingDiscount;
  };
  
  // Calculate total during editing
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountValue = calculateDiscountValue();
    return Math.max(0, subtotal - discountValue - editingLoyaltyPoints);
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (method: 'cash' | 'upi' | 'split') => {
    setEditingPaymentMethod(method);
    
    if (method === 'split') {
      setEditingIsSplitPayment(true);
      
      // Set default 50/50 split
      const total = calculateTotal();
      const defaultCash = Math.floor(total / 2);
      setEditingCashAmount(defaultCash);
      setEditingUpiAmount(total - defaultCash);
    } else {
      setEditingIsSplitPayment(false);
      
      if (method === 'cash') {
        setEditingCashAmount(calculateTotal());
        setEditingUpiAmount(0);
      } else {
        setEditingCashAmount(0);
        setEditingUpiAmount(calculateTotal());
      }
    }
  };
  
  // Handle split payment changes
  const handleSplitAmountChange = (type: 'cash' | 'upi', amount: number) => {
    const total = calculateTotal();
    
    if (type === 'cash') {
      setEditingCashAmount(amount);
      setEditingUpiAmount(total - amount);
    } else {
      setEditingUpiAmount(amount);
      setEditingCashAmount(total - amount);
    }
  };
  
  // Determine if split payment amounts are valid
  const isSplitAmountsValid = () => {
    if (!editingIsSplitPayment) return true;
    
    const total = calculateTotal();
    return Math.abs((editingCashAmount + editingUpiAmount) - total) <= 0.01; // Allow small rounding errors
  };
  
  // Save edited bill
  const handleSaveBill = async () => {
    if (!editingBill) return;
    
    // Validate split payment amounts
    if (editingIsSplitPayment && !isSplitAmountsValid()) {
      toast({
        title: 'Invalid Split',
        description: 'Split payment amounts must equal the total',
        variant: 'destructive'
      });
      return;
    }
    
    const customer = getCustomer(editingBill);
    if (!customer) {
      toast({
        title: 'Error',
        description: 'Customer information not found',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const updatedBill = await updateBill(
        editingBill,
        editingItems,
        customer,
        editingDiscount,
        editingDiscountType,
        editingLoyaltyPoints,
        editingIsSplitPayment,
        editingCashAmount,
        editingUpiAmount
      );
      
      if (updatedBill) {
        toast({
          title: 'Success',
          description: 'Transaction updated successfully',
        });
        setEditingBill(null);
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      toast({
        title: 'Error',
        description: 'Failed to update transaction',
        variant: 'destructive'
      });
    }
  };
  
  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Render payment method with appropriate icon
  const renderPaymentMethod = (bill: Bill) => {
    if (bill.isSplitPayment) {
      return (
        <div className="flex items-center">
          <Split className="h-4 w-4 mr-1 text-cuephoria-purple" /> 
          <span>Split</span>
        </div>
      );
    } else if (bill.paymentMethod === 'cash') {
      return (
        <div className="flex items-center">
          <ReceiptIndianRupee className="h-4 w-4 mr-1 text-green-500" /> 
          <span>Cash</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center">
          <Receipt className="h-4 w-4 mr-1 text-blue-500" /> 
          <span>UPI</span>
        </div>
      );
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Split Details</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No transactions found.
                </TableCell>
              </TableRow>
            ) : (
              bills.map((bill) => {
                const customer = getCustomer(bill);
                return (
                  <TableRow key={bill.id} className="cursor-pointer hover:bg-gray-900/30">
                    <TableCell onClick={() => handleViewReceipt(bill)}>
                      <div className="font-medium">{formatDate(bill.createdAt)}</div>
                      <div className="text-sm text-muted-foreground">{formatTime(bill.createdAt)}</div>
                    </TableCell>
                    <TableCell onClick={() => handleViewReceipt(bill)}>
                      <div className="font-medium">{customer?.name || defaultCustomer.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                        {customer?.phone || "—"}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewReceipt(bill)}>
                      <div className="text-sm">
                        {bill.items.length} {bill.items.length === 1 ? "item" : "items"}
                      </div>
                    </TableCell>
                    <TableCell onClick={() => handleViewReceipt(bill)}>
                      {renderPaymentMethod(bill)}
                    </TableCell>
                    <TableCell onClick={() => handleViewReceipt(bill)}>
                      {bill.isSplitPayment ? (
                        <div className="text-sm">
                          <div>Cash: <CurrencyDisplay amount={bill.cashAmount || 0} /></div>
                          <div>UPI: <CurrencyDisplay amount={bill.upiAmount || 0} /></div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-mono font-medium" onClick={() => handleViewReceipt(bill)}>
                      <CurrencyDisplay amount={bill.total} />
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewReceipt(bill)}>
                            View Receipt
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditBill(bill)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500"
                            onClick={() => handleDeleteClick(bill)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Receipt View Dialog */}
      <Dialog open={!!viewingBill} onOpenChange={(open) => !open && setViewingBill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Transaction Receipt</DialogTitle>
            <DialogDescription>
              {viewingBill && formatDate(viewingBill.createdAt)} at {viewingBill && formatTime(viewingBill.createdAt)}
            </DialogDescription>
          </DialogHeader>
          
          {viewingBill && (
            <div className="space-y-4">
              <ReceiptContent 
                bill={viewingBill} 
                customer={getCustomer(viewingBill) || defaultCustomer}
                receiptRef={{ current: null }}
              />
              <ReceiptSummary 
                bill={viewingBill}
                customer={getCustomer(viewingBill)}
              />
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewingBill(null)}>Close</Button>
            {viewingBill && (
              <Button 
                variant="default" 
                className="bg-cuephoria-purple hover:bg-cuephoria-purple/90"
                onClick={() => {
                  setViewingBill(null);
                  handleEditBill(viewingBill);
                }}
              >
                Edit Receipt
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Transaction Dialog */}
      <Dialog open={!!editingBill} onOpenChange={(open) => !open && setEditingBill(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
            <DialogDescription>
              Make changes to this transaction
            </DialogDescription>
          </DialogHeader>
          
          {editingBill && (
            <div className="space-y-4">
              {/* Items List */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Items</h3>
                <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
                  {editingItems.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="flex items-center justify-between border-b border-gray-800 pb-2">
                      <div className="font-medium text-sm truncate max-w-[200px]">{item.name}</div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <span className="sr-only">Remove</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm">Discount</label>
                    <div className="flex mt-1">
                      <input
                        type="number"
                        className="w-full rounded-l px-3 py-1 bg-gray-800 border-r-0 border border-gray-700"
                        value={editingDiscount}
                        onChange={(e) => setEditingDiscount(parseFloat(e.target.value) || 0)}
                      />
                      <select
                        className="rounded-r px-2 py-1 bg-gray-800 border border-gray-700"
                        value={editingDiscountType}
                        onChange={(e) => setEditingDiscountType(e.target.value as 'percentage' | 'fixed')}
                      >
                        <option value="percentage">%</option>
                        <option value="fixed">₹</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm">Loyalty Points</label>
                    <input
                      type="number"
                      className="w-full mt-1 rounded px-3 py-1 bg-gray-800 border border-gray-700"
                      value={editingLoyaltyPoints}
                      onChange={(e) => setEditingLoyaltyPoints(parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm">Payment Method</label>
                  <div className="grid grid-cols-3 gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant={editingPaymentMethod === 'cash' && !editingIsSplitPayment ? 'default' : 'outline'}
                      className={editingPaymentMethod === 'cash' && !editingIsSplitPayment ? 'bg-cuephoria-purple hover:bg-cuephoria-purple/90' : ''}
                      onClick={() => handlePaymentMethodChange('cash')}
                    >
                      Cash
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editingPaymentMethod === 'upi' && !editingIsSplitPayment ? 'default' : 'outline'}
                      className={editingPaymentMethod === 'upi' && !editingIsSplitPayment ? 'bg-cuephoria-purple hover:bg-cuephoria-purple/90' : ''}
                      onClick={() => handlePaymentMethodChange('upi')}
                    >
                      UPI
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant={editingIsSplitPayment ? 'default' : 'outline'}
                      className={editingIsSplitPayment ? 'bg-cuephoria-purple hover:bg-cuephoria-purple/90' : ''}
                      onClick={() => handlePaymentMethodChange('split')}
                    >
                      Split
                    </Button>
                  </div>
                </div>
                
                {/* Split Payment Controls */}
                {editingIsSplitPayment && (
                  <div className="p-3 bg-gray-800/50 rounded-md border border-gray-700 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Total Amount:</span>
                        <CurrencyDisplay amount={calculateTotal()} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs">Cash Amount</label>
                        <input
                          type="number"
                          className="w-full rounded px-3 py-1 text-sm bg-gray-700 border border-gray-600"
                          value={editingCashAmount}
                          onChange={(e) => handleSplitAmountChange('cash', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs">UPI Amount</label>
                        <input
                          type="number"
                          className="w-full rounded px-3 py-1 text-sm bg-gray-700 border border-gray-600"
                          value={editingUpiAmount}
                          onChange={(e) => handleSplitAmountChange('upi', parseFloat(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                    
                    {!isSplitAmountsValid() && (
                      <div className="text-red-500 text-xs">
                        Split payment amounts must equal total: <CurrencyDisplay amount={calculateTotal()} />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const total = calculateTotal();
                          setEditingCashAmount(total);
                          setEditingUpiAmount(0);
                        }}
                      >
                        All Cash
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const total = calculateTotal();
                          const half = Math.floor(total / 2);
                          setEditingCashAmount(half);
                          setEditingUpiAmount(total - half);
                        }}
                      >
                        50/50
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const total = calculateTotal();
                          setEditingCashAmount(0);
                          setEditingUpiAmount(total);
                        }}
                      >
                        All UPI
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="pt-2">
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <CurrencyDisplay amount={calculateTotal()} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingBill(null)}>
              Cancel
            </Button>
            <Button 
              variant="default" 
              className="bg-cuephoria-purple hover:bg-cuephoria-purple/90"
              onClick={handleSaveBill}
              disabled={editingIsSplitPayment && !isSplitAmountsValid()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmBill} onOpenChange={(open) => !open && setDeleteConfirmBill(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete Transaction</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this transaction? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              onClick={() => setDeleteConfirmBill(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
