
import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '@/context/POSContext';
import { format } from 'date-fns';
import { Bill } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Search, Edit, Trash2 } from 'lucide-react';
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
import ReceiptContent from '@/components/receipt/ReceiptContent';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

const BillReport = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { bills, customers, updateBill, deleteBill } = usePOS();
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Bill Reports</h1>
        
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input 
            placeholder="Search by customer name, phone or email" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Bill ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Subtotal</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Points Used</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Payment</TableHead>
              {user?.isAdmin && <TableHead>Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map(bill => {
              const billDate = new Date(bill.createdAt);
              const customer = customers.find(c => c.id === bill.customerId);
              const firstItemName = bill.items.length > 0 ? bill.items[0].name : '';
              const itemCount = bill.items.length;
              
              return (
                <TableRow key={bill.id}>
                  <TableCell>
                    <div>{format(billDate, 'd MMM yyyy')}</div>
                    <div className="text-gray-500">{format(billDate, 'HH:mm')}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{bill.id.substring(0, 8)}...</TableCell>
                  <TableCell>{customer?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <div>{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
                    {bill.items.length > 0 && (
                      <div className="text-gray-500 text-xs">{firstItemName}</div>
                    )}
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
                    <Badge variant="outline" className={
                      bill.paymentMethod === 'upi'
                        ? "bg-blue-100 text-blue-800 border-blue-300"
                        : "bg-green-100 text-green-800 border-green-300"
                    }>
                      {bill.paymentMethod === 'upi' ? 'UPI' : 'Cash'}
                    </Badge>
                  </TableCell>
                  {user?.isAdmin && (
                    <TableCell>
                      <div className="flex space-x-1">
                        <Dialog 
                          open={selectedBillId === bill.id} 
                          onOpenChange={(open) => {
                            if (!open) setSelectedBillId(null);
                            if (open) setSelectedBillId(bill.id);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-blue-600"
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
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600"
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
                                className="bg-red-600" 
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
