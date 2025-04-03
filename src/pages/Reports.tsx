
import React, { useState } from 'react';
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
import { CalendarIcon, Download } from 'lucide-react';
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

const ReportsPage: React.FC = () => {
  const { expenses, businessSummary } = useExpenses();
  const { customers, bills, sessions, products, exportBills, exportCustomers } = usePOS();
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  
  const [activeTab, setActiveTab] = useState<'bills' | 'customers' | 'sessions' | 'summary'>('bills');
  
  // Function to handle downloading reports
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
        // For other tabs, implement specific export functionality
        console.log(`Exporting ${activeTab} report`);
    }
  };
  
  // Function to calculate date range string for display
  const getDateRangeString = () => {
    if (date?.from && date?.to) {
      return `${format(date.from, 'dd MMM yyyy')} - ${format(date.to, 'dd MMM yyyy')}`;
    }
    return 'Select date range';
  };
  
  // Filter customers based on date joined
  const filteredCustomers = customers.filter(customer => {
    if (!date?.from && !date?.to) return true;
    
    const joinedDate = customer.createdAt ? new Date(customer.createdAt) : new Date();
    
    if (date?.from && date?.to) {
      return joinedDate >= date.from && joinedDate <= date.to;
    } else if (date?.from) {
      return joinedDate >= date.from;
    } else if (date?.to) {
      return joinedDate <= date.to;
    }
    
    return true;
  });
  
  // Filter bills based on date
  const filteredBills = bills.filter(bill => {
    if (!date?.from && !date?.to) return true;
    
    const billDate = new Date(bill.createdAt);
    
    if (date?.from && date?.to) {
      return billDate >= date.from && billDate <= date.to;
    } else if (date?.from) {
      return billDate >= date.from;
    } else if (date?.to) {
      return billDate <= date.to;
    }
    
    return true;
  });
  
  // Filter sessions based on date
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
  
  // Calculate business summary metrics
  const calculateSummaryMetrics = () => {
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
    const completedSessions = filteredSessions.filter(s => s.endTime !== null).length;
    
    // Find most popular product
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
    
    // Customer metrics
    const totalCustomers = filteredCustomers.length;
    const memberCount = filteredCustomers.filter(c => c.isMember).length;
    const nonMemberCount = filteredCustomers.filter(c => !c.isMember).length;
    
    // Loyalty metrics
    const loyaltyPointsUsed = filteredBills.reduce((sum, bill) => sum + (bill.loyaltyPointsUsed || 0), 0);
    const loyaltyPointsEarned = filteredBills.reduce((sum, bill) => sum + (bill.loyaltyPointsEarned || 0), 0);
    
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
      }
    };
  };
  
  const summaryMetrics = calculateSummaryMetrics();
  
  // Format duration in hours and minutes (fixed format to match screenshot)
  const formatDuration = (durationInMinutes: number | undefined) => {
    if (!durationInMinutes) return "0h 0m";
    
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };
  
  // Format time to show only the hour and minute in 12-hour format with am/pm
  const formatTimeHM = (date: Date) => {
    return format(date, 'hh:mm a');
  };
  
  // Format to match the time format in screenshot (09:56 pm)
  const formatTimeDigital = (date: Date) => {
    return format(date, 'HH:mm');
  };
  
  // Calculate total time spent by customer
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
  
  // Calculate total spent by customer
  const calculateCustomerTotalSpent = (customerId: string) => {
    return filteredBills
      .filter(bill => bill.customerId === customerId)
      .reduce((total, bill) => total + bill.total, 0);
  };
  
  // Extract first item name for bills display
  const getFirstItemName = (bill: any) => {
    if (!bill.items || bill.items.length === 0) return 'Unknown item';
    
    const firstItem = bill.items[0];
    return firstItem.name;
  };
  
  // Calculate total item count
  const getTotalItemCount = (bill: any) => {
    if (!bill.items) return 0;
    return bill.items.length;
  };
  
  // Get a customer name by ID
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Unknown';
  };
  
  // Get formatted date for display
  const getFormattedDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    return `${format(date, 'd MMM yyyy')}\n${format(date, 'HH:mm')} pm`;
  };
  
  return (
    <div className="p-6 space-y-6 bg-[#1A1F2C] min-h-screen text-white">
      {/* Header with title, date range, and export button */}
      <div className="flex justify-between items-center pb-2">
        <h1 className="text-4xl font-bold">Reports</h1>
        <div className="flex items-center gap-4">
          <Select defaultValue="30days">
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
                onSelect={setDate}
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
      
      {/* Content based on selected tab */}
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
                        <TableCell className="text-white">₹{bill.subtotal}</TableCell>
                        <TableCell className="text-white">₹{bill.discountValue || 0}</TableCell>
                        <TableCell className="text-white">{bill.loyaltyPointsUsed || 0}</TableCell>
                        <TableCell className="text-white font-semibold">₹{bill.total}</TableCell>
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
              <p className="text-gray-400">View all customers and their activity</p>
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
                        ₹{calculateCustomerTotalSpent(customer.id).toFixed(2)}
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
              <p className="text-gray-400">View all game sessions and their details</p>
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSessions.map(session => {
                    const customer = customers.find(c => c.id === session.customerId);
                    
                    // Calculate session duration properly
                    let durationDisplay = "0h 1m"; // Default duration
                    if (session.endTime) {
                      const startMs = new Date(session.startTime).getTime();
                      const endMs = new Date(session.endTime).getTime();
                      const durationMinutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));
                      const hours = Math.floor(durationMinutes / 60);
                      const minutes = durationMinutes % 60;
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        {activeTab === 'summary' && (
          <Card className="border-gray-800 bg-[#1A1F2C] shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-white">Business Summary</CardTitle>
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
                      <span className="font-semibold text-white">₹{summaryMetrics.financial.totalRevenue}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Average Bill Value</span>
                      <span className="font-semibold text-white">₹{summaryMetrics.financial.averageBillValue.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Total Discounts Given</span>
                      <span className="font-semibold text-white">₹{summaryMetrics.financial.totalDiscounts}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">Cash Sales</span>
                      <span className="font-semibold text-white">₹{summaryMetrics.financial.cashSales}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-gray-400">UPI Sales</span>
                      <span className="font-semibold text-white">₹{summaryMetrics.financial.upiSales}</span>
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
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
