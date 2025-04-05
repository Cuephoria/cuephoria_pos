
import React, { useState, useEffect } from 'react';
import { usePOS } from '@/context';
import { useExpenses } from '@/context/ExpenseContext';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { CurrencyDisplay } from "@/components/ui/currency";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  Receipt,
  CreditCard,
  Banknote,
  Search,
  User,
  Calendar,
  Users
} from "lucide-react";
import { format } from "date-fns";
import BusinessSummaryReport from "@/components/dashboard/BusinessSummaryReport";
import { Bill, Customer } from '@/types/pos.types';

const Reports = () => {
  const { bills, exportBills, exportCustomers, customers } = usePOS();
  const { expenses } = useExpenses();
  
  // Default date range: last 30 days
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  
  const [startDate, setStartDate] = useState<Date | undefined>(defaultStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(defaultEndDate);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  
  // Filter bills by date range
  useEffect(() => {
    if (bills.length > 0) {
      const filtered = bills.filter(bill => {
        const billDate = new Date(bill.createdAt);
        const isAfterStart = !startDate || billDate >= startDate;
        const isBeforeEnd = !endDate || billDate <= endDate;
        return isAfterStart && isBeforeEnd;
      });
      setFilteredBills(filtered);
    } else {
      setFilteredBills([]);
    }
  }, [bills, startDate, endDate]);
  
  // Calculate sales metrics
  const calculateSalesMetrics = () => {
    let totalSales = 0;
    let cashSales = 0;
    let upiSales = 0;
    let discountAmount = 0;
    let loyaltyPointsUsed = 0;
    let loyaltyPointsEarned = 0;
    
    filteredBills.forEach(bill => {
      totalSales += bill.total;
      discountAmount += bill.discountValue;
      loyaltyPointsUsed += bill.loyaltyPointsUsed || 0;
      loyaltyPointsEarned += bill.loyaltyPointsEarned || 0;
      
      if (bill.paymentMethod === 'cash') {
        cashSales += bill.total;
      } else {
        upiSales += bill.total;
      }
    });
    
    const avgTicketSize = filteredBills.length > 0 ? totalSales / filteredBills.length : 0;
    
    return {
      totalSales,
      cashSales,
      upiSales,
      discountAmount,
      loyaltyPointsUsed,
      loyaltyPointsEarned,
      avgTicketSize,
      totalTransactions: filteredBills.length
    };
  };
  
  // Calculate product metrics
  const calculateProductMetrics = () => {
    const productSales: Record<string, { count: number; revenue: number }> = {};
    const productCategories: Record<string, { count: number; revenue: number }> = {};
    
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        if (item.type === 'product') {
          // Product level metrics
          if (!productSales[item.name]) {
            productSales[item.name] = { count: 0, revenue: 0 };
          }
          productSales[item.name].count += item.quantity;
          productSales[item.name].revenue += item.total;
          
          // Category level metrics
          const category = item.category || 'uncategorized';
          if (!productCategories[category]) {
            productCategories[category] = { count: 0, revenue: 0 };
          }
          productCategories[category].count += item.quantity;
          productCategories[category].revenue += item.total;
        }
      });
    });
    
    // Convert to arrays and sort by revenue
    const topProducts = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
      
    const categoryBreakdown = Object.entries(productCategories)
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.revenue - a.revenue);
      
    return { topProducts, categoryBreakdown };
  };
  
  // Calculate customer metrics
  const calculateCustomerMetrics = () => {
    const customerTransactions: Record<string, { 
      count: number; 
      revenue: number; 
      discounts: number;
      loyaltyUsed: number;
      loyaltyEarned: number;
      memberStatus: boolean;
    }> = {};
    
    filteredBills.forEach(bill => {
      const customerId = bill.customerId;
      const customer = customers.find(c => c.id === customerId);
      
      if (!customerTransactions[customerId]) {
        customerTransactions[customerId] = {
          count: 0,
          revenue: 0,
          discounts: 0,
          loyaltyUsed: 0,
          loyaltyEarned: 0,
          memberStatus: customer?.isMember || false
        };
      }
      
      customerTransactions[customerId].count += 1;
      customerTransactions[customerId].revenue += bill.total;
      customerTransactions[customerId].discounts += bill.discountValue;
      customerTransactions[customerId].loyaltyUsed += bill.loyaltyPointsUsed || 0;
      customerTransactions[customerId].loyaltyEarned += bill.loyaltyPointsEarned || 0;
    });
    
    // Convert to array and sort by revenue
    const customerData = Object.entries(customerTransactions)
      .map(([customerId, data]) => {
        const customer = customers.find(c => c.id === customerId);
        return {
          id: customerId,
          name: customer?.name || "Unknown",
          ...data
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
      
    // Count members vs non-members
    const memberCount = customerData.filter(c => c.memberStatus).length;
    const nonMemberCount = customerData.length - memberCount;
    
    // Calculate member vs non-member revenue
    const memberRevenue = customerData
      .filter(c => c.memberStatus)
      .reduce((sum, c) => sum + c.revenue, 0);
      
    const nonMemberRevenue = customerData
      .filter(c => !c.memberStatus)
      .reduce((sum, c) => sum + c.revenue, 0);
      
    return {
      topCustomers: customerData.slice(0, 10),
      memberCount,
      nonMemberCount,
      memberRevenue,
      nonMemberRevenue
    };
  };
  
  // Handle export
  const handleExportBills = () => {
    exportBills();
  };
  
  const handleExportCustomers = () => {
    exportCustomers();
  };
  
  // Get metrics
  const salesMetrics = calculateSalesMetrics();
  const { topProducts, categoryBreakdown } = calculateProductMetrics();
  const { topCustomers, memberCount, nonMemberCount, memberRevenue, nonMemberRevenue } = calculateCustomerMetrics();
  
  // Format date for display
  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, 'PP')} to ${format(endDate, 'PP')}`;
    } else if (startDate) {
      return `From ${format(startDate, 'PP')}`;
    } else if (endDate) {
      return `Until ${format(endDate, 'PP')}`;
    }
    return 'All time';
  };
  
  return (
    <div className="flex-1 space-y-6 p-6 bg-gray-100 dark:bg-[#1A1F2C]">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <div className="hidden md:flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleExportBills}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" /> Export Bills
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCustomers}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" /> Export Customers
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-center">
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-sm mb-1">Start Date</span>
            <DatePicker date={startDate} setDate={setStartDate} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm mb-1">End Date</span>
            <DatePicker date={endDate} setDate={setEndDate} />
          </div>
        </div>
        <div className="text-sm flex items-center space-x-2 w-full md:w-auto justify-center">
          <Calendar className="h-4 w-4" />
          <span>{formatDateRange()}</span>
        </div>
        <div className="flex md:hidden w-full space-x-2">
          <Button
            variant="outline"
            onClick={handleExportBills}
            className="flex-1 flex items-center justify-center"
          >
            <Download className="mr-2 h-4 w-4" /> Export Bills
          </Button>
          <Button
            variant="outline"
            onClick={handleExportCustomers}
            className="flex-1 flex items-center justify-center"
          >
            <Download className="mr-2 h-4 w-4" /> Export Customers
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <CurrencyDisplay amount={salesMetrics.totalSales} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {salesMetrics.totalTransactions} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cash Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <CurrencyDisplay amount={salesMetrics.cashSales} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {((salesMetrics.cashSales / salesMetrics.totalSales) * 100 || 0).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">UPI Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <CurrencyDisplay amount={salesMetrics.upiSales} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {((salesMetrics.upiSales / salesMetrics.totalSales) * 100 || 0).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg Ticket Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <CurrencyDisplay amount={salesMetrics.avgTicketSize} />
                </div>
                <p className="text-xs text-muted-foreground">
                  Per transaction
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>{filteredBills.length} transactions found</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBills.slice(0, 5).map(bill => {
                      const customer = customers.find(c => c.id === bill.customerId);
                      return (
                        <TableRow key={bill.id}>
                          <TableCell>{format(new Date(bill.createdAt), 'PP')}</TableCell>
                          <TableCell>{customer?.name || 'Unknown'}</TableCell>
                          <TableCell>
                            <CurrencyDisplay amount={bill.total} />
                          </TableCell>
                          <TableCell>
                            {bill.paymentMethod === 'cash' ? (
                              <span className="flex items-center">
                                <Banknote className="mr-1 h-4 w-4" /> Cash
                              </span>
                            ) : (
                              <span className="flex items-center">
                                <CreditCard className="mr-1 h-4 w-4" /> UPI
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Discount & Loyalty Summary</CardTitle>
                <CardDescription>Impact on revenue</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Discounts Provided</h3>
                  <div className="flex items-center justify-between">
                    <span>Total discount amount:</span>
                    <span className="font-bold">
                      <CurrencyDisplay amount={salesMetrics.discountAmount} />
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Percentage of gross sales:</span>
                    <span className="font-bold">
                      {(salesMetrics.discountAmount / (salesMetrics.totalSales + salesMetrics.discountAmount) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Loyalty Program</h3>
                  <div className="flex items-center justify-between">
                    <span>Points redeemed:</span>
                    <span className="font-bold">{salesMetrics.loyaltyPointsUsed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Points issued:</span>
                    <span className="font-bold">{salesMetrics.loyaltyPointsEarned}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Net points change:</span>
                    <span className={`font-bold ${(salesMetrics.loyaltyPointsEarned - salesMetrics.loyaltyPointsUsed) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {salesMetrics.loyaltyPointsEarned - salesMetrics.loyaltyPointsUsed}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>By revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map(product => (
                      <TableRow key={product.name}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="text-right">{product.count}</TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={product.revenue} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {topProducts.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No product sales data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Product category breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryBreakdown.map(category => (
                      <TableRow key={category.category}>
                        <TableCell className="capitalize">{category.category}</TableCell>
                        <TableCell className="text-right">{category.count}</TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={category.revenue} />
                        </TableCell>
                      </TableRow>
                    ))}
                    {categoryBreakdown.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-4">
                          No category data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.length}
                </div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Users className="h-3 w-3 mr-1" /> 
                  Active in system
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {memberCount}
                </div>
                <p className="text-xs text-muted-foreground">
                  {((memberCount / (memberCount + nonMemberCount)) * 100 || 0).toFixed(1)}% of active customers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Member Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <CurrencyDisplay amount={memberRevenue} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {((memberRevenue / (memberRevenue + nonMemberRevenue)) * 100 || 0).toFixed(1)}% of total revenue
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Non-Member Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  <CurrencyDisplay amount={nonMemberRevenue} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {((nonMemberRevenue / (memberRevenue + nonMemberRevenue)) * 100 || 0).toFixed(1)}% of total revenue
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Top Customers</CardTitle>
              <CardDescription>By spending</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Visits</TableHead>
                    <TableHead className="text-right">Total Spent</TableHead>
                    <TableHead className="text-right">Avg per Visit</TableHead>
                    <TableHead>Member Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topCustomers.map(customer => {
                    const customer_obj = customers.find(c => c.id === customer.id);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            <span>{customer.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{customer.count}</TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={customer.revenue} />
                        </TableCell>
                        <TableCell className="text-right">
                          <CurrencyDisplay amount={customer.revenue / customer.count} />
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${customer.memberStatus ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'}`}>
                            {customer.memberStatus ? 'Member' : 'Non-Member'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {topCustomers.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No customer data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="business" className="space-y-6">
          <BusinessSummaryReport
            startDate={startDate}
            endDate={endDate}
            onDownload={handleExportBills}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
