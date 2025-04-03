
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenses } from '@/context/ExpenseContext';
import { CurrencyDisplay } from '@/components/ui/currency';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Expense } from '@/types/expense.types';
import { format } from 'date-fns';
import { usePOS } from '@/context/POSContext';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BusinessSummaryReportProps {
  startDate?: Date;
  endDate?: Date;
  onDownload: () => void;
  selectedMonth?: string;
  onMonthChange?: (month: string) => void;
}

const BusinessSummaryReport: React.FC<BusinessSummaryReportProps> = ({ 
  startDate, 
  endDate,
  onDownload,
  selectedMonth,
  onMonthChange 
}) => {
  const { expenses, businessSummary } = useExpenses();
  const { bills, products } = usePOS();
  
  // Get current month and year for the default filter value
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  
  // Create month options for the filter
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '0', label: 'January' },
    { value: '1', label: 'February' },
    { value: '2', label: 'March' },
    { value: '3', label: 'April' },
    { value: '4', label: 'May' },
    { value: '5', label: 'June' },
    { value: '6', label: 'July' },
    { value: '7', label: 'August' },
    { value: '8', label: 'September' },
    { value: '9', label: 'October' },
    { value: '10', label: 'November' },
    { value: '11', label: 'December' }
  ];
  
  // Filter expenses based on date range or month if provided
  const filteredExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    
    // Apply date range filter if provided
    if (startDate && endDate) {
      return expenseDate >= startDate && expenseDate <= endDate;
    } else if (startDate) {
      return expenseDate >= startDate;
    } else if (endDate) {
      return expenseDate <= endDate;
    }
    
    // Apply month filter if selected
    if (selectedMonth && selectedMonth !== 'all') {
      const monthIndex = parseInt(selectedMonth);
      return expenseDate.getMonth() === monthIndex && expenseDate.getFullYear() === currentYear;
    }
    
    return true;
  });
  
  // Group expenses by category
  const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
    const { category } = expense;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);
  
  // Calculate total per category
  const categoryTotals = Object.entries(expensesByCategory).map(([category, expenses]) => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    return { category, total };
  }).sort((a, b) => b.total - a.total);
  
  // Format category name
  const formatCategory = (category: string) => {
    const categoryMap: Record<string, string> = {
      'rent': 'Rent',
      'utilities': 'Utilities',
      'salary': 'Salary',
      'restock': 'Restock',
      'misc': 'Miscellaneous',
    };
    
    return categoryMap[category] || category;
  };
  
  // Calculate PS5 and 8-Ball sales
  const calculateGameSales = () => {
    // Filter bills based on date range or month
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      
      // Apply date range filter if provided
      if (startDate && endDate) {
        return billDate >= startDate && billDate <= endDate;
      } else if (startDate) {
        return billDate >= startDate;
      } else if (endDate) {
        return billDate <= endDate;
      }
      
      // Apply month filter if selected
      if (selectedMonth && selectedMonth !== 'all') {
        const monthIndex = parseInt(selectedMonth);
        return billDate.getMonth() === monthIndex && billDate.getFullYear() === currentYear;
      }
      
      return true;
    });
    
    let ps5Sales = 0;
    let poolSales = 0;
    
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        // Check if the item is a session
        if (item.type === 'session') {
          // Look for PS5 or Pool in the name (case insensitive)
          const itemName = item.name.toLowerCase();
          if (itemName.includes('ps5') || itemName.includes('playstation')) {
            ps5Sales += item.total;
          } else if (itemName.includes('pool') || itemName.includes('8-ball') || itemName.includes('8 ball')) {
            poolSales += item.total;
          }
        }
      });
    });
    
    return { ps5Sales, poolSales };
  };
  
  const { ps5Sales, poolSales } = calculateGameSales();
  
  // Calculate filtered summary numbers
  const filteredSummary = {
    grossIncome: bills
      .filter(bill => {
        const billDate = new Date(bill.createdAt);
        
        // Apply date range filter if provided
        if (startDate && endDate) {
          return billDate >= startDate && billDate <= endDate;
        } else if (startDate) {
          return billDate >= startDate;
        } else if (endDate) {
          return billDate <= endDate;
        }
        
        // Apply month filter if selected
        if (selectedMonth && selectedMonth !== 'all') {
          const monthIndex = parseInt(selectedMonth);
          return billDate.getMonth() === monthIndex && billDate.getFullYear() === currentYear;
        }
        
        return true;
      })
      .reduce((sum, bill) => sum + bill.total, 0),
      
    totalExpenses: filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  };
  
  filteredSummary.netProfit = filteredSummary.grossIncome - filteredSummary.totalExpenses;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl">Business Summary Report</CardTitle>
          <CardDescription>
            {startDate && endDate 
              ? `From ${format(startDate, 'PP')} to ${format(endDate, 'PP')}`
              : startDate
                ? `From ${format(startDate, 'PP')}`
                : endDate
                  ? `Until ${format(endDate, 'PP')}`
                  : selectedMonth && selectedMonth !== 'all'
                    ? `${months.find(m => m.value === selectedMonth)?.label} ${currentYear}`
                    : 'All time summary'
            }
          </CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-[180px]">
            <Select 
              value={selectedMonth || 'all'} 
              onValueChange={(value) => onMonthChange && onMonthChange(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="icon" onClick={onDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Gross Income</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={filteredSummary.grossIncome} />
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Total Expenses</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={filteredSummary.totalExpenses} />
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Net Profit</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={filteredSummary.netProfit} />
            </p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <div>
            <h3 className="font-semibold text-base mb-2">Expenses by Category</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryTotals.map(({ category, total }) => (
                  <TableRow key={category}>
                    <TableCell>{formatCategory(category)}</TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={total} />
                    </TableCell>
                    <TableCell>
                      {filteredSummary.totalExpenses 
                        ? ((total / filteredSummary.totalExpenses) * 100).toFixed(1) 
                        : '0.0'}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          <div>
            <h3 className="font-semibold text-base mb-2">Gaming Station Revenue</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station Type</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>% of Gaming Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>PS5 Stations</TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={ps5Sales} />
                  </TableCell>
                  <TableCell>
                    {ps5Sales + poolSales > 0 
                      ? ((ps5Sales / (ps5Sales + poolSales)) * 100).toFixed(1) 
                      : '0.0'}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>8-Ball Pool</TableCell>
                  <TableCell>
                    <CurrencyDisplay amount={poolSales} />
                  </TableCell>
                  <TableCell>
                    {ps5Sales + poolSales > 0 
                      ? ((poolSales / (ps5Sales + poolSales)) * 100).toFixed(1) 
                      : '0.0'}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Total</TableCell>
                  <TableCell className="font-semibold">
                    <CurrencyDisplay amount={ps5Sales + poolSales} />
                  </TableCell>
                  <TableCell>100.0%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessSummaryReport;
