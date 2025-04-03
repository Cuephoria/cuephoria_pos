
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, BusinessSummary } from '@/types/expense.types';
import { usePOS } from './POSContext';
import { generateId } from '@/utils/pos.utils';
import { useToast } from '@/hooks/use-toast';
import { ExpenseFormData } from '@/components/expenses/ExpenseDialog';

interface ExpenseContextType {
  expenses: Expense[];
  businessSummary: BusinessSummary;
  addExpense: (expense: ExpenseFormData) => Promise<boolean>;
  updateExpense: (expense: Expense) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Local storage key for expenses
const EXPENSES_STORAGE_KEY = 'pos-app-expenses';

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessSummary, setBusinessSummary] = useState<BusinessSummary>({
    grossIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    profitMargin: 0
  });
  
  const { bills } = usePOS();
  const { toast } = useToast();

  // Load expenses from localStorage
  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const storedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
      if (storedExpenses) {
        const parsedExpenses: Expense[] = JSON.parse(storedExpenses);
        setExpenses(parsedExpenses);
        console.log(`Loaded ${parsedExpenses.length} expenses from localStorage`);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses from storage');
    } finally {
      setLoading(false);
    }
  };

  // Save expenses to localStorage
  const saveExpenses = (updatedExpenses: Expense[]) => {
    try {
      localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(updatedExpenses));
      console.log(`Saved ${updatedExpenses.length} expenses to localStorage`);
    } catch (err) {
      console.error('Error saving expenses:', err);
      toast({
        title: 'Error',
        description: 'Failed to save expenses',
        variant: 'destructive'
      });
    }
  };

  // Calculate business summary based on expenses and bills
  const calculateBusinessSummary = () => {
    const grossIncome = bills.reduce((sum, bill) => sum + bill.total, 0);
    
    const totalExpenses = expenses.reduce((sum, expense) => {
      if (expense.isRecurring) {
        switch(expense.frequency) {
          case 'monthly':
            return sum + expense.amount;
          case 'quarterly':
            return sum + (expense.amount / 3);
          case 'yearly':
            return sum + (expense.amount / 12);
          default:
            return sum + expense.amount;
        }
      } else {
        return sum + expense.amount;
      }
    }, 0);
    
    const netProfit = grossIncome - totalExpenses;
    const profitMargin = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;
    
    setBusinessSummary({
      grossIncome,
      totalExpenses,
      netProfit,
      profitMargin
    });
  };

  // Add a new expense
  const addExpense = async (expenseData: ExpenseFormData): Promise<boolean> => {
    try {
      const id = generateId();
      
      // Create the new expense object
      const newExpense: Expense = {
        id,
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        frequency: expenseData.frequency,
        date: expenseData.date.toISOString(), // Convert to ISO string for storage
        isRecurring: expenseData.isRecurring,
        notes: expenseData.notes || ''
      };
      
      // Update state with new expense
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      
      // Save to localStorage
      saveExpenses(updatedExpenses);
      
      toast({
        title: 'Success',
        description: 'Expense added successfully'
      });
      
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
      // Ensure date is stored as ISO string
      const updatedExpense = {
        ...expense,
        date: typeof expense.date === 'string' ? expense.date : expense.date.toISOString()
      };
      
      // Update expenses array
      const updatedExpenses = expenses.map(item => 
        item.id === expense.id ? updatedExpense : item
      );
      
      setExpenses(updatedExpenses);
      
      // Save to localStorage
      saveExpenses(updatedExpenses);
      
      toast({
        title: 'Success',
        description: 'Expense updated successfully'
      });
      
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
      // Remove expense from array
      const updatedExpenses = expenses.filter(item => item.id !== id);
      
      setExpenses(updatedExpenses);
      
      // Save to localStorage
      saveExpenses(updatedExpenses);
      
      toast({
        title: 'Success',
        description: 'Expense deleted successfully'
      });
      
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

  // Initialize by loading expenses from localStorage
  useEffect(() => {
    loadExpenses();
  }, []);

  // Recalculate business summary when expenses or bills change
  useEffect(() => {
    calculateBusinessSummary();
  }, [bills, expenses]);

  const contextValue: ExpenseContextType = {
    expenses,
    businessSummary,
    addExpense,
    updateExpense,
    deleteExpense,
    refreshExpenses: loadExpenses,
    loading,
    error
  };

  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
};
