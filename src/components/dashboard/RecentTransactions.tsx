
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { User, Trash2, Calendar, AlertTriangle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const RecentTransactions: React.FC = () => {
  const { bills, customers, deleteBill } = usePOS();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
  
  // Sort bills by date (newest first)
  const sortedBills = [...bills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Get filtered bills based on date range if present
  const filteredBills = startDate && endDate 
    ? sortedBills.filter(bill => {
        const billDate = new Date(bill.createdAt);
        return billDate >= startDate && billDate <= endDate;
      })
    : sortedBills;
  
  // Get the 5 most recent transactions
  const recentBills = filteredBills.slice(0, 5);
  
  const handleDeleteClick = (bill: Bill) => {
    setBillToDelete(bill);
    setIsConfirmOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!billToDelete) return;
    
    setIsDeleting(true);
    try {
      await deleteBill(billToDelete.id, billToDelete.customerId);
      // Clear state before closing dialogs
      setBillToDelete(null);
    } catch (error) {
      console.error("Error deleting bill:", error);
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };

  const handleDeleteAllInRange = async () => {
    if (!startDate || !endDate) return;
    
    setIsDeleting(true);
    try {
      const billsToDelete = filteredBills;
      let deleteSuccessCount = 0;
      
      for (const bill of billsToDelete) {
        const success = await deleteBill(bill.id, bill.customerId);
        if (success) deleteSuccessCount++;
      }
      
      // Reset state
      setStartDate(undefined);
      setEndDate(undefined);
    } catch (error) {
      console.error("Error deleting bills in range:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteAllOpen(false);
    }
  };
  
  const clearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
  };
  
  return (
    <>
      <Card className="bg-[#1A1F2C] border-gray-700 shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl font-bold text-white font-heading">Recent Transactions</CardTitle>
            <CardDescription className="text-gray-400">Latest sales and billing information</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-gray-600 text-gray-300 hover:text-white"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate && endDate ? (
                    <span>
                      {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
                    </span>
                  ) : (
                    <span>Date Range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="end">
                <div className="p-3 border-b border-gray-700 flex justify-between items-center">
                  <h4 className="text-sm font-medium text-white">Select Range</h4>
                  {(startDate || endDate) && (
                    <Button variant="ghost" size="sm" onClick={clearDateRange} className="h-7 text-xs text-gray-400 hover:text-white">
                      Clear
                    </Button>
                  )}
                </div>
                <CalendarComponent
                  mode="range"
                  selected={{
                    from: startDate,
                    to: endDate,
                  }}
                  onSelect={(range) => {
                    setStartDate(range?.from);
                    setEndDate(range?.to);
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            
            {startDate && endDate && (
              <AlertDialog open={isDeleteAllOpen} onOpenChange={setIsDeleteAllOpen}>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive"
                    disabled={isDeleting || filteredBills.length === 0}
                    className="space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete All</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-800 border-gray-700 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Delete All Transactions
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-300">
                      Are you sure you want to delete all {filteredBills.length} transactions between {format(startDate, 'PP')} and {format(endDate, 'PP')}?
                      <div className="mt-4 p-2 bg-red-900/30 border border-red-800 rounded-md text-red-300">
                        This will revert all sales, update inventory, and adjust customer loyalty points for all affected transactions. This action cannot be undone.
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600" disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteAllInRange}
                      className="bg-red-600 hover:bg-red-700"
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete All Transactions"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        
        {startDate && endDate && (
          <div className="px-6 pt-1 pb-2">
            <Badge variant="outline" className="text-blue-400 border-blue-400/30 bg-blue-400/10">
              Filtered: {format(startDate, 'PP')} - {format(endDate, 'PP')} ({filteredBills.length} transactions)
            </Badge>
          </div>
        )}
        
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
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-center justify-center p-6 text-gray-400">
              <p>No transactions {startDate && endDate ? 'in selected date range' : 'recorded yet'}</p>
            </div>
          )}
        </CardContent>
        
        {filteredBills.length > 5 && (
          <CardFooter className="pt-0">
            <Button variant="link" className="text-purple-400 hover:text-purple-300 w-full">
              View All {filteredBills.length} Transactions
            </Button>
          </CardFooter>
        )}
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
            <AlertDialogCancel className="bg-gray-700 text-white hover:bg-gray-600" disabled={isDeleting}>Cancel</AlertDialogCancel>
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
