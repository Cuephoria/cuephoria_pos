
import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '@/context/POSContext';
import { format } from 'date-fns';
import { Bill } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Search, Edit, Trash2, Info, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import ReceiptContent from '@/components/receipt/ReceiptContent';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const BillReport = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { bills, customers, products, updateBill, deleteBill } = usePOS();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  
  // Log for debugging admin status
  useEffect(() => {
    console.log("Current user on BillReport page:", user);
    console.log("Is admin:", user?.isAdmin);
  }, [user]);
  
  // Filter bills based on search query
  const filteredBills = useMemo(() => {
    if (!searchQuery.trim()) return bills;
    
    const query = searchQuery.toLowerCase().trim();
    return bills.filter(bill => {
      const customer = customers.find(c => c.id === bill.customerId);
      if (!customer) return false;
      
      return (
        customer.name.toLowerCase().includes(query) || 
        customer.phone.includes(query) ||
        (customer.email && customer.email.toLowerCase().includes(query))
      );
    });
  }, [bills, customers, searchQuery]);
  
  // Handle bill update
  const handleUpdateBill = async (updatedBill: Bill) => {
    if (updateBill) {
      try {
        console.log("Attempting to update bill:", updatedBill);
        const success = await updateBill(updatedBill);
        console.log("Update bill result:", success);
        if (success) {
          setSelectedBillId(null);
          toast({
            title: "Success",
            description: "Bill updated successfully",
          });
        }
        return success;
      } catch (error) {
        console.error("Error updating bill:", error);
        toast({
          title: "Error",
          description: "Failed to update bill",
          variant: "destructive"
        });
        return false;
      }
    }
    return false;
  };
  
  // Handle bill deletion
  const handleDeleteBill = async (billId: string, customerId: string) => {
    if (deleteBill) {
      try {
        console.log("Attempting to delete bill:", billId, "for customer:", customerId);
        const success = await deleteBill(billId, customerId);
        console.log("Delete bill result:", success);
        if (success) {
          setSelectedBillId(null);
          toast({
            title: "Success",
            description: "Bill deleted successfully",
          });
        }
        return success;
      } catch (error) {
        console.error("Error deleting bill:", error);
        toast({
          title: "Error",
          description: "Failed to delete bill",
          variant: "destructive"
        });
        return false;
      }
    }
    return false;
  };
  
  return (
    <div className="p-6 bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
      </div>
      
      <div className="mb-6 bg-gray-100 rounded-lg p-1 flex gap-2 w-fit">
        <Button variant="default" className="bg-[#9b87f5] hover:bg-[#7E69AB]">
          Bills
        </Button>
        <Button variant="ghost" className="text-gray-600">
          Customers
        </Button>
        <Button variant="ghost" className="text-gray-600">
          Sessions
        </Button>
        <Button variant="ghost" className="text-gray-600">
          Summary
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-medium mb-2">
          Showing {filteredBills.length} transactions
        </h2>
        
        <div className="relative w-full mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Search by customer name, phone or email" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border border-gray-200"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow className="border-b border-gray-300">
              <TableHead className="text-gray-700 font-semibold py-3">Date & Time</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Bill ID</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Customer</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Items</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Subtotal</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Discount</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Points Used</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Total</TableHead>
              <TableHead className="text-gray-700 font-semibold py-3">Payment</TableHead>
              {user?.isAdmin && <TableHead className="text-gray-700 font-semibold py-3">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map(bill => {
              const billDate = new Date(bill.createdAt);
              const customer = customers.find(c => c.id === bill.customerId);
              const firstItemName = bill.items.length > 0 ? bill.items[0].name : '';
              const itemCount = bill.items.length;
              
              return (
                <TableRow key={bill.id} className="hover:bg-gray-50 border-b border-gray-200">
                  <TableCell className="py-4">
                    <div>{format(billDate, 'd MMM yyyy')}</div>
                    <div className="text-gray-500">{format(billDate, 'HH:mm')}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{bill.id.substring(0, 8)}...</TableCell>
                  <TableCell>{customer?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help">
                            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                            {bill.items.length > 0 && (
                              <span className="text-gray-500 text-xs max-w-[120px] truncate">
                                {firstItemName}
                              </span>
                            )}
                            <Info className="h-3.5 w-3.5 text-gray-400 ml-1" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="w-72 p-3">
                          <div className="font-semibold mb-2">All Items:</div>
                          <ul className="text-sm space-y-1.5">
                            {bill.items.map((item, index) => (
                              <li key={`${bill.id}-item-${index}`} className="flex justify-between">
                                <span className="mr-2">{item.name}</span>
                                <span className="text-gray-600">
                                  {item.quantity} x <CurrencyDisplay amount={item.price} />
                                </span>
                              </li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={bill.subtotal} />
                  </TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={bill.discountValue || 0} />
                  </TableCell>
                  <TableCell>{bill.loyaltyPointsUsed || 0}</TableCell>
                  <TableCell className="font-semibold">
                    <CurrencyDisplay amount={bill.total} />
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      bill.paymentMethod === 'upi'
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-green-100 text-green-800 border-green-300"
                    }>
                      {bill.paymentMethod === 'upi' ? 'UPI' : 'Cash'}
                    </Badge>
                  </TableCell>
                  {user?.isAdmin && (
                    <TableCell>
                      <div className="flex space-x-2">
                        <Dialog 
                          open={selectedBillId === bill.id} 
                          onOpenChange={(open) => {
                            if (!open) setSelectedBillId(null);
                            if (open) setSelectedBillId(bill.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => console.log("Edit button clicked for bill:", bill.id)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit bill</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Edit Bill</DialogTitle>
                            </DialogHeader>
                            {selectedBillId && (
                              <ReceiptContent 
                                bill={bills.find(b => b.id === selectedBillId)!} 
                                customer={customers.find(c => c.id === bills.find(b => b.id === selectedBillId)?.customerId)!}
                                receiptRef={React.createRef()}
                                onUpdateBill={handleUpdateBill}
                                onDeleteBill={handleDeleteBill}
                                products={products}
                                allowAddProducts={true}
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => console.log("Delete button clicked for bill:", bill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete bill</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Bill</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this bill? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700" 
                                onClick={() => bill.id && handleDeleteBill(bill.id, bill.customerId)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            
            {filteredBills.length === 0 && (
              <TableRow>
                <TableCell colSpan={user?.isAdmin ? 10 : 9} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    <p className="text-lg font-medium">No bills available</p>
                    {searchQuery ? (
                      <>
                        <p className="text-sm">No transactions found matching "{searchQuery}"</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm">No transactions found</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default BillReport;
