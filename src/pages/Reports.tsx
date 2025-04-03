import React, { useState, useEffect } from 'react';
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CalendarIcon, Download, Trash2 } from 'lucide-react';
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
import { toast } from "sonner";
import BusinessSummaryReport from '@/components/dashboard/BusinessSummaryReport';

const ReportsPage: React.FC = () => {
  const { expenses, businessSummary } = useExpenses();
  const { customers, bills, sessions, products, exportBills, exportCustomers, deleteSession } = usePOS();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [dateRangeKey, setDateRangeKey] = useState<string>('30days');
  
  const [activeTab, setActiveTab] = useState<'bills' | 'customers' | 'sessions' | 'summary'>('bills');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<string | null>(null);
  
  const handleDateRangeChange = (value: string) => {
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
        from = date?.from;
        to = date?.to;
        break;
      default:
        from = new Date(today);
        from.setDate(today.getDate() - 30);
    }
    
    setDate({ from, to });
  };
  
  const handleDownloadReport = () => {
    console.log('Downloading report with date range:', date);
    switch (activeTab) {
      case 'bills':
        exportBills();
        break;
      case 'customers':
        exportCustomers();
        break;
      default:
        console.log(`Exporting ${activeTab} report`);
    }
  };
  
  const getDateRangeString = () => {
    if (date?.from && date?.to) {
      return `${format(date.from, 'dd MMM yyyy')} - ${format(date.to, 'dd MMM yyyy')}`;
    }
    return 'Select date range';
  };
  
  const filterByDateRange = <T extends { createdAt: Date | string }>(items: T[]): T[] => {
    return items.filter(item => {
      if (!date?.from && !date?.to) return true;
      
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
  
  const filteredCustomers = filterByDateRange(customers);
  const filteredBills = filterByDateRange(bills);
  
  const filteredSessions = sessions.filter(session => {
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
  
  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    
    try {
      const success = await deleteSession(sessionToDelete);
      
      if (success) {
        toast.success("Session deleted successfully");
      } else {
        toast.error("Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("An error occurred while deleting the session");
    } finally {
      setSessionToDelete(null);
      setDeleteDialogOpen(false);
    }
  };
  
  const confirmDeleteSession = (sessionId: string) => {
    setSessionToDelete(sessionId);
    setDeleteDialogOpen(true);
  };
  
  const calculateSummaryMetrics = () => {
    const totalRevenue = filteredBills.reduce((sum, bill) => sum + bill.total, 0);
    const averageBillValue = filteredBills.length > 0 ? totalRevenue / filteredBills.length : 0;
    const totalDiscounts = filteredBills.reduce((sum, bill) => sum + (bill.discountValue || 0), 0);
    
    const cashSales = filteredBills
      .filter(bill => bill.paymentMethod === 'cash')
      .reduce((sum, bill) => sum + bill.total, 0);
    
    const upiSales = filteredBills
      .filter(bill => bill.paymentMethod === 'upi')
      .reduce((sum, bill) => sum + bill.total, 0);
    
    const totalTransactions = filteredBills.length;
    const activeSessions = sessions.filter(s => s.endTime === null).length;
    const completedSessions = filteredSessions.filter(s => s.endTime !== null).length;
    
    const productFrequency: Record<string, number> = {};
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        if (productFrequency[item.id]) {
          productFrequency[item.id] += item.quantity;
        } else {
          productFrequency[item.id] = item.quantity;
        }
      });
    });
    
    let mostPopularProductId = '';
    let maxFrequency = 0;
    
    Object.entries(productFrequency).forEach(([productId, frequency]) => {
      if (frequency > maxFrequency) {
        mostPopularProductId = productId;
        maxFrequency = frequency;
      }
    });
    
    const mostPopularProduct = products.find(p => p.id === mostPopularProductId)?.name || 'None';
    
    const totalCustomers = filteredCustomers.length;
    const memberCount = filteredCustomers.filter(c => c.isMember).length;
    const nonMemberCount = filteredCustomers.filter(c => !c.isMember).length;
    
    const loyaltyPointsUsed = filteredBills.reduce((sum, bill) => sum + (bill.loyaltyPointsUsed || 0), 0);
    const loyaltyPointsEarned = filteredBills.reduce((sum, bill) => sum + (bill.loyaltyPointsEarned || 0), 0);
    
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
  };
  
  const summaryMetrics = calculateSummaryMetrics();
  
  const formatDuration = (durationInMinutes: number | undefined) => {
    if (!durationInMinutes) return "0h 0m";
    
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };
  
  const calculateCustomerPlayTime = (customerId: string) => {
    const customerSessions = filteredSessions.filter(
      session => session.customerId === customerId
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
    
    return `${hours}h ${minutes}m`;
  };
  
  const calculateCustomerTotalSpent = (customerId: string) => {
    return filteredBills
      .filter(bill => bill.customerId === customerId)
      .reduce((total, bill) => total + bill.total, 0);
  };
  
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };
  
  return (
    <div className="p-6 space-y-6 bg-[#1A1F2C] min-h-screen text-white">
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
                {getDateRangeString()}
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
      
      <div className="space-y-6">
        {activeTab === 'bills' && (
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
                  {filteredBills.map(bill => {
                    const customer = customers.find(c => c.id === bill.customerId);
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
                        <TableCell className="text-white">{customer?.name || 'Unknown'}</TableCell>
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
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {activeTab === 'customers' && (
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
                  {filteredCustomers.map(customer => (
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
                        <CurrencyDisplay amount={calculateCustomerTotalSpent(customer.id)} />
                      </TableCell>
                      <TableCell className="text-white">{calculateCustomerPlayTime(customer.id)}</TableCell>
                      <TableCell className="text-white">{customer.loyaltyPoints || 0}</TableCell>
                      <TableCell className="text-white">{customer.createdAt ? format(new Date(customer.createdAt), 'd MMM yyyy') : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {activeTab === 'sessions' && (
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
            </div>
            <div className="rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map(session => {
                    const customer = customers.find(c => c.id === session.customerId);
                    
                    let durationDisplay = "0h 1m"; // Default duration
                    if (session.endTime) {
                      const startMs = new Date(session.startTime).getTime();
                      const endMs = new Date(session.endTime).getTime();
                      const durationMin = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
                      const hours = Math.floor(durationMin / 60);
                      const minutes = durationMin % 60;
                      durationDisplay = `${hours}h ${minutes}m`;
                    } else if (session.duration) {
                      const hours = Math.floor(session.duration / 60);
                      const minutes = session.duration % 60;
                      durationDisplay = `${hours}h ${minutes}m`;
                    }
                        
                    return (
                      <TableRow key={session.id}>
                        <TableCell className="text-white font-medium">{session.stationId}</TableCell>
                        <TableCell className="text-white">{customer?.name || 'Unknown'}</TableCell>
                        <TableCell className="text-white">
                          <div>{format(new Date(session.startTime), 'd MMM yyyy')}</div>
                          <div className="text-gray-400">{format(new Date(session.startTime), 'HH:mm')} pm</div>
                        </TableCell>
                        <TableCell className="text-white">
                          {session.endTime ? (
                            <>
                              <div>{format(new Date(session.endTime), 'd MMM yyyy')}</div>
                              <div className="text-gray-400">{format(new Date(session.endTime), 'HH:mm')} pm</div>
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
                          {session.endTime && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => confirmDeleteSession(session.id)}
                              className="hover:bg-red-900/20 hover:text-red-400"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete session</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {activeTab === 'summary' && (
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
        )}
      </div>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
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
              onClick={handleDeleteSession}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ReportsPage;
