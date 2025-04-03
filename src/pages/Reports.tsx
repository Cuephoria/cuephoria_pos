
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Download, Users, Clock, CreditCard, FileText, CalendarRange, FileSpreadsheet } from 'lucide-react';
import { usePOS, Bill, Customer } from '@/context/POSContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format, startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const Reports = () => {
  const { bills, customers, exportBills, exportCustomers, sessions, stations } = usePOS();
  const [dateRange, setDateRange] = useState<{from: Date, to: Date}>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [reportType, setReportType] = useState('bills');
  const form = useForm();

  // Filter bills by date range
  const filteredBills = bills.filter(bill => {
    const billDate = new Date(bill.createdAt);
    return billDate >= startOfDay(dateRange.from) && billDate <= endOfDay(dateRange.to);
  });

  // Sort filtered bills by date (newest first)
  const sortedBills = [...filteredBills].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format time
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get customer name by ID
  const getCustomerName = (id: string) => {
    const customer = customers.find(c => c.id === id);
    return customer ? customer.name : 'Unknown Customer';
  };

  // Format play time
  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Set predefined date ranges
  const setDatePreset = (preset: string) => {
    const today = new Date();
    
    switch (preset) {
      case 'today':
        setDateRange({ from: startOfDay(today), to: endOfDay(today) });
        break;
      case 'yesterday':
        const yesterday = subDays(today, 1);
        setDateRange({ from: startOfDay(yesterday), to: endOfDay(yesterday) });
        break;
      case 'last7days':
        setDateRange({ from: startOfDay(subDays(today, 6)), to: endOfDay(today) });
        break;
      case 'thisWeek':
        setDateRange({ from: startOfWeek(today, { weekStartsOn: 1 }), to: endOfDay(today) });
        break;
      case 'lastWeek':
        const lastWeekStart = startOfWeek(subDays(today, 7), { weekStartsOn: 1 });
        const lastWeekEnd = endOfWeek(lastWeekStart, { weekStartsOn: 1 });
        setDateRange({ from: lastWeekStart, to: lastWeekEnd });
        break;
      case 'thisMonth':
        setDateRange({ from: startOfMonth(today), to: endOfDay(today) });
        break;
      case 'lastMonth':
        const lastMonthStart = startOfMonth(subDays(startOfMonth(today), 1));
        const lastMonthEnd = endOfMonth(lastMonthStart);
        setDateRange({ from: lastMonthStart, to: lastMonthEnd });
        break;
      case 'last30days':
      default:
        setDateRange({ from: startOfDay(subDays(today, 29)), to: endOfDay(today) });
    }
    
    setIsCalendarOpen(false);
  };

  // Download current view as CSV
  const downloadCurrentReport = () => {
    switch (reportType) {
      case 'bills':
        downloadBillsReport(sortedBills);
        break;
      case 'customers':
        downloadCustomersReport(customers);
        break;
      case 'sessions':
        downloadSessionsReport();
        break;
      case 'summary':
        downloadSummaryReport(sortedBills, customers);
        break;
      default:
        exportBills(customers);
    }
  };

  const downloadBillsReport = (billsToDownload: Bill[]) => {
    if (billsToDownload.length === 0) {
      return;
    }
    
    // Create CSV headers
    let csvContent = "Bill ID,Date,Time,Customer,Items,Subtotal,Discount,Points Used,Total,Payment Method\n";
    
    // Add data rows
    billsToDownload.forEach(bill => {
      const row = [
        `"${bill.id}"`,
        `"${formatDate(bill.createdAt)}"`,
        `"${formatTime(bill.createdAt)}"`,
        `"${getCustomerName(bill.customerId)}"`,
        `"${bill.items.length} items: ${bill.items.map(item => item.name).join(', ')}"`,
        bill.subtotal,
        bill.discount,
        bill.loyaltyPointsUsed,
        bill.total,
        `"${bill.paymentMethod}"`
      ].join(',');
      
      csvContent += row + "\n";
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bills_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCustomersReport = (customersToDownload: Customer[]) => {
    if (customersToDownload.length === 0) {
      return;
    }
    
    // Create CSV headers
    let csvContent = "Customer ID,Name,Contact,Member Status,Total Spent,Play Time,Loyalty Points,Joined On\n";
    
    // Add data rows
    customersToDownload.forEach(customer => {
      const row = [
        `"${customer.id}"`,
        `"${customer.name}"`,
        `"${customer.phone}${customer.email ? ' / ' + customer.email : ''}"`,
        `"${customer.isMember ? 'Member' : 'Non-Member'}"`,
        customer.totalSpent,
        `"${formatPlayTime(customer.totalPlayTime)}"`,
        customer.loyaltyPoints,
        `"${formatDate(customer.createdAt)}"`
      ].join(',');
      
      csvContent += row + "\n";
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `customers_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSessionsReport = () => {
    if (sessions.length === 0) {
      return;
    }
    
    // Create CSV headers
    let csvContent = "Session ID,Station,Customer,Start Time,End Time,Duration,Status\n";
    
    // Add data rows
    sessions.forEach(session => {
      const station = stations.find(s => s.id === session.stationId);
      const customer = customers.find(c => c.id === session.customerId);
      
      const row = [
        `"${session.id}"`,
        `"${station ? station.name : 'Unknown Station'}"`,
        `"${customer ? customer.name : 'Unknown Customer'}"`,
        `"${formatDate(session.startTime)} ${formatTime(session.startTime)}"`,
        `"${session.endTime ? formatDate(session.endTime) + ' ' + formatTime(session.endTime) : 'Active'}"`,
        `"${session.duration ? formatPlayTime(session.duration) : 'In progress'}"`,
        `"${session.endTime ? 'Completed' : 'Active'}"`
      ].join(',');
      
      csvContent += row + "\n";
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sessions_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadSummaryReport = (reportBills: Bill[], reportCustomers: Customer[]) => {
    // Create period string
    const periodStr = `${format(dateRange.from, 'dd MMM yyyy')} to ${format(dateRange.to, 'dd MMM yyyy')}`;
    
    // Calculate summary metrics
    const totalRevenue = reportBills.reduce((sum, bill) => sum + bill.total, 0);
    const totalBills = reportBills.length;
    const avgBillValue = totalBills > 0 ? totalRevenue / totalBills : 0;
    const totalDiscounts = reportBills.reduce((sum, bill) => sum + bill.discountValue, 0);
    const pointsUsed = reportBills.reduce((sum, bill) => sum + bill.loyaltyPointsUsed, 0);
    const pointsEarned = reportBills.reduce((sum, bill) => sum + bill.loyaltyPointsEarned, 0);
    const cashSales = reportBills.filter(bill => bill.paymentMethod === 'cash').reduce((sum, bill) => sum + bill.total, 0);
    const upiSales = reportBills.filter(bill => bill.paymentMethod === 'upi').reduce((sum, bill) => sum + bill.total, 0);
    const activeSessions = sessions.filter(s => !s.endTime).length;
    const completedSessions = sessions.filter(s => s.endTime).length;
    const totalCustomers = reportCustomers.length;
    const memberCustomers = reportCustomers.filter(c => c.isMember).length;
    
    // Create CSV content
    let csvContent = `Cuephoria Business Summary - ${periodStr}\n\n`;
    csvContent += "Financial Metrics\n";
    csvContent += `Total Revenue,₹${totalRevenue.toFixed(2)}\n`;
    csvContent += `Average Bill Value,₹${avgBillValue.toFixed(2)}\n`;
    csvContent += `Total Discounts Given,₹${totalDiscounts.toFixed(2)}\n`;
    csvContent += `Cash Sales,₹${cashSales.toFixed(2)}\n`;
    csvContent += `UPI Sales,₹${upiSales.toFixed(2)}\n\n`;
    
    csvContent += "Operational Metrics\n";
    csvContent += `Total Transactions,${totalBills}\n`;
    csvContent += `Active Sessions,${activeSessions}\n`;
    csvContent += `Completed Sessions,${completedSessions}\n\n`;
    
    csvContent += "Customer Metrics\n";
    csvContent += `Total Customers,${totalCustomers}\n`;
    csvContent += `Members,${memberCustomers}\n`;
    csvContent += `Non-Members,${totalCustomers - memberCustomers}\n`;
    csvContent += `Loyalty Points Used,${pointsUsed}\n`;
    csvContent += `Loyalty Points Earned,${pointsEarned}\n`;
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `summary_report_${format(dateRange.from, 'yyyy-MM-dd')}_to_${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="flex space-x-2">
          <Form {...form}>
            <div className="flex items-center space-x-2">
              <Select 
                defaultValue="last30days" 
                onValueChange={setDatePreset}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last7days">Last 7 days</SelectItem>
                  <SelectItem value="thisWeek">This week</SelectItem>
                  <SelectItem value="lastWeek">Last week</SelectItem>
                  <SelectItem value="thisMonth">This month</SelectItem>
                  <SelectItem value="lastMonth">Last month</SelectItem>
                  <SelectItem value="last30days">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="h-10">
                    <CalendarRange className="h-4 w-4 mr-2" />
                    {format(dateRange.from, 'dd MMM yyyy')} - {format(dateRange.to, 'dd MMM yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-3">
                    <div className="space-y-3">
                      <FormItem className="flex flex-col">
                        <FormLabel>From</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {format(dateRange.from, 'PPP')}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dateRange.from}
                              onSelect={(date) => date && setDateRange({...dateRange, from: date})}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                      
                      <FormItem className="flex flex-col">
                        <FormLabel>To</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className="w-full pl-3 text-left font-normal"
                              >
                                {format(dateRange.to, 'PPP')}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                              mode="single"
                              selected={dateRange.to}
                              onSelect={(date) => date && setDateRange({...dateRange, to: date})}
                              initialFocus
                              className="p-3 pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    </div>
                    
                    <div className="flex justify-end mt-4">
                      <Button 
                        variant="default" 
                        onClick={() => setIsCalendarOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button onClick={downloadCurrentReport}>
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>
          </Form>
        </div>
      </div>

      <Tabs defaultValue="bills" value={reportType} onValueChange={setReportType}>
        <TabsList>
          <TabsTrigger value="bills">
            <CreditCard className="h-4 w-4 mr-2" /> Bills
          </TabsTrigger>
          <TabsTrigger value="customers">
            <Users className="h-4 w-4 mr-2" /> Customers
          </TabsTrigger>
          <TabsTrigger value="sessions">
            <Clock className="h-4 w-4 mr-2" /> Sessions
          </TabsTrigger>
          <TabsTrigger value="summary">
            <FileText className="h-4 w-4 mr-2" /> Summary
          </TabsTrigger>
        </TabsList>
        
        {/* Bills Tab */}
        <TabsContent value="bills" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all transactions from {format(dateRange.from, 'PPP')} to {format(dateRange.to, 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Bill ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">Points Used</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBills.length > 0 ? (
                    sortedBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>
                          <div className="font-medium">{formatDate(bill.createdAt)}</div>
                          <div className="text-sm text-muted-foreground">{formatTime(bill.createdAt)}</div>
                        </TableCell>
                        <TableCell className="text-sm">{bill.id}</TableCell>
                        <TableCell>{getCustomerName(bill.customerId)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {bill.items.length} {bill.items.length === 1 ? 'item' : 'items'}
                          </div>
                          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {bill.items.map(item => item.name).join(', ')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={bill.subtotal} />
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={bill.discount} />
                        </TableCell>
                        <TableCell className="text-right">{bill.loyaltyPointsUsed}</TableCell>
                        <TableCell className="text-right font-medium">
                          <CurrencyDisplay amount={bill.total} />
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="capitalize">{bill.paymentMethod}</span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-muted-foreground">
                        No transactions found for this period
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Activity</CardTitle>
              <CardDescription>View all customers and their activity</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-center">Member Status</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Play Time</TableHead>
                    <TableHead className="text-right">Loyalty Points</TableHead>
                    <TableHead>Joined On</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>
                          <div>{customer.phone}</div>
                          {customer.email && (
                            <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                              {customer.email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            customer.isMember 
                              ? 'bg-cuephoria-purple/20 text-cuephoria-purple' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {customer.isMember ? 'Member' : 'Non-Member'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={customer.totalSpent} />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatPlayTime(customer.totalPlayTime)}
                        </TableCell>
                        <TableCell className="text-right">{customer.loyaltyPoints}</TableCell>
                        <TableCell>{formatDate(customer.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                        No customers found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Sessions Tab */}
        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>View all game sessions and their details</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
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
                  {sessions.length > 0 ? (
                    sessions.map((session) => {
                      const station = stations.find(s => s.id === session.stationId);
                      return (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">
                            {station ? station.name : 'Unknown Station'}
                          </TableCell>
                          <TableCell>{getCustomerName(session.customerId)}</TableCell>
                          <TableCell>
                            {formatDate(session.startTime)}
                            <div className="text-xs text-muted-foreground">
                              {formatTime(session.startTime)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {session.endTime ? (
                              <>
                                {formatDate(session.endTime)}
                                <div className="text-xs text-muted-foreground">
                                  {formatTime(session.endTime)}
                                </div>
                              </>
                            ) : (
                              <span className="text-cuephoria-purple">Active</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {session.duration ? formatPlayTime(session.duration) : 'In progress'}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              session.endTime
                                ? 'bg-gray-200 text-gray-600'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {session.endTime ? 'Completed' : 'Active'}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                        No sessions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Summary</CardTitle>
              <CardDescription>Overview of key metrics from {format(dateRange.from, 'PPP')} to {format(dateRange.to, 'PPP')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Financial Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Financial Metrics</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Revenue</dt>
                      <dd className="font-medium">
                        <CurrencyDisplay amount={sortedBills.reduce((sum, bill) => sum + bill.total, 0)} />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Average Bill Value</dt>
                      <dd className="font-medium">
                        <CurrencyDisplay amount={
                          sortedBills.length > 0 
                            ? sortedBills.reduce((sum, bill) => sum + bill.total, 0) / sortedBills.length 
                            : 0
                        } />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Discounts Given</dt>
                      <dd className="font-medium">
                        <CurrencyDisplay amount={sortedBills.reduce((sum, bill) => sum + bill.discountValue, 0)} />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Cash Sales</dt>
                      <dd className="font-medium">
                        <CurrencyDisplay amount={
                          sortedBills
                            .filter(bill => bill.paymentMethod === 'cash')
                            .reduce((sum, bill) => sum + bill.total, 0)
                        } />
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">UPI Sales</dt>
                      <dd className="font-medium">
                        <CurrencyDisplay amount={
                          sortedBills
                            .filter(bill => bill.paymentMethod === 'upi')
                            .reduce((sum, bill) => sum + bill.total, 0)
                        } />
                      </dd>
                    </div>
                  </dl>
                </div>
                
                {/* Operational Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Operational Metrics</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Transactions</dt>
                      <dd className="font-medium">{sortedBills.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Active Sessions</dt>
                      <dd className="font-medium">{sessions.filter(s => !s.endTime).length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Completed Sessions</dt>
                      <dd className="font-medium">{sessions.filter(s => s.endTime).length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Most Popular Product</dt>
                      <dd className="font-medium">
                        {(() => {
                          const productCounts: {[key: string]: number} = {};
                          sortedBills.forEach(bill => {
                            bill.items.forEach(item => {
                              if (item.type === 'product') {
                                productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
                              }
                            });
                          });
                          
                          const entries = Object.entries(productCounts);
                          if (entries.length === 0) return 'N/A';
                          
                          entries.sort((a, b) => b[1] - a[1]);
                          return entries[0][0];
                        })()}
                      </dd>
                    </div>
                  </dl>
                </div>
                
                {/* Customer Metrics */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Customer Metrics</h3>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Total Customers</dt>
                      <dd className="font-medium">{customers.length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Members</dt>
                      <dd className="font-medium">{customers.filter(c => c.isMember).length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Non-Members</dt>
                      <dd className="font-medium">{customers.filter(c => !c.isMember).length}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Loyalty Points Used</dt>
                      <dd className="font-medium">{sortedBills.reduce((sum, bill) => sum + bill.loyaltyPointsUsed, 0)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Loyalty Points Earned</dt>
                      <dd className="font-medium">{sortedBills.reduce((sum, bill) => sum + bill.loyaltyPointsEarned, 0)}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
