import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, BusinessSummary } from '@/types/expense.types';
import { supabase } from '@/integrations/supabase/client';
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
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching expenses:', error);
        setError(`Failed to fetch expenses: ${error.message}`);
        return;
      }
      
      if (data) {
        const transformedExpenses: Expense[] = data.map(item => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          category: item.category,
          frequency: item.frequency,
          date: item.date,
          isRecurring: item.is_recurring,
          notes: item.notes
        }));
        
        setExpenses(transformedExpenses);
        console.log(`Loaded ${transformedExpenses.length} expenses`);
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

  const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<boolean> => {
    try {
      console.log('Adding expense with data:', expenseData);
      const id = generateId();
      
      // Ensure date is a valid string
      let dateStr: string;
      
      if (typeof expenseData.date === 'string') {
        dateStr = expenseData.date;
      } else if (expenseData.date instanceof Date) {
        dateStr = expenseData.date.toISOString();
      } else {
        console.error('Invalid date format:', expenseData.date);
        toast({
          title: 'Error',
          description: 'Invalid date format',
          variant: 'destructive'
        });
        return false;
      }
      
      console.log('Formatted date to store:', dateStr);
      
      const { error: supabaseError } = await supabase
        .from('expenses')
        .insert({
          id,
          name: expenseData.name,
          amount: expenseData.amount,
          category: expenseData.category,
          frequency: expenseData.frequency,
          date: dateStr,
          is_recurring: expenseData.isRecurring,
          notes: expenseData.notes || ''
        });
        
      if (supabaseError) {
        console.error('Error adding expense:', supabaseError);
        toast({
          title: 'Error',
          description: `Failed to add expense: ${supabaseError.message}`,
          variant: 'destructive'
        });
        return false;
      }
      
      // Create a proper expense object for the state
      const newExpense: Expense = {
        id,
        name: expenseData.name,
        amount: expenseData.amount,
        category: expenseData.category,
        frequency: expenseData.frequency,
        date: dateStr,
        isRecurring: expenseData.isRecurring,
        notes: expenseData.notes || ''
      };
      
      setExpenses(prev => [newExpense, ...prev]);
      
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

  const updateExpense = async (expense: Expense): Promise<boolean> => {
    try {
      // Ensure date is a valid string
      let dateStr: string;
      
      if (typeof expense.date === 'string') {
        dateStr = expense.date;
      } else if (expense.date instanceof Date) {
        dateStr = expense.date.toISOString();
      } else {
        console.error('Invalid date format:', expense.date);
        toast({
          title: 'Error',
          description: 'Invalid date format',
          variant: 'destructive'
        });
        return false;
      }
      
      console.log('Formatted date to update:', dateStr);
      
      const { error: supabaseError } = await supabase
        .from('expenses')
        .update({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          frequency: expense.frequency,
          date: dateStr,
          is_recurring: expense.isRecurring,
          notes: expense.notes || ''
        })
        .eq('id', expense.id);
        
      if (supabaseError) {
        console.error('Error updating expense:', supabaseError);
        toast({
          title: 'Error',
          description: `Failed to update expense: ${supabaseError.message}`,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update the expense with the correct date 
      const updatedExpense = {
        ...expense,
        date: dateStr
      };
      
      setExpenses(prev => 
        prev.map(item => item.id === expense.id ? updatedExpense : item)
      );
      
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
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting expense:', error);
        toast({
          title: 'Error',
          description: `Failed to delete expense: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }
      
      setExpenses(prev => prev.filter(item => item.id !== id));
      
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
