
import React, { useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, Calendar as CalendarIcon, Download, Printer } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Import your report components
import BusinessSummaryReport from '@/components/dashboard/BusinessSummaryReport';
import SalesChart from '@/components/dashboard/SalesChart';
import CustomerActivityChart from '@/components/dashboard/CustomerActivityChart';
import ProductInventoryChart from '@/components/dashboard/ProductInventoryChart';

// Sample data for the sales chart
const generateSampleSalesData = (period: string) => {
  if (period === 'hourly') {
    return Array.from({ length: 12 }, (_, i) => ({
      name: `${i + 9}:00`,
      amount: Math.floor(Math.random() * 5000) + 1000,
    }));
  } else if (period === 'daily') {
    return Array.from({ length: 7 }, (_, i) => {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return {
        name: days[i],
        amount: Math.floor(Math.random() * 10000) + 5000,
      };
    });
  } else if (period === 'weekly') {
    return Array.from({ length: 4 }, (_, i) => ({
      name: `Week ${i + 1}`,
      amount: Math.floor(Math.random() * 50000) + 20000,
    }));
  } else {
    return Array.from({ length: 12 }, (_, i) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return {
        name: months[i],
        amount: Math.floor(Math.random() * 100000) + 50000,
      };
    });
  }
};

const Reports = () => {
  const [activeTab, setActiveTab] = useState('summary');
  const [salesChartTab, setSalesChartTab] = useState('daily');
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // First day of current month
    to: new Date()
  });

  const handleDownloadReport = () => {
    // Implement your report download functionality
    console.log('Downloading report for date range:', date);
    // For now, just show an alert
    alert('Report download functionality will be implemented soon');
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Generate sample data based on the active tab
  const salesData = generateSampleSalesData(salesChartTab);

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 print:p-0">
      <div className="print:hidden">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 px-4 py-2">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                  <ArrowDown className="ml-2 h-4 w-4 opacity-50" />
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
            <Button variant="outline" onClick={handlePrintReport}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownloadReport}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <Tabs defaultValue="summary" className="mt-6" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Business Summary</TabsTrigger>
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="customers">Customer Activity</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className={cn(activeTab === 'summary' ? 'block' : 'hidden', 'space-y-4')}>
        <BusinessSummaryReport
          startDate={date?.from}
          endDate={date?.to}
          onDownload={handleDownloadReport}
        />
      </div>
      
      <div className={cn(activeTab === 'sales' ? 'block' : 'hidden', 'space-y-4')}>
        <Card>
          <CardHeader>
            <CardTitle>Sales Analysis</CardTitle>
            <CardDescription>View your sales data over time</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesChart 
              data={salesData} 
              activeTab={salesChartTab} 
              setActiveTab={setSalesChartTab} 
            />
          </CardContent>
        </Card>
      </div>
      
      <div className={cn(activeTab === 'customers' ? 'block' : 'hidden', 'space-y-4')}>
        <Card>
          <CardHeader>
            <CardTitle>Customer Activity</CardTitle>
            <CardDescription>Track customer engagement and spending</CardDescription>
          </CardHeader>
          <CardContent>
            <CustomerActivityChart />
          </CardContent>
        </Card>
      </div>
      
      <div className={cn(activeTab === 'inventory' ? 'block' : 'hidden', 'space-y-4')}>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Analysis</CardTitle>
            <CardDescription>Monitor product stock and popularity</CardDescription>
          </CardHeader>
          <CardContent>
            <ProductInventoryChart />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
