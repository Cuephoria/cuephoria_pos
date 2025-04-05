
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useExpenses } from '@/context/ExpenseContext';
import { usePOS } from '@/context/POSContext';
import { Calendar } from '@/components/ui/calendar';
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
import { CalendarIcon, Download, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import BusinessSummaryReport from '@/components/dashboard/BusinessSummaryReport';
import { useSessionsData } from '@/hooks/stations/useSessionsData';

const ReportsPage: React.FC = () => {
  const { expenses, businessSummary } = useExpenses();
  const { customers, bills, products, exportBills, exportCustomers } = usePOS();
  const { sessions, sessionsLoading, deleteSession } = useSessionsData();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [dateRangeKey, setDateRangeKey] = useState<string>('30days');
  
  const [activeTab, setActiveTab] = useState<'bills' | 'customers' | 'sessions' | 'summary'>('bills');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Handle date range selection from dropdown - memoized to prevent re-creation
  const handleDateRangeChange = useCallback((value: string) => {
    setDateRangeKey(value);
    
    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined = today;
    
    switch (value) {
      case '7days':
        from = new Date(today);
        from.setDate(today.getDate() - 7);
        break;
      case '30days':
        from = new Date(today);
        from.setDate(today.getDate() - 30);
        break;
      case '90days':
        from = new Date(today);
        from.setDate(today.getDate() - 90);
        break;
      case 'year':
        from = new Date(today.getFullYear(), 0, 1); // Start of current year
        break;
      case 'custom':
        // Keep the current date range for custom
        from = date?.from;
        to = date?.to;
        break;
      default:
        from = new Date(today);
        from.setDate(today.getDate() - 30);
    }
    
    setDate({ from, to });
  }, [date]);
  
  // Memoize the date range string to prevent unnecessary re-renders
  const dateRangeString = useMemo(() => {
    if (date?.from && date?.to) {
      return `${format(date.from, 'dd MMM yyyy')} - ${format(date.to, 'dd MMM yyyy')}`;
    }
    return 'Select date range';
  }, [date]);
  
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
    const filteredCustomers = filterByDateRange(customers);
    const filteredBills = filterByDateRange(bills);
    
    // Filter sessions (special case since sessions use startTime instead of createdAt)
    let filteredSessions = sessions.filter(session => {
      if (!date?.from && !date?.to) return true;
      
      const startTime = new Date(session.startTime);
      
      if (date?.from && date?.to) {
        return startTime >= date.from && startTime <= date.to;
      } else if (date?.from) {
        return startTime >= date.from;
      } else if (date?.to) {
        return startTime <= date.to;
      }
      
      return true;
    });
    
    // Apply search filtering if search query exists
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredSessions = filteredSessions.filter(session => {
        const customer = customers.find(c => c.id === session.customerId);
        if (!customer) return false;
        
        return (
          customer.name.toLowerCase().includes(query) || 
          (customer.email && customer.email.toLowerCase().includes(query)) || 
          customer.phone.includes(query)
        );
      });
    }
    
    return { 
      filteredCustomers, 
      filteredBills, 
      filteredSessions 
    };
  }, [bills, customers, sessions, date, searchQuery]);
  
  // Memoize customer lookup functions to prevent expensive recalculations
  const customerLookup = useMemo(() => {
    const lookup: Record<string, { 
      name: string, 
      email: string | undefined, 
      phone: string | undefined,
      playTime: string,
      totalSpent: number
    }> = {};
    
    // Pre-calculate play times and total spent for each customer
    customers.forEach(customer => {
      const customerSessions = filteredData.filteredSessions.filter(
        session => session.customerId === customer.id
      );
      
      const totalMinutes = customerSessions.reduce((total, session) => {
        if (session.endTime) {
          const start = new Date(session.startTime).getTime();
          const end = new Date(session.endTime).getTime();
          return total + (end - start) / (1000 * 60);
        }
        return total;
      }, 0);
      
      const hours = Math.floor(totalMinutes / 60);
      const minutes = Math.floor(totalMinutes % 60);
      const playTime = `${hours}h ${minutes}m`;
      
      const totalSpent = filteredData.filteredBills
        .filter(bill => bill.customerId === customer.id)
        .reduce((total, bill) => total + bill.total, 0);
      
      lookup[customer.id] = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        playTime,
        totalSpent
      };
    });
    
    return lookup;
  }, [customers, filteredData.filteredSessions, filteredData.filteredBills]);
  
  // Pre-calculate summary metrics once when filtered data changes
  const summaryMetrics = useMemo(() => calculateSummaryMetrics(), [filteredData]);
  
  // Function to handle downloading reports
  const handleDownloadReport = useCallback(() => {
    console.log('Downloading report with date range:', date);
    switch (activeTab) {
      case 'bills':
        exportBills();
        break;
      case 'customers':
        exportCustomers();
        break;
      default:
        // For other tabs, implement specific export functionality
        console.log(`Exporting ${activeTab} report`);
    }
  }, [activeTab, date, exportBills, exportCustomers]);
  
  // Handle session deletion - memoized to prevent re-creation
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    const success = await deleteSession(sessionId);
    if (success) {
      console.log(`Session ${sessionId} deleted successfully`);
    }
  }, [deleteSession]);
  
  // Calculate business summary metrics function
  function calculateSummaryMetrics() {
    const { filteredBills } = filteredData;
    
    // Financial metrics
    const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    const averageBillValue = filteredBills.length > 0 ? totalRevenue / filteredBills.length : 0;
    const totalDiscounts = filteredBills.reduce((sum, bill) => sum + (bill.discountValue || 0), 0);
    
    // Payment method breakdown
    const cashSales = filteredBills
      .filter(bill => bill.paymentMethod === 'cash')
      .reduce((sum, bill) => sum + bill.total, 0);
    
    const upiSales = filteredBills
      .filter(bill => bill.paymentMethod === 'upi')
      .reduce((sum, bill) => sum + bill.total, 0);
    
    // Operational metrics
    const totalTransactions = filteredBills.length;
    const activeSessions = sessions.filter(s => s.endTime === null).length;
    const completedSessions = filteredData.filteredSessions.filter(s => s.endTime !== null).length;
    
    // Find most popular product - reduce complexity by doing a single loop
    const productFrequency: Record<string, number> = {};
    let mostPopularProductId = '';
    let maxFrequency = 0;
    
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        const newFreq = (productFrequency[item.id] || 0) + item.quantity;
        productFrequency[item.id] = newFreq;
        
        if (newFreq > maxFrequency) {
          mostPopularProductId = item.id;
          maxFrequency = newFreq;
        }
      });
    });
    
    const mostPopularProduct = products.find(p => p.id === mostPopularProductId)?.name || 'None';
    
    // Customer metrics
    const totalCustomers = filteredData.filteredCustomers.length;
    const memberCount = filteredData.filteredCustomers.filter(c => c.isMember).length;
    const nonMemberCount = filteredData.filteredCustomers.filter(c => !c.isMember).length;
    
    // Loyalty metrics
    const loyaltyPointsUsed = filteredBills.reduce((sum, bill) => sum + (bill.loyaltyPointsUsed || 0), 0);
    const loyaltyPointsEarned = filteredBills.reduce((sum, bill) => sum + (bill.loyaltyPointsEarned || 0), 0);
    
    // Gaming metrics - calculate PS5 vs Pool revenue in one loop
    let ps5Sales = 0;
    let poolSales = 0;
    
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        if (item.type === 'session') {
          const itemName = item.name.toLowerCase();
          if (itemName.includes('ps5') || itemName.includes('playstation')) {
            ps5Sales += item.total;
          } else if (itemName.includes('pool') || itemName.includes('8-ball') || itemName.includes('8 ball')) {
            poolSales += item.total;
          }
        }
      });
    });
    
    return {
      financial: {
        totalRevenue,
        averageBillValue,
        totalDiscounts,
        cashSales,
        upiSales
      },
      operational: {
        totalTransactions,
        activeSessions,
        completedSessions,
        mostPopularProduct
      },
      customer: {
        totalCustomers,
        memberCount,
        nonMemberCount,
        loyaltyPointsUsed,
        loyaltyPointsEarned
      },
      gaming: {
        ps5Sales,
        poolSales
      }
    };
  }
  
  // Format duration in hours and minutes - a simple utility function
  const formatDuration = (durationInMinutes: number | undefined) => {
    if (!durationInMinutes) return "0h 0m";
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };
  
  // Use customer lookup for performance
  const getCustomerName = (customerId: string) => customerLookup[customerId]?.name || 'Unknown';
  const getCustomerEmail = (customerId: string) => customerLookup[customerId]?.email || '';
  const getCustomerPhone = (customerId: string) => customerLookup[customerId]?.phone || '';
  const getCustomerPlayTime = (customerId: string) => customerLookup[customerId]?.playTime || '0h 0m';
  const getCustomerTotalSpent = (customerId: string) => customerLookup[customerId]?.totalSpent || 0;
  
  // Only display a limited number of items at once for better performance
  const itemsPerPage = 50;
  const [currentPage, setCurrentPage] = useState(1);
  
  // Calculate paginated data for each tab
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    
    return {
      bills: filteredData.filteredBills.slice(startIdx, endIdx),
      customers: filteredData.filteredCustomers.slice(startIdx, endIdx),
      sessions: filteredData.filteredSessions.slice(startIdx, endIdx)
    };
  }, [currentPage, filteredData, itemsPerPage]);
  
  // Reset pagination when tab or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, date, searchQuery]);
  
  // Only render what's needed based on active tab
  const renderContent = () => {
    switch(activeTab) {
      case 'bills':
        return renderBillsTab();
      case 'customers':
        return renderCustomersTab();
      case 'sessions':
        return renderSessionsTab();
      case 'summary':
        return renderSummaryTab();
      default:
        return null;
    }
  };
  
  // Split rendering into separate functions for clarity and code organization
  const renderBillsTab = () => (
    <div className="bg-[#1A1F2C] border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-1">Transaction History</h2>
        <p className="text-gray-400">
          View all transactions 
          {date?.from && date?.to ? 
            ` from ${format(date.from, 'MMMM do, yyyy')} to ${format(date.to, 'MMMM do, yyyy')}` : 
            ''
          }
        </p>
        
        {filteredData.filteredBills.length > itemsPerPage && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Showing {Math.min(paginatedData.bills.length, itemsPerPage)} of {filteredData.filteredBills.length} transactions
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage * itemsPerPage >= filteredData.filteredBills.length}
                onClick={() => setCurrentPage(curr => curr + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-md overflow-hidden">
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.bills.map(bill => {
              const billDate = new Date(bill.createdAt);
              const firstItemName = bill.items.length > 0 ? bill.items[0].name : '';
              const itemCount = bill.items.length;
              
              return (
                <TableRow key={bill.id}>
                  <TableCell className="text-white">
                    <div>{format(billDate, 'd MMM yyyy')}</div>
                    <div className="text-gray-400">{format(billDate, 'HH:mm')} pm</div>
                  </TableCell>
                  <TableCell className="text-white font-mono text-xs">{bill.id.substring(0, 30)}</TableCell>
                  <TableCell className="text-white">{getCustomerName(bill.customerId)}</TableCell>
                  <TableCell className="text-white">
                    <div>{itemCount} item{itemCount !== 1 ? 's' : ''}</div>
                    {bill.items.length > 0 && (
                      <div className="text-gray-400 text-xs">{firstItemName}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-white">
                    <CurrencyDisplay amount={bill.subtotal} />
                  </TableCell>
                  <TableCell className="text-white">
                    <CurrencyDisplay amount={bill.discountValue || 0} />
                  </TableCell>
                  <TableCell className="text-white">{bill.loyaltyPointsUsed || 0}</TableCell>
                  <TableCell className="text-white font-semibold">
                    <CurrencyDisplay amount={bill.total} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      bill.paymentMethod === 'upi'
                        ? "bg-blue-900/30 text-blue-400 border-blue-800"
                        : "bg-green-900/30 text-green-400 border-green-800"
                    }>
                      {bill.paymentMethod === 'upi' ? 'UPI' : 'Cash'}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            
            {paginatedData.bills.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-16 text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 mb-2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
                    <p className="text-lg font-medium">No bills available</p>
                    <p className="text-sm">No transactions found in the selected date range</p>
                    {date?.from || date?.to ? (
                      <Button 
                        variant="outline" 
                        className="mt-2 text-purple-400 border-purple-800 hover:bg-purple-900/20"
                        onClick={() => setDate(undefined)}
                      >
                        Reset date filter
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  const renderCustomersTab = () => (
    <div className="bg-[#1A1F2C] border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-1">Customer Activity</h2>
        <p className="text-gray-400">
          View all customers and their activity
          {date?.from && date?.to ? 
            ` from ${format(date.from, 'MMMM do, yyyy')} to ${format(date.to, 'MMMM do, yyyy')}` : 
            ''
          }
        </p>
        
        {filteredData.filteredCustomers.length > itemsPerPage && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Showing {Math.min(paginatedData.customers.length, itemsPerPage)} of {filteredData.filteredCustomers.length} customers
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage * itemsPerPage >= filteredData.filteredCustomers.length}
                onClick={() => setCurrentPage(curr => curr + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Member Status</TableHead>
              <TableHead>Total Spent</TableHead>
              <TableHead>Play Time</TableHead>
              <TableHead>Loyalty Points</TableHead>
              <TableHead>Joined On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.customers.map(customer => (
              <TableRow key={customer.id}>
                <TableCell className="text-white font-medium">{customer.name}</TableCell>
                <TableCell className="text-white">
                  <div>{customer.phone}</div>
                  {customer.email && <div className="text-gray-400 text-xs">{customer.email}</div>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={customer.isMember ? 
                    "bg-purple-900/30 text-purple-400 border-purple-800" : 
                    "bg-gray-800/50 text-gray-400 border-gray-700"
                  }>
                    {customer.isMember ? "Member" : "Non-Member"}
                  </Badge>
                </TableCell>
                <TableCell className="text-white">
                  <CurrencyDisplay amount={getCustomerTotalSpent(customer.id)} />
                </TableCell>
                <TableCell className="text-white">{getCustomerPlayTime(customer.id)}</TableCell>
                <TableCell className="text-white">{customer.loyaltyPoints || 0}</TableCell>
                <TableCell className="text-white">{customer.createdAt ? format(new Date(customer.createdAt), 'd MMM yyyy') : 'N/A'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  const renderSessionsTab = () => (
    <div className="bg-[#1A1F2C] border border-gray-800 rounded-lg overflow-hidden">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-1">Session History</h2>
        <p className="text-gray-400">
          View all game sessions and their details
          {date?.from && date?.to ? 
            ` from ${format(date.from, 'MMMM do, yyyy')} to ${format(date.to, 'MMMM do, yyyy')}` : 
            ''
          }
        </p>
        
        {/* Search bar for sessions */}
        <div className="mt-4 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input 
              placeholder="Search by customer name, email or phone" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white w-full md:w-96"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-2">
              Found {filteredData.filteredSessions.length} matching sessions
            </p>
          )}
        </div>
        
        {filteredData.filteredSessions.length > itemsPerPage && (
          <div className="mt-4 flex justify-between items-center">
            <span className="text-sm text-gray-400">
              Showing {Math.min(paginatedData.sessions.length, itemsPerPage)} of {filteredData.filteredSessions.length} sessions
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentPage * itemsPerPage >= filteredData.filteredSessions.length}
                onClick={() => setCurrentPage(curr => curr + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      <div className="rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Station</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Start Time</TableHead>
              <TableHead>End Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.sessions.map(session => {
              // Calculate session duration properly
              let durationDisplay = "0h 1m"; // Default duration
              if (session.endTime) {
                const startMs = new Date(session.startTime).getTime();
                const endMs = new Date(session.endTime).getTime();
                const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
                const hours = Math.floor(durationMinutes / 60);
                const minutes = durationMinutes % 60;
                durationDisplay = `${hours}h ${minutes}m`;
              } else if (session.duration) {
                const hours = Math.floor(session.duration / 60);
                const minutes = session.duration % 60;
                durationDisplay = `${hours}h ${minutes}m`;
              }
                  
              return (
                <TableRow key={session.id}>
                  <TableCell className="text-white font-medium">{session.stationId}</TableCell>
                  <TableCell className="text-white">{getCustomerName(session.customerId)}</TableCell>
                  <TableCell className="text-white text-sm">
                    {getCustomerPhone(session.customerId)}
                    {getCustomerEmail(session.customerId) && <div className="text-gray-400">{getCustomerEmail(session.customerId)}</div>}
                  </TableCell>
                  <TableCell className="text-white">
                    <div>{format(new Date(session.startTime), 'd MMM yyyy')}</div>
                    <div className="text-gray-400">{format(new Date(session.startTime), 'HH:mm')}</div>
                  </TableCell>
                  <TableCell className="text-white">
                    {session.endTime ? (
                      <>
                        <div>{format(new Date(session.endTime), 'd MMM yyyy')}</div>
                        <div className="text-gray-400">{format(new Date(session.endTime), 'HH:mm')}</div>
                      </>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-white">{durationDisplay}</TableCell>
                  <TableCell>
                    <Badge className={
                      !session.endTime
                        ? "bg-green-900/30 text-green-400 border-green-800"
                        : "bg-gray-700 text-gray-300"
                    }>
                      {session.endTime ? 'Completed' : 'Active'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete session</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Session</AlertDialogTitle>
                          <AlertDialogDescription className="text-gray-400">
                            Are you sure you want to delete this session? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            className="bg-red-900 hover:bg-red-800 focus:ring-red-800" 
                            onClick={() => handleDeleteSession(session.id)}
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
            {paginatedData.sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-400">
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cuephoria-purple"></div>
                      <span className="ml-3">Loading sessions...</span>
                    </div>
                  ) : searchQuery ? (
                    <div>
                      <p>No sessions found matching "{searchQuery}"</p>
                      <Button 
                        variant="link" 
                        className="text-cuephoria-purple"
                        onClick={() => setSearchQuery('')}
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    "No sessions found in the selected date range"
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
  
  const renderSummaryTab = () => (
    <div className="space-y-8">
      <BusinessSummaryReport startDate={date?.from} endDate={date?.to} onDownload={handleDownloadReport} />
      
      <Card className="border-gray-800 bg-[#1A1F2C] shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white">Detailed Business Metrics</CardTitle>
          <CardDescription className="text-gray-400">
            Overview of key metrics 
            {date?.from && date?.to 
              ? ` from ${format(date.from, 'MMM do, yyyy')} to ${format(date.to, 'MMM do, yyyy')}` 
              : ''
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Financial Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Financial Metrics</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Revenue</span>
                  <span className="font-semibold text-white">
                    <CurrencyDisplay amount={summaryMetrics.financial.totalRevenue} />
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Average Bill Value</span>
                  <span className="font-semibold text-white">
                    <CurrencyDisplay amount={summaryMetrics.financial.averageBillValue} showDecimals />
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Discounts Given</span>
                  <span className="font-semibold text-white">
                    <CurrencyDisplay amount={summaryMetrics.financial.totalDiscounts} />
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Cash Sales</span>
                  <span className="font-semibold text-white">
                    <CurrencyDisplay amount={summaryMetrics.financial.cashSales} />
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">UPI Sales</span>
                  <span className="font-semibold text-white">
                    <CurrencyDisplay amount={summaryMetrics.financial.upiSales} />
                  </span>
                </div>
              </div>
            </div>
            
            {/* Operational Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Operational Metrics</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Transactions</span>
                  <span className="font-semibold text-white">{summaryMetrics.operational.totalTransactions}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Sessions</span>
                  <span className="font-semibold text-white">{summaryMetrics.operational.activeSessions}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Completed Sessions</span>
                  <span className="font-semibold text-white">{summaryMetrics.operational.completedSessions}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Most Popular Product</span>
                  <span className="font-semibold text-white">{summaryMetrics.operational.mostPopularProduct}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">PS5 Revenue</span>
                  <span className="font-semibold text-white">
                    <CurrencyDisplay amount={summaryMetrics.gaming.ps5Sales} />
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">8-Ball Revenue</span>
                  <span className="font-semibold text-white">
                    <CurrencyDisplay amount={summaryMetrics.gaming.poolSales} />
                  </span>
                </div>
              </div>
            </div>
            
            {/* Customer Metrics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Customer Metrics</h3>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Customers</span>
                  <span className="font-semibold text-white">{summaryMetrics.customer.totalCustomers}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Members</span>
                  <span className="font-semibold text-white">{summaryMetrics.customer.memberCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Non-Members</span>
                  <span className="font-semibold text-white">{summaryMetrics.customer.nonMemberCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Loyalty Points Used</span>
                  <span className="font-semibold text-white">{summaryMetrics.customer.loyaltyPointsUsed}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Loyalty Points Earned</span>
                  <span className="font-semibold text-white">{summaryMetrics.customer.loyaltyPointsEarned}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
  
  return (
    <div className="p-6 space-y-6 bg-[#1A1F2C] min-h-screen text-white">
      {/* Header with title, date range, and export button */}
      <div className="flex justify-between items-center pb-2">
        <h1 className="text-4xl font-bold">Reports</h1>
        <div className="flex items-center gap-4">
          <Select value={dateRangeKey} onValueChange={handleDateRangeChange}>
            <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Last 30 days" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-gray-800 border-gray-700 text-white">
                <CalendarIcon className="h-4 w-4" />
                {dateRangeString}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  if (newDate?.from && newDate?.to) {
                    setDateRangeKey('custom');
                  }
                }}
                numberOfMonths={2}
                className="p-3 pointer-events-auto bg-gray-800 text-white"
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleDownloadReport} className="gap-2 bg-purple-500 hover:bg-purple-600 text-white">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="bg-gray-800/60 rounded-lg p-1 flex gap-2 w-fit">
        <Button 
          onClick={() => setActiveTab('bills')}
          variant={activeTab === 'bills' ? 'default' : 'ghost'} 
          className={`gap-2 ${activeTab === 'bills' ? 'bg-gray-700' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          Bills
        </Button>
        <Button 
          onClick={() => setActiveTab('customers')}
          variant={activeTab === 'customers' ? 'default' : 'ghost'} 
          className={`gap-2 ${activeTab === 'customers' ? 'bg-gray-700' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Customers
        </Button>
        <Button 
          onClick={() => setActiveTab('sessions')}
          variant={activeTab === 'sessions' ? 'default' : 'ghost'} 
          className={`gap-2 ${activeTab === 'sessions' ? 'bg-gray-700' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Sessions
        </Button>
        <Button 
          onClick={() => setActiveTab('summary')}
          variant={activeTab === 'summary' ? 'default' : 'ghost'} 
          className={`gap-2 ${activeTab === 'summary' ? 'bg-gray-700' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          Summary
        </Button>
      </div>
      
      {/* Render only the content for the active tab */}
      <div className="space-y-6">
        {renderContent()}
      </div>
    </div>
  );
};

export default ReportsPage;
