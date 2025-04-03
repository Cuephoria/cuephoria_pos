
import React, { useState } from 'react';
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
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DeleteSaleDialog from './DeleteSaleDialog';

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
  const { bills, products, deleteBill } = usePOS();
  
  // State for delete dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<typeof bills[0] | null>(null);

  // Current date for display
  const currentDate = new Date();
  
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
  
  // Calculate canteen sales (food, beverages, and tobacco)
  const calculateCanteenSales = () => {
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
    
    let foodSales = 0;
    let beverageSales = 0;
    let tobaccoSales = 0;
    
    filteredBills.forEach(bill => {
      bill.items.forEach(item => {
        // Check if the item is a product
        if (item.type === 'product') {
          // Find the product to check its category
          const product = products.find(p => p.id === item.id);
          if (product) {
            const category = product.category.toLowerCase();
            if (category === 'food' || category === 'snacks') {
              foodSales += item.total;
            } else if (category === 'beverage' || category === 'drinks') {
              beverageSales += item.total;
            } else if (category === 'tobacco') {
              tobaccoSales += item.total;
            }
          }
        }
      });
    });
    
    const totalCanteenSales = foodSales + beverageSales + tobaccoSales;
    
    return { foodSales, beverageSales, tobaccoSales, totalCanteenSales };
  };
  
  const { ps5Sales, poolSales } = calculateGameSales();
  const { foodSales, beverageSales, tobaccoSales, totalCanteenSales } = calculateCanteenSales();
  
  // Debug logs to trace the issue
  console.log('Canteen sales calculation:', { foodSales, beverageSales, tobaccoSales, totalCanteenSales });
  console.log('Products available:', products.length);
  console.log('Bills available:', bills.length);

  // Get recent sales for display
  const recentSales = [...bills]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Handle delete bill
  const handleDeleteClick = (bill: typeof bills[0]) => {
    setSelectedBill(bill);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (billId: string) => {
    await deleteBill(billId);
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
                {categoryTotals.map(({ category, total }) => (
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
              <TableRow>
                <TableCell>Food & Snacks</TableCell>
                <TableCell>
                  <CurrencyDisplay amount={foodSales} />
                </TableCell>
                <TableCell>
                  {totalCanteenSales > 0 
                    ? ((foodSales / totalCanteenSales) * 100).toFixed(1) 
                    : '0.0'}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Beverages & Drinks</TableCell>
                <TableCell>
                  <CurrencyDisplay amount={beverageSales} />
                </TableCell>
                <TableCell>
                  {totalCanteenSales > 0 
                    ? ((beverageSales / totalCanteenSales) * 100).toFixed(1) 
                    : '0.0'}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Tobacco Products</TableCell>
                <TableCell>
                  <CurrencyDisplay amount={tobaccoSales} />
                </TableCell>
                <TableCell>
                  {totalCanteenSales > 0 
                    ? ((tobaccoSales / totalCanteenSales) * 100).toFixed(1) 
                    : '0.0'}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-semibold">Total Canteen</TableCell>
                <TableCell className="font-semibold">
                  <CurrencyDisplay amount={totalCanteenSales} />
                </TableCell>
                <TableCell>100.0%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        
        <div className="mb-6">
          <h3 className="font-semibold text-base mb-2">Recent Sales</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentSales.length > 0 ? (
                recentSales.map(bill => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      {format(new Date(bill.createdAt), 'PP p')}
                    </TableCell>
                    <TableCell>
                      <CurrencyDisplay amount={bill.total} />
                    </TableCell>
                    <TableCell className="capitalize">
                      {bill.paymentMethod}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                        onClick={() => handleDeleteClick(bill)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    No recent sales
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
      
      <DeleteSaleDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        bill={selectedBill}
        onConfirm={handleConfirmDelete}
      />
    </Card>
  );
};

export default BusinessSummaryReport;
