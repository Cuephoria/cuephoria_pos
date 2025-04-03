
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, BusinessSummary, ExpenseCategory } from '@/types/expense.types';
import { usePOS } from './POSContext';
import { generateId } from '@/utils/pos.utils';
import { useToast } from '@/hooks/use-toast';

interface ExpenseContextType {
  expenses: Expense[];
  businessSummary: BusinessSummary;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<boolean>;
  updateExpense: (expense: Expense) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

// Local storage key
const EXPENSES_STORAGE_KEY = 'business_expenses';

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessSummary, setBusinessSummary] = useState<BusinessSummary>({
    grossIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0,
    monthlyExpenses: {},
    categoryTotals: []
  });
  
  const { bills } = usePOS();
  const { toast } = useToast();

  // Fetch expenses from localStorage
  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses);
        // Convert string dates to Date objects
        const transformedExpenses: Expense[] = parsedExpenses.map((item: any) => ({
          ...item,
          date: new Date(item.date)
        }));
        
        setExpenses(transformedExpenses);
        console.log(`Loaded ${transformedExpenses.length} expenses from localStorage`);
      } else {
        setExpenses([]);
        console.log('No expenses found in localStorage');
      }
    } catch (err) {
      console.error('Error in fetchExpenses:', err);
      setError('An unexpected error occurred while fetching expenses');
    } finally {
      setLoading(false);
    }
  };

  // Save expenses to localStorage
  const saveExpenses = (updatedExpenses: Expense[]) => {
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (err) {
      console.error('Error saving expenses to localStorage:', err);
      toast({
        title: 'Error',
        description: 'Failed to save expenses',
        variant: 'destructive'
      });
    }
  };

  // Calculate the business summary with improved logic
  const calculateBusinessSummary = () => {
    // Calculate total revenue from all bills
    const grossIncome = bills.reduce((sum, bill) => sum + bill.total, 0);
    
    // Calculate monthly expense equivalent for recurring expenses
    const calculateMonthlyEquivalent = (expense: Expense): number => {
      if (!expense.isRecurring) {
        return 0; // One-time expenses handled separately
      }
      
      switch(expense.frequency) {
        case 'monthly':
          return expense.amount;
        case 'quarterly':
          return expense.amount / 3;
        case 'yearly':
          return expense.amount / 12;
        default:
          return 0;
      }
    };
    
    // Calculate one-time expenses in the current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const oneTimeExpensesThisMonth = expenses
      .filter(expense => !expense.isRecurring)
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && 
               expenseDate.getFullYear() === currentYear;
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate recurring monthly expenses
    const recurringMonthlyExpenses = expenses
      .filter(expense => expense.isRecurring)
      .reduce((sum, expense) => sum + calculateMonthlyEquivalent(expense), 0);
    
    // Total monthly expenses
    const totalMonthlyExpenses = oneTimeExpensesThisMonth + recurringMonthlyExpenses;
    
    // Calculate expenses by category
    const categoryExpenses = expenses.reduce((acc, expense) => {
      const category = expense.category;
      const monthlyAmount = expense.isRecurring 
        ? calculateMonthlyEquivalent(expense)
        : (new Date(expense.date).getMonth() === currentMonth && 
           new Date(expense.date).getFullYear() === currentYear) 
          ? expense.amount 
          : 0;
          
      acc[category] = (acc[category] || 0) + monthlyAmount;
      return acc;
    }, {} as Record<string, number>);
    
    // Calculate category totals with percentages
    const categoryTotals = Object.entries(categoryExpenses)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalMonthlyExpenses > 0 
          ? (amount / totalMonthlyExpenses) * 100 
          : 0
      }))
      .sort((a, b) => b.amount - a.amount);
    
    // Calculate net profit and profit margin
    const netProfit = grossIncome - totalMonthlyExpenses;
    const profitMargin = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;
    
    // Organize expenses by month (for trending/charts)
    const monthlyExpenseTrend: Record<string, number> = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    });
    
    last6Months.forEach(date => {
      const month = date.getMonth();
      const year = date.getFullYear();
      const key = `${year}-${month + 1}`;
      
      // Calculate recurring expenses for this month
      const recurringForMonth = expenses
        .filter(expense => expense.isRecurring)
        .reduce((sum, expense) => sum + calculateMonthlyEquivalent(expense), 0);
      
      // Calculate one-time expenses for this month
      const oneTimeForMonth = expenses
        .filter(expense => !expense.isRecurring)
        .filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getMonth() === month && 
                 expenseDate.getFullYear() === year;
        })
        .reduce((sum, expense) => sum + expense.amount, 0);
      
      monthlyExpenseTrend[key] = recurringForMonth + oneTimeForMonth;
    });
    
    setBusinessSummary({
      grossIncome,
      totalExpenses: totalMonthlyExpenses,
      netProfit,
      profitMargin,
      monthlyExpenses: monthlyExpenseTrend,
      categoryTotals
    });
    
    console.log('Business summary calculated:', {
      grossIncome,
      totalExpenses: totalMonthlyExpenses,
      netProfit,
      profitMargin,
      categories: categoryTotals
    });
  };

  // Add a new expense
  const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<boolean> => {
    try {
      console.log('Adding expense with data:', expenseData);
      const id = generateId();
      
      // Ensure date is a valid Date object
      let dateObj: Date;
      
      if (expenseData.date instanceof Date) {
        dateObj = expenseData.date;
      } else {
        try {
          dateObj = new Date(expenseData.date as any);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (err) {
          console.error('Failed to parse date:', expenseData.date);
          toast({
            title: 'Error',
            description: 'Invalid date format',
            variant: 'destructive'
          });
          return false;
        }
      }
      
      // Create a proper expense object for the state
      const newExpense: Expense = {
        id,
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        frequency: expenseData.frequency,
        date: dateObj,
        isRecurring: expenseData.isRecurring,
        notes: expenseData.notes || ''
      };
      
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
      
      toast({
        title: 'Success',
        description: 'Expense added successfully'
      });
      
      // Recalculate business summary
      calculateBusinessSummary();
      
      return true;
    } catch (err) {
      console.error('Error in addExpense:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while adding expense',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Update an existing expense
  const updateExpense = async (expense: Expense): Promise<boolean> => {
    try {
      // Ensure date is a valid Date object
      let dateObj: Date;
      
      if (expense.date instanceof Date) {
        dateObj = expense.date;
      } else {
        try {
          dateObj = new Date(expense.date as any);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
          }
        } catch (err) {
          console.error('Failed to parse date:', expense.date);
          toast({
            title: 'Error',
            description: 'Invalid date format',
            variant: 'destructive'
          });
          return false;
        }
      }
      
      // Update the expense with the correct date object
      const updatedExpense = {
        ...expense,
        date: dateObj
      };
      
      const updatedExpenses = expenses.map(item => 
        item.id === expense.id ? updatedExpense : item
      );
      
      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
      
      toast({
        title: 'Success',
        description: 'Expense updated successfully'
      });
      
      // Recalculate business summary
      calculateBusinessSummary();
      
      return true;
    } catch (err) {
      console.error('Error in updateExpense:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while updating expense',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      const updatedExpenses = expenses.filter(item => item.id !== id);
      setExpenses(updatedExpenses);
      saveExpenses(updatedExpenses);
      
      toast({
        title: 'Success',
        description: 'Expense deleted successfully'
      });
      
      // Recalculate business summary
      calculateBusinessSummary();
      
      return true;
    } catch (err) {
      console.error('Error in deleteExpense:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while deleting expense',
        variant: 'destructive'
      });
      return false;
    }
  };

  // Initial load of expenses
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Recalculate business summary when bills or expenses change
  useEffect(() => {
    calculateBusinessSummary();
  }, [bills, expenses]);

  const contextValue: ExpenseContextType = {
    expenses,
    businessSummary,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses: fetchExpenses,
    loading,
    error
  };

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
};
