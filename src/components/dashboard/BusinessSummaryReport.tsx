
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
import { format } from 'date-fns';

interface BusinessSummaryReportProps {
  startDate?: Date;
  endDate?: Date;
  onDownload: () => void;
}

const BusinessSummaryReport: React.FC<BusinessSummaryReportProps> = ({ 
  startDate, 
  endDate,
  onDownload 
}) => {
  const { expenses, businessSummary } = useExpenses();
  const { grossIncome, totalExpenses, netProfit, categoryTotals } = businessSummary;
  
  // Filter expenses based on date range if provided
  const filteredExpenses = expenses.filter(expense => {
    if (!startDate && !endDate) return true;
    
    const expenseDate = new Date(expense.date);
    
    if (startDate && endDate) {
      return expenseDate >= startDate && expenseDate <= endDate;
    } else if (startDate) {
      return expenseDate >= startDate;
    } else if (endDate) {
      return expenseDate <= endDate;
    }
    
    return true;
  });
  
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Business Summary Report</CardTitle>
        <CardDescription>
          {startDate && endDate 
            ? `From ${format(startDate, 'PP')} to ${format(endDate, 'PP')}`
            : startDate
              ? `From ${format(startDate, 'PP')}`
              : endDate
                ? `Until ${format(endDate, 'PP')}`
                : 'Monthly Financial Summary'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Gross Income</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={grossIncome} />
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Total Expenses</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={totalExpenses} />
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Net Profit</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={netProfit} />
            </p>
          </div>
        </div>
        
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
            {categoryTotals.map(({ category, amount, percentage }) => (
              <TableRow key={category}>
                <TableCell>{formatCategory(category)}</TableCell>
                <TableCell>
                  <CurrencyDisplay amount={amount} />
                </TableCell>
                <TableCell>
                  {percentage.toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default BusinessSummaryReport;
