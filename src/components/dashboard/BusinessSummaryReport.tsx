
import React, { useMemo } from 'react';
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
  const { bills, products } = usePOS();
  
  // Current date for display
  const currentDate = new Date();
  
  // Memoize all calculations to improve performance
  const reportData = useMemo(() => {
    // Filter expenses based on date range
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
    
    // Filter bills based on date range
    const filteredBills = bills.filter(bill => {
      if (!startDate && !endDate) return true;
      
      const billDate = new Date(bill.createdAt);
      
      if (startDate && endDate) {
        return billDate >= startDate && billDate <= endDate;
      } else if (startDate) {
        return billDate >= startDate;
      } else if (endDate) {
        return billDate <= endDate;
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
    
    // Calculate game sales (PS5 and Pool) - CORRECTED to use actual bill totals after discounts
    let ps5Sales = 0;
    let poolSales = 0;
    
    // Calculate canteen sales
    let foodSales = 0;
    let beverageSales = 0;
    let tobaccoSales = 0;
    
    // Process all bills at once to improve performance
    filteredBills.forEach(bill => {
      // Calculate effective discount rate for proportional application
      const discountRatio = bill.total / bill.subtotal;
      
      bill.items.forEach(item => {
        // Apply proportional discount to each item to reflect actual revenue
        const discountedItemTotal = item.total * discountRatio;
        
        // Check if the item is a session
        if (item.type === 'session') {
          // Look for PS5 or Pool in the name (case insensitive)
          const itemName = item.name.toLowerCase();
          if (itemName.includes('ps5') || itemName.includes('playstation')) {
            ps5Sales += discountedItemTotal;
          } else if (itemName.includes('pool') || itemName.includes('8-ball') || itemName.includes('8 ball')) {
            poolSales += discountedItemTotal;
          }
        } 
        // Check if the item is a product
        else if (item.type === 'product') {
          // Find the product to check its category
          const product = products.find(p => p.id === item.id);
          if (product) {
            const category = product.category.toLowerCase();
            if (category === 'food' || category === 'snacks') {
              foodSales += discountedItemTotal;
            } else if (category === 'beverage' || category === 'drinks') {
              beverageSales += discountedItemTotal;
            } else if (category === 'tobacco') {
              tobaccoSales += discountedItemTotal;
            }
          }
        }
      });
    });
    
    const totalCanteenSales = foodSales + beverageSales + tobaccoSales;
    
    return {
      categoryTotals,
      gameSales: {
        ps5Sales,
        poolSales,
        totalGameSales: ps5Sales + poolSales
      },
      canteenSales: {
        foodSales,
        beverageSales,
        tobaccoSales,
        totalCanteenSales
      }
    };
  }, [expenses, bills, products, startDate, endDate]);

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Business Summary Report</CardTitle>
        <CardDescription>
          {startDate && endDate 
            ? `From ${format(startDate, 'PP')} to ${format(endDate, 'PP')}`
            : startDate
              ? `From ${format(startDate, 'PP')}`
              : endDate
                ? `Until ${format(endDate, 'PP')}`
                : `${format(currentDate, 'MMMM yyyy')}`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Gross Income</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={businessSummary.grossIncome} />
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Total Expenses</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={businessSummary.totalExpenses} />
            </p>
          </div>
          <div className="space-y-1.5">
            <h3 className="font-medium text-sm">Net Profit</h3>
            <p className="text-2xl font-bold">
              <CurrencyDisplay amount={businessSummary.netProfit} />
            </p>
          </div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 mb-8">
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
                {reportData.categoryTotals.length > 0 ? (
                  reportData.categoryTotals.map(({ category, total }) => (
                    <TableRow key={category}>
                      <TableCell>{formatCategory(category)}</TableCell>
                      <TableCell>
                        <CurrencyDisplay amount={total} />
                      </TableCell>
                      <TableCell>
                        {businessSummary.totalExpenses 
                          ? ((total / businessSummary.totalExpenses) * 100).toFixed(1) 
                          : '0.0'}%
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                      No expenses found in the selected date range
                    </TableCell>
                  </TableRow>
                )}
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
                {reportData.gameSales.ps5Sales > 0 || reportData.gameSales.poolSales > 0 ? (
                  <>
                    <TableRow>
                      <TableCell>PS5 Stations</TableCell>
                      <TableCell>
                        <CurrencyDisplay amount={reportData.gameSales.ps5Sales} />
                      </TableCell>
                      <TableCell>
                        {reportData.gameSales.totalGameSales > 0 
                          ? ((reportData.gameSales.ps5Sales / reportData.gameSales.totalGameSales) * 100).toFixed(1) 
                          : '0.0'}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>8-Ball Pool</TableCell>
                      <TableCell>
                        <CurrencyDisplay amount={reportData.gameSales.poolSales} />
                      </TableCell>
                      <TableCell>
                        {reportData.gameSales.totalGameSales > 0 
                          ? ((reportData.gameSales.poolSales / reportData.gameSales.totalGameSales) * 100).toFixed(1) 
                          : '0.0'}%
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Total</TableCell>
                      <TableCell className="font-semibold">
                        <CurrencyDisplay amount={reportData.gameSales.totalGameSales} />
                      </TableCell>
                      <TableCell>100.0%</TableCell>
                    </TableRow>
                  </>
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                      No gaming revenue found in the selected date range
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-base mb-2">Canteen Sales</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>% of Canteen Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.canteenSales.totalCanteenSales > 0 ? (
                <>
                  <TableRow>
                    <TableCell>Food & Snacks</TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={reportData.canteenSales.foodSales} />
                    </TableCell>
                    <TableCell>
                      {reportData.canteenSales.totalCanteenSales > 0 
                        ? ((reportData.canteenSales.foodSales / reportData.canteenSales.totalCanteenSales) * 100).toFixed(1) 
                        : '0.0'}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Beverages & Drinks</TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={reportData.canteenSales.beverageSales} />
                    </TableCell>
                    <TableCell>
                      {reportData.canteenSales.totalCanteenSales > 0 
                        ? ((reportData.canteenSales.beverageSales / reportData.canteenSales.totalCanteenSales) * 100).toFixed(1) 
                        : '0.0'}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tobacco Products</TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={reportData.canteenSales.tobaccoSales} />
                    </TableCell>
                    <TableCell>
                      {reportData.canteenSales.totalCanteenSales > 0 
                        ? ((reportData.canteenSales.tobaccoSales / reportData.canteenSales.totalCanteenSales) * 100).toFixed(1) 
                        : '0.0'}%
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold">Total Canteen</TableCell>
                    <TableCell className="font-semibold">
                      <CurrencyDisplay amount={reportData.canteenSales.totalCanteenSales} />
                    </TableCell>
                    <TableCell>100.0%</TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-gray-400">
                    No canteen sales found in the selected date range
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessSummaryReport;
