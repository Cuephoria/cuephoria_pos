import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { addDays, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { DatePickerWithRange } from '@/components/ui/date-picker-range';
import { SalesChart } from '@/components/dashboard/SalesChart';
import BusinessSummaryReport from '@/components/dashboard/BusinessSummaryReport';

interface SalesChartData {
  name: string;
  total: number;
}

interface SalesDataPoint {
  date: string;
  amount: number;
}

const Reports = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('sales');
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 7),
    to: new Date(),
  });
  
  // Generate sample data for our sales chart (placeholder)
  const generateSampleSalesData = (): SalesChartData[] => {
    // Create an array of dates for the past week
    const dates = Array.from({ length: 7 }, (_, i) => {
      const d = subDays(new Date(), 6 - i);
      return format(d, 'MMM dd');
    });
    
    // Create random sales data
    return dates.map(date => ({
      name: date,
      total: Math.floor(Math.random() * 5000) + 1000, // Random amount between 1000-6000
    }));
  };
  
  const sampleSalesData = generateSampleSalesData();
  
  const handleDownloadReport = () => {
    // This is just a placeholder function for the download functionality
    toast({
      title: 'Report Download',
      description: 'Report download functionality will be implemented in the future.',
    });
  };
  
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        
        <div className="flex items-center space-x-2">
          <DatePickerWithRange date={date} onDateChange={setDate} />
          
          <Button variant="outline" onClick={handleDownloadReport}>
            Download Report
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="sales" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="profit">Profit & Loss</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <SalesChart 
                data={sampleSalesData} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
              />
            </CardContent>
          </Card>
          
          {/* Other sales related cards could go here */}
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-4">
          {/* Expense charts and tables would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Detailed expense breakdown will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profit" className="space-y-4">
          <BusinessSummaryReport 
            startDate={date?.from} 
            endDate={date?.to}
            onDownload={handleDownloadReport} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
