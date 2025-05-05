
import React, { useState, useEffect, useMemo } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { usePOS } from '@/context/POSContext';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { CurrencyDisplay } from '@/components/ui/currency';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Download, Edit, Info, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Calendar } from '@/components/ui/calendar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import BusinessSummaryReport from '@/components/dashboard/BusinessSummaryReport';
import { useSessionsData } from '@/hooks/stations/useSessionsData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ReceiptContent from '@/components/receipt/ReceiptContent';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Reports: React.FC = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { expenses, businessSummary } = useExpenses();
  const { customers, bills, products, exportBills, exportCustomers, stations, updateBill, deleteBill } = usePOS();
  const { sessions, sessionsLoading, deleteSession } = useSessionsData();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [dateRangeKey, setDateRangeKey] = useState<string>('30days');
  
  const [activeTab, setActiveTab] = useState<'bills' | 'customers' | 'sessions' | 'summary'>('bills');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [selectedBill, setSelectedBill] = useState<string | null>(null);
  
  // Log for debugging admin status
  useEffect(() => {
    console.log("Current user on Reports page:", user);
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
  
  // Memoize filtered data to prevent recalculation on every render
  const filteredData = useMemo(() => {
    // Filter function applied to any collection with createdAt
    const filterByDateRange = <T extends { createdAt: Date | string }>(items: T[]): T[] => {
      if (!date?.from && !date?.to) return items;
      
      return items.filter(item => {
        const itemDate = item.createdAt instanceof Date 
          ? item.createdAt 
          : new Date(item.createdAt);
        
        if (date?.from && date?.to) {
          return itemDate >= date.from && itemDate <= date.to;
        } else if (date?.from) {
          return itemDate >= date.from;
        } else if (date?.to) {
          return itemDate <= date.to;
        }
        
        return true;
      });
    };

    // Apply filters to all datasets at once
    let filteredCustomers = filterByDateRange(customers);
    let filteredBills = filterByDateRange(bills);
    
    // Filter sessions (special case since sessions use startTime instead of createdAt)
    let filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.startTime);
      
      if (date?.from && date?.to) {
        return sessionDate >= date.from && sessionDate <= date.to;
      } else if (date?.from) {
        return sessionDate >= date.from;
      } else if (date?.to) {
        return sessionDate <= date.to;
      }
      
      return true;
    });
    
    // Apply search filtering for bills and customers
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      // For bills tab, filter by customer information
      if (activeTab === 'bills') {
        filteredBills = filteredBills.filter(bill => {
          const customer = customers.find(c => c.id === bill.customerId);
          if (!customer) return false;
          
          return (
            customer.name.toLowerCase().includes(query) || 
            customer.phone.includes(query) ||
            (customer.email && customer.email.toLowerCase().includes(query))
          );
        });
      }
      
      // For customers tab, filter by customer information
      if (activeTab === 'customers') {
        filteredCustomers = filteredCustomers.filter(customer => 
          customer.name.toLowerCase().includes(query) || 
          customer.phone.includes(query) ||
          (customer.email && customer.email.toLowerCase().includes(query))
        );
      }
      
      // For sessions tab, filter by customer associated with the session
      filteredSessions = filteredSessions.filter(session => {
        const customer = customers.find(c => c.id === session.customerId);
        if (!customer) return false;
        
        return (
          customer.name.toLowerCase().includes(query) ||
          customer.phone.includes(query) ||
          (customer.email && customer.email.toLowerCase().includes(query))
        );
      });
    }
    
    return { 
      filteredCustomers, 
      filteredBills, 
      filteredSessions 
    };
  }, [bills, customers, sessions, date, searchQuery, activeTab]);
  
  // Function to handle bill update
  const handleUpdateBill = async (updatedBill) => {
    console.log("Attempting to update bill:", updatedBill);
    if (updateBill) {
      try {
        const success = await updateBill(updatedBill);
        console.log("Bill update result:", success);
        if (success) {
          setSelectedBill(null);
          toast({
            title: "Success",
            description: "Bill updated successfully",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to update bill",
            variant: "destructive"
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
  
  // Function to handle bill deletion
  const handleDeleteBill = async (billId, customerId) => {
    console.log("Attempting to delete bill:", billId, "for customer:", customerId);
    if (deleteBill) {
      try {
        const success = await deleteBill(billId, customerId);
        console.log("Bill deletion result:", success);
        if (success) {
          setSelectedBill(null);
          toast({
            title: "Success",
            description: "Bill deleted successfully",
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete bill",
            variant: "destructive"
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
  
  // Render bills tab
  const renderBillsTab = () => (
    <div className="bg-background rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-1">Transaction History</h2>
            <p className="text-gray-500">
              Showing {filteredData.filteredBills.length} transactions 
              {date?.from && date?.to ? 
                ` from ${format(date.from, 'MMM d, yyyy')} to ${format(date.to, 'MMM d, yyyy')}` : 
                ''
              }
            </p>
          </div>
        </div>
        
        {/* Search bar for bills */}
        <div className="mb-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search by customer name, phone or email" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-500 mt-2">
              Found {filteredData.filteredBills.length} matching transactions
            </p>
          )}
        </div>
      </div>
      
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
          {filteredData.filteredBills.map(bill => {
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
                      <TooltipContent className="w-60 p-2">
                        <div className="font-semibold mb-1">All Items:</div>
                        <ul className="text-sm space-y-1">
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
                        open={selectedBill === bill.id} 
                        onOpenChange={(open) => {
                          if (!open) setSelectedBill(null);
                          if (open) setSelectedBill(bill.id);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit bill</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Edit Bill</DialogTitle>
                          </DialogHeader>
                          {selectedBill && (
                            <ReceiptContent 
                              bill={bills.find(b => b.id === selectedBill)!} 
                              customer={customers.find(c => c.id === bills.find(b => b.id === selectedBill)?.customerId)!}
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
          
          {filteredData.filteredBills.length === 0 && (
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
                    <p className="text-sm">No transactions found in the selected date range</p>
                  )}
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
  
  // Render customers tab
  const renderCustomersTab = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">Customer List</h2>
              <p className="text-gray-500">
                Showing {filteredData.filteredCustomers.length} customers 
                {date?.from && date?.to ? 
                  ` from ${format(date.from, 'MMM d, yyyy')} to ${format(date.to, 'MMM d, yyyy')}` : 
                  ''
                }
              </p>
            </div>
            
            <Button
              onClick={exportCustomers}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export Customers
            </Button>
          </div>
          
          {/* Search bar for customers */}
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Search by customer name, phone or email" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                Found {filteredData.filteredCustomers.length} matching customers
              </p>
            )}
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date Added</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Membership</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.filteredCustomers.map(customer => {
              const customerDate = new Date(customer.createdAt);
              
              return (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>{format(customerDate, 'd MMM yyyy')}</div>
                    <div className="text-gray-500">{format(customerDate, 'HH:mm')}</div>
                  </TableCell>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.email || 'N/A'}</TableCell>
                  <TableCell>
                    {customer.isMember ? (
                      <Badge variant="default">Member</Badge>
                    ) : (
                      <Badge variant="outline">Guest</Badge>
                    )}
                  </TableCell>
                  <TableCell>{customer.loyaltyPoints || 0}</TableCell>
                </TableRow>
              );
            })}
            
            {filteredData.filteredCustomers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16 text-gray-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" x2="22" y1="8" y2="8"/><line x1="18" x2="22" y1="14" y2="14"/></svg>
                    <p className="text-lg font-medium">No customers available</p>
                    {searchQuery ? (
                      <>
                        <p className="text-sm">No customers found matching "{searchQuery}"</p>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm">No customers found in the selected date range</p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  };
  
  // Render sessions tab
  const renderSessionsTab = () => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Session History</h2>
          
          {/* Search bar for sessions */}
          <div className="mb-4 relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input 
                placeholder="Search by customer name, phone or email" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-2">
                Found {filteredData.filteredSessions.length} matching sessions
              </p>
            )}
          </div>
          
          {sessionsLoading ? (
            <p>Loading sessions...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Station</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.filteredSessions.map(session => {
                  const startTime = new Date(session.startTime);
                  const endTime = session.endTime ? new Date(session.endTime) : null;
                  const duration = endTime ? (endTime.getTime() - startTime.getTime()) : 0;
                  const durationInMinutes = Math.round(duration / 60000);
                  
                  const station = stations.find(s => s.id === session.stationId);
                  const customer = customers.find(c => c.id === session.customerId);
                  
                  return (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>{format(startTime, 'd MMM yyyy')}</div>
                        <div className="text-gray-500">{format(startTime, 'HH:mm')}</div>
                      </TableCell>
                      <TableCell>
                        {endTime ? (
                          <>
                            <div>{format(endTime, 'd MMM yyyy')}</div>
                            <div className="text-gray-500">{format(endTime, 'HH:mm')}</div>
                          </>
                        ) : 'In Progress'}
                      </TableCell>
                      <TableCell>{station?.name || 'Unknown'}</TableCell>
                      <TableCell>{customer?.name || 'Unknown'}</TableCell>
                      <TableCell>{durationInMinutes} minutes</TableCell>
                      <TableCell>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete session</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Session</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this session? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600" 
                                onClick={() => session.id && deleteSession(session.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
                
                {filteredData.filteredSessions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16 text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="9" x2="15" y1="9" y2="9"/><line x1="9" x2="15" y1="15" y2="15"/></svg>
                        <p className="text-lg font-medium">No sessions available</p>
                        {searchQuery ? (
                          <>
                            <p className="text-sm">No sessions found matching "{searchQuery}"</p>
                            <Button 
                              variant="outline" 
                              className="mt-2"
                              onClick={() => setSearchQuery('')}
                            >
                              Clear search
                            </Button>
                          </>
                        ) : (
                          <p className="text-sm">No sessions found in the selected date range</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    );
  };
  
  // Render summary tab
  const renderSummaryTab = () => {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-4">Business Summary</h2>
        <BusinessSummaryReport 
          startDate={date?.from} 
          endDate={date?.to}
          onDownload={() => exportBills()} 
        />
      </div>
    );
  };
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Reports</h1>
        
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="h-4 w-4" />
                {date?.from && date?.to ? 
                  `${format(date.from, 'MMM d')} - ${format(date.to, 'MMM d')}` : 
                  "Date Range"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={setDate}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
          
          <Select value={dateRangeKey} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="thisMonth">This month</SelectItem>
              <SelectItem value="lastMonth">Last month</SelectItem>
              <SelectItem value="thisYear">This year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={() => setDate(undefined)}>
            Reset
          </Button>
          
          <Button
            onClick={exportBills}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-1 flex gap-2 w-fit">
        <Button 
          onClick={() => setActiveTab('bills')}
          variant={activeTab === 'bills' ? 'default' : 'ghost'} 
          className={activeTab === 'bills' ? '' : 'text-gray-600'}
        >
          Bills
        </Button>
        <Button 
          onClick={() => setActiveTab('customers')}
          variant={activeTab === 'customers' ? 'default' : 'ghost'} 
          className={activeTab === 'customers' ? '' : 'text-gray-600'}
        >
          Customers
        </Button>
        <Button 
          onClick={() => setActiveTab('sessions')}
          variant={activeTab === 'sessions' ? 'default' : 'ghost'} 
          className={activeTab === 'sessions' ? '' : 'text-gray-600'}
        >
          Sessions
        </Button>
        <Button 
          onClick={() => setActiveTab('summary')}
          variant={activeTab === 'summary' ? 'default' : 'ghost'} 
          className={activeTab === 'summary' ? '' : 'text-gray-600'}
        >
          Summary
        </Button>
      </div>
      
      <div className="space-y-6">
        {activeTab === 'bills' && renderBillsTab()}
        {activeTab === 'customers' && renderCustomersTab()}
        {activeTab === 'sessions' && renderSessionsTab()}
        {activeTab === 'summary' && renderSummaryTab()}
      </div>
    </div>
  );
};

export default Reports;
