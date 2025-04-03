
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, BusinessSummary, ExpenseFormData } from '@/types/expense.types';
import { usePOS } from './POSContext';
import { generateId } from '@/utils/pos.utils';
import { useToast } from '@/hooks/use-toast';

interface ExpenseContextType {
  expenses: Expense[];
  businessSummary: BusinessSummary;
  addExpense: (expense: Omit<ExpenseFormData, 'id'>) => Promise<boolean>;
  updateExpense: (expense: Expense & { date: Date }) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  refreshExpenses: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const STORAGE_KEY = 'pos-expenses';

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

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get expenses from localStorage
      const storedExpenses = localStorage.getItem(STORAGE_KEY);
      
      if (storedExpenses) {
        const parsedExpenses = JSON.parse(storedExpenses) as Expense[];
        setExpenses(parsedExpenses);
        console.log(`Loaded ${parsedExpenses.length} expenses from localStorage`);
      } else {
        // Initialize with empty array if no data found
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

  const saveExpensesToStorage = (updatedExpenses: Expense[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExpenses));
    } catch (err) {
      console.error('Error saving expenses to localStorage:', err);
      toast({
        title: 'Error',
        description: 'Failed to save expenses data',
        variant: 'destructive'
      });
    }
  };

  const addExpense = async (formData: ExpenseFormData): Promise<boolean> => {
    try {
      const id = generateId();
      
      // Convert Date to ISO string for storage
      const newExpense: Expense = {
        id,
        name: formData.name,
        amount: formData.amount,
        category: formData.category,
        frequency: formData.frequency,
        date: formData.date.toISOString(),
        isRecurring: formData.isRecurring,
        notes: formData.notes
      };
      
      const updatedExpenses = [newExpense, ...expenses];
      setExpenses(updatedExpenses);
      saveExpensesToStorage(updatedExpenses);
      
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

  const updateExpense = async (expense: Expense & { date: Date }): Promise<boolean> => {
    try {
      // Convert Date to ISO string for storage
      const updatedExpense: Expense = {
        ...expense,
        date: expense.date.toISOString()
      };
      
      const updatedExpenses = expenses.map(item => 
        item.id === expense.id ? updatedExpense : item
      );
      
      setExpenses(updatedExpenses);
      saveExpensesToStorage(updatedExpenses);
      
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

  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      const updatedExpenses = expenses.filter(item => item.id !== id);
      setExpenses(updatedExpenses);
      saveExpensesToStorage(updatedExpenses);
      
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

  useEffect(() => {
    fetchExpenses();
  }, []);

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
