
export type ExpenseCategory = 'rent' | 'utilities' | 'salary' | 'restock' | 'misc';
export type ExpenseFrequency = 'one-time' | 'monthly' | 'quarterly' | 'yearly';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: ExpenseFrequency;
  date: string; // Store as ISO string for consistency
  isRecurring: boolean;
  notes?: string;
}

export interface BusinessSummary {
  grossIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
}

// Form-specific type to handle Date objects in forms
export interface ExpenseFormData {
  name: string;
  amount: number;
  category: ExpenseCategory;
  frequency: ExpenseFrequency;
  date: Date; // Use Date object for form handling
  isRecurring: boolean;
  notes?: string;
}
