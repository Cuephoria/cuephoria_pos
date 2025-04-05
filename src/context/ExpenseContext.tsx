
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Expense, BusinessSummary, ExpenseFormData } from '@/types/expense.types';
import { usePOS } from './POSContext';
import { generateId } from '@/utils/pos.utils';
import { useToast } from '@/hooks/use-toast';
import { supabase, handleSupabaseError } from '@/integrations/supabase/client';

interface ExpenseContextType {
  expenses: Expense[];
  businessSummary: BusinessSummary;
  addExpense: (expense: Omit<ExpenseFormData, 'date'> & { date: string }) => Promise<boolean>;
  updateExpense: (expense: Expense) => Promise<boolean>;
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
      // Try to fetch expenses from Supabase using a type assertion to bypass type checking
      const { data: supabaseExpenses, error: supabaseError } = await (supabase
        .from('expenses' as any)
        .select('*')
        .order('date', { ascending: false }) as any);
      
      if (supabaseError) {
        console.error('Error fetching expenses from Supabase:', supabaseError);
        
        // Fall back to localStorage if Supabase fails
        const storedExpenses = localStorage.getItem(STORAGE_KEY);
        
        if (storedExpenses) {
          const parsedExpenses = JSON.parse(storedExpenses) as Expense[];
          setExpenses(parsedExpenses);
          console.log(`Loaded ${parsedExpenses.length} expenses from localStorage`);
          
          // Try to sync localStorage expenses to Supabase
          parsedExpenses.forEach(async (expense) => {
            await (supabase.from('expenses' as any).upsert({
              id: expense.id,
              name: expense.name,
              amount: expense.amount,
              category: expense.category,
              frequency: expense.frequency,
              date: expense.date,
              is_recurring: expense.isRecurring,
              notes: expense.notes || null
            }, { onConflict: 'id' }) as any);
          });
        } else {
          setExpenses([]);
          console.log('No expenses found in localStorage');
        }
      } else {
        // Use Supabase data
        const formattedExpenses = supabaseExpenses.map((item: any) => ({
          id: item.id,
          name: item.name,
          amount: item.amount,
          category: item.category as Expense['category'],
          frequency: item.frequency as Expense['frequency'],
          date: item.date,
          isRecurring: item.is_recurring,
          notes: item.notes || undefined
        }));
        
        setExpenses(formattedExpenses);
        console.log(`Loaded ${formattedExpenses.length} expenses from Supabase`);
        
        // Update localStorage with the latest data from Supabase
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formattedExpenses));
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
        description: 'Failed to save expenses data locally',
        variant: 'destructive'
      });
    }
  };

  const addExpense = async (formData: Omit<ExpenseFormData, 'date'> & { date: string }): Promise<boolean> => {
    try {
      const id = generateId();
      
      // The date is already an ISO string from ExpenseDialog
      const newExpense: Expense = {
        id,
        name: formData.name,
        amount: formData.amount,
        category: formData.category,
        frequency: formData.frequency,
        date: formData.date, // Already a string from ExpenseDialog
        isRecurring: formData.isRecurring,
        notes: formData.notes
      };
      
      // Insert to Supabase with type assertion to bypass type checking
      const { error: supabaseError } = await (supabase
        .from('expenses' as any)
        .insert({
          id: newExpense.id,
          name: newExpense.name,
          amount: newExpense.amount,
          category: newExpense.category,
          frequency: newExpense.frequency,
          date: newExpense.date,
          is_recurring: newExpense.isRecurring,
          notes: newExpense.notes || null
        }) as any);
      
      if (supabaseError) {
        const errorMessage = handleSupabaseError(supabaseError, 'adding expense');
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
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

  const updateExpense = async (expense: Expense): Promise<boolean> => {
    try {
      // Update in Supabase with type assertion
      const { error: supabaseError } = await (supabase
        .from('expenses' as any)
        .update({
          name: expense.name,
          amount: expense.amount,
          category: expense.category,
          frequency: expense.frequency,
          date: expense.date,
          is_recurring: expense.isRecurring,
          notes: expense.notes || null
        })
        .eq('id', expense.id) as any);
      
      if (supabaseError) {
        const errorMessage = handleSupabaseError(supabaseError, 'updating expense');
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
      const updatedExpenses = expenses.map(item => 
        item.id === expense.id ? expense : item
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
      // Delete from Supabase with type assertion
      const { error: supabaseError } = await (supabase
        .from('expenses' as any)
        .delete()
        .eq('id', id) as any);
      
      if (supabaseError) {
        const errorMessage = handleSupabaseError(supabaseError, 'deleting expense');
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        return false;
      }
      
      // Update local state
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
