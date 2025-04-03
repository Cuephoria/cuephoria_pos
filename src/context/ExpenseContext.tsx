
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

  // Load expenses from Supabase
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
          date: new Date(item.date),
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

  // Calculate business summary based on bills and expenses
  const calculateBusinessSummary = () => {
    // Calculate gross income from bills
    const grossIncome = bills.reduce((sum, bill) => sum + bill.total, 0);
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce((sum, expense) => {
      // For recurring expenses, calculate based on frequency
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
    
    // Calculate net profit
    const netProfit = grossIncome - totalExpenses;
    
    // Calculate profit margin
    const profitMargin = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;
    
    setBusinessSummary({
      grossIncome,
      totalExpenses,
      netProfit,
      profitMargin
    });
  };

  // Add a new expense
  const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<boolean> => {
    try {
      const id = generateId();
      
      // Insert into Supabase
      const { error } = await supabase
        .from('expenses')
        .insert({
          id,
          name: expenseData.name,
          amount: expenseData.amount,
          category: expenseData.category,
          frequency: expenseData.frequency,
          date: expenseData.date.toISOString(),
          is_recurring: expenseData.isRecurring,
          notes: expenseData.notes
        });
        
      if (error) {
        console.error('Error adding expense:', error);
        toast({
          title: 'Error',
          description: `Failed to add expense: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
      const newExpense: Expense = {
        id,
        ...expenseData
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

  // Update an existing expense
  const updateExpense = async (expense: Expense): Promise<boolean> => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('expenses')
        .update({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          frequency: expense.frequency,
          date: expense.date.toISOString(),
          is_recurring: expense.isRecurring,
          notes: expense.notes
        })
        .eq('id', expense.id);
        
      if (error) {
        console.error('Error updating expense:', error);
        toast({
          title: 'Error',
          description: `Failed to update expense: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
      setExpenses(prev => 
        prev.map(item => item.id === expense.id ? expense : item)
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

  // Delete an expense
  const deleteExpense = async (id: string): Promise<boolean> => {
    try {
      // Delete from Supabase
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
      
      // Update local state
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

  // Effect to fetch expenses on mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Effect to recalculate business summary when bills or expenses change
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
