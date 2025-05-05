
import React, { useState, useEffect, useMemo } from 'react';
import { usePOS } from '@/context/POSContext';
import { format } from 'date-fns';
import { Bill } from '@/types/pos.types';
import { CurrencyDisplay } from '@/components/ui/currency';
import { Search, Edit, Trash2, Info, Calendar, Download } from 'lucide-react';
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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

const BillReport = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { bills, customers, updateBill, deleteBill, exportBills } = usePOS();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [dateRangeKey, setDateRangeKey] = useState<string>('30days');
  
  // Log for debugging admin status
  useEffect(() => {
    console.log("Current user on BillReport page:", user);
    console.log("Is admin:", user?.isAdmin);
  }, [user]);
  
  // Handle date range selection
  const handleDateRangeChange = (value: string) => {
    let fromDate: Date | undefined = undefined;
    let toDate: Date | undefined = new Date();
    
    switch (value) {
      case '7days':
        fromDate = new Date(new Date().setDate(new Date().getDate() - 7));
        break;
      case '30days':
        fromDate = new Date(new Date().setDate(new Date().getDate() - 30));
        break;
      case '90days':
        fromDate = new Date(new Date().setDate(new Date().getDate() - 90));
        break;
      case 'thisMonth':
        fromDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        break;
      case 'lastMonth':
        const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
        fromDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1);
        toDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0);
        break;
      case 'thisYear':
        fromDate = new Date(new Date().getFullYear(), 0, 1);
        break;
      default:
        break;
    }
    
    setDate(fromDate ? { from: fromDate, to: toDate } : undefined);
    setDateRangeKey(value);
  };
  
  // Filter bills based on search query and date range
  const filteredBills = useMemo(() => {
    if (!bills) return [];
    
    return bills.filter(bill => {
      // Filter by date range
      if (date?.from || date?.to) {
        const billDate = new Date(bill.createdAt);
        
        if (date?.from && date?.to) {
          if (billDate < date.from || billDate > date.to) return false;
        } else if (date?.from) {
          if (billDate < date.from) return false;
        } else if (date?.to) {
          if (billDate > date.to) return false;
        }
      }
      
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const customer = customers.find(c => c.id === bill.customerId);
        if (!customer) return false;
        
        return (
          customer.name.toLowerCase().includes(query) || 
          customer.phone.includes(query) ||
          (customer.email && customer.email.toLowerCase().includes(query))
        );
      }
      
      return true;
    });
  }, [bills, customers, searchQuery, date]);
  
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
    <div className="p-6 bg-[#121212] text-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Reports</h1>
        
        <div className="flex space-x-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                <Calendar className="h-4 w-4" />
                {date?.from && date?.to ? 
                  `${format(date.from, 'MMM d')} - ${format(date.to, 'MMM d')}` : 
                  "Date Range"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="end">
              <CalendarComponent
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
                className="bg-gray-800 text-white"
              />
            </PopoverContent>
          </Popover>
          
          <Select value={dateRangeKey} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
              <SelectItem value="thisYear">This year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            onClick={() => setDate(undefined)}
          >
            Reset
          </Button>
          
          <Button
            className="bg-purple-600 hover:bg-purple-700 gap-2"
            onClick={exportBills}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="mb-6 bg-gray-800 rounded-lg p-1 flex gap-2 w-fit">
        <Button variant="default" className="bg-[#9b87f5] hover:bg-[#7E69AB]">
          Bills
        </Button>
        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
          Customers
        </Button>
        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
          Sessions
        </Button>
        <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-gray-700">
          Summary
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-medium mb-2">
          Showing {filteredBills.length} transactions
          {date?.from && date?.to ? 
            ` from ${format(date.from, 'MMM d, yyyy')} to ${format(date.to, 'MMM d, yyyy')}` : 
            ''
          }
        </h2>
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search by customer name, phone or email" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
        </div>
      </div>
      
      <div className="rounded-lg overflow-hidden border border-gray-700">
        <Table className="border-collapse">
          <TableHeader className="bg-gray-800">
            <TableRow className="border-b border-gray-700 hover:bg-gray-700">
              <TableHead className="text-gray-300 font-medium py-3">Date & Time</TableHead>
              <TableHead className="text-gray-300 font-medium">Bill ID</TableHead>
              <TableHead className="text-gray-300 font-medium">Customer</TableHead>
              <TableHead className="text-gray-300 font-medium">Items</TableHead>
              <TableHead className="text-gray-300 font-medium">Subtotal</TableHead>
              <TableHead className="text-gray-300 font-medium">Discount</TableHead>
              <TableHead className="text-gray-300 font-medium">Points Used</TableHead>
              <TableHead className="text-gray-300 font-medium">Total</TableHead>
              <TableHead className="text-gray-300 font-medium">Payment</TableHead>
              {user?.isAdmin && <TableHead className="text-gray-300 font-medium">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBills.map(bill => {
              const billDate = new Date(bill.createdAt);
              const customer = customers.find(c => c.id === bill.customerId);
              const firstItemName = bill.items.length > 0 ? bill.items[0].name : '';
              const itemCount = bill.items.length;
              
              return (
                <TableRow key={bill.id} className="border-b border-gray-700 hover:bg-gray-800/50">
                  <TableCell className="py-4 text-gray-100">
                    <div>{format(billDate, 'd MMM yyyy')}</div>
                    <div className="text-gray-400">{format(billDate, 'HH:mm')}</div>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-gray-100">{bill.id.substring(0, 8)}...</TableCell>
                  <TableCell className="text-gray-100">{customer?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-1 cursor-help text-gray-100">
                            <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                            {bill.items.length > 0 && (
                              <span className="text-gray-400 text-xs max-w-[120px] truncate">
                                {firstItemName}
                              </span>
                            )}
                            <Info className="h-3.5 w-3.5 text-gray-400 ml-1" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="w-60 p-2 bg-gray-800 border-gray-700">
                          <div className="font-semibold mb-1 text-white">All Items:</div>
                          <ul className="text-sm space-y-1 text-gray-200">
                            {bill.items.map((item, index) => (
                              <li key={`${bill.id}-item-${index}`} className="flex justify-between">
                                <span className="mr-2">{item.name}</span>
                                <span className="text-gray-400">
                                  {item.quantity} x <CurrencyDisplay amount={item.price} />
                                </span>
                              </li>
                            ))}
                          </ul>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell className="text-gray-100">
                    <CurrencyDisplay amount={bill.subtotal} />
                  </TableCell>
                  <TableCell className="text-gray-100">
                    <CurrencyDisplay amount={bill.discountValue || 0} />
                  </TableCell>
                  <TableCell className="text-gray-100">{bill.loyaltyPointsUsed || 0}</TableCell>
                  <TableCell className="font-semibold text-gray-100">
                    <CurrencyDisplay amount={bill.total} />
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      bill.paymentMethod === 'upi'
                        ? "bg-blue-900/50 text-blue-300 border-blue-700"
                        : "bg-green-900/50 text-green-300 border-green-700"
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
                              className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                              onClick={() => console.log("Edit button clicked for bill:", bill.id)}
                            >
                              <Edit className="h-4 w-4" />
                              <span className="sr-only">Edit bill</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl bg-gray-900 border-gray-700">
                            <DialogHeader>
                              <DialogTitle className="text-white">Edit Bill</DialogTitle>
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
                              className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/30"
                              onClick={() => console.log("Delete button clicked for bill:", bill.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete bill</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-gray-900 border-gray-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-white">Delete Bill</AlertDialogTitle>
                              <AlertDialogDescription className="text-gray-300">
                                Are you sure you want to delete this bill? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">Cancel</AlertDialogCancel>
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
              <TableRow className="hover:bg-gray-800/50">
                <TableCell colSpan={user?.isAdmin ? 10 : 9} className="text-center py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    <p className="text-lg font-medium text-gray-300">No bills available</p>
                    {searchQuery ? (
                      <>
                        <p className="text-sm">No transactions found matching "{searchQuery}"</p>
                        <Button 
                          variant="outline" 
                          className="mt-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm">No transactions found in the selected date range</p>
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
