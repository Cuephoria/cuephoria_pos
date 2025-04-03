
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Trash2, Calendar } from 'lucide-react';
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
import { Bill } from '@/types/pos.types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

const RecentTransactions: React.FC = () => {
  const { bills, customers, deleteBill } = usePOS();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  
  // Filter bills by date range if provided
  const filteredBills = bills.filter(bill => {
    if (!startDate && !endDate) return true;
    
    const billDate = new Date(bill.createdAt);
    
    if (startDate && endDate) {
      return billDate >= startDate && billDate <= endDate;
    } else if (startDate) {
      return billDate >= startDate;
    } else if (endDate) {
      return billDate <= endDate;
    }
    
    return true;
  });
  
  // Sort bills by date (newest first)
  const sortedBills = [...filteredBills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get the 5 most recent transactions
  const recentBills = sortedBills.slice(0, 5);
  
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
  
  const handleDeleteAllInRange = async () => {
    setIsDeleting(true);
    
    try {
      // Create a copy of the bills array to avoid issues during iteration
      const billsToDelete = [...filteredBills];
      let successCount = 0;
      
      for (const bill of billsToDelete) {
        const success = await deleteBill(bill.id, bill.customerId);
        if (success) {
          successCount++;
        }
      }
      
      // Reset the date range after deletion
      setStartDate(undefined);
      setEndDate(undefined);
      
    } catch (error) {
      console.error("Error deleting bills in range:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteAllOpen(false);
    }
  };
  
  const resetDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  return (
    <>
      <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white font-heading">Recent Transactions</CardTitle>
              <CardDescription className="text-gray-400">Latest sales and billing information</CardDescription>
            </div>
            <div className="flex space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 border-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {startDate || endDate ? (
                      <span className="text-xs">
                        {startDate ? format(startDate, 'PP') : 'Any'} - {endDate ? format(endDate, 'PP') : 'Any'}
                      </span>
                    ) : (
                      <span className="text-xs">Filter by date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="end">
                  <div className="p-3">
                    <div className="space-y-2">
                      <div>
                        <div className="text-xs font-medium mb-1 text-gray-400">Start Date</div>
                        <CalendarComponent
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          className="border rounded-md border-gray-700"
                        />
                      </div>
                      <div>
                        <div className="text-xs font-medium mb-1 text-gray-400">End Date</div>
                        <CalendarComponent
                          mode="single"
                          selected={endDate}
                          onSelect={setEndDate}
                          disabled={(date) => startDate ? date < startDate : false}
                          className="border rounded-md border-gray-700"
                        />
                      </div>
                      <div className="flex justify-between pt-2">
                        <Button size="sm" variant="ghost" onClick={resetDateRange}>Reset</Button>
                        {startDate || endDate ? (
                          <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={isDeleting}>
                                Delete All
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete All Transactions</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Are you sure you want to delete all {filteredBills.length} transactions 
                                  {startDate ? ` from ${format(startDate, 'PP')}` : ''}
                                  {endDate ? ` to ${format(endDate, 'PP')}` : ''}?
                                  This will revert all sales, update inventory, and adjust customer loyalty points. 
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600">Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={handleDeleteAllInRange}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? "Deleting..." : "Delete All"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentBills.length > 0 ? (
            recentBills.map(bill => {
              const customer = customers.find(c => c.id === bill.customerId);
              const date = new Date(bill.createdAt);
              
              return (
                <div key={bill.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800 border border-gray-700">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-[#6E59A5]/30 flex items-center justify-center">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
                      <p className="text-xs text-gray-400">
                        {date.toLocaleDateString()} {date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-white font-semibold">
                      <CurrencyDisplay amount={bill.total} />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      onClick={() => handleDeleteClick(bill)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center p-6 text-gray-400">
              <p>No transactions recorded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
      
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
    </>
  );
};

export default RecentTransactions;
