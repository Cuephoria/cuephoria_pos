
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
  
  const [activeTab, setActiveTab] = useState<'bills' | 'customers' | 'sessions' | 'summary'>('summary');
  
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
  
  // Format duration in hours and minutes
  const formatDuration = (durationInMinutes: number) => {
    const hours = Math.floor(durationInMinutes / 60);
    const minutes = durationInMinutes % 60;
    return `${hours}h ${minutes}m`;
  };
  
  // Calculate total time spent by customer
  const calculateCustomerPlayTime = (customerId: string) => {
    const customerSessions = filteredSessions.filter(
      session => session.customerId === customerId && session.endTime
    );
    
    const totalMinutes = customerSessions.reduce((total, session) => {
      if (session.endTime) {
        const start = new Date(session.startTime).getTime();
        const end = new Date(session.endTime).getTime();
        return total + (end - start) / (1000 * 60);
      }
      return total;
    }, 0);
    
    if (totalMinutes === 0) return "0h 0m";
    
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
  
  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header with title, date range, and export button */}
      <div className="flex justify-between items-center pb-2">
        <h1 className="text-4xl font-bold">Reports</h1>
        <div className="flex items-center gap-4">
          <Select defaultValue="30days">
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">This year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 bg-background">
                <CalendarIcon className="h-4 w-4" />
                {getDateRangeString()}
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
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleDownloadReport} className="gap-2 bg-primary/80 hover:bg-primary">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Navigation tabs */}
      <div className="bg-muted/60 rounded-lg p-1 flex gap-2 w-fit">
        <Button 
          onClick={() => setActiveTab('bills')}
          variant={activeTab === 'bills' ? 'default' : 'ghost'} 
          className="gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
          Bills
        </Button>
        <Button 
          onClick={() => setActiveTab('customers')}
          variant={activeTab === 'customers' ? 'default' : 'ghost'} 
          className="gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Customers
        </Button>
        <Button 
          onClick={() => setActiveTab('sessions')}
          variant={activeTab === 'sessions' ? 'default' : 'ghost'} 
          className="gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Sessions
        </Button>
        <Button 
          onClick={() => setActiveTab('summary')}
          variant={activeTab === 'summary' ? 'default' : 'ghost'} 
          className="gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          Summary
        </Button>
      </div>
      
      {/* Content based on selected tab */}
      <div className="space-y-6">
        {activeTab === 'customers' && (
          <Card className="border-none bg-card shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Customer Activity</CardTitle>
              <CardDescription>View all customers and their activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
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
                      <TableRow key={customer.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          {customer.phone}
                          {customer.email && <div className="text-xs text-muted-foreground">{customer.email}</div>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={customer.isMember ? 
                            "bg-purple-900/10 text-purple-500 border-purple-200" : 
                            "bg-slate-100 text-slate-500 border-slate-200"
                          }>
                            {customer.isMember ? "Member" : "Non-Member"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <CurrencyDisplay amount={calculateCustomerTotalSpent(customer.id)} />
                        </TableCell>
                        <TableCell>{calculateCustomerPlayTime(customer.id)}</TableCell>
                        <TableCell>{customer.loyaltyPoints || 0}</TableCell>
                        <TableCell>{customer.createdAt ? format(new Date(customer.createdAt), 'dd MMM yyyy') : 'N/A'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'bills' && (
          <Card className="border-none bg-card shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Bills</CardTitle>
              <CardDescription>
                {date?.from && date?.to 
                  ? `From ${format(date.from, 'PP')} to ${format(date.to, 'PP')}` 
                  : 'All bills'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
                      <TableHead>Bill #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.map(bill => {
                      const customer = customers.find(c => c.id === bill.customerId);
                      return (
                        <TableRow key={bill.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{bill.id.substring(0, 8)}</TableCell>
                          <TableCell>{customer?.name || 'Unknown'}</TableCell>
                          <TableCell>{bill.items.reduce((sum, item) => sum + item.quantity, 0)}</TableCell>
                          <TableCell><CurrencyDisplay amount={bill.total} /></TableCell>
                          <TableCell>
                            <Badge variant="outline" className={
                              bill.paymentMethod === 'upi'
                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                : "bg-green-100 text-green-800 border-green-200"
                            }>
                              {bill.paymentMethod === 'upi' ? 'UPI' : 'Cash'}
                            </Badge>
                          </TableCell>
                          <TableCell>{format(new Date(bill.createdAt), 'dd MMM yyyy')}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'sessions' && (
          <Card className="border-none bg-card shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Sessions</CardTitle>
              <CardDescription>
                {date?.from && date?.to 
                  ? `From ${format(date.from, 'PP')} to ${format(date.to, 'PP')}` 
                  : 'All sessions'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-muted/50">
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
                      const duration = session.endTime 
                        ? Math.floor((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / (1000 * 60))
                        : 0;
                        
                      return (
                        <TableRow key={session.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{session.stationId}</TableCell>
                          <TableCell>{customer?.name || 'Unknown'}</TableCell>
                          <TableCell>{format(new Date(session.startTime), 'dd MMM yyyy HH:mm')}</TableCell>
                          <TableCell>{session.endTime ? format(new Date(session.endTime), 'dd MMM yyyy HH:mm') : '-'}</TableCell>
                          <TableCell>{session.endTime ? formatDuration(duration) : 'In progress'}</TableCell>
                          <TableCell>
                            <Badge variant={session.endTime ? 'outline' : 'default'} className={
                              !session.endTime
                                ? "bg-green-100 text-green-800 border-green-200"
                                : ""
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
            </CardContent>
          </Card>
        )}
        
        {activeTab === 'summary' && (
          <Card className="border-none bg-card shadow-md">
            <CardHeader className="pb-2">
              <CardTitle>Business Summary</CardTitle>
              <CardDescription>
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
                  <h3 className="text-lg font-semibold">Financial Metrics</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue</span>
                      <span className="font-semibold"><CurrencyDisplay amount={summaryMetrics.financial.totalRevenue} /></span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Average Bill Value</span>
                      <span className="font-semibold"><CurrencyDisplay amount={summaryMetrics.financial.averageBillValue} /></span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Discounts Given</span>
                      <span className="font-semibold"><CurrencyDisplay amount={summaryMetrics.financial.totalDiscounts} /></span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cash Sales</span>
                      <span className="font-semibold"><CurrencyDisplay amount={summaryMetrics.financial.cashSales} /></span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">UPI Sales</span>
                      <span className="font-semibold"><CurrencyDisplay amount={summaryMetrics.financial.upiSales} /></span>
                    </div>
                  </div>
                </div>
                
                {/* Operational Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Operational Metrics</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Transactions</span>
                      <span className="font-semibold">{summaryMetrics.operational.totalTransactions}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Active Sessions</span>
                      <span className="font-semibold">{summaryMetrics.operational.activeSessions}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completed Sessions</span>
                      <span className="font-semibold">{summaryMetrics.operational.completedSessions}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Most Popular Product</span>
                      <span className="font-semibold">{summaryMetrics.operational.mostPopularProduct}</span>
                    </div>
                  </div>
                </div>
                
                {/* Customer Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Customer Metrics</h3>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Customers</span>
                      <span className="font-semibold">{summaryMetrics.customer.totalCustomers}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Members</span>
                      <span className="font-semibold">{summaryMetrics.customer.memberCount}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Non-Members</span>
                      <span className="font-semibold">{summaryMetrics.customer.nonMemberCount}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loyalty Points Used</span>
                      <span className="font-semibold">{summaryMetrics.customer.loyaltyPointsUsed}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loyalty Points Earned</span>
                      <span className="font-semibold">{summaryMetrics.customer.loyaltyPointsEarned}</span>
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
