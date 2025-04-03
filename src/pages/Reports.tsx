
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { useExpenses } from '@/context/ExpenseContext';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import BusinessSummaryReport from '@/components/dashboard/BusinessSummaryReport';
import ExpenseList from '@/components/expenses/ExpenseList';
import { Button } from '@/components/ui/button';
import { CalendarIcon, Download, FilterX } from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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

const ReportsPage: React.FC = () => {
  const { displayLowStockWarning } = useProducts();
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  
  // Function to handle downloading reports
  const handleDownloadReport = () => {
    // In a real application, this would generate a PDF or CSV file
    console.log('Downloading report with date range:', date);
    // Placeholder for actual download implementation
  };
  
  // Function to handle low stock warning
  const handleLowStockWarning = () => {
    displayLowStockWarning();
  };
  
  // Function to clear date filters
  const clearDateFilter = () => {
    setDate({ from: undefined, to: undefined });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-fit gap-2">
                <CalendarIcon className="h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  "Select Date Range"
                )}
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
              {date?.from && (
                <div className="p-3 border-t border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearDateFilter}
                    className="w-full gap-2 text-xs"
                  >
                    <FilterX className="h-3 w-3" />
                    Clear Date Filter
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          <Button onClick={handleDownloadReport} className="gap-2">
            <Download className="h-4 w-4" />
            Download Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="business_summary" className="w-full">
        <TabsList className="w-full flex-wrap mb-4">
          <TabsTrigger value="business_summary">Business Summary</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="tax">Tax Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="business_summary">
          <div className="grid gap-6">
            <BusinessSummaryReport 
              startDate={date?.from} 
              endDate={date?.to}
              onDownload={handleDownloadReport}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="expenses">
          <ExpenseList />
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Report</CardTitle>
              <CardDescription>
                {date?.from && date?.to 
                  ? `From ${format(date.from, 'PP')} to ${format(date.to, 'PP')}`
                  : 'Current inventory status'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Button onClick={handleLowStockWarning} variant="outline">
                  Show Low Stock Items
                </Button>
                <p className="text-muted-foreground mt-4">
                  Detailed inventory reports will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle>Tax Report</CardTitle>
              <CardDescription>
                {date?.from && date?.to 
                  ? `From ${format(date.from, 'PP')} to ${format(date.to, 'PP')}`
                  : 'Current tax period'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Tax reports will be available in the next update.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsPage;
